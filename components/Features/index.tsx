"use client";
import { Upload, Brain, FileText, Volume2, Link2, Zap } from "lucide-react";

const Features = () => {
    const features = [
        {
            id: 1,
            icon: Upload,
            title: "Multi-Format Upload",
            description: "Upload PDF, TXT, or DOCX files seamlessly. Our intelligent parser handles various document structures and extracts content accurately.",
            color: "blue"
        },
        {
            id: 2,
            icon: Brain,
            title: "AI Theme Extraction",
            description: "Advanced AI analyzes your content and identifies 3-7 key themes, ensuring learners focus on what matters most for workplace application.",
            color: "purple"
        },
        {
            id: 3,
            icon: FileText,
            title: "Concise Lessons",
            description: "Get workplace-ready lessons (250-400 words) that distill complex materials into actionable insights employees can apply immediately.",
            color: "green"
        },
        {
            id: 4,
            icon: Volume2,
            title: "Voice Narration",
            description: "Every lesson includes high-quality AI voice narration, perfect for learning on-the-go or accommodating different learning styles.",
            color: "orange"
        },
        {
            id: 5,
            icon: Link2,
            title: "Source Citations",
            description: "Maintain credibility with automatic citations. Each lesson references the top 2-3 source snippets with line and paragraph references.",
            color: "pink"
        },
        {
            id: 6,
            icon: Zap,
            title: "Instant Processing",
            description: "Transform documents into complete learning experiences in seconds. No waiting, no manual work—just upload and learn.",
            color: "indigo"
        }
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-500",
            purple: "bg-purple-500",
            green: "bg-green-500",
            orange: "bg-orange-500",
            pink: "bg-pink-500",
            indigo: "bg-indigo-500"
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
            indigo: "group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30"
        };
        return colors[color];
    };

    return (
        <section id="features" className="py-20 lg:py-28 xl:py-32 bg-white dark:bg-black">
            <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-0">
                {/* Section Header */}
                <div className="mx-auto text-center max-w-3xl mb-16">

                    <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Everything You Need to Transform Learning
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Cognify combines cutting-edge AI with intuitive design to create
                        engaging, actionable learning experiences from any document.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.id}
                                className={`group relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm hover:shadow-xl transition-all duration-300 ${getHoverColorClasses(feature.color)}`}
                            >
                                {/* Icon */}
                                <div className={`relative flex h-14 w-14 items-center justify-center rounded-xl ${getColorClasses(feature.color)} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover gradient effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-transparent group-hover:from-white/5 group-hover:to-transparent pointer-events-none transition-all duration-300" />
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Ready to revolutionize your team's learning?
                    </p>
                    <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200">
                        Get Started
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Features;