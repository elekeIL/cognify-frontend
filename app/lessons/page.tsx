"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import Link from "next/link";
import {
    Search,
    BookOpen,
    Clock,
    Play,
    CheckCircle2,
    Headphones,
    TrendingUp,
    Target,
    Sparkles,
    Filter,
    LayoutGrid,
    List,
    ChevronRight,
    Award,
    Zap,
    X,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
    RefreshCw,
    AlertCircle,
} from "lucide-react";
import { lessonsApi, Lesson as ApiLesson, LessonListResponse } from "@/lib/api";

// =============================================================================
// TYPES
// =============================================================================

type LessonStatus = "not_started" | "in_progress" | "completed";
type ViewMode = "grid" | "list";

interface Theme {
    id: string;
    name: string;
    color: string;
}

interface Lesson {
    id: string;
    documentId: string;
    title: string;
    description: string;
    themes: Theme[];
    wordCount: number;
    readTime: number; // in minutes
    audioDuration: number; // in seconds
    status: LessonStatus;
    progress: number; // 0-100
    completedAt?: string;
    createdAt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const themeColors = [
    "from-violet-500 to-purple-500",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-500",
];

const ITEMS_PER_PAGE_OPTIONS = [6, 9, 12, 18];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatRelativeDate(iso: string): string {
    const date = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

// Map API lesson to local format
function mapApiLesson(apiLesson: ApiLesson): Lesson {
    // Determine status based on is_completed and progress_percentage
    let status: LessonStatus = "not_started";
    if (apiLesson.is_completed) {
        status = "completed";
    } else if (apiLesson.progress_percentage > 0) {
        status = "in_progress";
    }

    // Parse learning outcomes to get theme-like items for display
    const themes: Theme[] = [];
    if (apiLesson.learning_outcomes) {
        try {
            const outcomes = JSON.parse(apiLesson.learning_outcomes);
            outcomes.slice(0, 5).forEach((outcome: any, index: number) => {
                themes.push({
                    id: outcome.id || `theme_${index}`,
                    name: outcome.title?.split(' ').slice(0, 3).join(' ') || `Topic ${index + 1}`,
                    color: themeColors[index % themeColors.length],
                });
            });
        } catch (e) {
            // If parsing fails, use summary words as themes
            const words = apiLesson.summary.split(' ').slice(0, 3);
            words.forEach((word, index) => {
                if (word.length > 3) {
                    themes.push({
                        id: `theme_${index}`,
                        name: word.replace(/[^a-zA-Z]/g, ''),
                        color: themeColors[index % themeColors.length],
                    });
                }
            });
        }
    }

    // Calculate read time (~200 words per minute)
    const readTime = Math.max(1, Math.ceil(apiLesson.word_count / 200));

    return {
        id: apiLesson.id,
        documentId: apiLesson.document_id,
        title: apiLesson.title,
        description: apiLesson.summary,
        themes,
        wordCount: apiLesson.word_count,
        readTime,
        audioDuration: apiLesson.audio_duration || 0,
        status,
        progress: Math.round(apiLesson.progress_percentage),
        completedAt: apiLesson.completed_at,
        createdAt: apiLesson.created_at,
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function StatusBadge({ status, progress }: { status: LessonStatus; progress: number }) {
    const config = {
        not_started: {
            label: "Not Started",
            className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
            icon: BookOpen,
        },
        in_progress: {
            label: `${progress}% Complete`,
            className: "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
            icon: TrendingUp,
        },
        completed: {
            label: "Completed",
            className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
            icon: CheckCircle2,
        },
    };

    const { label, className, icon: Icon } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
}

function ProgressRing({ progress, size = 40 }: { progress: number; size?: number }) {
    const strokeWidth = 3;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className={progress === 100 ? "text-emerald-500" : "text-blue-500"}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {progress === 100 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{progress}%</span>
                )}
            </div>
        </div>
    );
}

function LessonCard({ lesson }: { lesson: Lesson }) {
    const isCompleted = lesson.status === "completed";
    const isInProgress = lesson.status === "in_progress";

    return (
        <Link
            href={`/learning/${lesson.documentId}`}
            className="group relative bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-1"
        >
            {/* Gradient accent bar */}
            <div className={`h-1.5 bg-gradient-to-r ${lesson.themes[0]?.color || themeColors[0]}`} />

            {/* Progress indicator for in-progress lessons */}
            {isInProgress && (
                <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                        style={{ width: `${lesson.progress}%` }}
                    />
                </div>
            )}

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                            {lesson.title}
                        </h3>
                    </div>
                    <ProgressRing progress={lesson.progress} />
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {lesson.description}
                </p>

                {/* Themes */}
                {lesson.themes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {lesson.themes.slice(0, 3).map((theme) => (
                            <span
                                key={theme.id}
                                className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300 rounded-md"
                            >
                                {theme.name}
                            </span>
                        ))}
                        {lesson.themes.length > 3 && (
                            <span className="px-2 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                                +{lesson.themes.length - 3}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {lesson.readTime} min read
                        </span>
                        {lesson.audioDuration > 0 && (
                            <span className="flex items-center gap-1">
                                <Headphones className="w-3.5 h-3.5" />
                                {formatDuration(lesson.audioDuration)}
                            </span>
                        )}
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${
                        isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isInProgress
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    } transition-colors`}>
                        {isCompleted ? "Review" : isInProgress ? "Continue" : "Start"}
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function LessonListItem({ lesson }: { lesson: Lesson }) {
    const isCompleted = lesson.status === "completed";
    const isInProgress = lesson.status === "in_progress";

    return (
        <Link
            href={`/learning/${lesson.documentId}`}
            className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/50 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/30 transition-all duration-200 hover:-translate-y-0.5"
        >
            {/* Progress Ring */}
            <ProgressRing progress={lesson.progress} size={48} />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            {lesson.description}
                        </p>
                    </div>
                    <StatusBadge status={lesson.status} progress={lesson.progress} />
                </div>

                <div className="flex items-center gap-4 mt-2">
                    {/* Themes */}
                    {lesson.themes.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {lesson.themes.slice(0, 2).map((theme) => (
                                <span
                                    key={theme.id}
                                    className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                >
                                    {theme.name}
                                </span>
                            ))}
                            {lesson.themes.length > 2 && (
                                <span className="text-xs text-gray-400">+{lesson.themes.length - 2}</span>
                            )}
                        </div>
                    )}

                    {lesson.themes.length > 0 && <span className="text-gray-300 dark:text-gray-600">•</span>}

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {lesson.readTime} min
                        </span>
                        {lesson.audioDuration > 0 && (
                            <span className="flex items-center gap-1">
                                <Headphones className="w-3.5 h-3.5" />
                                {formatDuration(lesson.audioDuration)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Arrow */}
            <ChevronRight className={`w-5 h-5 ${
                isCompleted
                    ? "text-emerald-500"
                    : isInProgress
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-blue-500"
            } group-hover:translate-x-0.5 transition-all`} />
        </Link>
    );
}

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (count: number) => void;
    totalItems: number;
}) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items per page */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Show</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{startItem}-{endItem}</span> of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
                </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="px-3 text-sm text-gray-600 dark:text-gray-400">
                    Page <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span> of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
                </span>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<LessonStatus | "all">("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [totalFromApi, setTotalFromApi] = useState(0);

    // Fetch lessons from API
    const fetchLessons = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await lessonsApi.list(1, 100); // Fetch all for client-side filtering
            const mappedLessons = response.items.map(mapApiLesson);
            setLessons(mappedLessons);
            setTotalFromApi(response.total);
        } catch (err) {
            console.error("Failed to fetch lessons:", err);
            setError("Failed to load lessons. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLessons();
    }, [fetchLessons]);

    // Filter lessons
    const filteredLessons = useMemo(() => {
        let result = [...lessons];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (lesson) =>
                    lesson.title.toLowerCase().includes(query) ||
                    lesson.description.toLowerCase().includes(query) ||
                    lesson.themes.some((t) => t.name.toLowerCase().includes(query))
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((lesson) => lesson.status === statusFilter);
        }

        return result;
    }, [lessons, searchQuery, statusFilter]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredLessons.length / itemsPerPage));
    const paginatedLessons = filteredLessons.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, itemsPerPage]);

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
    };

    const hasActiveFilters = searchQuery || statusFilter !== "all";

    // Stats
    const stats = {
        total: lessons.length,
        completed: lessons.filter((l) => l.status === "completed").length,
        inProgress: lessons.filter((l) => l.status === "in_progress").length,
        totalTime: lessons.reduce((acc, l) => acc + l.readTime, 0),
    };

    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Lessons
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Your personalized learning library
                        </p>
                    </div>
                    <Link
                        href="/upload"
                        className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                        <Sparkles className="relative w-4 h-4 text-white" />
                        <span className="relative text-white">Create New Lesson</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Completion Rate */}
                    <div className="group relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-200 dark:border-violet-800/50 p-5 hover:shadow-lg hover:shadow-violet-200/50 dark:hover:shadow-violet-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-100 to-transparent dark:from-violet-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-violet-100 dark:bg-violet-500/20 rounded-xl">
                                <Target className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Completion</p>
                                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{completionRate}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-5 hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-transparent dark:from-emerald-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    {/* In Progress */}
                    <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-5 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">In Progress</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.inProgress}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Time */}
                    <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-5 hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-transparent dark:from-amber-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Time</p>
                                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.totalTime} min</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search lessons or themes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Filters & View Toggle */}
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as LessonStatus | "all")}
                                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 cursor-pointer"
                            >
                                <option value="all">All Lessons</option>
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                                >
                                    Clear
                                </button>
                            )}

                            {/* Refresh Button */}
                            <button
                                onClick={fetchLessons}
                                disabled={loading}
                                className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </button>

                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1" />

                            {/* View Toggle */}
                            <div className="flex items-center bg-gray-100 dark:bg-gray-900/50 rounded-xl p-1">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === "grid"
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === "list"
                                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 py-16 text-center">
                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading lessons...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6">
                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                            <p className="text-red-600 dark:text-red-400 flex-1">{error}</p>
                            <button
                                onClick={fetchLessons}
                                className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Lessons Grid/List */}
                {!loading && !error && paginatedLessons.length > 0 ? (
                    <>
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {paginatedLessons.map((lesson) => (
                                    <LessonCard key={lesson.id} lesson={lesson} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {paginatedLessons.map((lesson) => (
                                    <LessonListItem key={lesson.id} lesson={lesson} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredLessons.length > itemsPerPage && (
                            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    totalItems={filteredLessons.length}
                                />
                            </div>
                        )}
                    </>
                ) : !loading && !error ? (
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/20 rounded-2xl mb-4">
                            <BookOpen className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {hasActiveFilters ? "No lessons found" : "No lessons yet"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            {hasActiveFilters
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Upload a document to generate your first AI-powered lesson."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                onClick={clearFilters}
                                className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
                            >
                                Clear all filters
                            </button>
                        ) : (
                            <Link
                                href="/upload"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
                            >
                                <Sparkles className="w-4 h-4" />
                                Create Your First Lesson
                            </Link>
                        )}
                    </div>
                ) : null}
            </div>
        </DashboardLayout>
    );
}
