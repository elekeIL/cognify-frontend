"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Search, Menu, Moon, Sun, LogOut, User, Settings, Brain, Check, FileText, BookOpen, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
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
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Get the correct route for a search result
    const getSearchResultUrl = (result: SearchResult): string => {
        if (result.type === "lesson") {
            // Lessons navigate to /learning/{document_id}
            return `/learning/${result.document_id || result.id}`;
        }
        // Documents navigate to /learning/{document_id} if completed, otherwise /documents
        if (result.status === "completed") {
            return `/learning/${result.document_id || result.id}`;
        }
        return `/documents`;
    };

    // Handle search result selection (keyboard or click)
    const handleSelectResult = (result: SearchResult) => {
        const url = getSearchResultUrl(result);
        router.push(url);
        setShowSearchResults(false);
        setSearchQuery("");
        setSelectedIndex(-1);
    };

    // Handle keyboard navigation in search
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSearchResults || searchResults.length === 0) {
            if (e.key === "Escape") {
                setShowSearchResults(false);
                searchInputRef.current?.blur();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < searchResults.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : searchResults.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
                    handleSelectResult(searchResults[selectedIndex]);
                }
                break;
            case "Escape":
                e.preventDefault();
                setShowSearchResults(false);
                setSelectedIndex(-1);
                searchInputRef.current?.blur();
                break;
        }
    };

    // Debounced search
    useEffect(() => {
        // Show dropdown immediately when user types anything
        if (searchQuery.trim().length >= 1) {
            setShowSearchResults(true);
        } else {
            setShowSearchResults(false);
            setSearchResults([]);
            setSelectedIndex(-1);
            return;
        }

        // Only search if 2+ characters
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setSelectedIndex(-1);
            return;
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true);
            setSelectedIndex(-1);
            try {
                const response = await searchApi.search(searchQuery);
                setSearchResults(response.results.slice(0, 8));
            } catch (error) {
                console.error("Search failed:", error);
                setSearchResults([]);
            }
            setIsSearching(false);
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
                            ref={searchInputRef}
                            type="search"
                            placeholder="Search documents, lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full h-10 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all outline-none"
                        />
                        {isSearching && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                        )}

                        {/* Search Results Dropdown */}
                        {showSearchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black/5 border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                                {isSearching ? (
                                    <div className="p-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Searching...</span>
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    <>
                                        {/* Results header */}
                                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                                            </p>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {searchResults.map((result, index) => (
                                                <button
                                                    key={`${result.type}-${result.id}`}
                                                    onClick={() => handleSelectResult(result)}
                                                    className={`w-full text-left p-3 flex items-start gap-3 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                                                        index === selectedIndex
                                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }`}
                                                >
                                                    {/* Type Icon */}
                                                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                                                        result.type === 'lesson'
                                                            ? 'bg-purple-100 dark:bg-purple-900/30'
                                                            : 'bg-blue-100 dark:bg-blue-900/30'
                                                    }`}>
                                                        {result.type === 'lesson' ? (
                                                            <BookOpen className={`w-4 h-4 ${
                                                                result.is_completed
                                                                    ? 'text-green-600 dark:text-green-400'
                                                                    : 'text-purple-600 dark:text-purple-400'
                                                            }`} />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                {result.title}
                                                            </p>
                                                            {result.type === 'lesson' && result.is_completed && (
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                                result.type === 'lesson'
                                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                            }`}>
                                                                {result.type}
                                                            </span>
                                                            {result.description && (
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                    {result.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Arrow indicator */}
                                                    <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-2.5 transition-opacity ${
                                                        index === selectedIndex
                                                            ? 'text-blue-500 opacity-100'
                                                            : 'text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100'
                                                    }`} />
                                                </button>
                                            ))}
                                        </div>
                                        {/* Keyboard hint */}
                                        <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono">↑</kbd>
                                                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono ml-1">↓</kbd>
                                                <span className="ml-1.5">to navigate</span>
                                                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono ml-3">Enter</kbd>
                                                <span className="ml-1.5">to select</span>
                                                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px] font-mono ml-3">Esc</kbd>
                                                <span className="ml-1.5">to close</span>
                                            </p>
                                        </div>
                                    </>
                                ) : searchQuery.trim().length >= 2 ? (
                                    <div className="p-6 text-center">
                                        <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            No results found
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Try searching with different keywords
                                        </p>
                                    </div>
                                ) : searchQuery.trim().length === 1 ? (
                                    <div className="p-4 text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Type one more character to search...
                                        </p>
                                    </div>
                                ) : null}
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
