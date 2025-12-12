"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    File,
    FileType,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    Sparkles,
    ArrowRight,
    Brain,
    Volume2,
    Quote,
    BookOpen,
    Zap,
    Shield,
    Clock,
    Layers,
} from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";
import ProcessingPage from "@/components/ProcessingPage";
import { documentsApi, Document } from "@/lib/api";

interface UploadedFile {
    file: File;
    preview: {
        name: string;
        size: string;
        type: string;
        icon: React.ElementType;
        color: string;
        bgColor: string;
    };
}

const SUPPORTED_FORMATS = {
    "application/pdf": {
        ext: "PDF",
        icon: FileText,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/40",
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        ext: "DOCX",
        icon: File,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/40",
    },
    "application/msword": {
        ext: "DOC",
        icon: File,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/40",
    },
    "text/plain": {
        ext: "TXT",
        icon: FileType,
        color: "text-slate-600 dark:text-slate-400",
        bgColor: "bg-slate-100 dark:bg-slate-800",
    },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PROCESSING_STEPS = [
    { icon: FileText, label: "Extract", desc: "Text extraction" },
    { icon: Brain, label: "Analyze", desc: "3-7 themes" },
    { icon: BookOpen, label: "Generate", desc: "Lesson content" },
    { icon: Quote, label: "Cite", desc: "Source refs" },
    { icon: Volume2, label: "Narrate", desc: "Voice audio" },
];

export default function UploadPage() {
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string>("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processDocId, setProcessDocId] = useState<string | null>(null);
    const [processDocName, setProcessDocName] = useState<string>("");

    useEffect(() => {
        const processId = searchParams.get("process");
        const docName = searchParams.get("name");
        if (processId) {
            setProcessDocId(processId);
            setProcessDocName(docName || "Document");
            setIsProcessing(true);
        }
    }, [searchParams]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const validateFile = (file: File): string | null => {
        if (!Object.keys(SUPPORTED_FORMATS).includes(file.type)) {
            return `Unsupported file format. Please upload PDF, DOCX, or TXT files.`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 10MB limit.`;
        }
        if (file.size === 0) {
            return `File is empty.`;
        }
        return null;
    };

    const handleFileSelect = useCallback(async (file: File) => {
        setError("");
        setUploadedDocument(null);
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        const fileFormat = SUPPORTED_FORMATS[file.type as keyof typeof SUPPORTED_FORMATS];
        const preview = {
            file,
            preview: {
                name: file.name,
                size: formatFileSize(file.size),
                type: fileFormat.ext,
                icon: fileFormat.icon,
                color: fileFormat.color,
                bgColor: fileFormat.bgColor,
            },
        };
        setUploadedFile(preview);

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 12;
                });
            }, 120);

            const document = await documentsApi.upload(file);

            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadedDocument(document);
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Failed to upload file. Please try again.");
            setUploadedFile(null);
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleProcessDocument = async () => {
        if (!uploadedDocument) return;
        setIsProcessing(true);
        setError("");
    };

    const handleProcessingCancel = () => {
        setIsProcessing(false);
        if (processDocId) {
            window.location.href = "/documents";
        } else {
            setProcessDocId(null);
            setProcessDocName("");
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setUploadedFile(null);
        setUploadedDocument(null);
        setUploadProgress(0);
        setError("");
        setIsUploading(false);
        setIsProcessing(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const documentIdToProcess = processDocId || uploadedDocument?.id;
    const documentNameToShow = processDocName || uploadedFile?.preview.name || uploadedDocument?.title || "Document";

    if (isProcessing && documentIdToProcess) {
        return (
            <DashboardLayout>
                <div className="max-w-3xl mx-auto py-8">
                    <ProcessingPage
                        documentId={documentIdToProcess}
                        documentName={documentNameToShow}
                        onCancel={handleProcessingCancel}
                        onComplete={() => {
                            window.location.href = `/learning/${documentIdToProcess}`;
                        }}
                    />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Upload Document
                            </h1>
                            <p className="mt-1 text-gray-600 dark:text-gray-400">
                                Transform documents into AI-powered learning experiences
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/50 dark:border-blue-800/50">
                            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered</span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Upload Area - Takes 2/3 on XL screens */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="xl:col-span-2"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {!uploadedFile ? (
                                    /* Drop Zone */
                                    <motion.div
                                        key="dropzone"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onDragEnter={handleDragEnter}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className="p-8 lg:p-12"
                                    >
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                                                isDragging
                                                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-gray-50/50 dark:hover:bg-gray-900/30"
                                            } p-8 lg:p-16`}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf,.docx,.doc,.txt"
                                                onChange={handleFileInputChange}
                                                className="hidden"
                                            />

                                            <div className="flex flex-col items-center text-center">
                                                {/* Animated Upload Icon */}
                                                <motion.div
                                                    animate={isDragging ? { scale: 1.15, y: -5 } : { scale: 1, y: 0 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                    className="mb-8"
                                                >
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-25 animate-pulse" />
                                                        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 shadow-xl shadow-blue-500/30">
                                                            <Upload className="h-12 w-12 text-white" strokeWidth={1.5} />
                                                        </div>
                                                    </div>
                                                </motion.div>

                                                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                                    {isDragging ? "Drop your file here" : "Drag & drop your document"}
                                                </h3>
                                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                                                    or click to browse from your computer. We support PDF, DOCX, and TXT files up to 10MB.
                                                </p>

                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg shadow-gray-900/10 dark:shadow-white/10"
                                                >
                                                    <Upload className="h-5 w-5" />
                                                    Browse Files
                                                </button>

                                                {/* Format Badges */}
                                                <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                                                    {Object.entries(SUPPORTED_FORMATS).slice(0, 3).map(([mime, format]) => (
                                                        <div
                                                            key={mime}
                                                            className={`flex items-center gap-2 rounded-full ${format.bgColor} ${format.color} px-4 py-2`}
                                                        >
                                                            <format.icon className="h-4 w-4" />
                                                            <span className="text-sm font-medium">{format.ext}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* File Preview & Upload Progress */
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="p-8"
                                    >
                                        <div className="space-y-6">
                                            {/* File Card */}
                                            <div className={`relative rounded-2xl border-2 transition-all overflow-hidden ${
                                                isUploading
                                                    ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20"
                                                    : uploadProgress === 100
                                                        ? "border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-950/20"
                                                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                                            }`}>
                                                <div className="p-6">
                                                    <div className="flex items-start gap-5">
                                                        {/* File Icon */}
                                                        <div className="relative shrink-0">
                                                            {isUploading && (
                                                                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl animate-pulse" />
                                                            )}
                                                            <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${uploadedFile.preview.bgColor} shadow-sm`}>
                                                                <uploadedFile.preview.icon className={`h-8 w-8 ${uploadedFile.preview.color}`} />
                                                            </div>
                                                        </div>

                                                        {/* File Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="min-w-0">
                                                                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg truncate pr-4">
                                                                        {uploadedFile.preview.name}
                                                                    </h4>
                                                                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                        <span className={`font-medium ${uploadedFile.preview.color}`}>
                                                                            {uploadedFile.preview.type}
                                                                        </span>
                                                                        <span>•</span>
                                                                        <span>{uploadedFile.preview.size}</span>
                                                                        {isUploading && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                                    Uploading
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                        {!isUploading && uploadProgress === 100 && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                                    Ready
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {!isUploading && (
                                                                    <button
                                                                        onClick={handleRemoveFile}
                                                                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                    >
                                                                        <X className="h-5 w-5" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* Progress Bar */}
                                                            {(isUploading || uploadProgress > 0) && (
                                                                <div className="mt-4">
                                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                                        <span className="text-gray-600 dark:text-gray-400">
                                                                            {isUploading ? "Uploading..." : "Upload complete"}
                                                                        </span>
                                                                        <span className={`font-semibold ${
                                                                            uploadProgress === 100
                                                                                ? "text-green-600 dark:text-green-400"
                                                                                : "text-blue-600 dark:text-blue-400"
                                                                        }`}>
                                                                            {Math.round(uploadProgress)}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${uploadProgress}%` }}
                                                                            className={`h-full rounded-full transition-colors ${
                                                                                uploadProgress === 100
                                                                                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                                                                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                                                                            }`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Process Button & Steps */}
                                            {!isUploading && uploadProgress === 100 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.2 }}
                                                    className="space-y-6"
                                                >
                                                    {/* Processing Steps Preview */}
                                                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5">
                                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                                            AI will process your document in 5 steps:
                                                        </p>
                                                        <div className="flex items-center justify-between">
                                                            {PROCESSING_STEPS.map((step, i) => (
                                                                <React.Fragment key={i}>
                                                                    <div className="flex flex-col items-center text-center">
                                                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-2 shadow-sm">
                                                                            <step.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                                        </div>
                                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{step.label}</span>
                                                                        <span className="text-xs text-gray-500 dark:text-gray-500 hidden sm:block">{step.desc}</span>
                                                                    </div>
                                                                    {i < PROCESSING_STEPS.length - 1 && (
                                                                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Action Button */}
                                                    <button
                                                        onClick={handleProcessDocument}
                                                        disabled={isProcessing}
                                                        className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    >
                                                        {isProcessing ? (
                                                            <>
                                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                                <span>Starting Processing...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Sparkles className="h-5 w-5" />
                                                                <span>Process with AI</span>
                                                                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                                            </>
                                                        )}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-red-200 dark:border-red-800"
                                    >
                                        <div className="p-4 bg-red-50 dark:bg-red-950/30 flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Sidebar - Features & Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="xl:col-span-1 space-y-6"
                    >
                        {/* What You Get Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                What You Get
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { icon: Brain, label: "3-7 Key Themes", desc: "AI-extracted main topics", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/40" },
                                    { icon: BookOpen, label: "Concise Lesson", desc: "250-400 word summary", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
                                    { icon: Quote, label: "Source Citations", desc: "Top 2-3 referenced snippets", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/40" },
                                    { icon: Volume2, label: "Voice Narration", desc: "AI-generated audio", color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/40" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                                            <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/40 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">~30s</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Processing time</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-800/50">
                                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-2" />
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">Secure</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">End-to-end</p>
                            </div>
                        </div>

                        {/* Supported Formats */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Supported Formats
                            </h4>
                            <div className="space-y-2">
                                {[
                                    { ext: "PDF", desc: "Adobe PDF documents" },
                                    { ext: "DOCX", desc: "Microsoft Word files" },
                                    { ext: "TXT", desc: "Plain text files" },
                                ].map((format, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-gray-800 dark:text-gray-200">{format.ext}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{format.desc}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Maximum file size: <span className="font-medium text-gray-700 dark:text-gray-300">10MB</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
