"use client";
import { useState, useRef } from "react";
import { Upload, Sparkles, BookOpen } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, Variants } from "framer-motion";
import { Floating, Magnetic } from "@/components/ScrollAnimations";

const Hero = () => {
    const [email, setEmail] = useState("");
    const containerRef = useRef<HTMLElement>(null);
    const contentRef = useRef(null);
    const isInView = useInView(contentRef, { once: true, margin: "-100px" });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });

    // Smooth spring physics for parallax
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    // Parallax transforms
    const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
    const contentY = useTransform(smoothProgress, [0, 1], ["0%", "15%"]);
    const illustrationY = useTransform(smoothProgress, [0, 1], ["0%", "25%"]);
    const opacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(smoothProgress, [0, 0.5], [1, 0.95]);

    // Blob positions
    const blob1X = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);
    const blob1Y = useTransform(smoothProgress, [0, 1], ["0%", "40%"]);
    const blob2X = useTransform(smoothProgress, [0, 1], ["0%", "-20%"]);
    const blob2Y = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Email submitted:", email);
    };

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
            },
        },
    };

    const featureVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: 0.6 + i * 0.1,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <section
            ref={containerRef}
            className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black min-h-screen flex items-center"
        >
            {/* Animated Background Elements */}
            <motion.div className="absolute inset-0 overflow-hidden" style={{ y: backgroundY }}>
                {/* Gradient Blobs with Parallax */}
                <motion.div
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"
                    style={{ x: blob1X, y: blob1Y }}
                />
                <motion.div
                    className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-purple-400/20 dark:bg-purple-500/10 rounded-full blur-3xl"
                    style={{ x: blob2X, y: blob2Y }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-300/10 via-purple-300/10 to-pink-300/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 180, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </motion.div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <motion.div
                className="relative mx-auto max-w-7xl px-4 md:px-8 2xl:px-0 py-20 md:py-32"
                style={{ y: contentY, opacity, scale }}
            >
                <motion.div
                    ref={contentRef}
                    className="flex flex-col lg:flex-row items-center gap-12 xl:gap-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {/* Left content */}
                    <div className="flex-1 text-center lg:text-left">
                        {/* Badge */}
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-4 h-4" />
                            </motion.div>
                            AI-Powered Learning Platform
                        </motion.div>

                        {/* Heading */}
                        <motion.h1
                            variants={itemVariants}
                            className="text-4xl md:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
                        >
                            Transform Documents into{" "}
                            <span className="relative inline-block">
                                <motion.span
                                    className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
                                    animate={{
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    style={{
                                        backgroundSize: "200% 200%",
                                    }}
                                >
                                    Actionable Lessons
                                </motion.span>
                                <motion.span
                                    className="absolute bottom-2 left-0 w-full h-3 bg-blue-200 dark:bg-blue-900/50 -z-0"
                                    initial={{ scaleX: 0 }}
                                    animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                                    transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                    style={{ originX: 0 }}
                                />
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            variants={itemVariants}
                            className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0"
                        >
                            Upload your training materials and let Cognify extract key themes,
                            generate concise lessons, and create audio narration—all optimized
                            for workplace learning.
                        </motion.p>

                        {/* Email Form */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                                <motion.input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-300 shadow-sm hover:shadow-md"
                                    whileFocus={{ scale: 1.02 }}
                                />
                                <Magnetic strength={0.2}>
                                    <motion.button
                                        type="submit"
                                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 relative overflow-hidden group"
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {/* Shine effect */}
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                            animate={{ x: ["-100%", "100%"] }}
                                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                        />
                                        <span className="relative z-10">Get Started</span>
                                    </motion.button>
                                </Magnetic>
                            </form>
                        </motion.div>

                        {/* Trust text */}
                        <motion.p
                            variants={itemVariants}
                            className="text-sm text-gray-500 dark:text-gray-400"
                        >
                            Free to try • No credit card required
                        </motion.p>

                        {/* Features Grid */}
                        <motion.div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                            {[
                                { icon: Upload, title: "Upload", desc: "PDF, TXT, DOCX", color: "blue" },
                                { icon: Sparkles, title: "Analyze", desc: "AI Themes", color: "purple" },
                                { icon: BookOpen, title: "Learn", desc: "Audio + Text", color: "green" },
                            ].map((feature, index) => {
                                const Icon = feature.icon;
                                const colors: Record<string, string> = {
                                    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
                                    purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
                                    green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
                                };
                                return (
                                    <motion.div
                                        key={feature.title}
                                        custom={index}
                                        variants={featureVariants}
                                        className="text-center lg:text-left group"
                                        whileHover={{ y: -5 }}
                                    >
                                        <motion.div
                                            className={`inline-flex items-center justify-center w-12 h-12 ${colors[feature.color]} rounded-xl mb-2 transition-transform duration-300 group-hover:scale-110`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </motion.div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{feature.title}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Right illustration */}
                    <motion.div
                        className="flex-1 relative"
                        style={{ y: illustrationY }}
                    >
                        <motion.div
                            className="relative w-full max-w-lg mx-auto"
                            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                            animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
                            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {/* Main Card */}
                            <motion.div
                                className="relative aspect-square w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl"
                                whileHover={{ rotateY: 5, rotateX: -5 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                            >
                                <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col justify-center items-center shadow-inner">
                                    <div className="w-full space-y-4">
                                        {/* Animated skeleton lines */}
                                        {[0.75, 1, 0.85].map((width, i) => (
                                            <motion.div
                                                key={i}
                                                className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                                                style={{ width: `${width * 100}%` }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                                transition={{ delay: 0.5 + i * 0.1 }}
                                            />
                                        ))}
                                        <div className="mt-8 flex gap-2">
                                            {["blue", "purple", "pink"].map((color, i) => (
                                                <motion.div
                                                    key={color}
                                                    className={`h-8 bg-${color}-200 dark:bg-${color}-800 rounded-full`}
                                                    style={{ width: [80, 96, 64][i] }}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                                    transition={{
                                                        delay: 0.8 + i * 0.1,
                                                        type: "spring",
                                                        stiffness: 200,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Decorative Elements */}
                            <Floating duration={4} distance={15}>
                                <motion.div
                                    className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 0, rotate: -45 }}
                                    animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.1, rotate: 10 }}
                                >
                                    <Upload className="w-8 h-8 text-white" />
                                </motion.div>
                            </Floating>

                            <Floating duration={3.5} distance={12} delay={0.5}>
                                <motion.div
                                    className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 0, rotate: 45 }}
                                    animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.1, rotate: -10 }}
                                >
                                    <Sparkles className="w-7 h-7 text-white" />
                                </motion.div>
                            </Floating>

                            <Floating duration={5} distance={10} delay={1}>
                                <motion.div
                                    className="absolute top-1/2 -right-8 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg flex items-center justify-center"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.1 }}
                                >
                                    <BookOpen className="w-6 h-6 text-white" />
                                </motion.div>
                            </Floating>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center pt-2"
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1.5 h-3 bg-gray-400 dark:bg-gray-600 rounded-full"
                        animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </section>
    );
};

export default Hero;
