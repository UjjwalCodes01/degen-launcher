'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "@/app/provider"; // 👈 we'll create this file next

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Wrap the whole app with Providers */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
