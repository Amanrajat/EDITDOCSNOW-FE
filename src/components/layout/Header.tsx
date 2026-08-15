"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { cn } from "@/utils/cn";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/merge", label: "Merge PDF" },
  { href: "/split", label: "Split PDF" },
  { href: "/organize", label: "Organize PDF" },
  { href: "/remove-pages", label: "Remove Pages" },
  { href: "/rotate", label: "Rotate PDF" },
  { href: "/crop", label: "Crop PDF" },
  { href: "/page-numbers", label: "Page Numbers" },
  { href: "/compress", label: "Compress PDF" },
  { href: "/batch-compress", label: "Batch Compress" },
  { href: "/pdf-to-word", label: "PDF to Word" },
  { href: "/pdf-to-excel", label: "PDF to Excel" },
  { href: "/pdf-to-powerpoint", label: "PDF to PowerPoint" },
  { href: "/pdf-to-jpg", label: "PDF to JPG" },
  { href: "/pdf-to-markdown", label: "PDF to Markdown" },
  { href: "/jpg-to-pdf", label: "JPG to PDF" },
  { href: "/pdf-to-pdfa", label: "PDF to PDF/A" },
  { href: "/word-to-pdf", label: "Word to PDF" },
  { href: "/excel-to-pdf", label: "Excel to PDF" },
  { href: "/powerpoint-to-pdf", label: "PowerPoint to PDF" },
  { href: "/html-to-pdf", label: "HTML to PDF" },
  { href: "/ocr", label: "OCR" },
];

interface HeaderProps {
  /** "full" = marketing nav + CTA. "minimal" = editor top bar (logo + a
   * single escape hatch back to /upload). */
  variant?: "full" | "minimal";
}

export function Header({ variant = "full" }: HeaderProps) {
  const pathname = usePathname();

  if (variant === "minimal") {
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <Link
            href="/upload"
            className="focus-ring-accent rounded-lg px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:text-primary"
          >
            Upload another file
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "focus-ring-accent rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-primary/10 text-primary-400"
                  : "text-white/60 hover:bg-white/5 hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button label="Upload PDF" variant="primary" size="sm" as={Link} href="/upload" />
        </div>
      </div>
    </header>
  );
}
