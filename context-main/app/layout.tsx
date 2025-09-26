import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import StatusBar from "@/components/StatusBar";
import SkipLink from "@/components/ui/SkipLink";
import Navbar from "@/components/Navbar";
import ClientDebug from "@/components/ClientDebug";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Context Frontend",
  description:
    "Semantic search and knowledge management system with AI-powered document search, knowledge graphs, and mind mapping",
  keywords: [
    "semantic search",
    "knowledge management",
    "AI",
    "document search",
    "mind mapping",
    "knowledge graph",
  ],
  authors: [{ name: "Context Frontend Team" }],
  openGraph: {
    title: "Context Frontend",
    description: "Semantic search and knowledge management system",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-context-dark`}>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>

        <ErrorBoundary>
          <Providers>
            <div className="min-h-screen">
              {process.env.NODE_ENV !== "production" && <ClientDebug />}
              <Navbar />
              <main id="main-content" className="relative" role="main">
                {children}
              </main>
              <StatusBar />
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
