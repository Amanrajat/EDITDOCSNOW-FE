"use client";

import { Table2 } from "lucide-react";
import { OfficeToPdfPage } from "@/components/convert/OfficeToPdfPage";
import { convertExcelToPdf } from "@/services/pdf.service";

export function ExcelToPdfClient() {
  return (
    <OfficeToPdfPage
      icon={<Table2 className="h-7 w-7" aria-hidden />}
      title="Excel to PDF"
      description="Convert your Excel workbook to a PDF, preserving sheets and layout."
      kind="xlsx"
      fileTypeLabel="Excel workbook"
      convertFn={convertExcelToPdf}
      resultHeading="Your Excel workbook is now a PDF"
    />
  );
}
