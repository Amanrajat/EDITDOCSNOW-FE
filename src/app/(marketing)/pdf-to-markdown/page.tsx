"use client";

import { FileCode } from "lucide-react";
import { ConversionToolPage } from "@/components/convert/ConversionToolPage";

export default function PdfToMarkdownPage() {
  return (
    <ConversionToolPage
      icon={<FileCode className="h-7 w-7" aria-hidden />}
      title="PDF to Markdown"
      description="Extract headings, paragraphs, lists, tables, and links from your PDF into clean Markdown."
      endpointPath="/convert/pdf-to-markdown/"
      submitLabel="Convert to Markdown"
      resultHeading="Your PDF is now Markdown"
      resultDescription={(result) =>
        `${result.page_count} pages, ${result.heading_count} heading(s), ${result.table_count} table(s).`
      }
      resultFilename="converted.md"
      renderStats={(result) => (
        <div className="grid grid-cols-3 gap-3 text-center text-sm text-white/60">
          <div>
            <p className="text-lg font-semibold text-white">{String(result.page_count ?? "-")}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Pages</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{String(result.heading_count ?? 0)}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Headings</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{String(result.table_count ?? 0)}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Tables</p>
          </div>
        </div>
      )}
    />
  );
}
