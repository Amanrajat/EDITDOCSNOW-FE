import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PdfToExcelClient } from "./PdfToExcelClient";

export const metadata: Metadata = {
  title: "PDF to Excel Converter — Convert PDF to XLSX",
  description: "Extract tables from a PDF into a spreadsheet. Free, in your browser.",
  alternates: { canonical: "/pdf-to-excel" },
};

export default function PdfToExcelPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF to Excel" }]} />
      </div>
      <PdfToExcelClient />
      <HowToUse toolName="PDF to Excel" steps={getHowToSteps("pdf-to-excel")} />
      <FAQSection faqs={getToolFaqs("pdf-to-excel")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("pdf-to-excel"))} />
    </div>
  );
}
