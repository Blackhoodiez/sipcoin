import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

console.log("layout.tsx: Minimal test execution point.");

// console.log("layout.tsx: Before css import");
import "./globals.css";
// console.log("layout.tsx: After css import");

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { PerformanceOptimizer } from "@/components/ui/performance-optimizer";
// import { SessionWarning } from "@/components/session-warning";
// import { CookieConsentBanner } from "@/components/cookie-consent-banner";

// Optimize font loading with display swap
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SipCoin - Nightlife Rewards App",
  description:
    "Drink. Earn. Repeat. Your ultimate nightlife rewards companion.",
  manifest: "/manifest.json",
  keywords: ["nightlife", "rewards", "drinks", "loyalty", "points", "social"],
  authors: [{ name: "SipCoin Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sipcoin.app",
    title: "SipCoin - Nightlife Rewards App",
    description:
      "Drink. Earn. Repeat. Your ultimate nightlife rewards companion.",
    siteName: "SipCoin",
  },
  twitter: {
    card: "summary_large_image",
    title: "SipCoin - Nightlife Rewards App",
    description:
      "Drink. Earn. Repeat. Your ultimate nightlife rewards companion.",
    creator: "@sipcoin",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("layout.tsx: RootLayout function called");
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
      </head>
      <body
        className={`${inter.className} dark min-h-screen bg-zinc-950 text-white antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <PerformanceOptimizer>{children}</PerformanceOptimizer>
          </AuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#fff",
              border: "1px solid #27272a",
            },
          }}
        />
        {/* <SessionWarning /> */}
        {/* <CookieConsentBanner /> */}
      </body>
    </html>
  );
}

// console.log("layout.tsx: End of file");
