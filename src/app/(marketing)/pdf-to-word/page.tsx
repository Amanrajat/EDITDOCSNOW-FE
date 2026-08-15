import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PdfToWordClient } from "./PdfToWordClient";

export const metadata: Metadata = {
  title: "PDF to Word Converter — Convert PDF to DOCX",
  description: "Convert your PDF into an editable Word document — text, tables, and images preserved. Free, in your browser.",
  alternates: { canonical: "/pdf-to-word" },
};

export default function PdfToWordPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF to Word" }]} />
      </div>
      <PdfToWordClient />
      <HowToUse toolName="PDF to Word" steps={getHowToSteps("pdf-to-word")} />
      <FAQSection faqs={getToolFaqs("pdf-to-word")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("pdf-to-word"))} />
    </div>
  );
}
