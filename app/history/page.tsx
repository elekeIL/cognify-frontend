"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import Link from "next/link";
import {
    Search,
    Upload,
    FileText,
    BookOpen,
    CheckCircle2,
    XCircle,
    Clock,
    Play,
    Pause,
    Volume2,
    Trash2,
    Eye,
    Filter,
    Calendar,
    ChevronRight,
    ChevronLeft,
    ChevronsLeft,
    ChevronsRight,
    X,
    Sparkles,
    Loader2,
    Download,
    RotateCcw,
    Activity,
    TrendingUp,
    FileUp,
    GraduationCap,
    RefreshCw,
    AlertCircle,
    User,
    Lock,
    LogIn,
} from "lucide-react";
import { activitiesApi, Activity as ApiActivity, ActivityListResponse } from "@/lib/api";

// =============================================================================
// TYPES
// =============================================================================

type ActivityType =
    | "document_uploaded"
    | "document_processed"
    | "document_deleted"
    | "lesson_started"
    | "lesson_completed"
    | "profile_updated"
    | "password_changed"
    | "login"
    | "logout"
    | "processing_failed";

interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: string;
    entityType?: string;
    entityId?: string;
}

type FilterType = "all" | "documents" | "lessons" | "account";
type DateFilter = "all" | "today" | "week" | "month";

// =============================================================================
// CONSTANTS
// =============================================================================

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatTimestamp(iso: string): { date: string; time: string; relative: string } {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let relative: string;
    if (diffMins < 1) relative = "Just now";
    else if (diffMins < 60) relative = `${diffMins}m ago`;
    else if (diffHours < 24) relative = `${diffHours}h ago`;
    else if (diffDays === 1) relative = "Yesterday";
    else if (diffDays < 7) relative = `${diffDays} days ago`;
    else relative = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
        relative,
    };
}

function isToday(iso: string): boolean {
    const date = new Date(iso);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isThisWeek(iso: string): boolean {
    const date = new Date(iso);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= weekAgo;
}

function isThisMonth(iso: string): boolean {
    const date = new Date(iso);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

// Map API activity to local format
function mapApiActivity(apiActivity: ApiActivity): ActivityItem {
    return {
        id: apiActivity.id,
        type: apiActivity.activity_type as ActivityType,
        title: apiActivity.title,
        description: apiActivity.description || "",
        timestamp: apiActivity.created_at,
        entityType: apiActivity.entity_type,
        entityId: apiActivity.entity_id,
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function ActivityIcon({ type }: { type: ActivityType }) {
    const config: Record<ActivityType, { icon: any; gradient: string; shadow: string }> = {
        document_uploaded: {
            icon: FileUp,
            gradient: "from-blue-500 to-cyan-500",
            shadow: "shadow-blue-500/25",
        },
        document_processed: {
            icon: Sparkles,
            gradient: "from-emerald-500 to-teal-500",
            shadow: "shadow-emerald-500/25",
        },
        document_deleted: {
            icon: Trash2,
            gradient: "from-gray-500 to-slate-500",
            shadow: "shadow-gray-500/25",
        },
        lesson_started: {
            icon: Play,
            gradient: "from-violet-500 to-purple-500",
            shadow: "shadow-violet-500/25",
        },
        lesson_completed: {
            icon: GraduationCap,
            gradient: "from-emerald-500 to-green-500",
            shadow: "shadow-emerald-500/25",
        },
        profile_updated: {
            icon: User,
            gradient: "from-blue-500 to-indigo-500",
            shadow: "shadow-blue-500/25",
        },
        password_changed: {
            icon: Lock,
            gradient: "from-amber-500 to-orange-500",
            shadow: "shadow-amber-500/25",
        },
        login: {
            icon: LogIn,
            gradient: "from-green-500 to-emerald-500",
            shadow: "shadow-green-500/25",
        },
        logout: {
            icon: LogIn,
            gradient: "from-gray-500 to-slate-500",
            shadow: "shadow-gray-500/25",
        },
        processing_failed: {
            icon: XCircle,
            gradient: "from-red-500 to-rose-500",
            shadow: "shadow-red-500/25",
        },
    };

    const { icon: Icon, gradient, shadow } = config[type] || config.document_uploaded;

    return (
        <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-md opacity-40`} />
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow}`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
        </div>
    );
}

function ActivityCard({ activity }: { activity: ActivityItem }) {
    const { time, relative } = formatTimestamp(activity.timestamp);

    const getActionButton = () => {
        switch (activity.type) {
            case "lesson_completed":
            case "lesson_started":
                return activity.entityId ? (
                    <Link
                        href={`/learning/${activity.entityId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 rounded-xl ring-1 ring-violet-200 dark:ring-violet-500/20 transition-all hover:scale-[1.02]"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        View Lesson
                    </Link>
                ) : null;
            case "document_processed":
                return activity.entityId ? (
                    <Link
                        href={`/learning/${activity.entityId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl ring-1 ring-emerald-200 dark:ring-emerald-500/20 transition-all hover:scale-[1.02]"
                    >
                        <BookOpen className="w-3.5 h-3.5" />
                        View Lesson
                    </Link>
                ) : null;
            case "document_uploaded":
                return activity.entityId ? (
                    <Link
                        href={`/documents`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl ring-1 ring-blue-200 dark:ring-blue-500/20 transition-all hover:scale-[1.02]"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        View Documents
                    </Link>
                ) : null;
            default:
                return null;
        }
    };

    return (
        <div className="group relative flex gap-4 p-5 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/30 transition-all duration-300 hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-violet-50/0 to-purple-50/0 group-hover:from-blue-50/50 group-hover:via-violet-50/30 group-hover:to-purple-50/50 dark:group-hover:from-blue-900/10 dark:group-hover:via-violet-900/5 dark:group-hover:to-purple-900/10 rounded-2xl transition-all duration-300" />
            <div className="relative">
                <ActivityIcon type={activity.type} />
            </div>

            <div className="relative flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {activity.title}
                        </h3>
                        {activity.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.description}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                            {relative}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {time}
                        </span>
                    </div>
                </div>

                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    {getActionButton()}
                </div>
            </div>
        </div>
    );
}

function DateGroupHeader({ date, count }: { date: string; count: number }) {
    return (
        <div className="flex items-center gap-4 py-3">
            <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date}</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 via-gray-200 to-transparent dark:from-gray-700 dark:via-gray-700 dark:to-transparent" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">{count} activities</span>
        </div>
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

export default function HistoryPage() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<FilterType>("all");
    const [dateFilter, setDateFilter] = useState<DateFilter>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalFromApi, setTotalFromApi] = useState(0);

    // Fetch activities from API
    const fetchActivities = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await activitiesApi.list(1, 100); // Fetch all for client-side filtering
            const mappedActivities = response.items.map(mapApiActivity);
            setActivities(mappedActivities);
            setTotalFromApi(response.total);
        } catch (err) {
            console.error("Failed to fetch activities:", err);
            setError("Failed to load activity history. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    // Filter activities
    const filteredActivities = useMemo(() => {
        let result = [...activities];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (act) =>
                    act.title.toLowerCase().includes(query) ||
                    act.description.toLowerCase().includes(query)
            );
        }

        // Type filter
        if (typeFilter !== "all") {
            const typeMap: Record<FilterType, ActivityType[]> = {
                all: [],
                documents: ["document_uploaded", "document_processed", "document_deleted", "processing_failed"],
                lessons: ["lesson_started", "lesson_completed"],
                account: ["profile_updated", "password_changed", "login", "logout"],
            };
            result = result.filter((act) => typeMap[typeFilter].includes(act.type));
        }

        // Date filter
        if (dateFilter !== "all") {
            result = result.filter((act) => {
                switch (dateFilter) {
                    case "today":
                        return isToday(act.timestamp);
                    case "week":
                        return isThisWeek(act.timestamp);
                    case "month":
                        return isThisMonth(act.timestamp);
                    default:
                        return true;
                }
            });
        }

        // Sort by timestamp (newest first)
        result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return result;
    }, [activities, searchQuery, typeFilter, dateFilter]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredActivities.length / itemsPerPage));
    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Group paginated activities by date
    const paginatedGroups = useMemo(() => {
        const groups: Record<string, ActivityItem[]> = {};

        paginatedActivities.forEach((activity) => {
            const date = new Date(activity.timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let key: string;
            if (date.toDateString() === today.toDateString()) {
                key = "Today";
            } else if (date.toDateString() === yesterday.toDateString()) {
                key = "Yesterday";
            } else {
                key = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
            }

            if (!groups[key]) groups[key] = [];
            groups[key].push(activity);
        });

        return groups;
    }, [paginatedActivities]);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, dateFilter, itemsPerPage]);

    const clearFilters = () => {
        setSearchQuery("");
        setTypeFilter("all");
        setDateFilter("all");
    };

    const hasActiveFilters = searchQuery || typeFilter !== "all" || dateFilter !== "all";

    // Stats
    const stats = {
        total: activities.length,
        today: activities.filter((a) => isToday(a.timestamp)).length,
        uploads: activities.filter((a) => a.type === "document_uploaded").length,
        completions: activities.filter((a) => a.type === "lesson_completed").length,
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Activity History
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Track your learning journey and document activity
                        </p>
                    </div>
                    <Link
                        href="/upload"
                        className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                        <Upload className="relative w-4 h-4 text-white" />
                        <span className="relative text-white">New Upload</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="group relative bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-700/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Activity</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-5 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Today</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.today}</p>
                            </div>
                        </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-200 dark:border-violet-800/50 p-5 hover:shadow-lg hover:shadow-violet-200/50 dark:hover:shadow-violet-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-100 to-transparent dark:from-violet-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 bg-violet-100 dark:bg-violet-500/20 rounded-xl">
                                <FileUp className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Uploads</p>
                                <p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{stats.uploads}</p>
                            </div>
                        </div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-5 hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-transparent dark:from-emerald-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
                                <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.completions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search activity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as FilterType)}
                                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="documents">Documents</option>
                                <option value="lessons">Lessons</option>
                                <option value="account">Account</option>
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                                className="px-3 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
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
                                onClick={fetchActivities}
                                disabled={loading}
                                className="p-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 py-16 text-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading activity history...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6">
                        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                            <p className="text-red-600 dark:text-red-400 flex-1">{error}</p>
                            <button
                                onClick={fetchActivities}
                                className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                )}

                {/* Activity Timeline */}
                {!loading && !error && paginatedActivities.length > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(paginatedGroups).map(([date, acts]) => (
                            <div key={date} className="space-y-3">
                                <DateGroupHeader date={date} count={acts.length} />
                                <div className="space-y-3 pl-2">
                                    {acts.map((activity) => (
                                        <ActivityCard key={activity.id} activity={activity} />
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {filteredActivities.length > itemsPerPage && (
                            <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-lg shadow-gray-200/30 dark:shadow-gray-900/20 p-4">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    totalItems={filteredActivities.length}
                                />
                            </div>
                        )}
                    </div>
                ) : !loading && !error ? (
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 py-16 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl mb-4 shadow-lg">
                            <Activity className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {hasActiveFilters ? "No activity found" : "No activity yet"}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                            {hasActiveFilters
                                ? "Try adjusting your filters to find what you're looking for."
                                : "Upload a document or start a lesson to see your activity here."}
                        </p>
                        {hasActiveFilters ? (
                            <button
                                onClick={clearFilters}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                                Clear all filters
                            </button>
                        ) : (
                            <Link
                                href="/upload"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Document
                            </Link>
                        )}
                    </div>
                ) : null}
            </div>
        </DashboardLayout>
    );
}
