"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ArrowUp, ChevronUp } from "lucide-react";

export default function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Get scroll progress for the circular indicator
    const { scrollYProgress } = useScroll();

    // Calculate circle properties
    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = useTransform(
        scrollYProgress,
        [0, 1],
        [circumference, 0]
    );

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed bottom-8 right-8 z-50"
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                    }}
                >
                    <motion.button
                        onClick={scrollToTop}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Scroll to top"
                    >
                        {/* Outer glow effect */}
                        <motion.div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 blur-xl"
                            initial={{ opacity: 0, scale: 1 }}
                            animate={isHovered ? { opacity: 0.6, scale: 1.5 } : { opacity: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Background with glassmorphism */}
                        <div className="relative w-14 h-14 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-black/30 flex items-center justify-center overflow-hidden">
                            {/* Animated gradient background on hover */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isHovered ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                            />

                            {/* Progress circle */}
                            <svg
                                className="absolute inset-0 w-full h-full -rotate-90"
                                viewBox="0 0 56 56"
                            >
                                {/* Background circle */}
                                <circle
                                    cx="28"
                                    cy="28"
                                    r="20"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    className="text-gray-200 dark:text-gray-700/50"
                                />
                                {/* Progress circle */}
                                <motion.circle
                                    cx="28"
                                    cy="28"
                                    r="20"
                                    fill="none"
                                    stroke="url(#progressGradient)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    style={{
                                        strokeDasharray: circumference,
                                        strokeDashoffset: strokeDashoffset,
                                    }}
                                    className={isHovered ? "opacity-0" : "opacity-100"}
                                />
                                {/* Gradient definition */}
                                <defs>
                                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Arrow icon with animation */}
                            <motion.div
                                className="relative z-10"
                                animate={isHovered ? { y: [-2, -4, -2] } : { y: 0 }}
                                transition={
                                    isHovered
                                        ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                                        : { duration: 0.2 }
                                }
                            >
                                <ChevronUp
                                    className={`w-6 h-6 transition-colors duration-300 ${
                                        isHovered
                                            ? "text-white"
                                            : "text-gray-700 dark:text-gray-200"
                                    }`}
                                    strokeWidth={2.5}
                                />
                            </motion.div>

                            {/* Ripple effect on hover */}
                            {isHovered && (
                                <motion.div
                                    className="absolute inset-0 rounded-full border-2 border-white/50"
                                    initial={{ scale: 0.8, opacity: 0.8 }}
                                    animate={{
                                        scale: [1, 1.4, 1.8],
                                        opacity: [0.6, 0.3, 0],
                                    }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        ease: "easeOut",
                                    }}
                                />
                            )}
                        </div>

                        {/* Tooltip */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-medium rounded-lg whitespace-nowrap shadow-lg"
                                    initial={{ opacity: 0, x: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 10, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Back to top
                                    {/* Tooltip arrow */}
                                    <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900 dark:border-l-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
