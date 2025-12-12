"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import DashboardLayout from "@/app/dashboard/layout";
import {
    User,
    Bell,
    Shield,
    Palette,
    Volume2,
    Mail,
    Key,
    Trash2,
    ChevronRight,
    Check,
    Moon,
    Sun,
    Monitor,
    Save,
    Camera,
    Loader2,
    X,
    Eye,
    EyeOff,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Locale, localeNames } from "@/i18n/config";

// =============================================================================
// TYPES
// =============================================================================

type ThemeOption = "light" | "dark" | "system";

// =============================================================================
// COMPONENTS
// =============================================================================

function SettingsSection({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/30 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/80 dark:to-gray-800/40">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function ToggleSwitch({
    enabled,
    onChange,
    label,
    description,
    disabled,
}: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                )}
            </div>
            <button
                onClick={() => onChange(!enabled)}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                    enabled ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gray-200 dark:bg-gray-700"
                }`}
            >
                <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                        enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                />
            </button>
        </div>
    );
}

function SelectOption({
    label,
    description,
    value,
    options,
    onChange,
    disabled,
}: {
    label: string;
    description?: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
                )}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

function ThemeSelector({
    value,
    onChange,
    disabled,
    t,
}: {
    value: ThemeOption;
    onChange: (value: ThemeOption) => void;
    disabled?: boolean;
    t: (key: string) => string;
}) {
    const options: { value: ThemeOption; label: string; icon: React.ElementType }[] = [
        { value: "light", label: t("appearance.light"), icon: Sun },
        { value: "dark", label: t("appearance.dark"), icon: Moon },
        { value: "system", label: t("appearance.system"), icon: Monitor },
    ];

    return (
        <div className="py-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{t("appearance.theme")}</p>
            <div className="grid grid-cols-3 gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        disabled={disabled}
                        className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            value === opt.value
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50"
                        }`}
                    >
                        {value === opt.value && (
                            <div className="absolute top-2 right-2">
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                        <opt.icon className={`w-6 h-6 ${
                            value === opt.value
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400"
                        }`} />
                        <span className={`text-sm font-medium ${
                            value === opt.value
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-700 dark:text-gray-300"
                        }`}>
                            {opt.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Password Change Modal
function PasswordChangeModal({
    isOpen,
    onClose,
    onSubmit,
    t,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
    t: (key: string) => string;
}) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const tCommon = useTranslations("common");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError(t("security.passwordMismatch"));
            return;
        }

        if (newPassword.length < 8) {
            setError(t("security.passwordTooShort"));
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(currentPassword, newPassword);
            onClose();
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            // Error is handled in context with toast
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("security.changePassword")}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("security.currentPassword")}
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("security.newPassword")}
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            {t("security.confirmPassword")}
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {tCommon("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                                t("security.changePassword")
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Delete Account Modal
function DeleteAccountModal({
    isOpen,
    onClose,
    onConfirm,
    t,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    t: (key: string) => string;
}) {
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const tCommon = useTranslations("common");

    const handleDelete = async () => {
        if (confirmText !== "DELETE") return;

        try {
            setIsDeleting(true);
            await onConfirm();
        } catch (err) {
            // Error is handled in context with toast
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">{t("danger.deleteConfirmTitle")}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t("danger.deleteConfirmMessage")}
                </p>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t("danger.deleteConfirmLabel")}
                    </label>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        placeholder="DELETE"
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        {tCommon("cancel")}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={confirmText !== "DELETE" || isDeleting}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                            t("danger.deleteButton")
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Loading Skeleton
function SettingsSkeleton() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                    <div className="space-y-3">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function SettingsPage() {
    const router = useRouter();
    const { setTheme } = useTheme();
    const { logout } = useAuth();
    const { locale, setLocale } = useLanguage();
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const {
        settings,
        isLoading,
        error,
        fetchSettings,
        updateProfile,
        updateNotifications,
        updateLearningPreferences,
        changePassword,
        deleteAccount,
    } = useSettings();

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Local state for form values
    const [profileForm, setProfileForm] = useState({
        full_name: "",
        company: "",
        role: "",
        language: locale,
    });
    const [notificationForm, setNotificationForm] = useState({
        email_notifications: true,
        push_notifications: true,
        lesson_reminders: true,
        weekly_digest: true,
        marketing_emails: false,
    });
    const [learningForm, setLearningForm] = useState({
        auto_play_audio: false,
        playback_speed: 1,
        theme: "system" as ThemeOption,
    });

    // UI State
    const [isSaving, setIsSaving] = useState(false);
    const [showSaved, setShowSaved] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Initialize form values from settings (only once when settings load)
    const initializedRef = React.useRef(false);

    useEffect(() => {
        if (settings && !initializedRef.current) {
            initializedRef.current = true;
            setProfileForm({
                full_name: settings.profile.full_name || "",
                company: settings.profile.company || "",
                role: settings.profile.role || "",
                language: (settings.profile.language as "en" | "es" | "fr" | "de") || "en",
            });
            setNotificationForm({
                email_notifications: settings.notifications.email_notifications,
                push_notifications: settings.notifications.push_notifications,
                lesson_reminders: settings.notifications.lesson_reminders,
                weekly_digest: settings.notifications.weekly_digest,
                marketing_emails: settings.notifications.marketing_emails,
            });
            setLearningForm({
                auto_play_audio: settings.learning.auto_play_audio,
                playback_speed: settings.learning.playback_speed,
                theme: settings.learning.theme,
            });
            // Sync locale from settings only on initial load
            if (settings.profile.language) {
                setLocale(settings.profile.language as Locale);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settings]);

    // Track changes
    useEffect(() => {
        if (!settings) return;

        const profileChanged =
            profileForm.full_name !== settings.profile.full_name ||
            profileForm.company !== (settings.profile.company || "") ||
            profileForm.role !== (settings.profile.role || "") ||
            profileForm.language !== settings.profile.language;

        const notificationChanged =
            notificationForm.email_notifications !== settings.notifications.email_notifications ||
            notificationForm.push_notifications !== settings.notifications.push_notifications ||
            notificationForm.lesson_reminders !== settings.notifications.lesson_reminders ||
            notificationForm.weekly_digest !== settings.notifications.weekly_digest ||
            notificationForm.marketing_emails !== settings.notifications.marketing_emails;

        const learningChanged =
            learningForm.auto_play_audio !== settings.learning.auto_play_audio ||
            learningForm.playback_speed !== settings.learning.playback_speed ||
            learningForm.theme !== settings.learning.theme;

        setHasChanges(profileChanged || notificationChanged || learningChanged);
    }, [profileForm, notificationForm, learningForm, settings]);

    const handleSave = async () => {
        if (!settings) return;

        setIsSaving(true);
        try {
            // Check what changed and update accordingly
            const profileChanged =
                profileForm.full_name !== settings.profile.full_name ||
                profileForm.company !== (settings.profile.company || "") ||
                profileForm.role !== (settings.profile.role || "") ||
                profileForm.language !== settings.profile.language;

            const notificationChanged =
                notificationForm.email_notifications !== settings.notifications.email_notifications ||
                notificationForm.push_notifications !== settings.notifications.push_notifications ||
                notificationForm.lesson_reminders !== settings.notifications.lesson_reminders ||
                notificationForm.weekly_digest !== settings.notifications.weekly_digest ||
                notificationForm.marketing_emails !== settings.notifications.marketing_emails;

            const learningChanged =
                learningForm.auto_play_audio !== settings.learning.auto_play_audio ||
                learningForm.playback_speed !== settings.learning.playback_speed ||
                learningForm.theme !== settings.learning.theme;

            const promises: Promise<any>[] = [];

            if (profileChanged) {
                promises.push(updateProfile({
                    full_name: profileForm.full_name,
                    company: profileForm.company || undefined,
                    role: profileForm.role || undefined,
                    language: profileForm.language,
                }));
                // Update locale immediately for better UX
                if (profileForm.language !== locale) {
                    setLocale(profileForm.language as Locale);
                }
            }

            if (notificationChanged) {
                promises.push(updateNotifications(notificationForm));
            }

            if (learningChanged) {
                promises.push(updateLearningPreferences({
                    auto_play_audio: learningForm.auto_play_audio,
                    playback_speed: learningForm.playback_speed,
                    theme: learningForm.theme,
                }));
            }

            await Promise.all(promises);

            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 2000);
        } catch (err) {
            // Error handled in context
        } finally {
            setIsSaving(false);
        }
    };

    const handleThemeChange = (newTheme: ThemeOption) => {
        setLearningForm(prev => ({ ...prev, theme: newTheme }));
        // Immediately apply theme for visual feedback
        setTheme(newTheme);
    };

    const handleLanguageChange = (newLanguage: string) => {
        setProfileForm(prev => ({ ...prev, language: newLanguage }));
        // Immediately apply language for visual feedback
        setLocale(newLanguage as Locale);
    };

    const handleDeleteAccount = async () => {
        await deleteAccount();
        logout();
        router.push("/auth/signin");
    };

    // Show loading skeleton while fetching or if settings haven't loaded yet
    if (isLoading || (!settings && !error)) {
        return (
            <DashboardLayout>
                <SettingsSkeleton />
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-6 text-center">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                        >
                            {tCommon("retry")}
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t("title")}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t("subtitle")}
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges}
                        className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                        {isSaving ? (
                            <Loader2 className="relative w-4 h-4 text-white animate-spin" />
                        ) : showSaved ? (
                            <Check className="relative w-4 h-4 text-white" />
                        ) : (
                            <Save className="relative w-4 h-4 text-white" />
                        )}
                        <span className="relative text-white">
                            {isSaving ? tCommon("saving") : showSaved ? tCommon("saved") : tCommon("save")}
                        </span>
                    </button>
                </div>

                {/* Profile Section */}
                <SettingsSection
                    title={t("profile.title")}
                    description={t("profile.description")}
                    icon={User}
                >
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                                    {profileForm.full_name.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
                                </div>
                                <button className="absolute -bottom-1 -right-1 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
                                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        {/* Profile Fields */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t("profile.fullName")}
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.full_name}
                                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t("profile.email")}
                                </label>
                                <input
                                    type="email"
                                    value={settings?.profile.email || ""}
                                    disabled
                                    className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t("profile.role")}
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.role}
                                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    {t("profile.company")}
                                </label>
                                <input
                                    type="text"
                                    value={profileForm.company}
                                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                {/* Appearance Section */}
                <SettingsSection
                    title={t("appearance.title")}
                    description={t("appearance.description")}
                    icon={Palette}
                >
                    <ThemeSelector
                        value={learningForm.theme}
                        onChange={handleThemeChange}
                        t={t}
                    />
                    <div className="border-t border-gray-100 dark:border-gray-700/50 mt-3">
                        <SelectOption
                            label={t("appearance.language")}
                            description={t("appearance.languageDescription")}
                            value={profileForm.language}
                            options={Object.entries(localeNames).map(([value, label]) => ({ value, label }))}
                            onChange={handleLanguageChange}
                        />
                    </div>
                </SettingsSection>

                {/* Learning Preferences */}
                <SettingsSection
                    title={t("learning.title")}
                    description={t("learning.description")}
                    icon={Volume2}
                >
                    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700/50">
                        <ToggleSwitch
                            label={t("learning.autoPlayAudio")}
                            description={t("learning.autoPlayAudioDescription")}
                            enabled={learningForm.auto_play_audio}
                            onChange={(v) => setLearningForm({ ...learningForm, auto_play_audio: v })}
                        />
                        <SelectOption
                            label={t("learning.playbackSpeed")}
                            description={t("learning.playbackSpeedDescription")}
                            value={learningForm.playback_speed.toString()}
                            options={[
                                { value: "0.5", label: "0.5x" },
                                { value: "0.75", label: "0.75x" },
                                { value: "1", label: "1x (Normal)" },
                                { value: "1.25", label: "1.25x" },
                                { value: "1.5", label: "1.5x" },
                                { value: "2", label: "2x" },
                            ]}
                            onChange={(v) => setLearningForm({ ...learningForm, playback_speed: parseFloat(v) })}
                        />
                    </div>
                </SettingsSection>

                {/* Notifications */}
                <SettingsSection
                    title={t("notifications.title")}
                    description={t("notifications.description")}
                    icon={Bell}
                >
                    <div className="space-y-1 divide-y divide-gray-100 dark:divide-gray-700/50">
                        <ToggleSwitch
                            label={t("notifications.emailNotifications")}
                            description={t("notifications.emailNotificationsDescription")}
                            enabled={notificationForm.email_notifications}
                            onChange={(v) => setNotificationForm({ ...notificationForm, email_notifications: v })}
                        />
                        <ToggleSwitch
                            label={t("notifications.pushNotifications")}
                            description={t("notifications.pushNotificationsDescription")}
                            enabled={notificationForm.push_notifications}
                            onChange={(v) => setNotificationForm({ ...notificationForm, push_notifications: v })}
                        />
                        <ToggleSwitch
                            label={t("notifications.lessonReminders")}
                            description={t("notifications.lessonRemindersDescription")}
                            enabled={notificationForm.lesson_reminders}
                            onChange={(v) => setNotificationForm({ ...notificationForm, lesson_reminders: v })}
                        />
                        <ToggleSwitch
                            label={t("notifications.weeklyDigest")}
                            description={t("notifications.weeklyDigestDescription")}
                            enabled={notificationForm.weekly_digest}
                            onChange={(v) => setNotificationForm({ ...notificationForm, weekly_digest: v })}
                        />
                        <ToggleSwitch
                            label={t("notifications.marketingEmails")}
                            description={t("notifications.marketingEmailsDescription")}
                            enabled={notificationForm.marketing_emails}
                            onChange={(v) => setNotificationForm({ ...notificationForm, marketing_emails: v })}
                        />
                    </div>
                </SettingsSection>

                {/* Security */}
                <SettingsSection
                    title={t("security.title")}
                    description={t("security.description")}
                    icon={Shield}
                >
                    <div className="space-y-3">
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                                    <Key className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t("security.changePassword")}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("security.changePasswordDescription")}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
                                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t("security.twoFactor")}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("security.twoFactorDescription")}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                        </button>
                    </div>
                </SettingsSection>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800/60 rounded-2xl border border-red-200 dark:border-red-900/50 shadow-xl shadow-red-100/50 dark:shadow-red-900/10 overflow-hidden">
                    <div className="px-6 py-5 border-b border-red-200 dark:border-red-900/50 bg-gradient-to-r from-red-50 to-white dark:from-red-950/30 dark:to-gray-800/40">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/25">
                                <Trash2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("danger.title")}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t("danger.description")}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("danger.deleteAccount")}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    {t("danger.deleteAccountDescription")}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl ring-1 ring-red-200 dark:ring-red-500/30 transition-colors"
                            >
                                {t("danger.deleteButton")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PasswordChangeModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSubmit={changePassword}
                t={t}
            />
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteAccount}
                t={t}
            />
        </DashboardLayout>
    );
}
