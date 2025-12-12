"use client";
import { Upload, Brain, FileCheck, Headphones, ArrowRight } from "lucide-react";

const About = () => {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Your Material",
      description: "Drop any PDF, TXT, or DOCX file containing your training content. Our system handles documents of any length and complexity.",
      color: "blue"
    },
    {
      number: "02",
      icon: Brain,
      title: "AI Extracts Key Themes",
      description: "Advanced AI analyzes your content and identifies 3-7 main themes, ensuring learners focus on the most important concepts.",
      color: "purple"
    },
    {
      number: "03",
      icon: FileCheck,
      title: "Generate Workplace Lessons",
      description: "Get concise, actionable lessons (250-400 words) tailored for employee upskilling with cited source references.",
      color: "green"
    },
    {
      number: "04",
      icon: Headphones,
      title: "Listen & Learn",
      description: "Every lesson includes professional AI voice narration. Learn on-the-go or accommodate different learning preferences.",
      color: "orange"
    }
  ];

  const benefits = [
    {
      title: "Save Time",
      description: "Transform hours of reading into minutes of focused learning"
    },
    {
      title: "Boost Retention",
      description: "Concise, themed lessons improve knowledge retention by 40%"
    },
    {
      title: "Flexible Learning",
      description: "Audio + text format accommodates all learning styles"
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      orange: "bg-orange-500"
    };
    return colors[color];
  };

  const getGradientClasses = (color: string) => {
    const gradients: Record<string, string> = {
      blue: "from-blue-500/20 to-transparent",
      purple: "from-purple-500/20 to-transparent",
      green: "from-green-500/20 to-transparent",
      orange: "from-orange-500/20 to-transparent"
    };
    return gradients[color];
  };

  return (
      <>
        {/* How It Works - Process Steps */}
        <section id="about" className="overflow-hidden pb-20 lg:pb-25 xl:pb-30 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-0 pt-20 lg:pt-25">
            {/* Section Header */}
            <div className="mx-auto text-center max-w-3xl mb-16">
              <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                From Document to Lesson in{" "}
                <span className="relative inline-block">
                <span className="relative z-10">Seconds</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-purple-200 dark:bg-purple-900/50 -z-0" />
              </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Our intelligent pipeline transforms complex documents into
                engaging, workplace-ready learning experiences.
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Connection Lines - Desktop Only */}
              <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 opacity-20" style={{ width: 'calc(100% - 8rem)', marginLeft: '4rem' }} />

              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                    <div key={index} className="relative">
                      {/* Step Card */}
                      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
                        {/* Number Badge */}
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white dark:text-gray-900">
                        {step.number}
                      </span>
                        </div>

                        {/* Icon with Gradient Background */}
                        <div className="relative mb-6">
                          <div className={`absolute inset-0 bg-gradient-to-br ${getGradientClasses(step.color)} rounded-xl blur-xl`} />
                          <div className={`relative flex h-16 w-16 items-center justify-center rounded-xl ${getColorClasses(step.color)} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Arrow - Mobile Only */}
                      {index < steps.length - 1 && (
                          <div className="flex justify-center my-4 lg:hidden">
                            <ArrowRight className="w-6 h-6 text-gray-400" />
                          </div>
                      )}
                    </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-white dark:bg-black py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8 xl:px-0">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
              {/* Left - Benefits List */}
              <div className="flex-1">
                <h4 className="font-medium uppercase text-blue-600 dark:text-blue-400 mb-2">
                  Why Cognify Works
                </h4>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Built for Modern{" "}
                  <span className="relative inline-block">
                  <span className="relative z-10">Workplace Learning</span>
                  <span className="absolute bottom-2 left-0 w-full h-3 bg-blue-200 dark:bg-blue-900/50 -z-0" />
                </span>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Traditional training materials are too long and unfocused.
                  Cognify distills the essential knowledge employees need to
                  perform better at work.
                </p>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                  ))}
                </div>

                <button className="mt-8 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:gap-4 transition-all duration-300 font-medium">
                  <span>See It In Action</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Right - Visual/Stats */}
              <div className="flex-1">
                <div className="relative">
                  {/* Main Card */}
                  <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8">
                      <div className="space-y-6">
                        {/* Mock Document Preview */}
                        <div className="space-y-3">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                        </div>

                        {/* Arrow */}
                        <div className="flex justify-center">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3">
                            <ArrowRight className="w-6 h-6 text-white" />
                          </div>
                        </div>

                        {/* Mock Theme Tags */}
                        <div className="flex flex-wrap gap-2">
                          <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
                            Leadership
                          </div>
                          <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                            Communication
                          </div>
                          <div className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm">
                            Strategy
                          </div>
                        </div>

                        {/* Mock Audio Player */}
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Headphones className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Stats */}
                  <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        &lt;30s
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Processing Time
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
  );
};

export default About;