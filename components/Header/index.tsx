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
              className="lg:hidden p-2 text-gray-700 dark:text-gray-300 z-50"
              aria-label="Toggle menu"
          >
            {navigationOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Navigation */}
          <div
              className={`fixed inset-0 bg-white dark:bg-black z-40 lg:hidden transition-all duration-300 ${
                  navigationOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
          >
            <div className="flex flex-col items-center justify-center h-full px-8">
              <nav className="w-full max-w-sm">
                {isLanding && (
                    <ul className="space-y-6">
                      {menuItems.map((item, index) => (
                          <li key={index} className="text-center">
                            <a
                                href={item.path}
                                onClick={() => setNavigationOpen(false)}
                                className={`block text-2xl font-medium transition-colors ${
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
                )}

                <div className="mt-12 space-y-4">
                  <button
                      onClick={toggleTheme}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium"
                  >
                    {mounted &&
                        (theme === "dark" ? (
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

                  {/* Mobile SignIn/GetStarted only on landing */}
                  {isLanding && (
                      <>
                        <a
                            href="/auth/signin"
                            onClick={() => setNavigationOpen(false)}
                            className="block text-center py-3 text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Sign In
                        </a>

                        <a
                            href="/auth/signup"
                            onClick={() => setNavigationOpen(false)}
                            className="block text-center py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg"
                        >
                          Get Started
                        </a>
                      </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </header>
  );
};

export default Header;
