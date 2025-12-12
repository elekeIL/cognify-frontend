"use client";

import React from "react";
import { FileText, BookOpen, Clock, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { DashboardStats } from "@/lib/api";

interface Stat {
    label: string;
    value: string;
    change: string;
    changeValue: number;
    changeType: "positive" | "negative" | "neutral";
    icon: React.ElementType;
    color: string;
}

interface LearningStatsCardsProps {
    stats?: DashboardStats | null;
}

// Format minutes to hours and minutes
const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export function LearningStatsCards({ stats }: LearningStatsCardsProps) {
    const displayStats: Stat[] = [
        {
            label: "Documents Uploaded",
            value: stats?.total_documents?.toString() || "0",
            change: `${stats?.documents_this_week || 0} this week`,
            changeValue: stats?.documents_this_week || 0,
            changeType: (stats?.documents_this_week || 0) > 0 ? "positive" : "neutral",
            icon: FileText,
            color: "blue",
        },
        {
            label: "Lessons Generated",
            value: stats?.total_lessons?.toString() || "0",
            change: `${stats?.completed_lessons || 0} completed`,
            changeValue: stats?.lessons_completed_this_week || 0,
            changeType: (stats?.lessons_completed_this_week || 0) > 0 ? "positive" : "neutral",
            icon: BookOpen,
            color: "purple",
        },
        {
            label: "Total Learning Time",
            value: formatTime(stats?.total_learning_time_minutes || 0),
            change: `${stats?.current_streak_days || 0} day streak`,
            changeValue: stats?.current_streak_days || 0,
            changeType: (stats?.current_streak_days || 0) > 0 ? "positive" : "neutral",
            icon: Clock,
            color: "orange",
        },
        {
            label: "Learning Outcomes",
            value: `${stats?.completed_learning_outcomes || 0}/${stats?.total_learning_outcomes || 0}`,
            change: `${Math.round(stats?.learning_outcomes_rate || 0)}% mastered`,
            changeValue: Math.round(stats?.learning_outcomes_rate || 0),
            changeType: (stats?.learning_outcomes_rate || 0) >= 50 ? "positive" : "neutral",
            icon: TrendingUp,
            color: "green",
        },
    ];
    const getColorClasses = (color: string) => {
        const colors = {
            blue: {
                bg: "bg-blue-500",
                light: "bg-blue-50 dark:bg-blue-900/20",
                text: "text-blue-600 dark:text-blue-400",
                ring: "ring-blue-500/20",
            },
            purple: {
                bg: "bg-purple-500",
                light: "bg-purple-50 dark:bg-purple-900/20",
                text: "text-purple-600 dark:text-purple-400",
                ring: "ring-purple-500/20",
            },
            orange: {
                bg: "bg-orange-500",
                light: "bg-orange-50 dark:bg-orange-900/20",
                text: "text-orange-600 dark:text-orange-400",
                ring: "ring-orange-500/20",
            },
            green: {
                bg: "bg-green-500",
                light: "bg-green-50 dark:bg-green-900/20",
                text: "text-green-600 dark:text-green-400",
                ring: "ring-green-500/20",
            },
        };
        return colors[color as keyof typeof colors];
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {displayStats.map((stat, index) => {
                const colors = getColorClasses(stat.color);
                const Icon = stat.icon;
                const ChangeIcon = stat.changeType === "positive" ? ArrowUp : ArrowDown;

                return (
                    <div
                        key={stat.label}
                        className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                        style={{
                            animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                        }}
                    >
                        {/* Icon Container */}
                        <div className="flex items-start justify-between mb-4">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colors.light} ${colors.text} ring-4 ${colors.ring} group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="h-5 w-5" />
                            </div>

                            {/* Change Badge */}
                            {stat.changeType !== "neutral" && (
                                <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                                    stat.changeType === "positive"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                }`}>
                                    <ChangeIcon className="h-3 w-3" />
                                    <span>{stat.changeValue}%</span>
                                </div>
                            )}
                        </div>

                        {/* Stats Content */}
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {stat.value}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {stat.change}
                            </p>
                        </div>

                        {/* Hover Effect Bar */}
                        <div className={`absolute bottom-0 left-0 h-1 ${colors.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                    </div>
                );
            })}

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}