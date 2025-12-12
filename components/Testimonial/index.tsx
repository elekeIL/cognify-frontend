"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useAnimation } from "framer-motion";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    content: string;
    rating: number;
    avatar: string;
    gradient: string;
}

const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: "Sarah Johnson",
        role: "L&D Manager",
        company: "TechCorp",
        content: "Cognify transformed our training. We create comprehensive lessons in minutes instead of weeks. The AI insights are incredibly accurate.",
        rating: 5,
        avatar: "SJ",
        gradient: "from-indigo-500 to-purple-500"
    },
    {
        id: 2,
        name: "Michael Chen",
        role: "HR Director",
        company: "InnovateLabs",
        content: "Voice narration changed everything. Our employees learn on-the-go and engagement increased by 85%.",
        rating: 5,
        avatar: "MC",
        gradient: "from-purple-500 to-pink-500"
    },
    {
        id: 3,
        name: "Emily Rodriguez",
        role: "Training Lead",
        company: "Global Solutions",
        content: "Upload any document and Cognify extracts key themes perfectly. Like having an AI learning designer 24/7.",
        rating: 5,
        avatar: "ER",
        gradient: "from-pink-500 to-orange-500"
    },
    {
        id: 4,
        name: "David Park",
        role: "Operations Manager",
        company: "StartupHub",
        content: "What took 2-3 days now happens in 5 minutes. Cognify saved us countless hours and made upskilling seamless.",
        rating: 5,
        avatar: "DP",
        gradient: "from-orange-500 to-red-500"
    },
    {
        id: 5,
        name: "Lisa Thompson",
        role: "Chief Learning Officer",
        company: "Enterprise Co.",
        content: "Finally understands workplace learning. Lessons are concise, practical, and applicable. Employees enjoy learning now.",
        rating: 5,
        avatar: "LT",
        gradient: "from-cyan-500 to-blue-500"
    },
    {
        id: 6,
        name: "James Wilson",
        role: "Product Manager",
        company: "DevTools Pro",
        content: "Source citations are outstanding. Gives our team confidence the material is grounded in real documentation.",
        rating: 5,
        avatar: "JW",
        gradient: "from-blue-500 to-indigo-500"
    }
];

const Testimonial = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
    });

    const y1 = useTransform(smoothProgress, [0, 1], [100, -100]);
    const y2 = useTransform(smoothProgress, [0, 1], [-50, 50]);
    const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                });
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative overflow-hidden py-24 md:py-32 lg:py-40"
        >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950" />

            {/* Mouse-following gradient */}
            <motion.div
                className="pointer-events-none absolute inset-0 opacity-30"
                animate={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`
                }}
                transition={{ type: "tween", ease: "linear", duration: 0.2 }}
            />

            {/* Floating Orbs */}
            <motion.div
                style={{ y: y1, opacity }}
                className="absolute left-10 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"
            />
            <motion.div
                style={{ y: y2, opacity }}
                className="absolute right-10 bottom-32 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl"
            />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto mb-20 max-w-3xl text-center"
                >

                    <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                        Loved by Teams
                        <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Around the World
            </span>
                    </h2>

                    <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                        See how companies are transforming their learning programs with Cognify
                    </p>
                </motion.div>

                {/* Testimonials Grid with Stagger */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {TESTIMONIALS.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                duration: 0.7,
                                delay: index * 0.15,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            whileHover={{
                                y: -12,
                                transition: { duration: 0.3 }
                            }}
                            className="group relative"
                        >
                            {/* Card */}
                            <div className="relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-xl transition-all duration-500 hover:shadow-2xl dark:bg-gray-800/90 dark:backdrop-blur-sm">
                                {/* Animated gradient border */}
                                <motion.div
                                    className="absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                    style={{
                                        background: "linear-gradient(45deg, #6366f1, #a855f7, #ec4899, #f97316)",
                                        backgroundSize: "300% 300%",
                                        padding: "2px"
                                    }}
                                    animate={{
                                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear"
                                    }}
                                >
                                    <div className="h-full w-full rounded-3xl bg-white dark:bg-gray-800" />
                                </motion.div>

                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Quote Icon */}
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        whileInView={{ scale: 1, rotate: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                                        className="mb-4"
                                    >
                                        <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${testimonial.gradient} shadow-lg`}>
                                            <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                            </svg>
                                        </div>
                                    </motion.div>

                                    {/* Stars */}
                                    <div className="mb-4 flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{
                                                    delay: 0.4 + index * 0.1 + i * 0.05,
                                                    type: "spring",
                                                    stiffness: 200
                                                }}
                                                className="text-lg text-yellow-400"
                                            >
                                                ★
                                            </motion.span>
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <p className="mb-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                                        "{testimonial.content}"
                                    </p>

                                    {/* Divider */}
                                    <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-sm font-bold text-white shadow-lg`}
                                        >
                                            {testimonial.avatar}
                                        </motion.div>
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {testimonial.name}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {testimonial.role}
                                            </p>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                                {testimonial.company}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Corner glow */}
                                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl transition-transform duration-500 group-hover:scale-150" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="mt-20 grid gap-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-center shadow-2xl md:grid-cols-3"
                >
                    {[
                        { value: "10,000+", label: "Active Learners", icon: "👥" },
                        { value: "4.9/5", label: "Average Rating", icon: "⭐" },
                        { value: "500K+", label: "Lessons Created", icon: "📚" }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{
                                delay: 1 + index * 0.1,
                                type: "spring",
                                stiffness: 100
                            }}
                            whileHover={{ scale: 1.05 }}
                        >
                            <motion.div
                                className="mb-2 text-4xl"
                                animate={{ y: [0, -10, 0] }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: index * 0.2
                                }}
                            >
                                {stat.icon}
                            </motion.div>
                            <div className="mb-2 text-4xl font-bold text-white md:text-5xl">
                                {stat.value}
                            </div>
                            <p className="text-sm font-medium text-indigo-100">
                                {stat.label}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default Testimonial;