"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/app/dashboard/layout";
import {
    FileText,
    Clock,
    Calendar,
    Hash,
    Play,
    Pause,
    Volume2,
    VolumeX,
    SkipBack,
    SkipForward,
    Download,
    Share2,
    Trash2,
    BookOpen,
    Lightbulb,
    Target,
    CheckCircle2,
    Quote,
    ChevronRight,
    ArrowLeft,
    Bookmark,
    BookmarkCheck,
    Copy,
    Check,
    ExternalLink,
    Printer,
    MoreVertical,
    GraduationCap,
    Briefcase,
    ListChecks,
    FileType,
    Sparkles,
    Brain,
    Loader2,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { lessonsApi, documentsApi, Lesson, DocumentDetail, getStaticUrl } from "@/lib/api";

// =============================================================================
// TYPES
// =============================================================================

interface AudioNarration {
    url: string;
    duration: number;
    generatedAt: string;
}

interface OutcomeTimestamp {
    id: string;
    startTime: number;
    endTime: number;
}

// Utility to map learning outcomes to audio timestamps based on word count
function mapOutcomesToTimestamps(
    outcomes: Array<{ id: string; text: string }>,
    totalDuration: number
): OutcomeTimestamp[] {
    if (outcomes.length === 0 || totalDuration <= 0) return [];

    // Distribute outcomes evenly across the audio duration
    // Each outcome corresponds to a section of the lesson
    const segmentDuration = totalDuration / outcomes.length;

    return outcomes.map((outcome, index) => ({
        id: outcome.id,
        startTime: index * segmentDuration,
        endTime: (index + 1) * segmentDuration,
    }));
}

// =============================================================================
// COMPONENTS
// =============================================================================

// File Type Badge
function FileTypeBadge({ type }: { type: "PDF" | "DOCX" | "TXT" }) {
    const styles = {
        PDF: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-red-200 dark:ring-red-800",
        DOCX: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ring-blue-200 dark:ring-blue-800",
        TXT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-slate-200 dark:ring-slate-700",
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ring-1 ring-inset ${styles[type]}`}>
            <FileType className="w-3 h-3" />
            {type}
        </span>
    );
}

// Priority Badge
function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
    const styles = {
        high: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
        medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
        low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    };

    return (
        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide rounded ${styles[priority]}`}>
            {priority}
        </span>
    );
}

// Section Header Component
function SectionHeader({
    icon: Icon,
    title,
    subtitle,
    iconBg = "bg-blue-100 dark:bg-blue-900/40",
    iconColor = "text-blue-600 dark:text-blue-400",
    badge,
}: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    iconBg?: string;
    iconColor?: string;
    badge?: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-4 mb-6">
            <div className={`p-2.5 rounded-xl ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                    {badge}
                </div>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

// Audio Player Component - Premium waveform design
interface AudioPlayerProps {
    audio: AudioNarration;
    learningOutcomes?: Array<{ id: string; text: string }>;
    onOutcomeReached?: (outcomeId: string) => void;
    onCurrentOutcomeChange?: (outcomeId: string | null) => void;
}

function AudioPlayer({
    audio,
    learningOutcomes = [],
    onOutcomeReached,
    onCurrentOutcomeChange
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const volumeRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [hoverPosition, setHoverPosition] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Track which outcomes have been triggered to avoid re-triggering
    const triggeredOutcomes = useRef<Set<string>>(new Set());

    // Generate realistic audio waveform data (simulating actual audio analysis)
    const waveformData = useRef(
        Array.from({ length: 100 }, (_, i) => {
            // Create natural-looking audio waveform with multiple frequency components
            const base = 0.3;
            const lowFreq = Math.sin(i * 0.1) * 0.15;
            const midFreq = Math.sin(i * 0.3 + 1) * 0.2;
            const highFreq = Math.sin(i * 0.7 + 2) * 0.1;
            // Add some "speech-like" variations
            const speech = Math.sin(i * 0.05) > 0 ? Math.sin(i * 0.5) * 0.15 : 0;
            // Random micro-variations
            const noise = (Math.sin(i * 17.3) * 0.5 + 0.5) * 0.1;
            // Combine all components
            const value = Math.min(1, Math.max(0.08, base + lowFreq + midFreq + highFreq + speech + noise));
            return value;
        })
    ).current;

    // Draw canvas waveform
    const drawWaveform = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const barCount = waveformData.length;
        const barWidth = 4;
        const totalBarsWidth = barCount * barWidth;
        const totalGapsWidth = width - totalBarsWidth;
        const barGap = totalGapsWidth / (barCount - 1);
        const progress = duration > 0 ? currentTime / duration : 0;
        const progressX = progress * width;
        const hoverX = hoverPosition * width;

        ctx.clearRect(0, 0, width, height);

        // Draw bars - starting from the very left edge
        waveformData.forEach((value, i) => {
            const x = i * (barWidth + barGap);
            const barHeight = value * height * 0.9;
            const isPlayed = (x + barWidth / 2) <= progressX;
            const isNearPlayhead = Math.abs(x + barWidth / 2 - progressX) < 20;
            const isNearHover = isHovering && Math.abs(x + barWidth / 2 - hoverX) < 25;

            // Dynamic height animation when playing
            let animatedHeight = barHeight;
            if (isPlaying && isNearPlayhead) {
                const pulseIntensity = 1 + Math.sin(Date.now() * 0.015 + i * 0.3) * 0.2;
                animatedHeight = barHeight * pulseIntensity;
            }

            // Hover effect
            if (isNearHover && !isPlayed) {
                animatedHeight = barHeight * 1.15;
            }

            const animatedY = (height - animatedHeight) / 2;

            // Create gradient for played bars
            if (isPlayed) {
                const gradient = ctx.createLinearGradient(x, animatedY, x, animatedY + animatedHeight);
                gradient.addColorStop(0, '#A78BFA'); // purple-400
                gradient.addColorStop(0.5, '#818CF8'); // indigo-400
                gradient.addColorStop(1, '#A78BFA'); // purple-400
                ctx.fillStyle = gradient;
            } else {
                // Unplayed bars - check for dark mode
                const isDark = document.documentElement.classList.contains('dark');
                if (isNearHover) {
                    ctx.fillStyle = isDark ? 'rgba(148, 163, 184, 0.7)' : 'rgba(107, 114, 128, 0.5)';
                } else {
                    ctx.fillStyle = isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 1)';
                }
            }

            // Draw rounded bar
            const radius = barWidth / 2;
            ctx.beginPath();
            ctx.roundRect(x, animatedY, barWidth, animatedHeight, radius);
            ctx.fill();

            // Add glow to bars near playhead when playing
            if (isPlaying && isNearPlayhead && isPlayed) {
                ctx.shadowColor = '#818CF8';
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Draw playhead line
        ctx.fillStyle = '#6366F1';
        ctx.shadowColor = '#6366F1';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.roundRect(Math.max(0, progressX - 1.5), 0, 3, height, 1.5);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Playhead circle indicator
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(Math.max(5, progressX), height / 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#6366F1';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Draw hover indicator line
        if (isHovering && !isDragging && Math.abs(hoverX - progressX) > 10) {
            ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
            ctx.beginPath();
            ctx.roundRect(hoverX - 1, 0, 2, height, 1);
            ctx.fill();
        }
    }, [currentTime, duration, isPlaying, isHovering, hoverPosition, isDragging, waveformData]);

    // Animation loop for smooth waveform updates
    useEffect(() => {
        const animate = () => {
            drawWaveform();
            animationRef.current = requestAnimationFrame(animate);
        };

        if (isPlaying) {
            animate();
        } else {
            drawWaveform();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, drawWaveform]);

    // Redraw on theme change
    useEffect(() => {
        const observer = new MutationObserver(() => drawWaveform());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, [drawWaveform]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => drawWaveform();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawWaveform]);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        const handleTimeUpdate = () => !isDragging && setCurrentTime(audioEl.currentTime);
        const handleDurationChange = () => {
            if (audioEl.duration && !isNaN(audioEl.duration) && isFinite(audioEl.duration)) {
                setDuration(audioEl.duration);
            }
        };
        const handleEnded = () => setIsPlaying(false);
        const handleCanPlay = () => { setIsLoading(false); setIsBuffering(false); handleDurationChange(); };
        const handleLoadedMetadata = () => { handleDurationChange(); setIsLoading(false); };
        const handleWaiting = () => setIsBuffering(true);
        const handlePlaying = () => setIsBuffering(false);
        const handleError = () => { setError("Failed to load audio"); setIsLoading(false); };

        audioEl.addEventListener("timeupdate", handleTimeUpdate);
        audioEl.addEventListener("durationchange", handleDurationChange);
        audioEl.addEventListener("ended", handleEnded);
        audioEl.addEventListener("canplay", handleCanPlay);
        audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
        audioEl.addEventListener("waiting", handleWaiting);
        audioEl.addEventListener("playing", handlePlaying);
        audioEl.addEventListener("error", handleError);

        return () => {
            audioEl.removeEventListener("timeupdate", handleTimeUpdate);
            audioEl.removeEventListener("durationchange", handleDurationChange);
            audioEl.removeEventListener("ended", handleEnded);
            audioEl.removeEventListener("canplay", handleCanPlay);
            audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audioEl.removeEventListener("waiting", handleWaiting);
            audioEl.removeEventListener("playing", handlePlaying);
            audioEl.removeEventListener("error", handleError);
        };
    }, [isDragging]);

    // Calculate timestamps based on actual audio duration
    const outcomeTimestamps = React.useMemo(() => {
        if (learningOutcomes.length === 0 || duration <= 0) return [];
        return mapOutcomesToTimestamps(learningOutcomes, duration);
    }, [learningOutcomes, duration]);

    // Track outcome completion based on audio progress
    useEffect(() => {
        if (outcomeTimestamps.length === 0 || duration <= 0) return;

        // Find the current outcome based on playback time
        const currentOutcome = outcomeTimestamps.find(
            (ot) => currentTime >= ot.startTime && currentTime < ot.endTime
        );

        // Notify parent of current outcome change
        if (onCurrentOutcomeChange) {
            onCurrentOutcomeChange(currentOutcome?.id || null);
        }

        // Check if any outcome has been completed (passed its end time)
        outcomeTimestamps.forEach((ot) => {
            // Mark as completed when we've passed 90% of the outcome's section
            const completionThreshold = ot.startTime + (ot.endTime - ot.startTime) * 0.9;

            if (
                currentTime >= completionThreshold &&
                !triggeredOutcomes.current.has(ot.id) &&
                onOutcomeReached
            ) {
                triggeredOutcomes.current.add(ot.id);
                onOutcomeReached(ot.id);
            }
        });
    }, [currentTime, duration, outcomeTimestamps, onOutcomeReached, onCurrentOutcomeChange]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            switch (e.key.toLowerCase()) {
                case " ": e.preventDefault(); togglePlay(); break;
                case "arrowleft": e.shiftKey ? skip(-30) : skip(-10); break;
                case "arrowright": e.shiftKey ? skip(30) : skip(10); break;
                case "arrowup": e.preventDefault(); handleVolumeChange(Math.min(1, volume + 0.05)); break;
                case "arrowdown": e.preventDefault(); handleVolumeChange(Math.max(0, volume - 0.05)); break;
                case "m": toggleMute(); break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, isMuted, volume]);

    const togglePlay = () => {
        const audioEl = audioRef.current;
        if (!audioEl || isLoading) return;
        if (isPlaying) { audioEl.pause(); } else { audioEl.play().catch(() => setError("Playback failed")); }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        const audioEl = audioRef.current;
        if (!audioEl) return;
        audioEl.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (newVolume: number) => {
        const audioEl = audioRef.current;
        if (!audioEl) return;
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        audioEl.volume = clampedVolume;
        setVolume(clampedVolume);
        if (clampedVolume === 0) { setIsMuted(true); audioEl.muted = true; }
        else if (isMuted) { setIsMuted(false); audioEl.muted = false; }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audioEl = audioRef.current;
        const progressEl = progressRef.current;
        if (!audioEl || !progressEl || !duration) return;
        const rect = progressEl.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        audioEl.currentTime = percent * duration;
        setCurrentTime(percent * duration);
    };

    const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        handleProgressClick(e);
    };

    const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressEl = progressRef.current;
        if (!progressEl) return;
        const rect = progressEl.getBoundingClientRect();
        setHoverPosition(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };

    const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const volumeEl = volumeRef.current;
        if (!volumeEl) return;
        const rect = volumeEl.getBoundingClientRect();
        handleVolumeChange(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
    };

    const skip = (seconds: number) => {
        const audioEl = audioRef.current;
        if (!audioEl || !duration) return;
        const newTime = Math.max(0, Math.min(audioEl.currentTime + seconds, duration));
        audioEl.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const setPlaybackRateValue = (rate: number) => {
        const audioEl = audioRef.current;
        if (!audioEl) return;
        audioEl.playbackRate = rate;
        setPlaybackRate(rate);
    };

    const formatTime = (secs: number) => {
        if (!secs || !isFinite(secs)) return "0:00";
        return `${Math.floor(secs / 60)}:${Math.floor(secs % 60).toString().padStart(2, "0")}`;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const displayDuration = duration > 0 ? duration : audio.duration;
    const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    if (error) {
        return (
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700/50 shadow-lg">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50 dark:from-indigo-950/20 dark:via-transparent dark:to-purple-950/20" />

            <div className="relative p-6">
                <audio ref={audioRef} src={audio.url} preload="metadata" />

                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl transition-all duration-500 ${isPlaying ? 'opacity-50 scale-110' : 'opacity-25 scale-100'}`} />
                            <div className={`relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg transition-transform duration-300 ${isPlaying ? 'scale-105' : ''}`}>
                                {isLoading || isBuffering ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <div className="relative">
                                        <Volume2 className={`w-6 h-6 text-white transition-all duration-300 ${isPlaying ? 'scale-110' : ''}`} />
                                        {isPlaying && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="flex gap-0.5">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className="w-0.5 bg-white/60 rounded-full animate-pulse"
                                                            style={{
                                                                height: `${8 + i * 4}px`,
                                                                animationDelay: `${i * 0.15}s`,
                                                                animationDuration: '0.6s'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">Audio Lesson</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">
                                    <Sparkles className="w-3 h-3" />
                                    AI Generated
                                </span>
                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                <span className="font-medium">{formatTime(displayDuration)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Playback speed dropdown */}
                    <div className="relative group">
                        <button className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/80 hover:bg-gray-200 dark:hover:bg-gray-600/80 rounded-lg border border-gray-200 dark:border-gray-600/50 transition-all hover:scale-105">
                            {playbackRate}x
                        </button>
                        <div className="absolute right-0 top-full mt-2 py-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[90px] overflow-hidden">
                            {playbackRates.map((rate) => (
                                <button
                                    key={rate}
                                    onClick={() => setPlaybackRateValue(rate)}
                                    className={`w-full px-4 py-2 text-sm text-left transition-colors ${
                                        playbackRate === rate
                                            ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                    }`}
                                >
                                    {rate}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Canvas Waveform Visualization */}
                <div className="mb-5">
                    <div
                        ref={progressRef}
                        onClick={handleProgressClick}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => { setIsDragging(false); setIsHovering(false); }}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseMove={handleProgressHover}
                        className="relative h-20 cursor-pointer rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900/50"
                    >
                        <canvas
                            ref={canvasRef}
                            className="w-full h-full"
                            style={{ display: 'block' }}
                        />

                        {/* Time tooltip on hover */}
                        {isHovering && !isDragging && duration > 0 && (
                            <div
                                className="absolute -top-8 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium rounded-md shadow-lg transition-opacity"
                                style={{ left: `${hoverPosition * 100}%` }}
                            >
                                {formatTime(hoverPosition * duration)}
                            </div>
                        )}
                    </div>

                    {/* Time display */}
                    <div className="flex justify-between mt-3 px-1">
                        <span className="tabular-nums text-sm font-medium text-gray-900 dark:text-gray-100">{formatTime(currentTime)}</span>
                        <span className="tabular-nums text-sm text-gray-400 dark:text-gray-500">-{formatTime(Math.max(0, displayDuration - currentTime))}</span>
                    </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={() => skip(-10)}
                        className="relative p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all hover:scale-110 active:scale-95"
                        title="Rewind 10s (←)"
                    >
                        <SkipBack className="w-6 h-6" />
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-500">10</span>
                    </button>

                    <button
                        onClick={togglePlay}
                        disabled={isLoading}
                        className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${
                            isLoading
                                ? 'bg-gray-200 dark:bg-gray-700 cursor-wait'
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95'
                        }`}
                    >
                        {isLoading || isBuffering ? (
                            <Loader2 className="w-7 h-7 text-white animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="w-7 h-7 text-white" fill="currentColor" />
                        ) : (
                            <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
                        )}
                    </button>

                    <button
                        onClick={() => skip(10)}
                        className="relative p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all hover:scale-110 active:scale-95"
                        title="Forward 10s (→)"
                    >
                        <SkipForward className="w-6 h-6" />
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 dark:text-gray-500">10</span>
                    </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center justify-center gap-3 mt-6 pt-5 border-t border-gray-200/80 dark:border-gray-700/50">
                    <button
                        onClick={toggleMute}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                        title={isMuted ? "Unmute (M)" : "Mute (M)"}
                    >
                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <div
                        ref={volumeRef}
                        onClick={handleVolumeClick}
                        className="relative w-28 h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer group overflow-hidden"
                    >
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-indigo-500 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                            style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 8px)` }}
                        />
                    </div>

                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-10 text-center tabular-nums">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                </div>

                {/* Keyboard hints */}
                <div className="flex justify-center gap-6 mt-4 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">Space</kbd>
                        Play/Pause
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">←→</kbd>
                        Skip 10s
                    </span>
                    <span className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">M</kbd>
                        Mute
                    </span>
                </div>
            </div>
        </div>
    );
}

// Copy Button Component
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.id as string;

    const [isBookmarked, setIsBookmarked] = useState(false);
    const [completedOutcomes, setCompletedOutcomes] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrlCopied, setShareUrlCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [documentData, setDocumentData] = useState<DocumentDetail | null>(null);
    const [currentPlayingOutcome, setCurrentPlayingOutcome] = useState<string | null>(null);

    // Time tracking refs
    const sessionStartTime = useRef<number>(Date.now());
    const lastSavedTime = useRef<number>(0);
    const timeTrackingInterval = useRef<NodeJS.Timeout | null>(null);

    // Save time spent to backend
    const saveTimeSpent = useCallback(async (forceSync = false) => {
        if (!lesson) return;

        const now = Date.now();
        const sessionSeconds = Math.floor((now - sessionStartTime.current) / 1000);
        const unsavedSeconds = sessionSeconds - lastSavedTime.current;

        // Only save if there's meaningful time to save (at least 5 seconds)
        if (unsavedSeconds < 5 && !forceSync) return;

        try {
            await lessonsApi.updateProgress(lesson.id, {
                time_spent_seconds: unsavedSeconds,
            });
            lastSavedTime.current = sessionSeconds;
        } catch (err) {
            console.error('Failed to save time spent:', err);
        }
    }, [lesson]);

    // Time tracking effect - saves every 30 seconds and on page leave
    useEffect(() => {
        if (!lesson || isLoading) return;

        // Reset session tracking
        sessionStartTime.current = Date.now();
        lastSavedTime.current = 0;

        // Save time every 30 seconds
        timeTrackingInterval.current = setInterval(() => {
            saveTimeSpent();
        }, 30000);

        // Save on visibility change (tab switch, minimize)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                saveTimeSpent(true);
            }
        };

        // Save on page unload
        const handleBeforeUnload = () => {
            saveTimeSpent(true);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            // Save remaining time on cleanup
            saveTimeSpent(true);

            if (timeTrackingInterval.current) {
                clearInterval(timeTrackingInterval.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [lesson, isLoading, saveTimeSpent]);

    // Fetch lesson and document data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch lesson by document ID
                const lessonData = await lessonsApi.getByDocumentId(documentId);
                setLesson(lessonData);

                // Fetch document details for metadata
                const docData = await documentsApi.getById(documentId);
                setDocumentData(docData);
            } catch (err: unknown) {
                console.error("Failed to fetch lesson:", err);
                const errorMessage = err instanceof Error ? err.message : "Failed to load lesson. Please try again.";
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [documentId]);

    // Parse learning outcomes from lesson data (JSON format from AI)
    const learningOutcomes = React.useMemo(() => {
        if (!lesson?.learning_outcomes) return [];

        try {
            const parsed = JSON.parse(lesson.learning_outcomes);
            if (Array.isArray(parsed)) {
                return parsed.map((item: { id: string; title: string; description: string } | string, index: number) => {
                    // Handle both object format and string format
                    if (typeof item === 'string') {
                        return {
                            id: `lo${index}`,
                            text: item.replace(/^[-•\d.]\s*/, '').trim(),
                            description: '',
                        };
                    }
                    return {
                        id: item.id || `lo${index}`,
                        text: item.title || item.description || '',
                        description: item.description || '',
                    };
                });
            }
        } catch {
            // Fallback to text parsing for legacy data
            return lesson.learning_outcomes.split('\n').filter(Boolean).map((text, i) => ({
                id: `lo${i}`,
                text: text.replace(/^[-•]\s*/, '').trim(),
                description: '',
            }));
        }
        return [];
    }, [lesson?.learning_outcomes]);

    // Handle auto-completion of outcomes based on audio progress
    const handleOutcomeReached = useCallback(async (outcomeId: string) => {
        if (!lesson) return;

        // Check if already completed using the current state
        setCompletedOutcomes(prev => {
            if (prev.has(outcomeId)) return prev; // Already completed, no change

            const next = new Set(prev);
            next.add(outcomeId);
            return next;
        });

        // Persist to backend
        try {
            await lessonsApi.updateOutcome(lesson.id, {
                outcome_id: outcomeId,
                completed: true,
            });
        } catch (err) {
            console.error('Failed to auto-complete outcome:', err);
            // Revert on error
            setCompletedOutcomes(prev => {
                const next = new Set(prev);
                next.delete(outcomeId);
                return next;
            });
        }
    }, [lesson]);

    // Initialize completedOutcomes from lesson data
    React.useEffect(() => {
        if (lesson?.outcomes_completed) {
            try {
                const completed = JSON.parse(lesson.outcomes_completed);
                if (Array.isArray(completed)) {
                    setCompletedOutcomes(new Set(completed));
                }
            } catch {
                // Ignore parse errors
            }
        }
    }, [lesson?.outcomes_completed]);

    // Parse key takeaways from lesson data
    const keyTakeaways = React.useMemo(() => {
        if (!lesson?.key_takeaways) return [];

        // Try to parse as JSON first (in case it's stored as an array)
        try {
            const parsed = JSON.parse(lesson.key_takeaways);
            if (Array.isArray(parsed)) {
                return parsed.map((item: string | { text?: string; takeaway?: string }) => {
                    if (typeof item === 'string') return item.replace(/^[-•]\s*/, '').trim();
                    return (item.text || item.takeaway || '').replace(/^[-•]\s*/, '').trim();
                }).filter(Boolean);
            }
        } catch {
            // Not JSON, fall back to text parsing
        }

        // Fallback to newline-separated text
        return lesson.key_takeaways.split('\n').filter(Boolean).map(t => t.replace(/^[-•]\s*/, '').trim());
    }, [lesson?.key_takeaways]);

    // Parse workplace applications from lesson data
    const workplaceApplications = lesson?.apply_at_work
        ? lesson.apply_at_work.split('\n').filter(Boolean).map((text, i) => ({
            id: `wa${i}`,
            title: text.split(':')[0]?.replace(/^[-•\d.]\s*/, '').trim() || `Action ${i + 1}`,
            description: text.split(':').slice(1).join(':').trim() || text.replace(/^[-•\d.]\s*/, '').trim(),
            priority: i === 0 ? 'high' as const : i < 2 ? 'medium' as const : 'low' as const,
        }))
        : [];

    const toggleOutcome = async (id: string) => {
        if (!lesson) return;
        
        const willBeCompleted = !completedOutcomes.has(id);
        
        // Optimistic update
        setCompletedOutcomes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });

        // Persist to backend
        try {
            const updatedLesson = await lessonsApi.updateOutcome(lesson.id, {
                outcome_id: id,
                completed: willBeCompleted,
            });
            // Update lesson state with response
            setLesson(updatedLesson);
        } catch (err) {
            console.error('Failed to update outcome:', err);
            // Revert optimistic update on error
            setCompletedOutcomes((prev) => {
                const next = new Set(prev);
                if (willBeCompleted) {
                    next.delete(id);
                } else {
                    next.add(id);
                }
                return next;
            });
        }
    };

    const completionPercent = learningOutcomes.length > 0
        ? Math.round((completedOutcomes.size / learningOutcomes.length) * 100)
        : 0;

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const handleMarkComplete = async () => {
        if (!lesson) return;
        try {
            await lessonsApi.markComplete(lesson.id);
            setLesson(prev => prev ? { ...prev, is_completed: true, progress_percentage: 100 } : null);
        } catch (err) {
            console.error("Failed to mark lesson as complete:", err);
        }
    };

    const handleDelete = async () => {
        if (!documentData) return;
        try {
            await documentsApi.delete(documentData.id);
            router.push("/documents");
        } catch (err) {
            console.error("Failed to delete document:", err);
        }
    };

    // Share functionality
    const handleShare = async () => {
        const shareUrl = window.location.href;

        // Check if Web Share API is available (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: lesson?.title || "Cognify Lesson",
                    text: lesson?.summary || "Check out this lesson on Cognify",
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or error - fall back to modal
                if ((err as Error).name !== 'AbortError') {
                    setShowShareModal(true);
                }
            }
        } else {
            // Desktop - show share modal
            setShowShareModal(true);
        }
    };

    const handleCopyShareUrl = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShareUrlCopied(true);
            setTimeout(() => setShareUrlCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL:", err);
        }
    };

    // Download functionality
    const handleDownload = async () => {
        if (!documentData || isDownloading) return;
        try {
            setIsDownloading(true);
            const blob = await documentsApi.download(documentData.id);
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement("a");
            a.href = url;
            a.download = documentData.file_name;
            window.document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);
        } catch (err) {
            console.error("Failed to download document:", err);
        } finally {
            setIsDownloading(false);
        }
    };

    // Print functionality
    const handlePrint = () => {
        window.print();
    };

    // Loading state
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading lesson...</p>
                </div>
            </DashboardLayout>
        );
    }

    // Error state
    if (error || !lesson || !documentData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {error || "Lesson not found"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The lesson may not exist or is still being processed.
                    </p>
                    <Link
                        href="/documents"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Documents
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="w-full">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between mb-8">
                    <Link
                        href="/documents"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Documents
                    </Link>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsBookmarked(!isBookmarked)}
                            className={`p-2 rounded-lg transition-colors ${
                                isBookmarked
                                    ? "text-amber-500 bg-amber-50 dark:bg-amber-900/30"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                            title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                        >
                            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Share"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Download original document"
                        >
                            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={handlePrint}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            title="Print"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Delete this lesson?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                This will permanently delete the lesson, audio narration, and all associated data. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors"
                                >
                                    Delete Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Share this lesson
                                </h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Share this lesson with others by copying the link below.
                            </p>

                            {/* URL Copy Field */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    readOnly
                                    value={typeof window !== 'undefined' ? window.location.href : ''}
                                    className="flex-1 px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    onClick={handleCopyShareUrl}
                                    className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${
                                        shareUrlCopied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                                >
                                    {shareUrlCopied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Social Share Buttons */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    Or share via
                                </p>
                                <div className="flex gap-3">
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(lesson?.title || 'Check out this lesson')}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                        </svg>
                                        Twitter
                                    </a>
                                    <a
                                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                        LinkedIn
                                    </a>
                                    <a
                                        href={`mailto:?subject=${encodeURIComponent(lesson?.title || 'Check out this lesson')}&body=${encodeURIComponent(`I thought you might find this lesson interesting: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Email
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Document Metadata Header */}
                <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                        {/* Icon */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-30" />
                            <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                <GraduationCap className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {lesson.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="w-4 h-4" />
                                            {documentData.file_name}
                                        </span>
                                        <FileTypeBadge type={documentData.file_type.toUpperCase() as "PDF" | "DOCX" | "TXT"} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {lesson.is_completed && (
                                        <span className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/40 rounded-full ring-1 ring-inset ring-blue-200 dark:ring-blue-800">
                                            <span className="flex items-center gap-1.5">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Completed
                                            </span>
                                        </span>
                                    )}
                                    <span className="px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-full ring-1 ring-inset ring-green-200 dark:ring-green-800">
                                        <span className="flex items-center gap-1.5">
                                            <Sparkles className="w-3 h-3" />
                                            AI Generated
                                        </span>
                                    </span>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ingestion ID
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <code className="text-sm font-mono text-gray-900 dark:text-white">
                                            {documentData.ingestion_id}
                                        </code>
                                        <CopyButton text={documentData.ingestion_id} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Source Length
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {documentData.word_count?.toLocaleString() || 'N/A'} words
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        File Size
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatFileSize(documentData.file_size)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Uploaded
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(documentData.created_at)}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Lesson Words
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {lesson.word_count} words
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Themes Section */}
                {documentData.themes && documentData.themes.length > 0 && (
                    <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 mb-6 shadow-sm">
                        <SectionHeader
                            icon={Brain}
                            title="Key Themes Identified"
                            subtitle="Main topics extracted from your document"
                            iconBg="bg-purple-100 dark:bg-purple-900/40"
                            iconColor="text-purple-600 dark:text-purple-400"
                            badge={
                                <span className="px-2.5 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                                    {documentData.themes.length} themes
                                </span>
                            }
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documentData.themes.map((theme, index) => (
                                <div
                                    key={theme.id}
                                    className="group relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all bg-gray-50/50 dark:bg-gray-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 text-sm font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                                {theme.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {theme.description || 'No description available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-8 space-y-6">
                        {/* Lesson Content */}
                        <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm">
                            <SectionHeader
                                icon={BookOpen}
                                title="What You'll Learn"
                                subtitle={`${lesson.word_count} words • ${Math.ceil(lesson.word_count / 200)} min read`}
                                iconBg="bg-blue-100 dark:bg-blue-900/40"
                                iconColor="text-blue-600 dark:text-blue-400"
                            />

                            {/* Summary */}
                            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/50">
                                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                                    <strong>Summary:</strong> {lesson.summary}
                                </p>
                            </div>

                            {/* Full Lesson Text */}
                            <div className="prose prose-gray dark:prose-invert max-w-none">
                                {lesson.content.split("\n\n").map((paragraph, idx) => {
                                    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                                        return (
                                            <h3 key={idx} className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                                                {paragraph.replace(/\*\*/g, "")}
                                            </h3>
                                        );
                                    }
                                    // Handle inline bold
                                    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
                                    return (
                                        <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                            {parts.map((part, i) => {
                                                if (part.startsWith("**") && part.endsWith("**")) {
                                                    return (
                                                        <strong key={i} className="font-semibold text-gray-900 dark:text-white">
                                                            {part.replace(/\*\*/g, "")}
                                                        </strong>
                                                    );
                                                }
                                                return part;
                                            })}
                                        </p>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Audio Player */}
                        {(lesson.audio_url || lesson.audio_path) && (
                            <AudioPlayer
                                audio={{
                                    url: getStaticUrl(lesson.audio_url || lesson.audio_path) || '',
                                    duration: lesson.audio_duration || 0,
                                    generatedAt: lesson.created_at,
                                }}
                                learningOutcomes={learningOutcomes}
                                onOutcomeReached={handleOutcomeReached}
                                onCurrentOutcomeChange={setCurrentPlayingOutcome}
                            />
                        )}

                        {/* Source Citations */}
                        {documentData.citations && documentData.citations.length > 0 && (
                            <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm">
                                <SectionHeader
                                    icon={Quote}
                                    title="Source Citations"
                                    subtitle="Referenced excerpts from your document"
                                    iconBg="bg-amber-100 dark:bg-amber-900/40"
                                    iconColor="text-amber-600 dark:text-amber-400"
                                    badge={
                                        <span className="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 rounded-full">
                                            {documentData.citations.length} citations
                                        </span>
                                    }
                                />

                                <div className="space-y-6">
                                    {documentData.citations.map((citation, index) => (
                                        <div key={citation.id} className="relative">
                                            <div className="flex gap-4">
                                                {/* Number indicator */}
                                                <div className="flex flex-col items-center">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-bold text-sm shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    {index < documentData.citations.length - 1 && (
                                                        <div className="w-0.5 flex-1 bg-amber-200 dark:bg-amber-800 mt-2" />
                                                    )}
                                                </div>

                                                {/* Citation content */}
                                                <div className="flex-1 pb-6">
                                                    <blockquote className="text-gray-700 dark:text-gray-300 italic border-l-4 border-amber-300 dark:border-amber-700 pl-4 mb-3">
                                                        "{citation.snippet}"
                                                    </blockquote>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {citation.source_page && (
                                                            <code className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                                                                Page {citation.source_page}
                                                            </code>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Learning Progress */}
                        <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm">
                            <SectionHeader
                                icon={ListChecks}
                                title="Learning Outcomes"
                                iconBg="bg-green-100 dark:bg-green-900/40"
                                iconColor="text-green-600 dark:text-green-400"
                            />

                            {/* Progress bar */}
                            <div className="mb-5">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600 dark:text-gray-400">Your progress</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{completionPercent}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercent}%` }}
                                    />
                                </div>
                            </div>

                            {/* Outcomes checklist */}
                            <div className="space-y-3">
                                {learningOutcomes.length > 0 ? learningOutcomes.map((outcome, index) => {
                                    const isCompleted = completedOutcomes.has(outcome.id);
                                    const isCurrentlyPlaying = currentPlayingOutcome === outcome.id;
                                    // Find the index of the first uncompleted outcome
                                    const firstUncompletedIndex = learningOutcomes.findIndex(o => !completedOutcomes.has(o.id));
                                    // Can only click: the next uncompleted step (to complete) or the last completed step (to uncomplete)
                                    const isNextStep = index === firstUncompletedIndex;
                                    const isLastCompleted = isCompleted && (index === firstUncompletedIndex - 1 || (firstUncompletedIndex === -1 && index === learningOutcomes.length - 1));
                                    const canClick = isNextStep || isLastCompleted;
                                    const stepProgress = Math.round(((index + 1) / learningOutcomes.length) * 100);

                                    return (
                                        <button
                                            key={outcome.id}
                                            onClick={() => canClick && toggleOutcome(outcome.id)}
                                            disabled={!canClick}
                                            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                                                isCompleted
                                                    ? "bg-green-50 dark:bg-green-900/20 ring-1 ring-green-200 dark:ring-green-800"
                                                    : isCurrentlyPlaying
                                                        ? "bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-400 dark:ring-purple-600 shadow-md shadow-purple-200 dark:shadow-purple-900/30"
                                                        : isNextStep
                                                            ? "bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                                                            : "bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed"
                                            }`}
                                        >
                                            <div
                                                className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 mt-0.5 transition-colors text-xs font-semibold ${
                                                    isCompleted
                                                        ? "bg-green-500 text-white"
                                                        : isCurrentlyPlaying
                                                            ? "bg-purple-500 text-white animate-pulse"
                                                            : isNextStep
                                                                ? "bg-indigo-500 text-white"
                                                                : "border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                                                }`}
                                            >
                                                {isCompleted ? <Check className="w-3.5 h-3.5" /> : isCurrentlyPlaying ? <Volume2 className="w-3.5 h-3.5" /> : index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                                    <span
                                                        className={`text-sm font-medium ${
                                                            isCompleted
                                                                ? "text-green-700 dark:text-green-300"
                                                                : isCurrentlyPlaying
                                                                    ? "text-purple-700 dark:text-purple-300"
                                                                    : isNextStep
                                                                        ? "text-indigo-700 dark:text-indigo-300"
                                                                        : "text-gray-500 dark:text-gray-400"
                                                        }`}
                                                    >
                                                        {outcome.text}
                                                    </span>
                                                    <span className={`text-xs font-medium shrink-0 ${
                                                        isCompleted
                                                            ? "text-green-600 dark:text-green-400"
                                                            : isCurrentlyPlaying
                                                                ? "text-purple-600 dark:text-purple-400"
                                                                : isNextStep
                                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                                    : "text-gray-400 dark:text-gray-500"
                                                    }`}>
                                                        {stepProgress}%
                                                    </span>
                                                </div>
                                                {isCurrentlyPlaying && !isCompleted && (
                                                    <span className="text-xs text-purple-500 dark:text-purple-400 flex items-center gap-1">
                                                        <span className="inline-flex gap-0.5">
                                                            <span className="w-1 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <span className="w-1 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <span className="w-1 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </span>
                                                        Now playing
                                                    </span>
                                                )}
                                                {isNextStep && !isCompleted && !isCurrentlyPlaying && (
                                                    <span className="text-xs text-indigo-500 dark:text-indigo-400">Click to complete this step</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                }) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No learning outcomes defined for this lesson.</p>
                                )}
                            </div>
                        </div>

                        {/* Key Takeaways */}
                        {keyTakeaways.length > 0 && (
                            <div className="bg-white dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-gray-700/50 p-6 shadow-sm">
                                <SectionHeader
                                    icon={Lightbulb}
                                    title="Key Takeaways"
                                    iconBg="bg-yellow-100 dark:bg-yellow-900/40"
                                    iconColor="text-yellow-600 dark:text-yellow-400"
                                />

                                <ul className="space-y-3">
                                    {keyTakeaways.map((takeaway, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{takeaway}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Apply at Work */}
                        {workplaceApplications.length > 0 && (
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 p-[1px]">
                                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6">
                                    <SectionHeader
                                        icon={Briefcase}
                                        title="Apply at Work"
                                        subtitle="Practical next steps"
                                        iconBg="bg-indigo-100 dark:bg-indigo-900/40"
                                        iconColor="text-indigo-600 dark:text-indigo-400"
                                    />

                                    <div className="space-y-4">
                                        {workplaceApplications.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                                {index + 1}
                                                            </span>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                                {item.title}
                                                            </h4>
                                                        </div>
                                                        <PriorityBadge priority={item.priority} />
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleMarkComplete}
                                            disabled={lesson.is_completed}
                                            className={`mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl shadow-lg transition-all ${
                                                lesson.is_completed
                                                    ? "bg-green-500 text-white cursor-default"
                                                    : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                                            }`}
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                            {lesson.is_completed ? "Lesson Completed" : "Mark Lesson Complete"}
                                        </button>
                                    </div>
                                </div>
                            )}

                        {/* Mark Complete button for when no workplace applications */}
                        {workplaceApplications.length === 0 && (
                            <button
                                onClick={handleMarkComplete}
                                disabled={lesson.is_completed}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl shadow-lg transition-all ${
                                    lesson.is_completed
                                        ? "bg-green-500 text-white cursor-default"
                                        : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                                }`}
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {lesson.is_completed ? "Lesson Completed" : "Mark Lesson Complete"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
