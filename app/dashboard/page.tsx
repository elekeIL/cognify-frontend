"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
    TrendingUp,
    Target,
    FileText,
    BookOpen,
    Clock,
    ArrowRight,
    Upload,
    Brain,
    Volume2,
    Flame,
    ChevronRight,
    Play,
    CheckCircle2,
    Activity,
    ArrowUpRight,
    Star,
    Layers,
    GraduationCap,
    Rocket,
    BarChart3,
    Sun,
    Moon,
    CloudSun,
    Lightbulb,
    Timer,
    TrendingDown,
    Percent,
    BookMarked,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, DashboardResponse } from "@/lib/api";

// =============================================================================
// CUSTOM HOOKS
// =============================================================================

function useIntersectionObserver(threshold = 0.1) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setIsVisible(true);
                    setHasAnimated(true);
                }
            },
            { threshold, rootMargin: "50px" }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, hasAnimated]);

    return { ref, isVisible };
}

function useCountUp(end: number, duration: number = 2000, startOnVisible: boolean = true) {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(!startOnVisible);

    useEffect(() => {
        if (!started) return;

        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, started]);

    return { count, start: () => setStarted(true) };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
    return date.toLocaleDateString();
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good morning", icon: Sun, period: "morning" };
    if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: CloudSun, period: "afternoon" };
    if (hour >= 17 && hour < 21) return { text: "Good evening", icon: CloudSun, period: "evening" };
    return { text: "Good night", icon: Moon, period: "night" };
};

const getMotivationalQuote = (stats: DashboardResponse["stats"] | null) => {
    if (!stats) return "Start your learning journey today!";
    if (stats.current_streak_days >= 7) return "Amazing streak! You're on fire!";
    if (stats.current_streak_days >= 3) return "Great momentum! Keep the streak alive!";
    if (stats.completed_lessons > 0) return "Every lesson brings you closer to mastery!";
    if (stats.total_documents > 0) return "Your documents are ready to become knowledge!";
    return "Upload your first document to begin learning!";
};

// =============================================================================
// SKELETON COMPONENT - Matches actual layout
// =============================================================================

function DashboardSkeleton() {
    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            {/* Hero Skeleton */}
            <div className="relative overflow-hidden rounded-[2rem] h-[340px] lg:h-[320px]">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
                <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent" />

                <div className="relative p-8 lg:p-12 h-full flex flex-col justify-between">
                    {/* Top content */}
                    <div>
                        <div className="h-8 w-48 bg-white/20 dark:bg-white/10 rounded-full mb-6" />
                        <div className="h-12 w-80 bg-white/20 dark:bg-white/10 rounded-xl mb-4" />
                        <div className="h-6 w-64 bg-white/20 dark:bg-white/10 rounded-lg mb-8" />

                        {/* Stat pills */}
                        <div className="flex flex-wrap gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 w-36 bg-white/10 dark:bg-white/5 rounded-2xl" />
                            ))}
                        </div>
                    </div>

                    {/* Bottom progress */}
                    <div className="pt-6 border-t border-white/10">
                        <div className="flex justify-between mb-3">
                            <div className="h-4 w-32 bg-white/20 dark:bg-white/10 rounded" />
                            <div className="h-4 w-24 bg-white/20 dark:bg-white/10 rounded" />
                        </div>
                        <div className="h-3 w-full bg-white/10 dark:bg-white/5 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Stats Row Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="relative overflow-hidden rounded-2xl h-[140px] bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
                        <div className="h-4 w-28 bg-gray-100 dark:bg-gray-700/50 rounded" />
                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-gray-100/50 dark:via-gray-600/10 to-transparent" />
                    </div>
                ))}
            </div>

            {/* Main Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Documents Section */}
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                <div>
                                    <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            </div>
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                                    <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-3 w-32 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                    </div>
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lessons Section */}
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                <div>
                                    <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="h-3 w-28 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            </div>
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                        <div className="p-4 space-y-3">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                                    <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-5 w-52 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-3 w-40 bg-gray-100 dark:bg-gray-700/50 rounded mb-3" />
                                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Quick Actions */}
                    <div>
                        <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50">
                                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3" />
                                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                <div>
                                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="h-3 w-28 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30">
                                    <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                                    <div className="h-7 w-12 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
                                    <div className="h-3 w-20 bg-gray-100 dark:bg-gray-700/50 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features Promo */}
                    <div className="relative overflow-hidden rounded-2xl h-[280px]">
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-800" />
                        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// HERO SECTION - Premium Design
// =============================================================================

function HeroSection({
    user,
    stats,
}: {
    user: { name: string; avatar: string };
    stats: DashboardResponse["stats"] | null;
}) {
    const { ref, isVisible } = useIntersectionObserver();
    const greeting = getGreeting();
    const GreetingIcon = greeting.icon;
    const firstName = user.name.split(" ")[0];

    const streakCount = useCountUp(stats?.current_streak_days || 0, 1500, false);
    const lessonsCount = useCountUp(stats?.completed_lessons || 0, 1500, false);
    const documentsCount = useCountUp(stats?.total_documents || 0, 1500, false);

    useEffect(() => {
        if (isVisible) {
            streakCount.start();
            lessonsCount.start();
            documentsCount.start();
        }
    }, [isVisible]);

    return (
        <div ref={ref} className="relative">
            {/* Main Hero Card */}
            <div
                className={`relative overflow-hidden rounded-[2rem] transition-all duration-1000 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
                {/* Animated Gradient Background - Blue/Indigo theme to match app */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950" />

                {/* Animated Mesh Gradient Overlay */}
                <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
                    <div className="absolute top-0 -right-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-40 left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
                </div>

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

                {/* Content */}
                <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                        {/* Left Content */}
                        <div className="flex-1 max-w-2xl">
                            {/* Greeting Pill */}
                            <div
                                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-5"
                                style={{ animation: isVisible ? "slideInLeft 0.7s ease-out 0.1s both" : "none" }}
                            >
                                <GreetingIcon className="h-4 w-4 text-amber-400" />
                                <span className="text-sm font-medium text-white/90">{greeting.text}</span>
                                <div className="w-1 h-1 rounded-full bg-white/40" />
                                <span className="text-sm text-white/60">
                                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                                </span>
                            </div>

                            {/* Main Heading */}
                            <h1
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight"
                                style={{ animation: isVisible ? "slideInLeft 0.7s ease-out 0.2s both" : "none" }}
                            >
                                Welcome back,{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10 bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                        {firstName}
                                    </span>
                                    <span className="absolute -bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 blur-sm" />
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p
                                className="text-base sm:text-lg text-white/70 mb-6 leading-relaxed max-w-lg"
                                style={{ animation: isVisible ? "slideInLeft 0.7s ease-out 0.3s both" : "none" }}
                            >
                                {getMotivationalQuote(stats)}
                            </p>

                            {/* Quick Stats Row */}
                            <div
                                className="flex flex-wrap gap-3"
                                style={{ animation: isVisible ? "slideInLeft 0.7s ease-out 0.4s both" : "none" }}
                            >
                                {/* Streak */}
                                <div className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 backdrop-blur-sm border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500">
                                            <Flame className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white tabular-nums">{streakCount.count}</p>
                                        <p className="text-xs text-white/60 font-medium">Day Streak</p>
                                    </div>
                                </div>

                                {/* Lessons */}
                                <div className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500">
                                            <GraduationCap className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white tabular-nums">{lessonsCount.count}</p>
                                        <p className="text-xs text-white/60 font-medium">Completed</p>
                                    </div>
                                </div>

                                {/* Documents */}
                                <div className="group flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white tabular-nums">{documentsCount.count}</p>
                                        <p className="text-xs text-white/60 font-medium">Documents</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - CTA Card */}
                        <div
                            className="hidden lg:block"
                            style={{ animation: isVisible ? "slideInRight 0.7s ease-out 0.4s both" : "none" }}
                        >
                            <div className="relative group">
                                {/* Glow Effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                                {/* Card */}
                                <div className="relative p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                                    {/* Avatar */}
                                    <div className="flex justify-center mb-3">
                                        <div className="relative">
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-2xl">
                                                {user.avatar}
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-lg">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress Ring */}
                                    <div className="flex justify-center mb-3">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-20 h-20 transform -rotate-90">
                                                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r="35"
                                                    fill="none"
                                                    stroke="url(#heroGradient)"
                                                    strokeWidth="5"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(stats?.average_completion_rate || 0) * 2.2} 220`}
                                                    className="transition-all duration-1000"
                                                />
                                                <defs>
                                                    <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="50%" stopColor="#6366f1" />
                                                        <stop offset="100%" stopColor="#06b6d4" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-xl font-bold text-white">{Math.round(stats?.average_completion_rate || 0)}%</span>
                                                <span className="text-[9px] text-white/60 uppercase tracking-wider">Complete</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <Link
                                        href="/upload"
                                        className="group/btn flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white text-slate-900 rounded-xl font-semibold text-sm hover:shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>Upload</span>
                                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div
                        className="mt-8 pt-6 border-t border-white/10"
                        style={{ animation: isVisible ? "fadeIn 0.7s ease-out 0.5s both" : "none" }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-white/60" />
                                <span className="text-sm font-medium text-white/80">Learning Progress</span>
                            </div>
                            <span className="text-sm font-semibold text-white">
                                {stats?.completed_lessons || 0} / {stats?.total_lessons || 0} lessons
                            </span>
                        </div>
                        <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: isVisible ? `${Math.min(stats?.average_completion_rate || 0, 100)}%` : "0%" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile CTA */}
            <div className="lg:hidden mt-4">
                <Link
                    href="/upload"
                    className="flex items-center justify-center gap-3 w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                >
                    <Upload className="h-5 w-5" />
                    <span>Upload Document</span>
                    <ArrowRight className="h-5 w-5" />
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// STAT CARDS - Premium Design with proper dark/light mode
// =============================================================================

function StatCard({
    icon: Icon,
    label,
    value,
    change,
    changeType,
    color,
    delay = 0,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    change?: string;
    changeType?: "up" | "down" | "neutral";
    color: "blue" | "purple" | "orange" | "green";
    delay?: number;
}) {
    const { ref, isVisible } = useIntersectionObserver();

    const colorConfig = {
        blue: {
            gradient: "from-blue-500 to-cyan-500",
            light: "bg-blue-100 dark:bg-blue-500/15",
            border: "border-gray-200 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-500/50",
            glow: "hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20",
            text: "text-blue-600 dark:text-blue-400",
        },
        purple: {
            gradient: "from-purple-500 to-pink-500",
            light: "bg-purple-100 dark:bg-purple-500/15",
            border: "border-gray-200 dark:border-gray-700/50 hover:border-purple-300 dark:hover:border-purple-500/50",
            glow: "hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20",
            text: "text-purple-600 dark:text-purple-400",
        },
        orange: {
            gradient: "from-orange-500 to-amber-500",
            light: "bg-orange-100 dark:bg-orange-500/15",
            border: "border-gray-200 dark:border-gray-700/50 hover:border-orange-300 dark:hover:border-orange-500/50",
            glow: "hover:shadow-orange-500/10 dark:hover:shadow-orange-500/20",
            text: "text-orange-600 dark:text-orange-400",
        },
        green: {
            gradient: "from-emerald-500 to-green-500",
            light: "bg-emerald-100 dark:bg-emerald-500/15",
            border: "border-gray-200 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-500/50",
            glow: "hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20",
            text: "text-emerald-600 dark:text-emerald-400",
        },
    };

    const config = colorConfig[color];

    return (
        <div
            ref={ref}
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800/60 backdrop-blur-xl p-5 border ${config.border} transition-all duration-500 hover:shadow-xl ${config.glow} hover:-translate-y-1 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Background Gradient */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${config.gradient} opacity-0 dark:opacity-5 group-hover:opacity-5 dark:group-hover:opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity duration-500`} />

            <div className="relative">
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${config.light}`}>
                        <Icon className={`h-6 w-6 ${config.text}`} />
                    </div>
                    {change && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                            changeType === "up" ? "text-emerald-600 dark:text-emerald-400" : changeType === "down" ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
                        }`}>
                            {changeType === "up" && <TrendingUp className="h-3 w-3" />}
                            {changeType === "down" && <TrendingDown className="h-3 w-3" />}
                            {change}
                        </div>
                    )}
                </div>

                {/* Value */}
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 tabular-nums">{value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            </div>

            {/* Bottom Accent */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </div>
    );
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

function QuickActionsSection() {
    const { ref, isVisible } = useIntersectionObserver();

    const actions = [
        { icon: Upload, label: "Upload", description: "Add documents", href: "/upload", gradient: "from-blue-500 to-indigo-600", delay: 0 },
        { icon: BookOpen, label: "Lessons", description: "Continue learning", href: "/lessons", gradient: "from-purple-500 to-pink-500", delay: 50 },
        { icon: Layers, label: "Library", description: "Browse files", href: "/documents", gradient: "from-orange-500 to-amber-500", delay: 100 },
        { icon: Activity, label: "History", description: "View activity", href: "/history", gradient: "from-emerald-500 to-green-500", delay: 150 },
    ];

    return (
        <div ref={ref} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/50 hover:border-transparent hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        style={{ animation: isVisible ? `fadeIn 0.5s ease-out ${action.delay}ms both` : "none" }}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                        <div className="relative">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-white transition-colors">{action.label}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors mt-0.5">{action.description}</p>
                        </div>
                        <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-white transition-colors" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

// =============================================================================
// DOCUMENTS SECTION
// =============================================================================

function RecentDocumentsSection({ documents }: { documents: DashboardResponse["recent_documents"] }) {
    const { ref, isVisible } = useIntersectionObserver();
    const fileTypeConfig: Record<string, { bg: string; text: string }> = {
        pdf: { bg: "bg-red-100 dark:bg-red-500/15", text: "text-red-600 dark:text-red-400" },
        docx: { bg: "bg-blue-100 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" },
        txt: { bg: "bg-gray-100 dark:bg-gray-500/15", text: "text-gray-600 dark:text-gray-400" },
    };

    return (
        <div ref={ref} className={`bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                        <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Documents</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your latest uploads</p>
                    </div>
                </div>
                <Link href="/documents" className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    View all <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="p-3 sm:p-4">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No documents yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload your first document to get started</p>
                        <Link href="/upload" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105">
                            <Upload className="h-4 w-4" />Upload Document
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc, index) => {
                            const config = fileTypeConfig[doc.file_type] || fileTypeConfig.txt;
                            return (
                                <Link key={doc.id} href={doc.has_lesson ? `/learning/${doc.id}` : `/documents/${doc.id}`} className="group flex items-center gap-4 p-3 sm:p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300" style={{ animation: isVisible ? `slideInLeft 0.4s ease-out ${index * 50}ms both` : "none" }}>
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${config.bg} group-hover:scale-110 transition-transform duration-300`}>
                                        <FileText className={`h-5 w-5 ${config.text}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{doc.title}</p>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="uppercase font-medium">{doc.file_type}</span>
                                            <span>•</span>
                                            <span>{formatRelativeTime(doc.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {doc.status === "completed" && doc.has_lesson && <span className="px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 rounded-full">Ready</span>}
                                        {doc.status === "processing" && <span className="px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 rounded-full animate-pulse">Processing</span>}
                                        <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// LESSONS SECTION
// =============================================================================

function ContinueLearningSection({ lessons }: { lessons: DashboardResponse["recent_lessons"] }) {
    const { ref, isVisible } = useIntersectionObserver();
    const gradients = ["from-blue-500 to-indigo-600", "from-purple-500 to-pink-500", "from-orange-500 to-amber-500", "from-emerald-500 to-green-500"];

    return (
        <div ref={ref} className={`bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                        <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Continue Learning</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pick up where you left off</p>
                    </div>
                </div>
                <Link href="/lessons" className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    View all <ChevronRight className="h-4 w-4" />
                </Link>
            </div>
            <div className="p-3 sm:p-4">
                {lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 mb-4">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No lessons yet</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Upload a document to generate lessons</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {lessons.map((lesson, index) => {
                            const gradient = gradients[index % gradients.length];
                            return (
                                <Link key={lesson.id} href={`/learning/${lesson.document_id}`} className="group relative flex items-start gap-4 p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-300" style={{ animation: isVisible ? `slideInRight 0.4s ease-out ${index * 50}ms both` : "none" }}>
                                    <div className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        {lesson.is_completed && <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 shadow"><CheckCircle2 className="h-3 w-3 text-white" /></div>}
                                        {!lesson.is_completed && lesson.progress_percentage > 0 && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Play className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="white" /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{lesson.title}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{lesson.summary}</p>
                                        <div className="mt-2.5">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <span className={`font-medium ${lesson.is_completed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-600 dark:text-gray-400"}`}>{lesson.is_completed ? "Completed" : lesson.progress_percentage > 0 ? "In Progress" : "Not Started"}</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">{Math.round(lesson.progress_percentage)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${lesson.is_completed ? "bg-gradient-to-r from-emerald-500 to-green-500" : `bg-gradient-to-r ${gradient}`}`} style={{ width: isVisible ? `${lesson.progress_percentage}%` : "0%" }} />
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-3 sm:mt-4" />
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// =============================================================================
// INSIGHTS SECTION
// =============================================================================

function InsightsSection({ stats }: { stats: DashboardResponse["stats"] | null }) {
    const { ref, isVisible } = useIntersectionObserver();
    const insights = [
        { icon: Timer, label: "Avg Session", value: stats?.total_learning_time_minutes ? `${Math.round((stats.total_learning_time_minutes / Math.max(stats.completed_lessons, 1)))}m` : "0m", color: "blue" },
        { icon: Target, label: "Mastery", value: `${Math.round(stats?.learning_outcomes_rate || 0)}%`, color: "green" },
        { icon: Percent, label: "Complete", value: `${Math.round(stats?.average_completion_rate || 0)}%`, color: "purple" },
        { icon: BookMarked, label: "This Week", value: stats?.lessons_completed_this_week || 0, color: "orange" },
    ];
    const colorConfig: Record<string, { gradient: string; bg: string; text: string }> = {
        blue: { gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-100 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400" },
        green: { gradient: "from-emerald-500 to-green-500", bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" },
        purple: { gradient: "from-purple-500 to-pink-500", bg: "bg-purple-100 dark:bg-purple-500/15", text: "text-purple-600 dark:text-purple-400" },
        orange: { gradient: "from-orange-500 to-amber-500", bg: "bg-orange-100 dark:bg-orange-500/15", text: "text-orange-600 dark:text-orange-400" },
    };

    return (
        <div ref={ref} className={`bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                        <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insights</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your metrics</p>
                    </div>
                </div>
            </div>
            <div className="p-3 sm:p-4 grid grid-cols-2 gap-3">
                {insights.map((insight, index) => {
                    const config = colorConfig[insight.color];
                    return (
                        <div key={insight.label} className="relative overflow-hidden p-4 rounded-xl bg-gray-50 dark:bg-gray-900/30" style={{ animation: isVisible ? `scaleIn 0.4s ease-out ${index * 50}ms both` : "none" }}>
                            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${config.gradient} opacity-5 dark:opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
                            <insight.icon className={`h-5 w-5 ${config.text} mb-2`} />
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{insight.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{insight.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// =============================================================================
// FEATURES PROMO
// =============================================================================

function FeaturesPromo() {
    const { ref, isVisible } = useIntersectionObserver();
    return (
        <div ref={ref} className={`relative overflow-hidden rounded-2xl transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEg0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
            <div className="relative p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                    <Rocket className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-semibold text-white/90">Powered by AI</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Transform Any Document</h3>
                <p className="text-sm text-white/70 mb-4">Upload PDFs, DOCX, or TXT files and let AI create personalized lessons.</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {[{ icon: FileText, label: "Multi-format" }, { icon: Brain, label: "AI Analysis" }, { icon: Volume2, label: "Audio Ready" }, { icon: Star, label: "Personalized" }].map((feature, i) => (
                        <div key={feature.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm" style={{ animation: isVisible ? `fadeIn 0.4s ease-out ${i * 100}ms both` : "none" }}>
                            <feature.icon className="h-4 w-4 text-white" />
                            <span className="text-xs font-medium text-white">{feature.label}</span>
                        </div>
                    ))}
                </div>
                <Link href="/upload" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-white/20 hover:scale-[1.02] transition-all duration-300">
                    <Upload className="h-4 w-4" />Start Learning<ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DashboardPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setIsLoading(true);
                const data = await dashboardApi.getDashboard();
                setDashboardData(data);
            } catch (err) {
                console.error("Failed to fetch dashboard:", err);
                setError("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    const getUserInitials = () => {
        if (!user?.full_name) return "U";
        const names = user.full_name.split(" ");
        if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        return names[0].substring(0, 2).toUpperCase();
    };

    const userDisplay = { name: user?.full_name || "User", avatar: getUserInitials() };

    if (isLoading) return <DashboardSkeleton />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">Retry</button>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6">
            <HeroSection user={userDisplay} stats={dashboardData?.stats || null} />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Total Documents" value={dashboardData?.stats?.total_documents || 0} change={`+${dashboardData?.stats?.documents_this_week || 0} this week`} changeType={(dashboardData?.stats?.documents_this_week || 0) > 0 ? "up" : "neutral"} color="blue" delay={0} />
                <StatCard icon={GraduationCap} label="Lessons Completed" value={`${dashboardData?.stats?.completed_lessons || 0}/${dashboardData?.stats?.total_lessons || 0}`} change={`${Math.round(dashboardData?.stats?.average_completion_rate || 0)}% complete`} changeType="neutral" color="purple" delay={50} />
                <StatCard icon={Clock} label="Learning Time" value={formatTime(dashboardData?.stats?.total_learning_time_minutes || 0)} change="Total invested" changeType="neutral" color="orange" delay={100} />
                <StatCard icon={Target} label="Outcomes Mastered" value={dashboardData?.stats?.completed_learning_outcomes || 0} change={`${Math.round(dashboardData?.stats?.learning_outcomes_rate || 0)}% mastery`} changeType={(dashboardData?.stats?.learning_outcomes_rate || 0) > 50 ? "up" : "neutral"} color="green" delay={150} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <RecentDocumentsSection documents={dashboardData?.recent_documents || []} />
                    <ContinueLearningSection lessons={dashboardData?.recent_lessons || []} />
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <QuickActionsSection />
                    <InsightsSection stats={dashboardData?.stats || null} />
                    <FeaturesPromo />
                </div>
            </div>
            <style jsx global>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 25% { transform: translate(20px, -30px) scale(1.1); } 50% { transform: translate(-20px, 20px) scale(0.9); } 75% { transform: translate(30px, 10px) scale(1.05); } }
                .animate-shimmer { animation: shimmer 2s infinite; }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
}
