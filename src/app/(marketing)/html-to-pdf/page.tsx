import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { HtmlToPdfClient } from "./HtmlToPdfClient";

export const metadata: Metadata = {
  title: "HTML to PDF Converter — Convert Web Pages to PDF",
  description: "Convert a webpage URL or raw HTML into a PDF. Free, in your browser.",
  alternates: { canonical: "/html-to-pdf" },
};

export default function HtmlToPdfPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "HTML to PDF" }]} />
      </div>
      <HtmlToPdfClient />
      <HowToUse toolName="HTML to PDF" steps={getHowToSteps("html-to-pdf")} />
      <FAQSection faqs={getToolFaqs("html-to-pdf")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("html-to-pdf"))} />
    </div>
  );
}
