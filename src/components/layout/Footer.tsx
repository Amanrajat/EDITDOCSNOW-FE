import Link from "next/link";
import { FileEdit } from "lucide-react";
import { RESOURCE_LINKS, getToolsBySlugs } from "@/config/navigation";

const PRODUCT_LINKS = getToolsBySlugs(["merge", "split", "organize", "compress", "ocr", "editor"]);
const CONVERT_LINKS = getToolsBySlugs([
  "pdf-to-word",
  "pdf-to-excel",
  "pdf-to-powerpoint",
  "pdf-to-jpg",
  "word-to-pdf",
  "jpg-to-pdf",
]);
const TOOLS_LINKS = getToolsBySlugs([
  "rotate",
  "crop",
  "remove-pages",
  "page-numbers",
  "batch-compress",
  "pdf-to-pdfa",
]);

const FOOTER_COLUMNS = [
  { title: "Product", links: PRODUCT_LINKS },
  { title: "Convert", links: CONVERT_LINKS },
  { title: "Tools", links: TOOLS_LINKS },
  { title: "Resources", links: RESOURCE_LINKS },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="focus-ring-accent flex items-center gap-2.5 rounded-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-black">
                <FileEdit className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="font-semibold tracking-tight">EditDocsNow</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              Powerful PDF tools for editing, organizing, compressing, and converting documents
              online.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-white/40">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-ring-accent rounded text-sm text-white/60 transition-colors hover:text-primary"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-white/40">
          © {new Date().getFullYear()} EditDocsNow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
