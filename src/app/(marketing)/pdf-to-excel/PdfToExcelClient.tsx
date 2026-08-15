"use client";

import { Table2 } from "lucide-react";
import { ConversionToolPage } from "@/components/convert/ConversionToolPage";

export function PdfToExcelClient() {
  return (
    <ConversionToolPage
      icon={<Table2 className="h-7 w-7" aria-hidden />}
      title="PDF to Excel"
      description="Extract real tables from your PDF into an editable Excel workbook, one sheet per page."
      endpointPath="/convert/pdf-to-excel/"
      submitLabel="Convert to Excel"
      resultHeading="Your PDF is now an Excel workbook"
      resultDescription={(result) => `${result.page_count} pages, ${result.table_count} table(s) extracted.`}
      resultFilename="converted.xlsx"
      renderStats={(result) => (
        <div className="grid grid-cols-2 gap-3 text-center text-sm text-white/60">
          <div>
            <p className="text-lg font-semibold text-white">{String(result.page_count ?? "-")}</p>
            <p className="text-xs uppercase tracking-wide text-white/40">Sheets</p>
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
