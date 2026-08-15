"use client";

import { FileText } from "lucide-react";
import { OfficeToPdfPage } from "@/components/convert/OfficeToPdfPage";
import { convertWordToPdf } from "@/services/pdf.service";

export function WordToPdfClient() {
  return (
    <OfficeToPdfPage
      icon={<FileText className="h-7 w-7" aria-hidden />}
      title="Word to PDF"
      description="Convert your Word document to a PDF, preserving layout and formatting."
      kind="docx"
      fileTypeLabel="Word document"
      convertFn={convertWordToPdf}
      resultHeading="Your Word document is now a PDF"
    />
  );
}
