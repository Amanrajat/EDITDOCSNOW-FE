import Link from "next/link";
import { FileEdit } from "lucide-react";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 text-white/70">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-black">
            <FileEdit className="h-3.5 w-3.5" aria-hidden />
          </span>
          <span className="text-sm">© {new Date().getFullYear()} EditDocsNow. All rights reserved.</span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-white/60" aria-label="Footer">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring-accent rounded transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
