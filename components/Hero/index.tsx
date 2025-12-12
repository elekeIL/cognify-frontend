"use client";
import { useState } from "react";
import { Upload, Sparkles, BookOpen } from "lucide-react";

const Hero = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email submitted:", email);
  };

  return (
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black py-20 md:py-32">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-8 2xl:px-0">
          <div className="flex flex-col lg:flex-row items-center gap-12 xl:gap-20">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Learning Platform
              </div>

              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Transform Documents into{" "}
                <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Actionable Lessons
                </span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-200 dark:bg-blue-900/50 -z-0" />
              </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Upload your training materials and let Cognify extract key themes,
                generate concise lessons, and create audio narration—all optimized
                for workplace learning.
              </p>

              <div className="mb-8">
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                  <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  <button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Free to try • No credit card required
              </p>

              {/* Features */}
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-2">
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Upload</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">PDF, TXT, DOCX</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-2">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Analyze</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Themes</p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg mb-2">
                    <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Learn</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Audio + Text</p>
                </div>
              </div>
            </div>

            {/* Right illustration */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-lg mx-auto">
                <div className="relative aspect-square w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl">
                  <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col justify-center items-center">
                    <div className="w-full space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                      <div className="mt-8 flex gap-2">
                        <div className="h-8 bg-blue-200 dark:bg-blue-800 rounded-full w-20" />
                        <div className="h-8 bg-purple-200 dark:bg-purple-800 rounded-full w-24" />
                        <div className="h-8 bg-pink-200 dark:bg-pink-800 rounded-full w-16" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-2xl shadow-lg animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-purple-500 rounded-2xl shadow-lg animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default Hero;