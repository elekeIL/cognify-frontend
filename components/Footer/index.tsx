"use client";
import { useState } from "react";
import { Brain, Mail, ArrowRight, Twitter, Linkedin, Github, Facebook } from "lucide-react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "Case Studies", href: "#case-studies" }
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Blog", href: "#blog" },
      { label: "Press Kit", href: "#press" }
    ],
    resources: [
      { label: "Documentation", href: "#docs" },
      { label: "API Reference", href: "#api" },
      { label: "Guides", href: "#guides" },
      { label: "Support", href: "#support" }
    ],
    legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
      { label: "Security", href: "#security" }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-600" },
    { icon: Github, href: "#", label: "GitHub", color: "hover:text-gray-900 dark:hover:text-white" },
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-500" }
  ];

  return (
      <footer className="relative border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
        {/* Decorative top border gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

        <div className="mx-auto max-w-7xl px-4 md:px-8 2xl:px-0">
          {/* Main Footer Content */}
          <div className="py-16 lg:py-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Brand Column */}
              <div className="lg:col-span-4">
                <a href="/" className="inline-flex items-center gap-2 mb-6 group">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Cognify
                </span>
                </a>

                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  Transform your training materials into engaging, AI-powered lessons.
                  Built for modern workplace learning.
                </p>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                    Contact
                  </p>
                  <a
                      href="mailto:hello@cognify.ai"
                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:gap-3 transition-all group"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">hello@cognify.ai</span>
                  </a>
                </div>

                {/* Social Links */}
                <div className="mt-8 flex items-center gap-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                        <a
                            key={social.label}
                            href={social.href}
                            aria-label={social.label}
                            className={`group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ${social.color} transition-all hover:scale-110`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {social.label}
                      </span>
                        </a>
                    );
                  })}
                </div>
              </div>

              {/* Links Columns */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {/* Product */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      Product
                    </h3>
                    <ul className="space-y-3">
                      {footerLinks.product.map((link) => (
                          <li key={link.label}>
                            <a
                                href={link.href}
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                            >
                              <span>{link.label}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </a>
                          </li>
                      ))}
                    </ul>
                  </div>

                  {/* Company */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      Company
                    </h3>
                    <ul className="space-y-3">
                      {footerLinks.company.map((link) => (
                          <li key={link.label}>
                            <a
                                href={link.href}
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                            >
                              <span>{link.label}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </a>
                          </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      Resources
                    </h3>
                    <ul className="space-y-3">
                      {footerLinks.resources.map((link) => (
                          <li key={link.label}>
                            <a
                                href={link.href}
                                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                            >
                              <span>{link.label}</span>
                              <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                            </a>
                          </li>
                      ))}
                    </ul>
                  </div>

                  {/* Newsletter */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                      Newsletter
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Get the latest updates and learning insights.
                    </p>

                    <div className="relative">
                      <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email"
                          className="w-full px-4 py-2.5 pr-12 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          disabled={subscribed}
                      />
                      <button
                          onClick={handleSubscribe}
                          disabled={subscribed}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                          aria-label="Subscribe to newsletter"
                      >
                        {subscribed ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </button>
                    </div>

                    {subscribed && (
                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                          ✓ Successfully subscribed!
                        </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Copyright */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Cognify. All rights reserved.
              </p>

              {/* Legal Links */}
              <div className="flex flex-wrap items-center justify-center gap-6">
                {footerLinks.legal.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                ))}
              </div>

              {/* Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                All systems operational
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
      </footer>
  );
};

export default Footer;