"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Button } from "@astryxdesign/core/Button";
import { useUIStore } from "@/store/ui.store";
import { cn } from "@/utils/cn";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
];

interface HeaderProps {
  /** "full" = marketing nav + CTA. "minimal" = editor top bar (logo + theme
   * toggle + a single escape hatch back to /upload). */
  variant?: "full" | "minimal";
}

export function Header({ variant = "full" }: HeaderProps) {
  const pathname = usePathname();
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  const ThemeToggle = (
    <IconButton
      label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      icon={theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      variant="ghost"
      onClick={toggleTheme}
    />
  );

  if (variant === "minimal") {
    return (
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4 dark:border-dark-border dark:bg-dark-surface sm:px-6">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          {ThemeToggle}
          <Link
            href="/upload"
            className="focus-ring-accent rounded-lg px-3 py-2 text-sm font-medium text-black/60 transition-colors hover:text-primary dark:text-white/60 dark:hover:text-primary"
          >
            Upload another file
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/80 backdrop-blur-md dark:border-dark-border dark:bg-dark-surface/80">
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
                  ? "bg-primary/10 text-primary-700 dark:text-primary-400"
                  : "text-black/60 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {ThemeToggle}
          <Button label="Upload PDF" variant="primary" size="sm" as={Link} href="/upload" />
        </div>
      </div>
    </header>
  );
}
