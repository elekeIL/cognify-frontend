"use client";
import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const CTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const y = useTransform(smoothProgress, [0, 1], [100, -100]);
  const rotateCard = useTransform(smoothProgress, [0, 0.5, 1], [-2, 0, 2]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
      <section
          ref={containerRef}
          className="relative overflow-hidden px-4 py-20 md:px-8 lg:py-25 xl:py-30 2xl:px-0"
      >
        {/* Animated Background Elements */}
        <motion.div
            style={{ y }}
            className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"
        />
        <motion.div
            style={{ y: useTransform(y, (v) => -v) }}
            className="absolute -right-20 bottom-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-c-1390">
          <motion.div
              style={{ rotateX: rotateCard, scale }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-[2px] shadow-2xl"
          >
            {/* Inner Card with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl dark:bg-gray-900/95">
              {/* Animated Gradient Overlay */}
              <motion.div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(99, 102, 241, 0.1), transparent 50%)",
                  }}
              />

              {/* Decorative Shapes */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-400/10 to-purple-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-pink-400/10 to-orange-400/10 blur-3xl" />

              {/* Content */}
              <div className="relative flex flex-wrap gap-8 px-7.5 py-12.5 md:flex-nowrap md:items-center md:justify-between md:gap-0 md:px-12.5 xl:px-17.5 xl:py-16">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="md:w-[60%] lg:w-[55%]"
                >
                  <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      ⚡
                    </motion.span>
                    Start Free Today
                  </motion.div>

                  <h2 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white lg:text-4xl xl:text-5xl">
                    Transform Documents Into
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Interactive Learning</span>
                  </h2>

                  <p className="mb-6 text-lg leading-relaxed text-gray-600 dark:text-gray-400">
                    Join thousands of professionals using Cognify to accelerate their learning.
                    Upload any document and get AI-powered lessons with voice narration in seconds.
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: "✓", text: "AI-Powered Analysis" },
                      { icon: "🎯", text: "Instant Lessons" },
                      { icon: "🎙️", text: "Voice Narration" },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.text}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        >
                          <span>{feature.icon}</span>
                          {feature.text}
                        </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Right Content - CTA */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="flex w-full items-center justify-center md:w-[40%] lg:w-[45%]"
                >
                  <div className="relative">
                    {/* Floating Icons Around Button */}
                    <motion.div
                        animate={{
                          y: [0, -10, 0],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-12 -top-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl shadow-lg"
                    >
                      📄
                    </motion.div>

                    <motion.div
                        animate={{
                          y: [0, 10, 0],
                          rotate: [0, -5, 0]
                        }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="absolute -right-12 -top-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-xl shadow-lg"
                    >
                      🧠
                    </motion.div>

                    <motion.div
                        animate={{
                          y: [0, -8, 0],
                          rotate: [0, 3, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-4 -left-8 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-lg shadow-lg"
                    >
                      🎯
                    </motion.div>

                    {/* Main CTA Button */}
                    <motion.a
                        href="/auth/signup"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="group/btn relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-indigo-500/50"
                    >
                      {/* Button Shine Effect */}
                      <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />

                      <span className="relative z-10">Start Learning Free</span>

                      <motion.svg
                          className="relative z-10 h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>

                      {/* Glow Effect on Hover */}
                      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 blur-xl transition-opacity duration-300 group-hover/btn:opacity-75" />
                    </motion.a>

                    {/* Trust Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span className="font-semibold">No credit card required</span> • Free forever plan
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-8 text-center"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="h-10 w-10 rounded-full border-2 border-white bg-gradient-to-br from-indigo-400 to-purple-400 dark:border-gray-900"
                    />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Join 10,000+ learners
            </span>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                  <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.9 + i * 0.1 }}
                      className="text-yellow-400"
                  >
                    ⭐
                  </motion.span>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              4.9/5 from 2,000+ reviews
            </span>
            </div>
          </motion.div>
        </div>
      </section>
  );
};

export default CTA;