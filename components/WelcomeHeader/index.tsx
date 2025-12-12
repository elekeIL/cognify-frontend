"use client";

import React from "react";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { DashboardStats } from "@/lib/api";

interface User {
    name: string;
    email: string;
    avatar: string;
}

interface WelcomeHeaderProps {
    user: User;
    stats?: DashboardStats | null;
}

export function WelcomeHeader({ user, stats }: WelcomeHeaderProps) {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="relative">
            {/* Main Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Subtle gradient bar at top */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-6">
                        {/* Left Content */}
                        <div className="flex-1 min-w-0">
                            {/* Greeting Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    {getGreeting()}
                                </span>
                            </div>

                            {/* Main Title */}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user.name.split(' ')[0]}</span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                                {getCurrentDate()} • Ready to transform more documents into lessons?
                            </p>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Current Streak</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats?.current_streak_days || 0} days</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{stats?.lessons_completed_this_week || 0} lessons</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Avatar Section */}
                        <div className="hidden lg:block flex-shrink-0">
                            <div className="relative">
                                {/* Decorative rings */}
                                <div className="absolute -inset-4">
                                    <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 blur-2xl animate-pulse" />
                                </div>

                                {/* Avatar */}
                                <div className="relative">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-xl border-4 border-white dark:border-gray-800">
                                        {user.avatar}
                                    </div>

                                    {/* Status indicator */}
                                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-gray-800 shadow-lg">
                                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Progress Bar (Optional) */}
                <div className="px-6 sm:px-8 pb-6">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>Completion Progress</span>
                        <span className="font-medium">{stats?.completed_lessons || 0}/{stats?.total_lessons || 0} lessons</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${stats?.average_completion_rate || 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating Action Hint (Optional) */}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <span className="text-xs">💡</span>
                </div>
                <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Pro tip:</span> Upload multiple documents at once to save time
                </p>
            </div>
        </div>
    );
}