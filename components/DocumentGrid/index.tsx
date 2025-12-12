"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, MoreVertical, Eye, Trash2, Download, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { RecentDocument, documentsApi } from "@/lib/api";

interface RecentDocumentsGridProps {
    documents: RecentDocument[];
}

const fileTypeIcons: Record<string, string> = {
    pdf: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    docx: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    txt: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
};

export function RecentDocumentsGrid({ documents }: RecentDocumentsGridProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this document?")) {
            try {
                setDeletingId(id);
                await documentsApi.delete(id);
                // Reload page to refresh data
                window.location.reload();
            } catch (error) {
                console.error("Failed to delete document:", error);
                alert("Failed to delete document");
            } finally {
                setDeletingId(null);
            }
        }
        setActiveMenu(null);
    };

    const handleDownload = async (id: string) => {
        try {
            const blob = await documentsApi.download(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "document";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download document:", error);
            alert("Failed to download document");
        }
        setActiveMenu(null);
    };

    return (
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Recent Documents
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Your latest uploaded materials
                    </p>
                </div>
                <Link
                    href="/documents"
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    View all
                </Link>
            </div>

            {/* Documents Grid */}
            <div className="space-y-4">
                {documents.map((doc, index) => (
                    <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 ${deletingId === doc.id ? 'opacity-50' : ''}`}
                    >
                        <div className="flex items-start gap-4">
                            {/* File Icon */}
                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${fileTypeIcons[doc.file_type] || fileTypeIcons.txt}`}>
                                <FileText className="h-6 w-6" />
                            </div>

                            {/* Document Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={doc.has_lesson ? `/learning/${doc.id}` : `/documents/${doc.id}`}
                                            className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                                        >
                                            {doc.title}
                                        </Link>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>{formatRelativeTime(doc.created_at)}</span>
                                            </div>
                                            <span>•</span>
                                            <span className="uppercase">{doc.file_type}</span>
                                        </div>
                                    </div>

                                    {/* Actions Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === doc.id ? null : doc.id)}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                                            disabled={deletingId === doc.id}
                                        >
                                            <MoreVertical className="h-5 w-5" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeMenu === doc.id && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-gray-700 z-10">
                                                <div className="p-2">
                                                    {doc.has_lesson && (
                                                        <Link
                                                            href={`/learning/${doc.id}`}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            View Lesson
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownload(doc.id)}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </button>
                                                    <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
                                                    <button
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        {doc.status === "completed" && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                                {doc.has_lesson ? "Ready" : "Processed"}
                                            </span>
                                        )}
                                        {doc.status === "processing" && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                                                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                                                Processing
                                            </span>
                                        )}
                                        {doc.status === "pending" && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                                <div className="h-2 w-2 rounded-full bg-gray-500" />
                                                Pending
                                            </span>
                                        )}
                                        {doc.status === "failed" && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                Failed
                                            </span>
                                        )}
                                    </div>

                                    {doc.has_lesson && (
                                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            Lesson available
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hover Effect Border */}
                        <div className="absolute inset-0 rounded-lg border-2 border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            {/* Empty State (if no documents) */}
            {documents.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        No documents yet
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Upload your first document to get started
                    </p>
                    <Link
                        href="/upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
                    >
                        <FileText className="h-4 w-4" />
                        Upload Document
                    </Link>
                </div>
            )}
        </div>
    );
}