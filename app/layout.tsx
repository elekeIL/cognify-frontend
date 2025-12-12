// app/layout.tsx
import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Cognify | AI-Powered Learning Platform",
    description: "Transform documents into personalized learning experiences",
    icons: {
        icon: "/images/favicon.ico",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`dark:bg-black ${inter.className}`}>
        <Providers>{children}</Providers>
        </body>
        </html>
    );
}


