"use client";

import React, { ReactNode } from "react";
import { DashboardSidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { useAuth } from "@/context/AuthContext";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { isLoading, isAuthenticated } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // AuthContext will handle redirect if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            {/* Sidebar */}
            <DashboardSidebar />

            {/* Main Content Area */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Header */}
                <DashboardHeader />

                {/* Page Content */}
                <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
