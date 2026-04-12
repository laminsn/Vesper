import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { I18nProvider } from "@/providers/i18n-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vesper",
  description: "Vesper is an AI-powered workforce operating system that deploys, manages, and orchestrates autonomous AI agents across your entire business — from directives and playbooks to real-time reporting and multi-channel communications.",
  manifest: "/manifest.json",
  themeColor: "#06d6a0",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Vesper — AI Agent Workforce OS",
    description: "Deploy, manage, and orchestrate autonomous AI agents across your entire business. Real-time command center, playbooks, integrations, and multi-channel communications — all in one platform.",
    siteName: "Vesper",
    type: "website",
    locale: "en_US",
    url: "https://vesper-wheat.vercel.app",
  },
  twitter: {
    card: "summary",
    title: "Vesper — AI Agent Workforce OS",
    description: "Deploy, manage, and orchestrate autonomous AI agents across your entire business.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Vesper",
  },
  keywords: ["AI agents", "workforce automation", "agent management", "AI operating system", "business intelligence", "autonomous agents"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[var(--jarvis-bg-primary)] text-[var(--jarvis-text-primary)]">
        <ThemeProvider>
          <I18nProvider>
            <QueryProvider>
              {children}
              <Toaster
                theme="dark"
                position="top-right"
                toastOptions={{
                  style: {
                    background: "var(--jarvis-bg-secondary)",
                    border: "1px solid var(--jarvis-border)",
                    color: "var(--jarvis-text-primary)",
                  },
                }}
              />
            </QueryProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
