"use client";
import { CheckCircle, Users, FileText, Zap } from "lucide-react";

const TrustSection = () => {
    const stats = [
        {
            id: 1,
            icon: FileText,
            value: "10K+",
            label: "Documents Processed",
            color: "blue"
        },
        {
            id: 2,
            icon: Users,
            value: "500+",
            label: "Active Learners",
            color: "purple"
        },
        {
            id: 3,
            icon: Zap,
            value: "50K+",
            label: "Lessons Generated",
            color: "green"
        },
        {
            id: 4,
            icon: CheckCircle,
            value: "98%",
            label: "Accuracy Rate",
            color: "pink"
        }
    ];

    const features = [
        "AI-powered theme extraction",
        "Voice narration included",
        "Source citation tracking",
        "Workplace-focused content",
        "Multi-format support",
        "Instant lesson generation"
    ];

    const getColorClasses = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
            purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
            green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
            pink: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
        };
        return colors[color];
    };

    return (
        <section id="how-it-works" className="border-t border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-16">
            <div className="mx-auto max-w-7xl px-4 md:px-8 2xl:px-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={stat.id}
                                className="text-center group hover:scale-105 transition-transform duration-300"
                            >
                                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-3 ${getColorClasses(stat.color)}`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Features List */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Everything you need to accelerate learning
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature}
                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Trusted by professionals at leading organizations
                    </p>
                </div>
            </div>
        </section>
    );
};

export default TrustSection;