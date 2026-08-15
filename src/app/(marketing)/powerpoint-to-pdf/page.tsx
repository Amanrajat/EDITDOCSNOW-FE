"use client";

import { Presentation as PresentationIcon } from "lucide-react";
import { OfficeToPdfPage } from "@/components/convert/OfficeToPdfPage";
import { convertPptxToPdf } from "@/services/pdf.service";

export default function PowerPointToPdfPage() {
  return (
    <OfficeToPdfPage
      icon={<PresentationIcon className="h-7 w-7" aria-hidden />}
      title="PowerPoint to PDF"
      description="Convert your slide deck to a PDF, preserving slide order and visual content."
      kind="pptx"
      fileTypeLabel="presentation"
      convertFn={convertPptxToPdf}
      resultHeading="Your presentation is now a PDF"
    />
  );
}
