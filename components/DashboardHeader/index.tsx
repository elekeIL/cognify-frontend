"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Search, Menu, Moon, Sun, LogOut, User, Settings, Brain, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { notificationsApi, searchApi, Notification as ApiNotification, SearchResult } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function DashboardHeader() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Notifications state
    const [notifications, setNotifications] = useState<ApiNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.full_name) return "U";
        const names = user.full_name.split(" ");
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return names[0].substring(0, 2).toUpperCase();
    };

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            setLoadingNotifications(true);
            const [recentNotifications, count] = await Promise.all([
                notificationsApi.getRecent(5),
                notificationsApi.getUnreadCount(),
            ]);
            setNotifications(recentNotifications);
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoadingNotifications(false);
        }
    }, []);

    // Mark notification as read
    const markAsRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: ApiNotification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.action_url) {
            router.push(notification.action_url);
        }
        setShowNotifications(false);
    };

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const response = await searchApi.search(searchQuery);
                    setSearchResults(response.results.slice(0, 5));
                    setShowSearchResults(true);
                } catch (error) {
                    console.error("Search failed:", error);
                }
                setIsSearching(false);
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Mark component as mounted and fetch notifications
    useEffect(() => {
        setMounted(true);
        fetchNotifications();
    }, [fetchNotifications]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleDarkMode = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
                {/* Logo (mobile) */}
                <a href="/dashboard" className="flex items-center gap-2 lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600">
                        <Brain className="h-5 w-5 text-white" />
                    </div>
                </a>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="lg:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Search Bar */}
                <div className="flex flex-1 items-center">
                    <div className="relative w-full max-w-md" ref={searchRef}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="search"
                            placeholder="Search documents, lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none"
                        />

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                                {isSearching ? (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        <div className="max-h-64 overflow-y-auto">
                                            {searchResults.map((result) => (
                                                <Link
                                                    key={`${result.type}-${result.id}`}
                                                    href={result.type === 'lesson' ? `/learning/${result.id}` : `/documents/${result.id}`}
                                                    onClick={() => {
                                                        setShowSearchResults(false);
                                                        setSearchQuery("");
                                                    }}
                                                    className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                                                            result.type === 'lesson'
                                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                        }`}>
                                                            {result.type}
                                                        </span>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {result.title}
                                                        </p>
                                                    </div>
                                                    {result.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                            {result.description}
                                                        </p>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                        No results found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    {mounted && (
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {resolvedTheme === "dark" ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>
                    )}

                    {/* Notifications */}
                    <div className="relative" ref={notificationsRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            Notifications
                                        </h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            >
                                                <Check className="h-3 w-3" />
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {loadingNotifications ? (
                                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            Loading...
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                No notifications yet
                                            </p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={() => handleNotificationClick(notification)}
                                                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                                                    !notification.is_read ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                                                }`}
                                            >
                                                <div className="flex gap-3">
                                                    <div
                                                        className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${
                                                            !notification.is_read
                                                                ? notification.type === "success"
                                                                    ? "bg-green-500"
                                                                    : notification.type === "error"
                                                                    ? "bg-red-500"
                                                                    : notification.type === "warning"
                                                                    ? "bg-yellow-500"
                                                                    : "bg-blue-500"
                                                                : "bg-gray-300 dark:bg-gray-600"
                                                        }`}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {notification.title}
                                                        </p>
                                                        {notification.description && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                {notification.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        href="/notifications"
                                        onClick={() => setShowNotifications(false)}
                                        className="block w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        View all notifications
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Separator */}
                    <div className="hidden sm:block h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

                    {/* Profile Dropdown */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-semibold text-white ring-2 ring-white dark:ring-gray-900">
                                {getUserInitials()}
                            </div>
                            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user?.full_name || "User"}
                            </span>
                        </button>

                        {/* User Menu Dropdown */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.full_name || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {user?.email || ""}
                                    </p>
                                </div>
                                <div className="p-2">
                                    <a
                                        href="/profile"
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <User className="h-4 w-4" />
                                        Your Profile
                                    </a>
                                    <a
                                        href="/settings"
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </a>
                                </div>
                                <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            logout();
                                        }}
                                        className="flex w-full items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
