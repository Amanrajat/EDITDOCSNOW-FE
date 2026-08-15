import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PdfToPdfAClient } from "./PdfToPdfAClient";

export const metadata: Metadata = {
  title: "PDF to PDF/A Converter — Archive Your PDFs",
  description: "Convert your PDF to the PDF/A archival standard for long-term preservation. Free, in your browser.",
  alternates: { canonical: "/pdf-to-pdfa" },
};

export default function PdfToPdfAPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF to PDF/A" }]} />
      </div>
      <PdfToPdfAClient />
      <HowToUse toolName="PDF to PDF/A" steps={getHowToSteps("pdf-to-pdfa")} />
      <FAQSection faqs={getToolFaqs("pdf-to-pdfa")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("pdf-to-pdfa"))} />
    </div>
  );
}
