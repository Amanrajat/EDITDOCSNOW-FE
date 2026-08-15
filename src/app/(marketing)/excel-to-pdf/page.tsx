import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { ExcelToPdfClient } from "./ExcelToPdfClient";

export const metadata: Metadata = {
  title: "Excel to PDF Converter — Convert XLSX to PDF",
  description: "Convert your spreadsheet to a PDF, preserving layout and formatting. Free, in your browser.",
  alternates: { canonical: "/excel-to-pdf" },
};

export default function ExcelToPdfPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Excel to PDF" }]} />
      </div>
      <ExcelToPdfClient />
      <HowToUse toolName="Excel to PDF" steps={getHowToSteps("excel-to-pdf")} />
      <FAQSection faqs={getToolFaqs("excel-to-pdf")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("excel-to-pdf"))} />
    </div>
  );
}
