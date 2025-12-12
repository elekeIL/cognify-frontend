"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Integration {
    name: string;
    icon: React.ReactNode;
    color: string;
    description: string;
}

const INTEGRATIONS: Integration[] = [
    {
        name: "PDF Documents",
        color: "from-red-500 to-red-600",
        description: "Extract insights from PDF files",
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        name: "Word Documents",
        color: "from-blue-500 to-blue-600",
        description: "Process DOCX files seamlessly",
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
        )
    },
    {
        name: "Text Files",
        color: "from-gray-500 to-gray-600",
        description: "Plain text processing",
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        name: "Claude AI",
        color: "from-purple-500 to-purple-600",
        description: "Powered by Anthropic",
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        name: "Voice Synthesis",
        color: "from-green-500 to-green-600",
        description: "Text-to-speech narration",
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
        )
    },
    {
        name: "Cloud Storage",
        color: "from-cyan-500 to-cyan-600",
        description: "Secure data persistence",
        icon: (
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            </svg>
        )
    },
];

const Integration = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={containerRef} className="relative overflow-hidden py-20 md:py-32">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

            {/* Decorative Elements */}
            <motion.div
                style={{ y, opacity }}
                className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/20"
            />
            <motion.div
                style={{ y: useTransform(y, v => -v), opacity }}
                className="absolute right-1/4 bottom-20 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20"
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto mb-16 max-w-3xl text-center"
                >

                    <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                        Works With Your
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Existing Tools</span>
                    </h2>

                    <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        Upload any document format and let our AI transform it into engaging,
                        personalized learning content with voice narration.
                    </p>
                </motion.div>

                {/* Integration Grid */}
                <div className="relative">
                    {/* Connection Lines Background */}
                    <svg className="absolute inset-0 h-full w-full opacity-10 dark:opacity-5" style={{ zIndex: 0 }}>
                        <defs>
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {INTEGRATIONS.map((integration, index) => (
                            <motion.div
                                key={integration.name}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.1,
                                    ease: [0.22, 1, 0.36, 1]
                                }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.3 }
                                }}
                                className="group relative"
                            >
                                {/* Card */}
                                <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all duration-500 hover:shadow-2xl dark:bg-gray-800">
                                    {/* Gradient Border on Hover */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ padding: '2px' }}>
                                        <div className="h-full w-full rounded-2xl bg-white dark:bg-gray-800" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <motion.div
                                            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                            transition={{ duration: 0.5 }}
                                            className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${integration.color} text-white shadow-lg`}
                                        >
                                            {integration.icon}
                                        </motion.div>

                                        {/* Text */}
                                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                            {integration.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {integration.description}
                                        </p>

                                        {/* Status Indicator */}
                                        <div className="mt-4 flex items-center gap-2">
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="h-2 w-2 rounded-full bg-green-500"
                                            />
                                            <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Active
                      </span>
                                        </div>
                                    </div>

                                    {/* Decorative Corner */}
                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-2xl transition-all duration-500 group-hover:scale-150" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    {/*<p className="mb-4 text-lg text-gray-600 dark:text-gray-400">*/}
                    {/*    Need a custom integration?*/}
                    {/*</p>*/}
                    {/*<motion.button*/}
                    {/*    whileHover={{ scale: 1.05 }}*/}
                    {/*    whileTap={{ scale: 0.95 }}*/}
                    {/*    className="inline-flex items-center gap-2 rounded-full border-2 border-indigo-600 bg-transparent px-6 py-3 font-semibold text-indigo-600 transition-all hover:bg-indigo-600 hover:text-white dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-400 dark:hover:text-gray-900"*/}
                    {/*>*/}
                    {/*    Contact Us*/}
                    {/*    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
                    {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />*/}
                    {/*    </svg>*/}
                    {/*</motion.button>*/}
                </motion.div>
            </div>
        </section>
    );
};

export default Integration;