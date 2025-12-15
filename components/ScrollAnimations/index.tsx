"use client";

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring, useInView, MotionValue, Variants } from "framer-motion";

// =============================================================================
// SCROLL CONTEXT - For global scroll state
// =============================================================================

interface ScrollContextType {
    scrollY: MotionValue<number>;
    scrollYProgress: MotionValue<number>;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
    const { scrollY, scrollYProgress } = useScroll();

    return (
        <ScrollContext.Provider value={{ scrollY, scrollYProgress }}>
            {children}
        </ScrollContext.Provider>
    );
}

export function useScrollContext() {
    const context = useContext(ScrollContext);
    if (!context) {
        throw new Error("useScrollContext must be used within ScrollProvider");
    }
    return context;
}

// =============================================================================
// SMOOTH SCROLL SETUP - Lenis-like smooth scrolling
// =============================================================================

export function useSmoothScroll() {
    useEffect(() => {
        // Add smooth scroll behavior to html element
        document.documentElement.style.scrollBehavior = "smooth";

        return () => {
            document.documentElement.style.scrollBehavior = "";
        };
    }, []);
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1], // Custom easing for premium feel
        },
    },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

// =============================================================================
// ANIMATED COMPONENTS
// =============================================================================

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "scale";
}

export function AnimatedSection({
    children,
    className = "",
    delay = 0,
    direction = "up",
}: AnimatedSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const variants: Record<string, Variants> = {
        up: fadeInUp,
        down: fadeInDown,
        left: fadeInLeft,
        right: fadeInRight,
        scale: scaleIn,
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants[direction]}
            transition={{ delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// =============================================================================
// PARALLAX COMPONENTS
// =============================================================================

interface ParallaxProps {
    children: ReactNode;
    speed?: number; // Positive = slower, Negative = faster
    className?: string;
}

export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const y = useTransform(smoothProgress, [0, 1], [100 * speed, -100 * speed]);

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}

interface ParallaxLayerProps {
    children: ReactNode;
    offset?: [number, number];
    className?: string;
}

export function ParallaxLayer({
    children,
    offset = [0, 0],
    className = "",
}: ParallaxLayerProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const y = useTransform(smoothProgress, [0, 1], offset);

    return (
        <motion.div ref={ref} style={{ y }} className={className}>
            {children}
        </motion.div>
    );
}

// =============================================================================
// REVEAL ON SCROLL
// =============================================================================

interface RevealProps {
    children: ReactNode;
    className?: string;
    width?: "fit-content" | "100%";
}

export function Reveal({ children, className = "", width = "fit-content" }: RevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={className}
            >
                {children}
            </motion.div>
            <motion.div
                variants={{
                    hidden: { left: 0 },
                    visible: { left: "100%" },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.5, ease: "easeIn" }}
                style={{
                    position: "absolute",
                    top: 4,
                    bottom: 4,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                    zIndex: 20,
                }}
            />
        </div>
    );
}

// =============================================================================
// FLOATING ELEMENTS
// =============================================================================

interface FloatingProps {
    children: ReactNode;
    className?: string;
    duration?: number;
    distance?: number;
    delay?: number;
}

export function Floating({
    children,
    className = "",
    duration = 3,
    distance = 20,
    delay = 0,
}: FloatingProps) {
    return (
        <motion.div
            className={className}
            animate={{
                y: [-distance / 2, distance / 2, -distance / 2],
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay,
            }}
        >
            {children}
        </motion.div>
    );
}

// =============================================================================
// MAGNETIC HOVER EFFECT
// =============================================================================

interface MagneticProps {
    children: ReactNode;
    className?: string;
    strength?: number;
}

export function Magnetic({ children, className = "", strength = 0.3 }: MagneticProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const x = (clientX - left - width / 2) * strength;
        const y = (clientY - top - height / 2) * strength;

        setPosition({ x, y });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// =============================================================================
// TEXT REVEAL ANIMATION
// =============================================================================

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
}

export function TextReveal({ text, className = "", delay = 0 }: TextRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    const words = text.split(" ");

    return (
        <motion.span
            ref={ref}
            className={className}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            transition={{ staggerChildren: 0.05, delayChildren: delay }}
        >
            {words.map((word, index) => (
                <span key={index} className="inline-block overflow-hidden">
                    <motion.span
                        className="inline-block"
                        variants={{
                            hidden: { y: "100%", opacity: 0 },
                            visible: {
                                y: 0,
                                opacity: 1,
                                transition: {
                                    duration: 0.5,
                                    ease: [0.22, 1, 0.36, 1],
                                },
                            },
                        }}
                    >
                        {word}
                    </motion.span>
                    {index < words.length - 1 && "\u00A0"}
                </span>
            ))}
        </motion.span>
    );
}

// =============================================================================
// SCROLL PROGRESS INDICATOR
// =============================================================================

export function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left z-50"
            style={{ scaleX }}
        />
    );
}

// =============================================================================
// SECTION WRAPPER WITH SCROLL ANIMATIONS
// =============================================================================

interface ScrollSectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function ScrollSection({ children, className = "", id }: ScrollSectionProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);

    const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });
    const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

    return (
        <motion.section
            ref={ref}
            id={id}
            style={{ opacity: smoothOpacity, scale: smoothScale }}
            className={className}
        >
            {children}
        </motion.section>
    );
}

// =============================================================================
// GRADIENT BACKGROUND ANIMATION
// =============================================================================

interface AnimatedGradientProps {
    className?: string;
}

export function AnimatedGradient({ className = "" }: AnimatedGradientProps) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });

    const x1 = useTransform(scrollYProgress, [0, 1], ["-40%", "40%"]);
    const x2 = useTransform(scrollYProgress, [0, 1], ["40%", "-40%"]);

    return (
        <div ref={ref} className={`absolute inset-0 overflow-hidden ${className}`}>
            <motion.div
                className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-3xl"
                style={{ x: x1 }}
            />
            <motion.div
                className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-400/30 dark:bg-purple-500/20 rounded-full blur-3xl"
                style={{ x: x2 }}
            />
        </div>
    );
}
