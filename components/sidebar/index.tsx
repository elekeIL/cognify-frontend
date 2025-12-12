"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
    Home,
    Upload,
    BookOpen,
    Library,
    History,
    Settings,
    Brain,
} from "lucide-react";

type NavItem = {
    nameKey: string;
    href: string;
    icon: React.ElementType;
};

const navigationItems: NavItem[] = [
    {
        nameKey: "dashboard",
        href: "/dashboard",
        icon: Home,
    },
    {
        nameKey: "uploadDocument",
        href: "/upload",
        icon: Upload,
    },
    {
        nameKey: "myDocuments",
        href: "/documents",
        icon: Library,
    },
    {
        nameKey: "lessons",
        href: "/lessons",
        icon: BookOpen,
    },
    {
        nameKey: "history",
        href: "/history",
        icon: History,
    },
    {
        nameKey: "settings",
        href: "/settings",
        icon: Settings,
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const t = useTranslations("nav");

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 pb-4">
                {/* Logo */}
                <div className="flex h-16 shrink-0 items-center">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                                <Brain className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cognify
            </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul role="list" className="-mx-2 space-y-1">
                                {navigationItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <li key={item.nameKey}>
                                            <Link
                                                href={item.href}
                                                className={`group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-all ${
                                                    isActive
                                                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                                                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400"
                                                }`}
                                            >
                                                <item.icon
                                                    className={`h-5 w-5 shrink-0 ${
                                                        isActive
                                                            ? "text-white"
                                                            : "text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                                                    }`}
                                                    aria-hidden="true"
                                                />
                                                {t(item.nameKey)}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}