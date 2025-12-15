"use client";
import { useRef } from "react";
import { Upload, Brain, FileCheck, Headphones, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useInView, Variants } from "framer-motion";

const About = () => {
    const containerRef = useRef<HTMLElement>(null);
    const headerRef = useRef(null);
    const benefitsRef = useRef(null);
    const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });
    const isBenefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "30%"]);
    const cardY = useTransform(smoothProgress, [0, 1], ["20%", "-20%"]);

    const steps = [
        {
            number: "01",
            icon: Upload,
            title: "Upload Your Material",
            description: "Drop any PDF, TXT, or DOCX file containing your training content. Our system handles documents of any length and complexity.",
            color: "blue",
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            number: "02",
            icon: Brain,
            title: "AI Extracts Key Themes",
            description: "Advanced AI analyzes your content and identifies 3-7 main themes, ensuring learners focus on the most important concepts.",
            color: "purple",
            gradient: "from-purple-500 to-pink-500",
        },
        {
            number: "03",
            icon: FileCheck,
            title: "Generate Workplace Lessons",
            description: "Get concise, actionable lessons (250-400 words) tailored for employee upskilling with cited source references.",
            color: "green",
            gradient: "from-green-500 to-emerald-500",
        },
        {
            number: "04",
            icon: Headphones,
            title: "Listen & Learn",
            description: "Every lesson includes professional AI voice narration. Learn on-the-go or accommodate different learning preferences.",
            color: "orange",
            gradient: "from-orange-500 to-amber-500",
        },
    ];

    const benefits = [
        {
            title: "Save Time",
            description: "Transform hours of reading into minutes of focused learning",
        },
        {
            title: "Boost Retention",
            description: "Concise, themed lessons improve knowledge retention by 40%",
        },
        {
            title: "Flexible Learning",
            description: "Audio + text format accommodates all learning styles",
        },
    ];

    const stepVariants: Variants = {
        hidden: { opacity: 0, y: 50, scale: 0.9 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: i * 0.15,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    const benefitVariants: Variants = {
        hidden: { opacity: 0, x: -30 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <>
            {/* How It Works - Process Steps */}
            <section
                ref={containerRef}
                id="about"
                className="relative overflow-hidden pb-12 sm:pb-16 lg:pb-25 xl:pb-30 bg-gray-50 dark:bg-gray-900/50"
            >
                {/* Animated Background */}
                <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
                    <div className="absolute top-1/4 -left-16 sm:-left-32 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-blue-200/40 dark:bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-16 sm:-right-32 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-200/40 dark:bg-purple-500/10 rounded-full blur-3xl" />
                </motion.div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8 xl:px-0 pt-12 sm:pt-16 lg:pt-25">
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
                            From Document to Lesson in{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                    Seconds
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
                            Our intelligent pipeline transforms complex documents into
                            engaging, workplace-ready learning experiences.
                        </motion.p>
                    </motion.div>

                    {/* Process Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 relative">
                        {/* Connection Lines - Desktop Only */}
                        <motion.div
                            className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 overflow-hidden"
                            style={{ width: "calc(100% - 8rem)", marginLeft: "4rem" }}
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 opacity-30" />
                        </motion.div>

                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={index}
                                    className="relative pt-3 sm:pt-4"
                                    custom={index}
                                    variants={stepVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-50px" }}
                                >
                                    {/* Number Badge - Outside the card for visibility */}
                                    <motion.div
                                        className="absolute top-0 right-2 z-10 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-white dark:to-gray-100 rounded-full flex items-center justify-center shadow-lg"
                                        initial={{ scale: 0, rotate: -180 }}
                                        whileInView={{ scale: 1, rotate: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                                    >
                                        <span className="text-xs sm:text-sm font-bold text-white dark:text-gray-900">
                                            {step.number}
                                        </span>
                                    </motion.div>

                                    {/* Step Card */}
                                    <motion.div
                                        className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden"
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >

                                        {/* Icon with Gradient Background */}
                                        <div className="relative mb-4 sm:mb-5 lg:mb-6">
                                            <motion.div
                                                className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-lg sm:rounded-xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`}
                                            />
                                            <motion.div
                                                className={`relative flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            >
                                                <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                                            </motion.div>
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Hover gradient decoration */}
                                        <motion.div
                                            className={`absolute -bottom-16 -right-16 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br ${step.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}
                                        />
                                    </motion.div>

                                    {/* Arrow - Mobile Only (single column) */}
                                    {index < steps.length - 1 && (
                                        <motion.div
                                            className="flex justify-center my-3 sm:hidden"
                                            initial={{ opacity: 0, y: -10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                        >
                                            <motion.div
                                                animate={{ y: [0, 5, 0] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative bg-white dark:bg-black py-12 sm:py-16 lg:py-20 overflow-hidden">
                {/* Animated Background */}
                <motion.div className="absolute inset-0" style={{ y: cardY }}>
                    <div className="absolute top-0 right-1/4 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] bg-blue-100/50 dark:bg-blue-500/5 rounded-full blur-3xl" />
                </motion.div>

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-8 xl:px-0">
                    <motion.div
                        ref={benefitsRef}
                        className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-20"
                    >
                        {/* Left - Benefits List */}
                        <motion.div
                            className="flex-1 text-center lg:text-left"
                            initial={{ opacity: 0, x: -50 }}
                            animate={isBenefitsInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <motion.h4
                                className="font-medium uppercase text-xs sm:text-sm text-blue-600 dark:text-blue-400 mb-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Why Cognify Works
                            </motion.h4>
                            <motion.h2
                                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Built for Modern{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                                        Workplace Learning
                                    </span>
                                    <motion.span
                                        className="absolute bottom-1 sm:bottom-2 left-0 w-full h-2 sm:h-3 bg-blue-200 dark:bg-blue-900/50 -z-0"
                                        initial={{ scaleX: 0 }}
                                        animate={isBenefitsInView ? { scaleX: 1 } : {}}
                                        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                        style={{ originX: 0 }}
                                    />
                                </span>
                            </motion.h2>
                            <motion.p
                                className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 sm:mb-8"
                                initial={{ opacity: 0, y: 20 }}
                                animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            >
                                Traditional training materials are too long and unfocused.
                                Cognify distills the essential knowledge employees need to
                                perform better at work.
                            </motion.p>

                            <div className="space-y-4 sm:space-y-6">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        custom={index}
                                        variants={benefitVariants}
                                        initial="hidden"
                                        animate={isBenefitsInView ? "visible" : "hidden"}
                                        className="flex items-start gap-3 sm:gap-4 group text-left"
                                        whileHover={{ x: 10 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    >
                                        <motion.div
                                            className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            <span className="text-white font-bold text-sm sm:text-base">{index + 1}</span>
                                        </motion.div>
                                        <div>
                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-0.5 sm:mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {benefit.title}
                                            </h3>
                                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                                {benefit.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <motion.button
                                className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group text-sm sm:text-base"
                                whileHover={{ x: 5 }}
                                initial={{ opacity: 0 }}
                                animate={isBenefitsInView ? { opacity: 1 } : {}}
                                transition={{ duration: 0.6, delay: 0.6 }}
                            >
                                <span>See It In Action</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.div>
                            </motion.button>
                        </motion.div>

                        {/* Right - Visual/Stats */}
                        <motion.div
                            className="flex-1 w-full max-w-md lg:max-w-none mx-auto"
                            initial={{ opacity: 0, x: 50 }}
                            animate={isBenefitsInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="relative">
                                {/* Main Card */}
                                <motion.div
                                    className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl"
                                    whileHover={{ rotateY: 5, rotateX: -5 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                                >
                                    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8">
                                        <div className="space-y-4 sm:space-y-6">
                                            {/* Mock Document Preview */}
                                            <div className="space-y-2 sm:space-y-3">
                                                {[1, 0.83, 0.66].map((width, i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded"
                                                        style={{ width: `${width * 100}%` }}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={isBenefitsInView ? { opacity: 1, x: 0 } : {}}
                                                        transition={{ delay: 0.4 + i * 0.1 }}
                                                    />
                                                ))}
                                            </div>

                                            {/* Arrow */}
                                            <motion.div
                                                className="flex justify-center"
                                                initial={{ scale: 0 }}
                                                animate={isBenefitsInView ? { scale: 1 } : {}}
                                                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                                            >
                                                <motion.div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2 sm:p-3"
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                >
                                                    <ArrowRight className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                                </motion.div>
                                            </motion.div>

                                            {/* Mock Theme Tags */}
                                            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                                                {[
                                                    { label: "Leadership", color: "blue" },
                                                    { label: "Communication", color: "purple" },
                                                    { label: "Strategy", color: "pink" },
                                                ].map((tag, i) => (
                                                    <motion.div
                                                        key={tag.label}
                                                        className={`px-2 sm:px-3 py-0.5 sm:py-1 bg-${tag.color}-100 dark:bg-${tag.color}-900/30 text-${tag.color}-700 dark:text-${tag.color}-300 rounded-full text-xs sm:text-sm`}
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={isBenefitsInView ? { opacity: 1, scale: 1 } : {}}
                                                        transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200 }}
                                                        whileHover={{ scale: 1.1 }}
                                                    >
                                                        {tag.label}
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Mock Audio Player */}
                                            <motion.div
                                                className="bg-gray-100 dark:bg-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={isBenefitsInView ? { opacity: 1, y: 0 } : {}}
                                                transition={{ delay: 1 }}
                                            >
                                                <motion.div
                                                    className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Headphones className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </motion.div>
                                                <div className="flex-1">
                                                    <div className="h-1.5 sm:h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                                                        <motion.div
                                                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                            initial={{ width: "0%" }}
                                                            animate={isBenefitsInView ? { width: "33%" } : {}}
                                                            transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Floating Stats */}
                                <motion.div
                                    className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700"
                                    initial={{ opacity: 0, scale: 0, rotate: 15 }}
                                    animate={isBenefitsInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                                    whileHover={{ scale: 1.05, rotate: -5 }}
                                >
                                    <div className="text-center">
                                        <motion.div
                                            className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white"
                                            initial={{ opacity: 0 }}
                                            animate={isBenefitsInView ? { opacity: 1 } : {}}
                                            transition={{ delay: 1 }}
                                        >
                                            &lt;30s
                                        </motion.div>
                                        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                                            Processing Time
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default About;
