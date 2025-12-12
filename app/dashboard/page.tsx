"use client";

import React, { useEffect, useState } from "react";
import { WelcomeHeader } from "@/components/WelcomeHeader";
import { LearningStatsCards } from "@/components/StatCard";
import { UploadCTA } from "@/components/CTACard";
import { RecentDocumentsGrid } from "@/components/DocumentGrid";
import { QuickAccessLessons } from "@/components/QuickAccess";
import { useAuth } from "@/context/AuthContext";
import { dashboardApi, DashboardResponse } from "@/lib/api";

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

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.full_name) return "U";
        const names = user.full_name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    };

    const userDisplay = {
        name: user?.full_name || "User",
        email: user?.email || "",
        avatar: getUserInitials(),
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-8 animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                        ))}
                    </div>
                    <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
                <WelcomeHeader user={userDisplay} stats={dashboardData?.stats} />
                <LearningStatsCards stats={dashboardData?.stats} />
                <UploadCTA />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Recent Documents (2/3 width) */}
                    <div className="lg:col-span-2">
                        <RecentDocumentsGrid documents={dashboardData?.recent_documents || []} />
                    </div>

                    {/* Right Column - Quick Access (1/3 width) */}
                    <div className="lg:col-span-1">
                        <QuickAccessLessons lessons={dashboardData?.recent_lessons || []} stats={dashboardData?.stats} />
                    </div>
                </div>
            </div>
        </div>
    );
}
