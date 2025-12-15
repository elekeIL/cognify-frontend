"use client";
import { useRef } from "react";
import { Upload, Brain, FileText, Volume2, Link2, Zap } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, Variants } from "framer-motion";

const Features = () => {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "20%"]);

    const features = [
        {
            id: 1,
            icon: Upload,
            title: "Multi-Format Upload",
            description: "Upload PDF, TXT, or DOCX files seamlessly. Our intelligent parser handles various document structures and extracts content accurately.",
            color: "blue",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            id: 2,
            icon: Brain,
            title: "AI Theme Extraction",
            description: "Advanced AI analyzes your content and identifies 3-7 key themes, ensuring learners focus on what matters most for workplace application.",
            color: "purple",
            gradient: "from-purple-500 to-pink-500",
        },
        {
            id: 3,
            icon: FileText,
            title: "Concise Lessons",
            description: "Get workplace-ready lessons (250-400 words) that distill complex materials into actionable insights employees can apply immediately.",
            color: "green",
            gradient: "from-green-500 to-emerald-500",
        },
        {
            id: 4,
            icon: Volume2,
            title: "Voice Narration",
            description: "Every lesson includes high-quality AI voice narration, perfect for learning on-the-go or accommodating different learning styles.",
            color: "orange",
            gradient: "from-orange-500 to-amber-500",
        },
        {
            id: 5,
            icon: Link2,
            title: "Source Citations",
            description: "Maintain credibility with automatic citations. Each lesson references the top 2-3 source snippets with line and paragraph references.",
            color: "pink",
            gradient: "from-pink-500 to-rose-500",
        },
        {
            id: 6,
            icon: Zap,
            title: "Instant Processing",
            description: "Transform documents into complete learning experiences in seconds. No waiting, no manual work—just upload and learn.",
            color: "indigo",
            gradient: "from-indigo-500 to-violet-500",
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-500",
            purple: "bg-purple-500",
            green: "bg-green-500",
            orange: "bg-orange-500",
            pink: "bg-pink-500",
            indigo: "bg-indigo-500",
        };
        return colors[color];
    };

    const getHoverColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: "group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30",
            purple: "group-hover:bg-purple-50 dark:group-hover:bg-purple-950/30",
            green: "group-hover:bg-green-50 dark:group-hover:bg-green-950/30",
            orange: "group-hover:bg-orange-50 dark:group-hover:bg-orange-950/30",
            pink: "group-hover:bg-pink-50 dark:group-hover:bg-pink-950/30",
            indigo: "group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30",
        };
        return colors[color];
    };

    const getShadowColor = (color: string) => {
        const shadows: Record<string, string> = {
            blue: "group-hover:shadow-blue-500/25",
            purple: "group-hover:shadow-purple-500/25",
            green: "group-hover:shadow-green-500/25",
            orange: "group-hover:shadow-orange-500/25",
            pink: "group-hover:shadow-pink-500/25",
            indigo: "group-hover:shadow-indigo-500/25",
        };
        return shadows[color];
    };

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

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.1,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <section
            ref={containerRef}
            id="features"
            className="relative py-12 sm:py-16 lg:py-28 xl:py-32 bg-white dark:bg-black overflow-hidden"
        >
            {/* Animated Background */}
            <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
                <div className="absolute top-0 left-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl" />
            </motion.div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8 xl:px-0">
                {/* Section Header */}
                <motion.div
                    ref={headerRef}
                    className="mx-auto text-center max-w-3xl mb-8 sm:mb-12 lg:mb-16 px-2"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.h2
                        className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4"
                        initial={{ opacity: 0, y: 30 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Everything You Need to{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                Transform Learning
                            </span>
                            <motion.span
                                className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 bg-purple-200 dark:bg-purple-900/50 -z-0"
                                initial={{ scaleX: 0 }}
                                animate={isHeaderInView ? { scaleX: 1 } : {}}
                                transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                style={{ originX: 0 }}
                            />
                        </span>
                    </motion.h2>
                    <motion.p
                        className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isHeaderInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Cognify combines cutting-edge AI with intuitive design to create
                        engaging, actionable learning experiences from any document.
                    </motion.p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 xl:gap-10"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.id}
                                custom={index}
                                variants={cardVariants}
                                className={`group relative rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 ${getHoverColorClasses(feature.color)} ${getShadowColor(feature.color)} overflow-hidden`}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                {/* Gradient Border on Hover */}
                                <motion.div
                                    className={`absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                                    style={{ padding: "2px" }}
                                    initial={false}
                                >
                                    <div className="absolute inset-[2px] rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900" />
                                </motion.div>

                                {/* Icon */}
                                <motion.div
                                    className={`relative flex h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 sm:mb-5 lg:mb-6 shadow-lg`}
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                                    {/* Glow effect */}
                                    <div className={`absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
                                </motion.div>

                                {/* Content */}
                                <h3 className="relative text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                                    {feature.title}
                                </h3>
                                <p className="relative text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Corner decoration */}
                                <motion.div
                                    className={`absolute -bottom-10 -right-10 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${feature.gradient} rounded-full opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-2xl transition-opacity duration-500`}
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    className="mt-10 sm:mt-12 lg:mt-16 text-center px-4"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                        Ready to revolutionize your team&apos;s learning?
                    </p>
                    <motion.button
                        className="relative px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 overflow-hidden group text-sm sm:text-base"
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
                </motion.div>
            </div>
        </section>
    );
};

export default Features;
