import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { WordToPdfClient } from "./WordToPdfClient";

export const metadata: Metadata = {
  title: "Word to PDF Converter — Convert DOCX to PDF",
  description: "Convert your Word document to a PDF, preserving layout and formatting. Free, in your browser.",
  alternates: { canonical: "/word-to-pdf" },
};

export default function WordToPdfPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Word to PDF" }]} />
      </div>
      <WordToPdfClient />
      <HowToUse toolName="Word to PDF" steps={getHowToSteps("word-to-pdf")} />
      <FAQSection faqs={getToolFaqs("word-to-pdf")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("word-to-pdf"))} />
    </div>
  );
}
