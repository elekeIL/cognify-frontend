"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Loader2,
    CheckCircle,
    FileText,
    Brain,
    X,
    Clock,
    ArrowRight,
    AlertCircle,
    BookOpen,
    Quote,
    Volume2,
    RotateCcw,
} from "lucide-react";
import {
    documentsApi,
    ProcessingStep,
    StepStatus,
    StepResponse,
    ProcessingStatusResponse
} from "@/lib/api";

interface ProcessingStage {
    id: ProcessingStep;
    label: string;
    description: string;
    icon: React.ElementType;
    apiCall: (docId: string) => Promise<StepResponse>;
}

// Processing stages matching backend step-by-step API
const PROCESSING_STAGES: ProcessingStage[] = [
    {
        id: "extract_text",
        label: "Extracting Text",
        description: "Reading and extracting content from your document",
        icon: FileText,
        apiCall: (docId) => documentsApi.processExtractText(docId),
    },
    {
        id: "extract_themes",
        label: "Identifying Themes",
        description: "AI is extracting 3-7 main themes from the material",
        icon: Brain,
        apiCall: (docId) => documentsApi.processExtractThemes(docId),
    },
    {
        id: "generate_lesson",
        label: "Generating Lesson",
        description: "Creating a concise 250-400 word workplace lesson",
        icon: BookOpen,
        apiCall: (docId) => documentsApi.processGenerateLesson(docId),
    },
    {
        id: "extract_citations",
        label: "Extracting Citations",
        description: "Finding top 2-3 source snippets with references",
        icon: Quote,
        apiCall: (docId) => documentsApi.processExtractCitations(docId),
    },
    {
        id: "generate_audio",
        label: "Generating Audio",
        description: "Creating voice narration for your lesson",
        icon: Volume2,
        apiCall: (docId) => documentsApi.processGenerateAudio(docId),
    },
];

interface ProcessingPageProps {
    documentId: string;
    documentName?: string;
    onCancel?: () => void;
    onComplete?: () => void;
}

export default function ProcessingPage({
    documentId,
    documentName = "Document",
    onCancel,
    onComplete,
}: ProcessingPageProps) {
    // Step states
    const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [isComplete, setIsComplete] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const [failedStep, setFailedStep] = useState<ProcessingStep | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [canRetry, setCanRetry] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // UI states
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    // Refs
    const startTimeRef = useRef<number>(Date.now());
    const isProcessingRef = useRef<boolean>(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Calculate overall progress based on completed steps
    const completedSteps = Object.values(stepStatuses).filter(s => s === "completed").length;
    const overallProgress = isComplete
        ? 100
        : Math.round((completedSteps / PROCESSING_STAGES.length) * 100);

    const currentStage = currentStepIndex >= 0 && currentStepIndex < PROCESSING_STAGES.length
        ? PROCESSING_STAGES[currentStepIndex]
        : null;

    // Elapsed time counter
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Execute a single step
    const executeStep = useCallback(async (stepIndex: number): Promise<boolean> => {
        if (stepIndex >= PROCESSING_STAGES.length) {
            return true; // All steps completed
        }

        const stage = PROCESSING_STAGES[stepIndex];
        setCurrentStepIndex(stepIndex);
        setStepStatuses(prev => ({
            ...prev,
            [stage.id]: "in_progress"
        }));

        try {
            console.log(`Executing step: ${stage.id}`);
            const response = await stage.apiCall(documentId);

            if (response.status === "completed") {
                setStepStatuses(prev => ({
                    ...prev,
                    [stage.id]: "completed"
                }));
                setRetryCount(response.retry_count);

                // Check if there's a next step
                if (response.next_step) {
                    // Continue to next step
                    return await executeStep(stepIndex + 1);
                } else {
                    // All steps completed
                    return true;
                }
            } else if (response.status === "failed") {
                setStepStatuses(prev => ({
                    ...prev,
                    [stage.id]: "failed"
                }));
                setHasFailed(true);
                setFailedStep(stage.id);
                setErrorMessage(response.error_message || `Step "${stage.label}" failed`);
                setCanRetry(response.can_retry);
                setRetryCount(response.retry_count);
                return false;
            }

            return false;
        } catch (error: any) {
            console.error(`Error executing step ${stage.id}:`, error);
            setStepStatuses(prev => ({
                ...prev,
                [stage.id]: "failed"
            }));
            setHasFailed(true);
            setFailedStep(stage.id);
            setErrorMessage(error?.response?.data?.detail || error?.message || `Failed to execute step "${stage.label}"`);
            setCanRetry(true);
            return false;
        }
    }, [documentId]);

    // Start processing pipeline
    const startProcessing = useCallback(async () => {
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        abortControllerRef.current = new AbortController();

        try {
            // First, check current status
            const status = await documentsApi.getProcessingStatus(documentId);

            if (status.status === "completed") {
                setIsComplete(true);
                setStepStatuses(status.step_statuses);
                isProcessingRef.current = false;
                setTimeout(() => onComplete?.(), 1500);
                return;
            }

            if (status.status === "failed") {
                setHasFailed(true);
                setFailedStep(status.failed_step || null);
                setErrorMessage(status.error_message || "Processing failed");
                setCanRetry(status.can_retry);
                setRetryCount(status.retry_count);
                setStepStatuses(status.step_statuses);
                isProcessingRef.current = false;
                return;
            }

            // Initialize step statuses from backend
            if (Object.keys(status.step_statuses).length > 0) {
                setStepStatuses(status.step_statuses);
            }

            // Find the starting step (first non-completed step)
            let startIndex = 0;
            for (let i = 0; i < PROCESSING_STAGES.length; i++) {
                const stepStatus = status.step_statuses[PROCESSING_STAGES[i].id];
                if (stepStatus === "completed") {
                    startIndex = i + 1;
                } else {
                    break;
                }
            }

            // Execute steps sequentially
            const success = await executeStep(startIndex);

            if (success) {
                setIsComplete(true);
                setCurrentStepIndex(-1);
                setTimeout(() => onComplete?.(), 1500);
            }
        } catch (error: any) {
            console.error("Error starting processing:", error);
            setHasFailed(true);
            setErrorMessage(error?.response?.data?.detail || error?.message || "Failed to start processing");
        } finally {
            isProcessingRef.current = false;
        }
    }, [documentId, executeStep, onComplete]);

    // Retry failed step - simply re-call the same step endpoint
    const handleRetry = useCallback(async () => {
        if (!failedStep || isRetrying) return;

        setIsRetrying(true);
        setHasFailed(false);
        setErrorMessage("");

        // Find the failed step index
        const failedStepIndex = PROCESSING_STAGES.findIndex(s => s.id === failedStep);
        if (failedStepIndex === -1) {
            setHasFailed(true);
            setErrorMessage("Could not find failed step");
            setIsRetrying(false);
            return;
        }

        try {
            // Re-execute from the failed step (the backend handles retry counting)
            isProcessingRef.current = true;
            setFailedStep(null);

            const success = await executeStep(failedStepIndex);

            if (success) {
                setIsComplete(true);
                setCurrentStepIndex(-1);
                setTimeout(() => onComplete?.(), 1500);
            }
        } catch (error: any) {
            console.error("Error retrying step:", error);
            // Error handling is already done in executeStep
        } finally {
            setIsRetrying(false);
            isProcessingRef.current = false;
        }
    }, [failedStep, executeStep, onComplete, isRetrying]);

    // Start processing on mount
    useEffect(() => {
        startProcessing();

        return () => {
            abortControllerRef.current?.abort();
        };
    }, [startProcessing]);

    const handleCancel = () => {
        setShowCancelConfirm(false);
        abortControllerRef.current?.abort();
        onCancel?.();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

    // Get step display status
    const getStepDisplayStatus = (stepId: ProcessingStep, index: number) => {
        const status = stepStatuses[stepId];
        if (status === "completed") return "completed";
        if (status === "in_progress" || index === currentStepIndex) return "in_progress";
        if (status === "failed") return "failed";
        return "pending";
    };

    // Find which step failed (for display)
    const failedStageIndex = failedStep
        ? PROCESSING_STAGES.findIndex(s => s.id === failedStep)
        : -1;

    // Error State with Retry
    if (hasFailed) {
        const failedStage = failedStep
            ? PROCESSING_STAGES.find(s => s.id === failedStep)
            : null;

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Error Header */}
                <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/25">
                            <AlertCircle className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Processing Failed
                    </h1>
                    {failedStage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Failed at: <span className="font-medium text-red-600 dark:text-red-400">{failedStage.label}</span>
                        </p>
                    )}
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                        {errorMessage}
                    </p>
                </div>

                {/* Error Card */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5">
                    {/* Document Info */}
                    <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/25">
                            <FileText className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {documentName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Attempted for {formatTime(elapsedTime)} {retryCount > 0 && `(${retryCount} retries)`}
                            </p>
                        </div>
                    </div>

                    {/* Steps Progress */}
                    <div className="space-y-2 mb-6">
                        {PROCESSING_STAGES.map((stage, index) => {
                            const status = getStepDisplayStatus(stage.id, index);
                            const isFailed = stage.id === failedStep;
                            const StageIcon = stage.icon;

                            return (
                                <div
                                    key={stage.id}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl transition-all
                                        ${isFailed ? "bg-red-50 dark:bg-red-950/30 ring-1 ring-red-200 dark:ring-red-800" : ""}
                                        ${status === "completed" ? "bg-green-50/50 dark:bg-green-950/20" : ""}
                                        ${status === "pending" ? "opacity-50" : ""}
                                    `}
                                >
                                    <div
                                        className={`
                                            flex items-center justify-center w-9 h-9 rounded-lg
                                            ${status === "completed" ? "bg-green-100 dark:bg-green-900/40" : ""}
                                            ${isFailed ? "bg-red-100 dark:bg-red-900/40" : ""}
                                            ${status === "pending" ? "bg-gray-100 dark:bg-gray-800" : ""}
                                        `}
                                    >
                                        {status === "completed" ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : isFailed ? (
                                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        ) : (
                                            <StageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
                                        )}
                                    </div>
                                    <span
                                        className={`
                                            flex-1 text-sm font-medium
                                            ${status === "completed" ? "text-green-700 dark:text-green-400" : ""}
                                            ${isFailed ? "text-red-700 dark:text-red-400" : ""}
                                            ${status === "pending" ? "text-gray-400 dark:text-gray-500" : ""}
                                        `}
                                    >
                                        {stage.label}
                                    </span>
                                    {status === "completed" && (
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Done</span>
                                    )}
                                    {isFailed && (
                                        <span className="text-xs font-medium text-red-600 dark:text-red-400">Failed</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                            <span>Go Back</span>
                        </button>
                        {canRetry ? (
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isRetrying ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <RotateCcw className="w-5 h-5" />
                                )}
                                <span>
                                    {isRetrying
                                        ? "Retrying..."
                                        : `Retry Failed Step${retryCount > 0 ? ` (${3 - retryCount} left)` : ""}`
                                    }
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all"
                            >
                                <span>Re-upload Document</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {!canRetry && (
                        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            Maximum retries ({retryCount}) reached. Please re-upload your document.
                        </p>
                    )}
                </div>
            </div>
        );
    }

    // Completion State
    if (isComplete) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Success Header */}
                <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/25">
                            <CheckCircle className="w-10 h-10 text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Processing Complete
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Your lesson has been generated successfully
                    </p>
                </div>

                {/* Success Card */}
                <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-xl shadow-gray-900/5">
                    {/* Document Info */}
                    <div className="flex items-center gap-4 pb-5 mb-5 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                            <FileText className="w-6 h-6 text-white" strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {documentName}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Processed in {formatTime(elapsedTime)}
                            </p>
                        </div>
                    </div>

                    {/* Completed Stages */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {PROCESSING_STAGES.map((stage) => {
                            const StageIcon = stage.icon;
                            return (
                                <div
                                    key={stage.id}
                                    className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50"
                                >
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <StageIcon className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={2} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {stage.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => (window.location.href = `/learning/${documentId}`)}
                        className="group w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                    >
                        <span>View Your Lesson</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        );
    }

    // Processing State
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-16 h-16 mb-5">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
                        <Loader2 className="w-8 h-8 text-white animate-spin" strokeWidth={2} />
                    </div>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Processing Your Document
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs mx-auto">
                    {documentName}
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden shadow-xl shadow-gray-900/5">
                {/* Overall Progress Header */}
                <div className="p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border-b border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                Overall Progress
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                                {overallProgress}%
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(elapsedTime)} elapsed</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${overallProgress}%` }}
                        />
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400/50 to-purple-500/50 rounded-full blur-sm transition-all duration-500"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>

                {/* Current Stage Highlight */}
                {currentStage && (
                    <div className="p-5 border-b border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-xl animate-pulse" />
                                <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
                                    <currentStage.icon className="w-6 h-6 text-white" strokeWidth={2} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {currentStage.label}
                                    </h3>
                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {currentStage.description}
                                </p>
                            </div>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full">
                                Step {currentStepIndex + 1} of {PROCESSING_STAGES.length}
                            </span>
                        </div>
                    </div>
                )}

                {/* All Stages List */}
                <div className="p-4">
                    <div className="space-y-2">
                        {PROCESSING_STAGES.map((stage, index) => {
                            const status = getStepDisplayStatus(stage.id, index);
                            const isCompleted = status === "completed";
                            const isCurrent = status === "in_progress";
                            const isPending = status === "pending";
                            const StageIcon = stage.icon;

                            return (
                                <div
                                    key={stage.id}
                                    className={`
                                        flex items-center gap-3 p-3 rounded-xl transition-all duration-300
                                        ${isCurrent ? "bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-200 dark:ring-blue-800" : ""}
                                        ${isCompleted ? "bg-green-50/50 dark:bg-green-950/20" : ""}
                                        ${isPending ? "opacity-50" : ""}
                                    `}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`
                                            flex items-center justify-center w-9 h-9 rounded-lg transition-all
                                            ${isCompleted ? "bg-green-100 dark:bg-green-900/40" : ""}
                                            ${isCurrent ? "bg-blue-100 dark:bg-blue-900/40" : ""}
                                            ${isPending ? "bg-gray-100 dark:bg-gray-800" : ""}
                                        `}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        ) : isCurrent ? (
                                            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                                        ) : (
                                            <StageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`
                                            flex-1 text-sm font-medium transition-colors
                                            ${isCompleted ? "text-green-700 dark:text-green-400" : ""}
                                            ${isCurrent ? "text-gray-900 dark:text-white" : ""}
                                            ${isPending ? "text-gray-400 dark:text-gray-500" : ""}
                                        `}
                                    >
                                        {stage.label}
                                    </span>

                                    {/* Status Badge */}
                                    {isCompleted && (
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                            Done
                                        </span>
                                    )}
                                    {isCurrent && (
                                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                            In Progress
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Cancel Section */}
            <div className="flex justify-center">
                {!showCancelConfirm ? (
                    <button
                        onClick={() => setShowCancelConfirm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                        Cancel Processing
                    </button>
                ) : (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Cancel processing?
                        </span>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Yes, Cancel
                        </button>
                        <button
                            onClick={() => setShowCancelConfirm(false)}
                            className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
