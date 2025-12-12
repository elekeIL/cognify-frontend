"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import FAQItem from "./FAQItem";
import faqData from "@/components/FAQ/faqData";

// Animation variants with parallax-style effects
const fadeInLeft = {
  hidden: { opacity: 0, x: -50, y: 20 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    }
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50, y: 20 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      delay: 0.2,
    }
  },
};

const FAQ = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(1);

  const handleFaqToggle = (id: number) => {
    setActiveFaq((prev) => (prev === id ? null : id));
  };

  return (
      <section
          className="relative overflow-hidden pb-20 lg:pb-25 xl:pb-30 bg-gradient-to-b from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20"
          aria-labelledby="faq-heading"
      >
        {/* Animated gradient orbs */}
        <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
        />
        <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
        />

        <div className="relative mx-auto max-w-c-1235 px-4 md:px-8 xl:px-0">
          {/* Background decoration */}
          <motion.div
              className="absolute -bottom-16 -z-1 h-full w-full"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              viewport={{ once: true }}
              aria-hidden="true"
          >
            <Image
                fill
                src="/images/shape/shape-dotted-light.svg"
                alt=""
                className="dark:hidden opacity-40"
            />
            <Image
                fill
                src="/images/shape/shape-dotted-light.svg"
                alt=""
                className="hidden dark:block opacity-20"
            />
          </motion.div>

          <div className="flex flex-wrap gap-8 md:flex-nowrap md:items-center xl:gap-32.5">
            {/* Left section - Header */}
            <motion.div
                variants={fadeInLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="animate_left md:w-2/5 lg:w-1/2"
            >
            <span className="font-medium uppercase text-purple-600 dark:text-purple-400">
              YOUR QUESTIONS ANSWERED
            </span>
              <h2
                  id="faq-heading"
                  className="relative mb-6 text-3xl font-bold text-gray-900 dark:text-white xl:text-hero"
              >
                Learn More About{" "}
                <span className="relative inline-block before:absolute before:bottom-2.5 before:left-0 before:-z-1 before:h-3 before:w-full before:bg-gradient-to-r before:from-purple-200 before:to-blue-200 dark:before:from-purple-900/50 dark:before:to-blue-900/50">
                Cognify
              </span>
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Transform your learning materials into intelligent, bite-sized lessons powered by AI.
                Get your questions answered below.
              </p>

              <a
                  href="#"
                  className="group mt-7.5 inline-flex items-center gap-2.5 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                <span className="duration-300 group-hover:pr-2">Explore Features</span>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                >
                  <path
                      d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z"
                      fill="currentColor"
                  />
                </svg>
              </a>
            </motion.div>

            {/* Right section - FAQ list */}
            <motion.div
                variants={fadeInRight}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="animate_right md:w-3/5 lg:w-1/2"
            >
              <motion.div
                  className="rounded-2xl bg-white shadow-xl shadow-purple-100/50 dark:border dark:border-purple-900/30 dark:bg-gray-800/50 dark:shadow-purple-900/20 backdrop-blur-sm overflow-hidden"
                  whileHover={{
                    boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.15)",
                  }}
                  transition={{ duration: 0.3 }}
              >
                {faqData.map((faq, index) => (
                    <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                        }}
                        viewport={{ once: true, amount: 0.8 }}
                    >
                      <FAQItem
                          faqData={{ ...faq, activeFaq, handleFaqToggle }}
                      />
                    </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
  );
};

export default FAQ;