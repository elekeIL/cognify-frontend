"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { RecentLesson, DashboardStats } from "@/lib/api";

interface QuickAccessLessonsProps {
    lessons: RecentLesson[];
    stats?: DashboardStats | null;
}

// Format minutes to readable time
const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Get gradient color based on index
const getGradient = (index: number): string => {
    const gradients = [
        "bg-gradient-to-br from-blue-500 to-cyan-500",
        "bg-gradient-to-br from-purple-500 to-pink-500",
        "bg-gradient-to-br from-orange-500 to-red-500",
        "bg-gradient-to-br from-green-500 to-emerald-500",
    ];
    return gradients[index % gradients.length];
};

export function QuickAccessLessons({ lessons, stats }: QuickAccessLessonsProps) {
    return (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Continue Learning
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Pick up where you left off
                    </p>
                </div>
                <Link
                    href="/lessons"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View all
                </Link>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
                {lessons.length === 0 ? (
                    <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            No lessons yet. Upload a document to get started!
                        </p>
                    </div>
                ) : (
                    lessons.map((lesson, index) => (
                        <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="group"
                        >
                            <Link
                                href={`/learning/${lesson.document_id}`}
                                className="block relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Thumbnail */}
                                    <div className={`relative h-14 w-14 shrink-0 rounded-lg ${getGradient(index)} flex items-center justify-center shadow-lg`}>
                                        <BookOpen className="h-6 w-6 text-white" />

                                        {/* Play Icon Overlay */}
                                        {lesson.progress_percentage > 0 && lesson.progress_percentage < 100 && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <PlayCircle className="h-6 w-6 text-white" />
                                            </div>
                                        )}

                                        {/* Completed Badge */}
                                        {lesson.is_completed && (
                                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 border-2 border-white dark:border-gray-900">
                                                <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {lesson.title}
                                            </h3>
                                            <ArrowRight className="h-4 w-4 text-gray-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Summary */}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                            {lesson.summary}
                                        </p>

                                        {/* Progress Bar */}
                                        {lesson.progress_percentage > 0 && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        {lesson.is_completed ? "Completed" : "In Progress"}
                                                    </span>
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {Math.round(lesson.progress_percentage)}%
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${lesson.progress_percentage}%` }}
                                                        transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                                                        className={`h-full rounded-full ${
                                                            lesson.is_completed
                                                                ? "bg-green-500"
                                                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Start Badge for New Lessons */}
                                        {lesson.progress_percentage === 0 && (
                                            <div className="mt-3">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                                    <PlayCircle className="h-3 w-3" />
                                                    Start Learning
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Hover Effect Border */}
                                <div className="absolute inset-0 rounded-lg border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </Link>
                        </motion.div>
                    ))
                )}
            </div>

            {/* View All Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                    href="/lessons"
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                    <span>View All Lessons</span>
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            {/* Learning Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                            <BookOpen className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            This Week
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.lessons_completed_this_week || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Lessons completed
                    </p>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
                            <Clock className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                            Total Time
                        </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatTime(stats?.total_learning_time_minutes || 0)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Learning time
                    </p>
                </div>
            </div>
        </div>
    );
}