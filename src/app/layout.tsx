import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Sets `data-theme` on <html> synchronously, before first paint, from the
 * persisted zustand store (localStorage key "editdocsnow-ui") — otherwise
 * dark-mode users see a flash of the light theme while React hydrates.
 * `next/script` with `beforeInteractive` is the Next.js-supported way to run
 * blocking script before hydration; see ThemeProvider for the client-side
 * counterpart that seeds Astryx's <Theme mode> the same way.
 */
const noFlashThemeScript = `
(function () {
  try {
    var raw = window.localStorage.getItem("editdocsnow-ui");
    var theme = raw ? JSON.parse(raw).state.theme : "light";
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {noFlashThemeScript}
        </Script>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
