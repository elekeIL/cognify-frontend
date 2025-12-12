"use client";

import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Navigation items
const NAV_ITEMS = [
    { name: "Home", href: "/" },
    { name: "My Lessons", href: "/lessons" },
    { name: "Upload", href: "/upload" },
];

// Style configurations for scroll states
const SCROLL_STYLES = {
    light: {
        initial: {
            navbarBg: "rgba(255, 255, 255, 0.9)",
            navbarBorder: "rgba(229, 231, 235, 1)",
            navbarBlur: "blur(12px)",
            textColor: "rgb(0, 0, 0)",
        },
        scrolled: {
            navbarBg: "rgba(255, 255, 255, 0.95)",
            navbarBorder: "rgba(229, 231, 235, 1)",
            navbarBlur: "blur(12px)",
            textColor: "rgb(0, 0, 0)",
        },
    },
    dark: {
        initial: {
            navbarBg: "rgba(0, 0, 0, 0)",
            navbarBorder: "rgba(0, 0, 0, 0)",
            navbarBlur: "blur(0px)",
            textColor: "rgb(255, 255, 255)",
        },
        scrolled: {
            navbarBg: "rgba(255, 255, 255, 0.9)",
            navbarBorder: "rgba(229, 231, 235, 1)",
            navbarBlur: "blur(12px)",
            textColor: "rgb(0, 0, 0)",
        },
    },
};

// Helper functions
function lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
}

function parseColor(color: string): number[] {
    const match = color.match(/[\d.]+/g);
    return match ? match.map(Number) : [0, 0, 0, 1];
}

function interpolateColor(from: string, to: string, progress: number): string {
    const fromParts = parseColor(from);
    const toParts = parseColor(to);

    const r = Math.round(lerp(fromParts[0], toParts[0], progress));
    const g = Math.round(lerp(fromParts[1], toParts[1], progress));
    const b = Math.round(lerp(fromParts[2], toParts[2], progress));
    const a = lerp(fromParts[3] ?? 1, toParts[3] ?? 1, progress);

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const pathname = usePathname();

    // Determine if we're on a light background page
    const isLightBackgroundPage = pathname !== "/";

    // Track scroll progress
    const { scrollY } = useScroll();

    useMotionValueEvent(
        scrollY,
        "change",
        useCallback((latest: number) => {
            const progress = Math.min(1, Math.max(0, latest / 100));
            setScrollProgress(progress);
        }, [])
    );

    // Calculate interpolated styles
    const styles = useMemo(() => {
        const config = isLightBackgroundPage ? SCROLL_STYLES.light : SCROLL_STYLES.dark;
        const { initial, scrolled } = config;

        return {
            navbarBg: interpolateColor(initial.navbarBg, scrolled.navbarBg, scrollProgress),
            navbarBorder: interpolateColor(initial.navbarBorder, scrolled.navbarBorder, scrollProgress),
            navbarBlur: scrollProgress > 0.5 ? scrolled.navbarBlur : initial.navbarBlur,
            textColor: interpolateColor(initial.textColor, scrolled.textColor, scrollProgress),
            accentColor: interpolateColor("rgb(99, 102, 241)", "rgb(79, 70, 229)", scrollProgress),
        };
    }, [scrollProgress, isLightBackgroundPage]);

    const createNavClickHandler = useCallback(
        (itemName: string) => () => {
            setIsMobileMenuOpen(false);
        },
        []
    );

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    backgroundColor: styles.navbarBg,
                    borderBottomColor: styles.navbarBorder,
                    backdropFilter: styles.navbarBlur,
                    WebkitBackdropFilter: styles.navbarBlur,
                }}
                className="fixed top-0 left-0 right-0 z-50 border-b"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-3 hover:scale-[1.02] transition-transform duration-200"
                        >
                            <motion.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <GraduationCap
                                    className="w-8 h-8"
                                    style={{ color: styles.accentColor }}
                                />
                            </motion.div>
                            <span
                                style={{ color: styles.textColor }}
                                className="text-2xl font-bold tracking-tight"
                            >
                Distill
              </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {NAV_ITEMS.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                                >
                                    <Link
                                        href={item.href}
                                        onClick={createNavClickHandler(item.name)}
                                        style={{ color: styles.textColor }}
                                        className="relative font-medium text-sm hover:opacity-70 transition-opacity duration-200"
                                    >
                                        {item.name}
                                        <span
                                            style={{ backgroundColor: styles.textColor }}
                                            className="absolute -bottom-1 left-0 right-0 h-px scale-x-0 hover:scale-x-100 transition-transform duration-200 origin-left"
                                        />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Desktop CTA Button */}
                        <div className="hidden md:block">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                            >
                                <Link
                                    href="/upload"
                                    className="px-5 py-2.5 rounded-lg font-medium text-sm bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-block"
                                >
                                    Upload Material
                                </Link>
                            </motion.div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg backdrop-blur-sm border border-gray-200 bg-white/80 hover:scale-105 active:scale-95 transition-transform duration-200"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" style={{ color: styles.textColor }} />
                            ) : (
                                <Menu className="w-6 h-6" style={{ color: styles.textColor }} />
                            )}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-white border-l border-gray-200 z-50 md:hidden shadow-2xl"
                        >
                            <div className="flex flex-col h-full">
                                {/* Close Button */}
                                <div className="flex justify-end p-4 border-b border-gray-200">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                    >
                                        <X className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>

                                {/* Navigation Links */}
                                <div className="flex flex-col p-6 space-y-6 flex-1">
                                    {NAV_ITEMS.map((item, index) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={createNavClickHandler(item.name)}
                                                className="block text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors duration-200 py-2"
                                            >
                                                {item.name}
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mobile CTA */}
                                <div className="p-6 border-t border-gray-200">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.4 }}
                                    >
                                        <Link
                                            href="/upload"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="w-full block text-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                                        >
                                            Upload Material
                                        </Link>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}