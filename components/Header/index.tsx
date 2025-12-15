"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Brain, Menu, X, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);

  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pathUrl = usePathname();
  const isLanding = pathUrl === "/";

  const handleStickyMenu = () => {
    setStickyMenu(window.scrollY >= 80);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const menuItems = [
    { title: "Features", path: "#features" },
    { title: "How It Works", path: "#how-it-works" },
    { title: "Pricing", path: "#pricing" },
    { title: "About", path: "#about" },
  ];

  return (
      <header
          className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
              stickyMenu
                  ? "bg-white/95 dark:bg-black/95 backdrop-blur-lg shadow-lg py-4"
                  : "bg-transparent py-6"
          }`}
      >
        <div className="relative mx-auto max-w-7xl items-center justify-between px-4 md:px-8 flex">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group z-50">
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

          {/* Desktop Navigation */}
          {isLanding && (
              <nav className="hidden lg:block">
                <ul className="flex items-center gap-8">
                  {menuItems.map((item, index) => (
                      <li key={index}>
                        <a
                            href={item.path}
                            className={`text-sm font-medium transition-colors ${
                                pathUrl === item.path
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                            }`}
                        >
                          {item.title}
                        </a>
                      </li>
                  ))}
                </ul>
              </nav>
          )}

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {mounted &&
                  (theme === "dark" ? (
                      <Sun className="w-5 h-5" />
                  ) : (
                      <Moon className="w-5 h-5" />
                  ))}
            </button>

            {/* Show SignIn/GetStarted only on landing */}
            {isLanding && (
                <>
                  <a
                      href="/auth/signin"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Sign In
                  </a>

                  <a
                      href="/auth/signup"
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                  </a>
                </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
              onClick={() => setNavigationOpen(!navigationOpen)}
              className={`lg:hidden p-2.5 rounded-xl z-50 transition-all duration-300 ${
                  navigationOpen
                      ? "bg-gray-100 dark:bg-gray-800"
                      : stickyMenu
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "bg-white/10 backdrop-blur-sm"
              }`}
              aria-label="Toggle menu"
          >
            {navigationOpen ? (
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
                <Menu className={`w-5 h-5 ${stickyMenu ? "text-gray-700 dark:text-gray-300" : "text-gray-700 dark:text-white"}`} />
            )}
          </button>

          {/* Mobile Navigation */}
          {navigationOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60"
                    onClick={() => setNavigationOpen(false)}
                />

                {/* Menu Panel */}
                <div className="absolute top-0 right-0 h-full w-[85%] max-w-[350px] bg-white dark:bg-gray-950 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <a href="/" className="flex items-center gap-2">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        Cognify
                      </span>
                    </a>
                    <button
                        onClick={() => setNavigationOpen(false)}
                        className="p-2.5 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <div className="p-4 space-y-2 bg-white dark:bg-gray-950">
                    {isLanding && menuItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.path}
                            onClick={() => setNavigationOpen(false)}
                            className={`flex items-center px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 border ${
                                pathUrl === item.path
                                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                    : "bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 dark:hover:text-blue-400"
                            }`}
                        >
                          {item.title}
                        </a>
                    ))}
                  </div>

                  {/* Bottom Actions */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {mounted && (theme === "dark" ? (
                          <>
                            <Sun className="w-5 h-5" />
                            Light Mode
                          </>
                      ) : (
                          <>
                            <Moon className="w-5 h-5" />
                            Dark Mode
                          </>
                      ))}
                    </button>

                    {isLanding && (
                        <>
                          <a
                              href="/auth/signin"
                              onClick={() => setNavigationOpen(false)}
                              className="block text-center px-5 py-3.5 border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-semibold text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            Sign In
                          </a>

                          <a
                              href="/auth/signup"
                              onClick={() => setNavigationOpen(false)}
                              className="block text-center px-5 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
                          >
                            Get Started Free
                          </a>
                        </>
                    )}
                  </div>
                </div>
              </div>
          )}
        </div>
      </header>
  );
};

export default Header;
