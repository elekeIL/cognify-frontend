"use client";
import { useState, useEffect } from "react";
import { Upload, Brain, FileText, Volume2, CheckCircle, Sparkles } from "lucide-react";

const FeatureTab = () => {
  const [currentTab, setCurrentTab] = useState("upload");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tabs = [
    {
      id: "upload",
      icon: Upload,
      label: "Smart Upload",
      title: "Intelligent Document Processing",
      description: "Upload PDF, TXT, or DOCX files with confidence. Our advanced parser handles complex document structures, preserves formatting, and extracts content with high accuracy.",
      features: [
        "Supports multiple file formats",
        "Handles documents up to 100MB",
        "Preserves document structure",
        "Instant validation and preview"
      ],
      color: "blue",
      mockup: "upload"
    },
    {
      id: "analysis",
      icon: Brain,
      label: "AI Analysis",
      title: "Deep Content Understanding",
      description: "Our AI doesn't just scan—it understands. Using advanced natural language processing, we identify the core themes that matter most for workplace application.",
      features: [
        "Extracts 3-7 key themes automatically",
        "Context-aware analysis",
        "Industry-specific insights",
        "Confidence scoring per theme"
      ],
      color: "purple",
      mockup: "analysis"
    },
    {
      id: "lesson",
      icon: FileText,
      label: "Smart Lessons",
      title: "Workplace-Ready Content",
      description: "Every lesson is crafted for busy professionals. Concise, actionable, and focused on real-world application—no fluff, just what matters.",
      features: [
        "250-400 word optimized lessons",
        "Action-oriented language",
        "Source citations included",
        "Apply-at-work focus"
      ],
      color: "green",
      mockup: "lesson"
    },
    {
      id: "audio",
      icon: Volume2,
      label: "Voice Narration",
      title: "Learn While You Move",
      description: "High-quality AI voice narration transforms every lesson into a podcast-style learning experience. Perfect for commutes, workouts, or multitasking.",
      features: [
        "Natural-sounding voices",
        "Adjustable playback speed",
        "Download for offline learning",
        "Multiple voice options"
      ],
      color: "orange",
      mockup: "audio"
    }
  ];

  const currentTabData = tabs.find(tab => tab.id === currentTab);

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; gradient: string; light: string; text: string }> = {
      blue: {
        bg: "bg-blue-500",
        gradient: "from-blue-500 to-blue-600",
        light: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-600 dark:text-blue-400"
      },
      purple: {
        bg: "bg-purple-500",
        gradient: "from-purple-500 to-purple-600",
        light: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-600 dark:text-purple-400"
      },
      green: {
        bg: "bg-green-500",
        gradient: "from-green-500 to-green-600",
        light: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-600 dark:text-green-400"
      },
      orange: {
        bg: "bg-orange-500",
        gradient: "from-orange-500 to-orange-600",
        light: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-600 dark:text-orange-400"
      }
    };
    return colors[color];
  };

  const renderMockup = (type: string, color: string) => {
    const colors = getColorClasses(color);

    switch(type) {
      case "upload":
        return (
            <div className="relative">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 text-center bg-gray-50 dark:bg-gray-800/50">
                <Upload className={`w-16 h-16 mx-auto mb-4 ${colors.text}`} />
                <p className="text-gray-600 dark:text-gray-400 mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">PDF, TXT, DOCX • Max 100MB</p>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Ready to process</span>
                </div>
              </div>
            </div>
        );

      case "analysis":
        return (
            <div className="space-y-4">
              <div className={`${colors.light} rounded-xl p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className={`w-5 h-5 ${colors.text}`} />
                  <span className="font-medium text-gray-900 dark:text-white">Analyzing content...</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse`} style={{width: '75%'}} />
                </div>
              </div>
              <div className="space-y-2">
                {["Leadership Skills", "Team Communication", "Strategic Planning"].map((theme, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{theme}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${colors.light} ${colors.text}`}>
                      {95 - i * 5}%
                    </span>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        );

      case "lesson":
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Key Takeaways</h4>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                <span className={`px-3 py-1 rounded-full text-xs ${colors.light} ${colors.text}`}>
                  Leadership
                </span>
                  <span className={`px-3 py-1 rounded-full text-xs ${colors.light} ${colors.text}`}>
                  Strategy
                </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Sources cited • 3 references
                  </p>
                </div>
              </div>
            </div>
        );

      case "audio":
        return (
            <div className="space-y-4">
              <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl p-6 text-white shadow-xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold mb-1">Leadership Essentials</h4>
                    <p className="text-sm opacity-90">Lesson Audio • 2:45</p>
                  </div>
                  <Volume2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-white rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs opacity-75">
                    <span>0:55</span>
                    <span>2:45</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["0.5x", "1.0x", "1.5x"].map((speed, i) => (
                    <button key={i} className={`py-2 rounded-lg text-sm font-medium ${i === 1 ? `${colors.light} ${colors.text}` : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                      {speed}
                    </button>
                ))}
              </div>
            </div>
        );

      default:
        return null;
    }
  };

  return (
      <section id="features" className="relative py-20 lg:py-28 overflow-hidden bg-white dark:bg-black">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          />
          <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              style={{ transform: `translateY(${-scrollY * 0.15}px)` }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-8 2xl:px-0">
          {/* Section Header */}
          <div className="mx-auto text-center max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Experience the Power of{" "}
              <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-Driven Learning
              </span>
            </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Explore how Cognify transforms your documents into engaging learning experiences
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-12 flex flex-wrap justify-center gap-4 bg-gray-100 dark:bg-gray-900 rounded-2xl p-2 shadow-inner max-w-4xl mx-auto">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const colors = getColorClasses(tab.color);
              const isActive = currentTab === tab.id;

              return (
                  <button
                      key={tab.id}
                      onClick={() => setCurrentTab(tab.id)}
                      className={`
                  relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300
                  ${isActive
                          ? `bg-white dark:bg-gray-800 shadow-lg scale-105 ${colors.text}`
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }
                `}
                      style={{
                        transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                      }}
                  >
                    <div className={`
                  flex h-10 w-10 items-center justify-center rounded-lg transition-all
                  ${isActive ? `${colors.bg} text-white` : 'bg-gray-200 dark:bg-gray-700'}
                `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium hidden sm:block">{tab.label}</span>
                    {isActive && (
                        <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 ${colors.bg} rounded-full`} />
                    )}
                  </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Description */}
              <div
                  className="space-y-6"
                  style={{
                    opacity: 1,
                    transform: `translateX(0)`,
                  }}
              >
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {currentTabData?.title}
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {currentTabData?.description}
                  </p>
                </div>

                <div className="space-y-3">
                  {currentTabData?.features.map((feature, index) => (
                      <div
                          key={index}
                          className="flex items-start gap-3 group"
                          style={{
                            opacity: 1,
                            transform: 'translateX(0)',
                            transition: `all 0.3s ease ${index * 0.1}s`
                          }}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full ${getColorClasses(currentTabData.color).light} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <CheckCircle className={`w-4 h-4 ${getColorClasses(currentTabData.color).text}`} />
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                  ))}
                </div>
              </div>

              {/* Right: Mockup */}
              <div
                  className="relative"
                  style={{
                    opacity: 1,
                    transform: `translateY(${Math.sin(scrollY * 0.005) * 10}px)`,
                    transition: 'transform 0.1s ease-out'
                  }}
              >
                <div className="relative z-10">
                  {renderMockup(currentTabData?.mockup, currentTabData?.color)}
                </div>

                {/* Decorative elements */}
                <div
                    className={`absolute -z-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br ${getColorClasses(currentTabData?.color).gradient} opacity-10 blur-3xl rounded-full`}
                    style={{
                      transform: `translate(-50%, -50%) scale(${1 + Math.sin(scrollY * 0.01) * 0.1})`,
                    }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};

export default FeatureTab;