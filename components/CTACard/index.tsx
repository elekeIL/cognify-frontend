"use client";

import React from "react";
import { Upload, FileText, Brain, Volume2, ArrowRight, Sparkles } from "lucide-react";

export function UploadCTA() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 shadow-xl border border-white/10">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNFY0aC00ek02IDM0di00SDR2NGgwdjJoNHY0aDJ2LTRoNHYtMkg2ek02IDRWMEg0djRIMHYyaDR2NGgyVjZoNFY0SDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    {/* Left Content */}
                    <div className="flex-1 space-y-4">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
                            <Sparkles className="h-4 w-4 text-yellow-300" />
                            <span className="text-sm font-semibold text-white">
                                Quick Start
                            </span>
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                Transform Your Next Document
                            </h2>
                            <p className="text-base text-white/80 max-w-xl">
                                Upload any PDF, DOCX, or TXT file and let AI extract key themes, generate lessons, and create voice narration—all in seconds.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                                    <FileText className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">
                                    Multi-format
                                </span>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                                    <Brain className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">
                                    AI Powered
                                </span>
                            </div>

                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                                    <Volume2 className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">
                                    Voice Ready
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right CTA */}
                    <div className="flex-shrink-0 w-full lg:w-auto">
                        <a href="/upload">
                            <button className="group relative w-full lg:w-auto overflow-hidden rounded-xl bg-white px-8 py-4 font-semibold text-purple-600 shadow-2xl transition-all hover:shadow-white/20 hover:scale-105 active:scale-95">
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-100 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                <div className="relative flex items-center justify-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    <span>Upload Document</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                        </a>

                        {/* Quota Info */}
                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-white/70">
                            <div className="flex items-center gap-1.5">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                                    <span className="text-xs font-semibold text-white">7</span>
                                </div>
                                <span>uploads remaining this month</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Progress Bar (Optional) */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                        <span>Monthly quota</span>
                        <span className="font-medium text-white/90">17/25 used</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: '68%' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}