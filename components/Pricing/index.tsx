"use client";
import React, { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  popular?: boolean;
  gradient: string;
  icon: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Starter",
    price: 0,
    period: "forever",
    description: "Perfect for individuals exploring AI-powered learning",
    icon: "🚀",
    gradient: "from-blue-500 to-cyan-500",
    features: [
      { text: "10 documents per month", included: true },
      { text: "AI theme extraction", included: true },
      { text: "Basic lesson generation", included: true },
      { text: "Voice narration", included: true },
      { text: "PDF & TXT support", included: true },
      { text: "Priority support", included: false },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
    ]
  },
  {
    name: "Professional",
    price: 19,
    period: "month",
    description: "Ideal for professionals and small teams",
    icon: "⭐",
    gradient: "from-indigo-500 to-purple-500",
    popular: true,
    features: [
      { text: "100 documents per month", included: true },
      { text: "Advanced AI analysis", included: true },
      { text: "Premium lesson generation", included: true },
      { text: "High-quality voice narration", included: true },
      { text: "All file formats (PDF, DOCX, TXT)", included: true },
      { text: "Priority support", included: true },
      { text: "Custom branding", included: false },
      { text: "API access", included: false },
    ]
  },
  {
    name: "Enterprise",
    price: 49,
    period: "month",
    description: "For organizations scaling their learning programs",
    icon: "🏢",
    gradient: "from-purple-500 to-pink-500",
    features: [
      { text: "Unlimited documents", included: true },
      { text: "Advanced AI with custom models", included: true },
      { text: "White-label lesson generation", included: true },
      { text: "Premium voice with custom voices", included: true },
      { text: "All file formats + integrations", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Full custom branding", included: true },
      { text: "Full API access", included: true },
    ]
  }
];

const Pricing = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
  });

  const y1 = useTransform(smoothProgress, [0, 1], [100, -100]);
  const y2 = useTransform(smoothProgress, [0, 1], [-80, 80]);
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
      <section
          id="pricing"
          ref={containerRef}
          className="relative overflow-hidden py-20 md:py-32 lg:py-40"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />

        {/* Floating Orbs */}
        <motion.div
            style={{ y: y1, opacity }}
            className="absolute left-10 top-20 h-96 w-96 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl"
        />
        <motion.div
            style={{ y: y2, opacity }}
            className="absolute right-10 bottom-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-pink-400/20 to-orange-400/20 blur-3xl"
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
              Choose Your
              <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learning Journey
            </span>
            </h2>

            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-400">
              Start free, upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid gap-8 lg:grid-cols-3">
            {PRICING_PLANS.map((plan, index) => (
                <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                      duration: 0.7,
                      delay: index * 0.15,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    whileHover={{
                      y: -12,
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    onMouseEnter={() => setHoveredPlan(index)}
                    onMouseLeave={() => setHoveredPlan(null)}
                    className={`group relative ${plan.popular ? 'lg:-mt-4' : ''}`}
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                      <motion.div
                          initial={{ scale: 0, rotate: -12 }}
                          whileInView={{ scale: 1, rotate: -12 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + index * 0.15, type: "spring" }}
                          className="absolute -right-4 -top-4 z-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                      >
                        Most Popular
                      </motion.div>
                  )}

                  {/* Card */}
                  <div className={`relative h-full overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-500 dark:bg-gray-800 ${
                      plan.popular ? 'border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20' : ''
                  }`}>
                    {/* Animated Gradient Border */}
                    {hoveredPlan === index && (
                        <motion.div
                            className="absolute inset-0 rounded-3xl"
                            style={{
                              background: `linear-gradient(45deg, ${plan.gradient.split(' ')[0].replace('from-', '')}, ${plan.gradient.split(' ')[1].replace('to-', '')})`,
                              padding: '2px'
                            }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                          <div className="h-full w-full rounded-3xl bg-white dark:bg-gray-800" />
                        </motion.div>
                    )}

                    {/* Content */}
                    <div className={`relative z-10 p-8 ${plan.popular ? 'lg:p-10' : ''}`}>
                      {/* Icon */}
                      <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                          className="mb-6"
                      >
                        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${plan.gradient} text-3xl shadow-lg`}>
                          {plan.icon}
                        </div>
                      </motion.div>

                      {/* Plan Name */}
                      <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>

                      {/* Description */}
                      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                        {plan.description}
                      </p>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2">
                          <motion.span
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className={`text-5xl font-bold bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}
                          >
                            ${plan.price}
                          </motion.span>
                          <span className="text-gray-600 dark:text-gray-400">
                        /{plan.period}
                      </span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`mb-8 w-full rounded-xl py-4 font-semibold transition-all ${
                              plan.popular
                                  ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl`
                                  : 'border-2 border-gray-300 bg-white text-gray-900 hover:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                          }`}
                      >
                        {plan.price === 0 ? 'Start Free' : 'Get Started'}
                      </motion.button>

                      {/* Divider */}
                      <div className="mb-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-700" />

                      {/* Features */}
                      <ul className="space-y-4">
                        {plan.features.map((feature, featureIndex) => (
                            <motion.li
                                key={featureIndex}
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 + index * 0.1 + featureIndex * 0.05 }}
                                className="flex items-start gap-3"
                            >
                              <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                  feature.included
                                      ? `bg-gradient-to-br ${plan.gradient}`
                                      : 'bg-gray-200 dark:bg-gray-700'
                              }`}>
                                {feature.included ? (
                                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                              </div>
                              <span className={`text-sm ${
                                  feature.included
                                      ? 'text-gray-700 dark:text-gray-300'
                                      : 'text-gray-400 line-through dark:text-gray-600'
                              }`}>
                          {feature.text}
                        </span>
                            </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* Corner Glow */}
                    <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${plan.gradient} opacity-10 blur-3xl transition-transform duration-500 group-hover:scale-150`} />
                  </div>
                </motion.div>
            ))}
          </div>

          {/* Bottom Info */}
          <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="mt-16 text-center"
          >
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              All plans include 14-day money-back guarantee
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Upgrade or downgrade
              </div>
            </div>
          </motion.div>
        </div>
      </section>
  );
};

export default Pricing;