"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";

interface Stat {
    value: string;
    label: string;
    description: string;
}

const STATS: readonly Stat[] = [
    {
        value: "10K+",
        label: "Learning Sessions",
        description: "AI-powered lessons generated"
    },
    {
        value: "95%",
        label: "Engagement Rate",
        description: "Professionals actively learning"
    },
    {
        value: "50+",
        label: "Document Types",
        description: "Supported file formats"
    },
] as const;

const FunFact = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.3 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // Parallax effects - these create movement as you scroll
    const y1 = useTransform(smoothProgress, [0, 1], [200, -200]);
    const y2 = useTransform(smoothProgress, [0, 1], [-100, 100]);
    const y3 = useTransform(smoothProgress, [0, 1], [150, -150]);

    const rotate1 = useTransform(smoothProgress, [0, 1], [0, 360]);
    const rotate2 = useTransform(smoothProgress, [0, 1], [0, -360]);

    const scale1 = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 1]);
    const opacity1 = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen overflow-hidden py-24 md:py-32 lg:py-40"
        >
            {/* Animated Background with Parallax */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950"
                style={{ opacity: opacity1 }}
            />

            {/* Parallax Floating Orbs */}
            <motion.div
                className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-3xl"
                style={{ y: y1, scale: scale1, rotate: rotate1 }}
            />
            <motion.div
                className="absolute -right-32 top-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-400/30 to-orange-400/30 blur-3xl"
                style={{ y: y2, rotate: rotate2 }}
            />
            <motion.div
                className="absolute left-1/2 bottom-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-3xl"
                style={{ y: y3 }}
            />

            {/* Grid Pattern with Parallax */}
            <motion.div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{ y: useTransform(smoothProgress, [0, 1], [0, -100]) }}
            >
                <div className="h-full w-full" style={{
                    backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99, 102, 241, 0.3) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </motion.div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header with Parallax */}
                <motion.div
                    style={{ y: useTransform(smoothProgress, [0, 1], [50, -50]) }}
                    className="mx-auto mb-16 max-w-3xl text-center"
                >
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-4 inline-block"
                    >
            <span className="inline-flex items-center rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-2 h-2 w-2 rounded-full bg-indigo-500"
              />
              Powered by AI
            </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
                    >
                        Transforming How
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Professionals </span>
                        Learn
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-lg leading-relaxed text-gray-600 dark:text-gray-300"
                    >
                        Cognify empowers teams to extract insights from any document and
                        create personalized, AI-driven learning experiences in seconds.
                    </motion.p>
                </motion.div>

                {/* Stats Grid with Individual Parallax */}
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {STATS.map((stat, index) => {
                        const cardY = useTransform(
                            smoothProgress,
                            [0, 1],
                            [100 - index * 20, -100 + index * 20]
                        );

                        return (
                            <motion.div
                                key={stat.label}
                                style={{ y: cardY }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                                transition={{
                                    duration: 0.8,
                                    delay: 0.2 + index * 0.15,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{
                                    y: -12,
                                    scale: 1.03,
                                    transition: { duration: 0.3 }
                                }}
                                className="group relative"
                            >
                                {/* Card */}
                                <div className="relative h-full overflow-hidden rounded-2xl bg-white/80 p-8 shadow-xl backdrop-blur-sm transition-all duration-500 dark:bg-gray-800/80 dark:shadow-2xl">
                                    {/* Animated Hover Gradient */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
                                        whileHover={{ scale: 1.5, rotate: 180 }}
                                        transition={{ duration: 0.8 }}
                                    />

                                    {/* Animated Top Border */}
                                    <motion.div
                                        className="absolute left-0 top-0 h-1 w-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 group-hover:w-full"
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                                    />

                                    {/* Content */}
                                    <div className="relative">
                                        <motion.div
                                            whileInView={{
                                                scale: [1, 1.15, 1],
                                            }}
                                            viewport={{ once: true }}
                                            transition={{
                                                duration: 1.2,
                                                delay: 0.4 + index * 0.2,
                                                ease: "easeOut"
                                            }}
                                        >
                                            <h3 className="mb-2 bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-5xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400 lg:text-6xl">
                                                {stat.value}
                                            </h3>
                                        </motion.div>

                                        <p className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                                            {stat.label}
                                        </p>

                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {stat.description}
                                        </p>
                                    </div>

                                    {/* Animated Corner Decoration */}
                                    <motion.div
                                        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-2xl transition-all duration-500"
                                        animate={{
                                            scale: [1, 1.2, 1],
                                            rotate: [0, 90, 0],
                                        }}
                                        transition={{
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA with Parallax */}
                <motion.div
                    style={{ y: useTransform(smoothProgress, [0, 1], [30, -30]) }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="mt-16 text-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(99, 102, 241, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-2xl"
                    >
                        <span className="relative z-10">Start Learning Today</span>
                        <motion.svg
                            className="relative z-10 h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </motion.svg>
                        <motion.div
                            className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-700 to-purple-700"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
};

export default FunFact;