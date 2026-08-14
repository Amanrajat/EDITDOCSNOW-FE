import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EditDocsNow — Edit PDFs in your browser",
    template: "%s · EditDocsNow",
  },
  description:
    "Upload a PDF, edit its text blocks visually, and download the regenerated document in seconds.",
  applicationName: "EditDocsNow",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "EditDocsNow",
    title: "EditDocsNow — Edit PDFs in your browser",
    description:
      "Upload a PDF, edit its text blocks visually, and download the regenerated document in seconds.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "EditDocsNow — Edit PDFs in your browser",
    description:
      "Upload a PDF, edit its text blocks visually, and download the regenerated document in seconds.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D0D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
