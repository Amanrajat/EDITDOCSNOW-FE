import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ToolsDirectoryClient } from "./ToolsDirectoryClient";

export const metadata: Metadata = {
  title: "All PDF Tools — Merge, Convert, Compress & Edit PDFs",
  description:
    "Browse every PDF tool on EditDocsNow: merge, split, organize, compress, convert to and from PDF, edit, and OCR.",
  alternates: { canonical: "/tools" },
};

export default function ToolsDirectoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF Tools" }]} />

      <div className="mx-auto mt-6 max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">All PDF Tools</h1>
        <p className="mt-3 text-white/55">
          Every tool EditDocsNow offers, organized by category — merge, compress, convert, edit,
          and more.
        </p>
      </div>

      <div className="mt-12">
        <ToolsDirectoryClient />
      </div>
    </div>
  );
}
