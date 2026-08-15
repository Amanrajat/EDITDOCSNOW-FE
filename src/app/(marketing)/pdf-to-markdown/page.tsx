import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PdfToMarkdownClient } from "./PdfToMarkdownClient";

export const metadata: Metadata = {
  title: "PDF to Markdown Converter",
  description: "Convert a PDF's headings, paragraphs, and tables into Markdown. Free, in your browser.",
  alternates: { canonical: "/pdf-to-markdown" },
};

export default function PdfToMarkdownPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF to Markdown" }]} />
      </div>
      <PdfToMarkdownClient />
      <HowToUse toolName="PDF to Markdown" steps={getHowToSteps("pdf-to-markdown")} />
      <FAQSection faqs={getToolFaqs("pdf-to-markdown")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("pdf-to-markdown"))} />
    </div>
  );
}
