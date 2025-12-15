"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    User,
    Mail,
    Briefcase,
    Building2,
    Calendar,
    Clock,
    BookOpen,
    FileText,
    Trophy,
    Target,
    TrendingUp,
    Activity,
    Edit3,
    Settings,
    ChevronRight,
    Award,
    Flame,
    CheckCircle2,
    Play,
    Loader2,
    Camera,
    X,
    Check,
} from "lucide-react";
import DashboardLayout from "@/app/dashboard/layout";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, activitiesApi, DashboardStats, Activity as ActivityType, settingsApi } from "@/lib/api";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
};

const getActivityIcon = (type: string) => {
    switch (type) {
        case "document_uploaded":
            return FileText;
        case "lesson_started":
            return Play;
        case "lesson_completed":
            return CheckCircle2;
        default:
            return Activity;
    }
};

const getActivityColor = (type: string) => {
    switch (type) {
        case "document_uploaded":
            return "blue";
        case "lesson_started":
            return "amber";
        case "lesson_completed":
            return "green";
        default:
            return "gray";
    }
};

// =============================================================================
// COMPONENTS
// =============================================================================

function ProfileSkeleton() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Skeleton */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 h-64 animate-pulse" />

            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))}
            </div>

            {/* Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            </div>
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    subValue,
    color,
    delay = 0,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subValue?: string;
    color: "blue" | "purple" | "orange" | "green" | "amber" | "rose";
    delay?: number;
}) {
    const colorClasses = {
        blue: {
            bg: "bg-blue-500",
            light: "bg-blue-50 dark:bg-blue-500/10",
            text: "text-blue-600 dark:text-blue-400",
            ring: "ring-blue-500/20",
            gradient: "from-blue-500 to-indigo-500",
        },
        purple: {
            bg: "bg-purple-500",
            light: "bg-purple-50 dark:bg-purple-500/10",
            text: "text-purple-600 dark:text-purple-400",
            ring: "ring-purple-500/20",
            gradient: "from-purple-500 to-pink-500",
        },
        orange: {
            bg: "bg-orange-500",
            light: "bg-orange-50 dark:bg-orange-500/10",
            text: "text-orange-600 dark:text-orange-400",
            ring: "ring-orange-500/20",
            gradient: "from-orange-500 to-amber-500",
        },
        green: {
            bg: "bg-green-500",
            light: "bg-green-50 dark:bg-green-500/10",
            text: "text-green-600 dark:text-green-400",
            ring: "ring-green-500/20",
            gradient: "from-green-500 to-emerald-500",
        },
        amber: {
            bg: "bg-amber-500",
            light: "bg-amber-50 dark:bg-amber-500/10",
            text: "text-amber-600 dark:text-amber-400",
            ring: "ring-amber-500/20",
            gradient: "from-amber-500 to-yellow-500",
        },
        rose: {
            bg: "bg-rose-500",
            light: "bg-rose-50 dark:bg-rose-500/10",
            text: "text-rose-600 dark:text-rose-400",
            ring: "ring-rose-500/20",
            gradient: "from-rose-500 to-pink-500",
        },
    };

    const classes = colorClasses[color];

    return (
        <div
            className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/60 p-5 border border-gray-200 dark:border-gray-700/50 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/30 transition-all duration-500 hover:-translate-y-1"
            style={{
                animation: `slideUp 0.6s ease-out ${delay}s both`,
            }}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${classes.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            <div className="relative flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${classes.light} ${classes.text} ring-4 ${classes.ring} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                        {value}
                    </p>
                    {subValue && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {subValue}
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${classes.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </div>
    );
}

function ActivityItem({
    activity,
    delay = 0,
}: {
    activity: ActivityType;
    delay?: number;
}) {
    const Icon = getActivityIcon(activity.activity_type);
    const color = getActivityColor(activity.activity_type);

    const colorClasses = {
        blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
        amber: "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
        green: "bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400",
        gray: "bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400",
    };

    return (
        <div
            className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300"
            style={{
                animation: `fadeIn 0.5s ease-out ${delay}s both`,
            }}
        >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color as keyof typeof colorClasses]} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {activity.title}
                </p>
                {activity.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {activity.description}
                    </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatRelativeTime(activity.created_at)}
                </p>
            </div>
        </div>
    );
}

function AchievementBadge({
    icon: Icon,
    title,
    description,
    unlocked,
    delay = 0,
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    unlocked: boolean;
    delay?: number;
}) {
    return (
        <div
            className={`group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-500 ${
                unlocked
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border-amber-200 dark:border-amber-500/30"
                    : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700/50 opacity-50"
            }`}
            style={{
                animation: `scaleIn 0.5s ease-out ${delay}s both`,
            }}
        >
            <div className={`flex h-14 w-14 items-center justify-center rounded-xl mb-3 ${
                unlocked
                    ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            } group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-7 w-7" />
            </div>
            <p className={`text-sm font-semibold text-center ${
                unlocked ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
            }`}>
                {title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                {description}
            </p>
            {unlocked && (
                <div className="absolute -top-1 -right-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                        <Check className="h-3 w-3" />
                    </div>
                </div>
            )}
        </div>
    );
}

function EditProfileModal({
    isOpen,
    onClose,
    currentName,
    currentCompany,
    currentRole,
    onSave,
}: {
    isOpen: boolean;
    onClose: () => void;
    currentName: string;
    currentCompany: string;
    currentRole: string;
    onSave: (name: string, company: string, role: string) => Promise<void>;
}) {
    const [name, setName] = useState(currentName);
    const [company, setCompany] = useState(currentCompany);
    const [role, setRole] = useState(currentRole);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
            setCompany(currentCompany);
            setRole(currentRole);
        }
    }, [isOpen, currentName, currentCompany, currentRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(name, company, role);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                style={{ animation: "fadeIn 0.2s ease-out" }}
            />
            <div
                className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
                style={{ animation: "scaleIn 0.3s ease-out" }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h3>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Company
                        </label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="Where do you work?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Role
                        </label>
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            placeholder="What do you do?"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ProfilePage() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [dashboardData, recentActivities] = await Promise.all([
                dashboardApi.getStats(),
                activitiesApi.getRecent(5),
            ]);
            setStats(dashboardData);
            setActivities(recentActivities);
        } catch (error) {
            console.error("Failed to fetch profile data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveProfile = async (name: string, company: string, role: string) => {
        await settingsApi.updateProfile({
            full_name: name,
            company: company || undefined,
            role: role || undefined,
        });
        await refreshUser();
    };

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Calculate achievements
    const achievements = [
        {
            icon: Trophy,
            title: "First Steps",
            description: "Upload your first document",
            unlocked: (stats?.total_documents || 0) >= 1,
        },
        {
            icon: BookOpen,
            title: "Quick Learner",
            description: "Complete 5 lessons",
            unlocked: (stats?.completed_lessons || 0) >= 5,
        },
        {
            icon: Flame,
            title: "On Fire",
            description: "Maintain a 7-day streak",
            unlocked: (stats?.current_streak_days || 0) >= 7,
        },
        {
            icon: Target,
            title: "Goal Crusher",
            description: "Master 10 learning outcomes",
            unlocked: (stats?.completed_learning_outcomes || 0) >= 10,
        },
        {
            icon: Clock,
            title: "Dedicated",
            description: "Spend 5 hours learning",
            unlocked: (stats?.total_learning_time_minutes || 0) >= 300,
        },
        {
            icon: Award,
            title: "Scholar",
            description: "Upload 10 documents",
            unlocked: (stats?.total_documents || 0) >= 10,
        },
    ];

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    if (isLoading) {
        return (
            <DashboardLayout>
                <ProfileSkeleton />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section with Gradient Background */}
                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{ animation: "fadeIn 0.6s ease-out" }}
                >
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />

                    {/* Content */}
                    <div className="relative px-8 py-12 md:py-16">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-2xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                                    {user?.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.full_name}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    ) : (
                                        getInitials(user?.full_name || "?")
                                    )}
                                </div>
                                <button
                                    className="absolute -bottom-2 -right-2 flex items-center justify-center h-10 w-10 bg-white dark:bg-gray-800 rounded-xl border-2 border-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                                    onClick={() => setShowEditModal(true)}
                                >
                                    <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                                        {user?.full_name || "User"}
                                    </h1>
                                    {user?.is_verified && (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 backdrop-blur-sm rounded-full">
                                            <CheckCircle2 className="w-4 h-4 text-green-300" />
                                            <span className="text-xs font-medium text-green-300">Verified</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/80 mb-4">
                                    {user?.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm">{user.email}</span>
                                        </div>
                                    )}
                                    {user?.role && (
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="text-sm">{user.role}</span>
                                        </div>
                                    )}
                                    {user?.company && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            <span className="text-sm">{user.company}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-center md:justify-start gap-2 text-white/60 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {user?.created_at ? formatDate(user.created_at) : "Unknown"}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-medium"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                    <Link
                                        href="/settings"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-600 rounded-xl hover:shadow-lg hover:shadow-white/25 transition-all duration-300 text-sm font-medium"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        icon={FileText}
                        label="Documents"
                        value={stats?.total_documents || 0}
                        subValue={`${stats?.documents_this_week || 0} this week`}
                        color="blue"
                        delay={0.1}
                    />
                    <StatCard
                        icon={BookOpen}
                        label="Lessons Completed"
                        value={stats?.completed_lessons || 0}
                        subValue={`of ${stats?.total_lessons || 0} total`}
                        color="purple"
                        delay={0.2}
                    />
                    <StatCard
                        icon={Clock}
                        label="Learning Time"
                        value={formatTime(stats?.total_learning_time_minutes || 0)}
                        subValue={`${stats?.current_streak_days || 0} day streak`}
                        color="orange"
                        delay={0.3}
                    />
                    <StatCard
                        icon={Target}
                        label="Outcomes Mastered"
                        value={stats?.completed_learning_outcomes || 0}
                        subValue={`${Math.round(stats?.learning_outcomes_rate || 0)}% success rate`}
                        color="green"
                        delay={0.4}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Achievements Section */}
                    <div
                        className="lg:col-span-2 bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden"
                        style={{ animation: "slideUp 0.6s ease-out 0.3s both" }}
                    >
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/5 dark:to-orange-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/25">
                                        <Trophy className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{unlockedCount} of {achievements.length} unlocked</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-500/20 rounded-full">
                                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{unlockedCount}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {achievements.map((achievement, index) => (
                                    <AchievementBadge
                                        key={achievement.title}
                                        icon={achievement.icon}
                                        title={achievement.title}
                                        description={achievement.description}
                                        unlocked={achievement.unlocked}
                                        delay={0.4 + index * 0.1}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Section */}
                    <div
                        className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden"
                        style={{ animation: "slideUp 0.6s ease-out 0.4s both" }}
                    >
                        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                                        <Activity className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Your latest actions</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            {activities.length > 0 ? (
                                <div className="space-y-1">
                                    {activities.map((activity, index) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity}
                                            delay={0.5 + index * 0.1}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl mb-4">
                                        <Activity className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">No recent activity</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Start learning to see your activity here
                                    </p>
                                </div>
                            )}
                        </div>
                        {activities.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/50">
                                <Link
                                    href="/history"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                    View all activity
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Learning Progress Overview */}
                <div
                    className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden"
                    style={{ animation: "slideUp 0.6s ease-out 0.5s both" }}
                >
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/5 dark:to-emerald-500/5">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/25">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Learning Progress</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Your overall learning statistics</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Completion Rate */}
                            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                                <div className="relative w-28 h-28 mb-4">
                                    <svg className="w-28 h-28 transform -rotate-90">
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="50"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="50"
                                            fill="none"
                                            stroke="url(#progressGradient)"
                                            strokeWidth="8"
                                            strokeLinecap="round"
                                            strokeDasharray={`${(stats?.average_completion_rate || 0) * 3.14} 314`}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                        <defs>
                                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#22c55e" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {Math.round(stats?.average_completion_rate || 0)}%
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Completion Rate</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Average lesson completion</p>
                            </div>

                            {/* Current Streak */}
                            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                                <div className="flex items-center justify-center w-28 h-28 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
                                    <div className="text-center">
                                        <Flame className="w-10 h-10 text-white mx-auto" />
                                        <span className="text-3xl font-bold text-white">{stats?.current_streak_days || 0}</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Day Streak</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Keep the momentum going!</p>
                            </div>

                            {/* Total Time */}
                            <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-900/30 rounded-2xl">
                                <div className="flex items-center justify-center w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
                                    <div className="text-center">
                                        <Clock className="w-10 h-10 text-white mx-auto" />
                                        <span className="text-2xl font-bold text-white">
                                            {formatTime(stats?.total_learning_time_minutes || 0)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">Total Time</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Time invested in learning</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                currentName={user?.full_name || ""}
                currentCompany={user?.company || ""}
                currentRole={user?.role || ""}
                onSave={handleSaveProfile}
            />

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}
