"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Lines from "@/components/Lines";
import ScrollToTop from "@/components/ScrollToTop";
import { ScrollProgress } from "@/components/ScrollAnimations";
import { ThemeProvider } from "next-themes";
import ToasterContext from "../context/ToastContext";
import { motion, useScroll, useSpring } from "framer-motion";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeProvider
            enableSystem={true}
            attribute="class"
            defaultTheme="dark"
        >
            {/* Scroll Progress Bar */}
            <ScrollProgress />

            <Lines />
            <Header />
            <ToasterContext />
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {children}
            </motion.main>
            <Footer />
            <ScrollToTop />
        </ThemeProvider>
    );
}
