"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/app/dashboard/layout";
import Link from "next/link";
import {
    Search,
    FileText,
    File,
    FileType,
    Clock,
    Calendar,
    MoreHorizontal,
    Trash2,
    Download,
    Eye,
    ArrowUp,
    ArrowDown,
    CheckCircle2,
    Loader2,
    XCircle,
    Plus,
    X,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Filter,
    ArrowUpDown,
    RefreshCw,
    AlertCircle,
    Play,
} from "lucide-react";
import { documentsApi, Document as ApiDocument, DocumentListResponse } from "@/lib/api";

// =============================================================================
// TYPES
// =============================================================================

type DocumentStatus = "completed" | "processing" | "pending" | "failed";
type FileTypeOption = "PDF" | "DOCX" | "TXT" | "pdf" | "docx" | "txt";
type SortField = "date" | "name" | "themes" | "status";
type SortOrder = "asc" | "desc";

interface DocumentTheme {
    id: string;
    name: string;
}

interface Document {
    id: string;
    ingestionId: string;
    title: string;
    fileName: string;
    fileType: FileTypeOption;
    fileSize: string;
    fileSizeBytes: number;
    status: DocumentStatus;
    themes: DocumentTheme[];
    uploadedAt: string;
    processedAt?: string;
    wordCount?: number;
    lessonId?: string;
    hasLesson: boolean;
}

// =============================================================================
// HELPERS
// =============================================================================

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Convert API document to local format
const mapApiDocument = (apiDoc: ApiDocument): Document => ({
    id: apiDoc.id,
    ingestionId: apiDoc.ingestion_id,
    title: apiDoc.title,
    fileName: apiDoc.file_name,
    fileType: apiDoc.file_type.toUpperCase() as FileTypeOption,
    fileSize: formatFileSize(apiDoc.file_size),
    fileSizeBytes: apiDoc.file_size,
    status: apiDoc.status,
    themes: (apiDoc.themes || []).map(t => ({ id: t.id, name: t.name })),
    uploadedAt: apiDoc.created_at,
    processedAt: apiDoc.processed_at,
    wordCount: apiDoc.word_count,
    hasLesson: apiDoc.has_lesson,
});

// =============================================================================
// CONSTANTS
// =============================================================================

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 15, 25, 50];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatusBadge({ status }: { status: DocumentStatus }) {
    const config = {
        completed: {
            icon: CheckCircle2,
            label: "Completed",
            className: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 ring-emerald-500/30 dark:from-emerald-500/20 dark:to-teal-500/20 dark:text-emerald-400 dark:ring-emerald-500/30 shadow-sm shadow-emerald-500/10",
        },
        processing: {
            icon: Loader2,
            label: "Processing",
            className: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-blue-500/30 dark:from-blue-500/20 dark:to-indigo-500/20 dark:text-blue-400 dark:ring-blue-500/30 shadow-sm shadow-blue-500/10",
            animate: true,
        },
        pending: {
            icon: Clock,
            label: "Pending",
            className: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 ring-amber-500/30 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-400 dark:ring-amber-500/30 shadow-sm shadow-amber-500/10",
        },
        failed: {
            icon: XCircle,
            label: "Failed",
            className: "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 ring-red-500/30 dark:from-red-500/20 dark:to-rose-500/20 dark:text-red-400 dark:ring-red-500/30 shadow-sm shadow-red-500/10",
        },
    };

    const { icon: Icon, label, className, animate } = config[status] as any;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${className}`}>
            <Icon className={`w-3.5 h-3.5 ${animate ? "animate-spin" : ""}`} />
            {label}
        </span>
    );
}

function FileTypeIcon({ type }: { type: FileTypeOption }) {
    const config = {
        PDF: { gradient: "from-red-500 via-rose-500 to-pink-500", shadow: "shadow-red-500/25", icon: FileText },
        DOCX: { gradient: "from-blue-500 via-indigo-500 to-violet-500", shadow: "shadow-blue-500/25", icon: File },
        TXT: { gradient: "from-slate-400 via-slate-500 to-zinc-500", shadow: "shadow-slate-500/25", icon: FileType },
    };

    const normalizedType = type.toUpperCase() as "PDF" | "DOCX" | "TXT";
    const { gradient, shadow, icon: Icon } = config[normalizedType];

    return (
        <div className="relative group/icon">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-md opacity-40 group-hover/icon:opacity-60 transition-opacity`} />
            <div className={`relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} shadow-lg ${shadow}`}>
                <Icon className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
        </div>
    );
}

// =============================================================================
// PAGINATION COMPONENT
// =============================================================================

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (count: number) => void;
    totalItems: number;
}) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }

        return pages;
    };

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
            {/* Left side: Items per page & Results info */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Show</label>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                        className="px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-w-[70px]"
                    >
                        {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                </div>
                <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-gray-700" />
                <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-white">{startItem}-{endItem}</span> of{" "}
                    <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span>
                </p>
            </div>

            {/* Right side: Navigation */}
            <div className="flex items-center gap-1">
                {/* First */}
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    title="First page"
                >
                    <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    title="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 mx-2">
                    {getPageNumbers().map((page, idx) => (
                        <React.Fragment key={idx}>
                            {page === "..." ? (
                                <span className="px-2 text-gray-400 dark:text-gray-500">...</span>
                            ) : (
                                <button
                                    onClick={() => onPageChange(page as number)}
                                    className={`min-w-[36px] h-9 px-3 text-sm font-medium rounded-lg transition-all ${
                                        currentPage === page
                                            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    title="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last */}
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                    title="Last page"
                >
                    <ChevronsRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// TABLE HEADER COMPONENT
// =============================================================================

function SortableHeader({
    label,
    field,
    currentSort,
    currentOrder,
    onSort,
    className = "",
}: {
    label: string;
    field: SortField;
    currentSort: SortField;
    currentOrder: SortOrder;
    onSort: (field: SortField) => void;
    className?: string;
}) {
    const isActive = currentSort === field;

    return (
        <button
            onClick={() => onSort(field)}
            className={`group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                isActive
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            } ${className}`}
        >
            {label}
            <span className={`transition-opacity ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"}`}>
                {isActive && currentOrder === "asc" ? (
                    <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                    <ArrowDown className="w-3.5 h-3.5" />
                )}
            </span>
        </button>
    );
}

// =============================================================================
// DOCUMENT ROW COMPONENT
// =============================================================================

function DocumentRow({
    document,
    onDelete,
    onDownload,
    onProcess,
}: {
    document: Document;
    onDelete: (id: string) => void;
    onDownload: (id: string, fileName: string) => void;
    onProcess: (id: string) => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    const formatDate = (iso: string) => {
        const date = new Date(iso);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    };

    const isClickable = document.status === "completed" && document.hasLesson;

    return (
        <tr className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
            {/* Document Info */}
            <td className="py-4 pl-6 pr-3">
                <div className="flex items-center gap-4">
                    <FileTypeIcon type={document.fileType} />
                    <div className="min-w-0">
                        {isClickable ? (
                            <Link
                                href={`/learning/${document.id}`}
                                className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-1"
                            >
                                {document.title}
                            </Link>
                        ) : (
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1">
                                {document.title}
                            </p>
                        )}
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[280px]">
                            {document.fileName}
                        </p>
                    </div>
                </div>
            </td>

            {/* Themes */}
            <td className="py-4 px-3">
                {document.themes.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                        {document.themes.slice(0, 2).map((theme) => (
                            <span
                                key={theme.id}
                                className="inline-flex px-2 py-0.5 text-xs font-medium bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 rounded-md ring-1 ring-inset ring-violet-600/10 dark:ring-violet-500/20"
                            >
                                {theme.name}
                            </span>
                        ))}
                        {document.themes.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                +{document.themes.length - 2}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                )}
            </td>

            {/* Status */}
            <td className="py-4 px-3">
                <StatusBadge status={document.status} />
            </td>

            {/* Date */}
            <td className="py-4 px-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(document.uploadedAt)}
                </span>
            </td>

            {/* Size */}
            <td className="py-4 px-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {document.fileSize}
                </span>
            </td>

            {/* Actions */}
            <td className="py-4 pl-3 pr-6">
                <div className="relative flex justify-end">
                    <button
                        ref={buttonRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (buttonRef.current) {
                                const rect = buttonRef.current.getBoundingClientRect();
                                setMenuPosition({
                                    top: rect.bottom + 4,
                                    right: window.innerWidth - rect.right,
                                });
                            }
                            setShowMenu(!showMenu);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                    >
                        <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                            <div
                                className="fixed w-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 py-1 overflow-hidden"
                                style={{ top: menuPosition.top, right: menuPosition.right }}
                            >
                                {isClickable && (
                                    <Link
                                        href={`/learning/${document.id}`}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <Eye className="w-4 h-4 text-gray-400" />
                                        View Lesson
                                    </Link>
                                )}
                                {(document.status === "pending" || document.status === "failed") && !document.hasLesson && (
                                    <button
                                        onClick={() => {
                                            setShowMenu(false);
                                            onProcess(document.id);
                                        }}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 w-full transition-colors"
                                    >
                                        <Play className="w-4 h-4" />
                                        Process with AI
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onDownload(document.id, document.fileName);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 w-full transition-colors"
                                >
                                    <Download className="w-4 h-4 text-gray-400" />
                                    Download Original
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        onDelete(document.id);
                                    }}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Document
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | "all">("all");
    const [fileTypeFilter, setFileTypeFilter] = useState<FileTypeOption | "all">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [totalFromApi, setTotalFromApi] = useState(0);

    // Fetch documents from API
    const fetchDocuments = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await documentsApi.list(1, 100); // Fetch all for client-side filtering
            const mappedDocs = response.items.map(mapApiDocument);
            setDocuments(mappedDocs);
            setTotalFromApi(response.total);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
            setError("Failed to load documents. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Filter and sort documents
    const filteredDocuments = useMemo(() => {
        let result = [...documents];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (doc) =>
                    doc.title.toLowerCase().includes(query) ||
                    doc.fileName.toLowerCase().includes(query) ||
                    doc.themes.some((t) => t.name.toLowerCase().includes(query))
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            result = result.filter((doc) => doc.status === statusFilter);
        }

        // File type filter
        if (fileTypeFilter !== "all") {
            result = result.filter((doc) => doc.fileType === fileTypeFilter);
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "date":
                    comparison = new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
                    break;
                case "name":
                    comparison = a.title.localeCompare(b.title);
                    break;
                case "themes":
                    comparison = b.themes.length - a.themes.length;
                    break;
                case "status":
                    const order = { completed: 0, processing: 1, pending: 2, failed: 3 };
                    comparison = order[a.status] - order[b.status];
                    break;
            }
            return sortOrder === "asc" ? -comparison : comparison;
        });

        return result;
    }, [documents, searchQuery, sortField, sortOrder, statusFilter, fileTypeFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
    const paginatedDocuments = filteredDocuments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters or items per page change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, fileTypeFilter, itemsPerPage]);

    const handleItemsPerPageChange = (count: number) => {
        setItemsPerPage(count);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    const handleDelete = (id: string) => {
        setDeleteDocId(id);
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            const blob = await documentsApi.download(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to download document:", err);
            alert("Failed to download document. Please try again.");
        }
    };

    const handleProcess = (id: string) => {
        // Navigate to upload page with processing view
        // Processing starts automatically on upload - this just shows the status
        const doc = documents.find(d => d.id === id);
        if (doc) {
            window.location.href = `/upload?process=${id}&name=${encodeURIComponent(doc.title)}`;
        }
    };

    const confirmDelete = async () => {
        if (deleteDocId) {
            try {
                setDeleting(true);
                await documentsApi.delete(deleteDocId);
                setDocuments((prev) => prev.filter((doc) => doc.id !== deleteDocId));
                setTotalFromApi((prev) => prev - 1);
            } catch (err) {
                console.error("Failed to delete document:", err);
                alert("Failed to delete document. Please try again.");
            } finally {
                setDeleting(false);
                setDeleteDocId(null);
            }
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setFileTypeFilter("all");
    };

    const hasActiveFilters = searchQuery || statusFilter !== "all" || fileTypeFilter !== "all";

    // Stats
    const stats = {
        total: documents.length,
        completed: documents.filter((d) => d.status === "completed").length,
        processing: documents.filter((d) => d.status === "processing").length,
        failed: documents.filter((d) => d.status === "failed").length,
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            My Documents
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage and view all your uploaded documents
                        </p>
                    </div>
                    <Link
                        href="/upload"
                        className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                        <Plus className="relative w-4 h-4 text-white" />
                        <span className="relative text-white">Upload Document</span>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="group relative bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-100 to-transparent dark:from-gray-700/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Documents</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
                    </div>
                    <div className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-5 hover:shadow-lg hover:shadow-emerald-200/50 dark:hover:shadow-emerald-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-transparent dark:from-emerald-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
                        <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{stats.completed}</p>
                    </div>
                    <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800/50 p-5 hover:shadow-lg hover:shadow-blue-200/50 dark:hover:shadow-blue-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Processing</p>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">{stats.processing}</p>
                    </div>
                    <div className="group relative bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-2xl border border-red-200 dark:border-red-800/50 p-5 hover:shadow-lg hover:shadow-red-200/50 dark:hover:shadow-red-900/30 transition-all duration-300 hover:-translate-y-0.5">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-100 to-transparent dark:from-red-800/30 rounded-bl-[60px] rounded-tr-2xl" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed</p>
                        <p className="text-3xl font-bold text-red-700 dark:text-red-300 mt-2">{stats.failed}</p>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30">
                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700/50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Search */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | "all")}
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="processing">Processing</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>

                                <select
                                    value={fileTypeFilter}
                                    onChange={(e) => setFileTypeFilter(e.target.value as FileTypeOption | "all")}
                                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                                >
                                    <option value="all">All Types</option>
                                    <option value="PDF">PDF</option>
                                    <option value="DOCX">DOCX</option>
                                    <option value="TXT">TXT</option>
                                </select>

                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}

                                {/* Refresh Button */}
                                <button
                                    onClick={fetchDocuments}
                                    disabled={loading}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="py-16 text-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading documents...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="py-12 px-6">
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
                                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                                <p className="text-red-600 dark:text-red-400 flex-1">{error}</p>
                                <button
                                    onClick={fetchDocuments}
                                    className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && paginatedDocuments.length > 0 ? (
                        <div className="overflow-x-auto min-w-full">
                            <table className="w-full min-w-[800px]">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                                        <th className="py-3 pl-6 pr-3 text-left">
                                            <SortableHeader
                                                label="Document"
                                                field="name"
                                                currentSort={sortField}
                                                currentOrder={sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="py-3 px-3 text-left">
                                            <SortableHeader
                                                label="Themes"
                                                field="themes"
                                                currentSort={sortField}
                                                currentOrder={sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="py-3 px-3 text-left">
                                            <SortableHeader
                                                label="Status"
                                                field="status"
                                                currentSort={sortField}
                                                currentOrder={sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="py-3 px-3 text-left">
                                            <SortableHeader
                                                label="Date"
                                                field="date"
                                                currentSort={sortField}
                                                currentOrder={sortOrder}
                                                onSort={handleSort}
                                            />
                                        </th>
                                        <th className="py-3 px-3 text-left">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Size
                                            </span>
                                        </th>
                                        <th className="py-3 pl-3 pr-6 text-right">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                    {paginatedDocuments.map((doc) => (
                                        <DocumentRow
                                            key={doc.id}
                                            document={doc}
                                            onDelete={handleDelete}
                                            onDownload={handleDownload}
                                            onProcess={handleProcess}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : !loading && !error ? (
                        <div className="py-16 text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                                <FileText className="w-7 h-7 text-gray-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                No documents found
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                {hasActiveFilters
                                    ? "Try adjusting your search or filters"
                                    : "Upload your first document to get started"}
                            </p>
                            {hasActiveFilters ? (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                >
                                    Clear all filters
                                </button>
                            ) : (
                                <Link
                                    href="/upload"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Upload Document
                                </Link>
                            )}
                        </div>
                    ) : null}

                    {/* Pagination */}
                    {!loading && !error && filteredDocuments.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/30">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                totalItems={filteredDocuments.length}
                            />
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {deleteDocId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full">
                                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Delete Document
                                    </h3>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                This will permanently delete the document and its generated lesson. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteDocId(null)}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleting}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
