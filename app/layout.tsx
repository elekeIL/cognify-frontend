// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
    title: "Cognify App",
    description: "Dashboard and learning platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}
