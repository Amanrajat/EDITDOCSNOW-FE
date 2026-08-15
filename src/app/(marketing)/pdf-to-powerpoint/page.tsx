import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PdfToPowerpointClient } from "./PdfToPowerpointClient";

export const metadata: Metadata = {
  title: "PDF to PowerPoint Converter — Convert PDF to PPTX",
  description: "Turn PDF pages into an editable slide deck. Free, in your browser.",
  alternates: { canonical: "/pdf-to-powerpoint" },
};

export default function PdfToPowerpointPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF to PowerPoint" }]} />
      </div>
      <PdfToPowerpointClient />
      <HowToUse toolName="PDF to PowerPoint" steps={getHowToSteps("pdf-to-powerpoint")} />
      <FAQSection faqs={getToolFaqs("pdf-to-powerpoint")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("pdf-to-powerpoint"))} />
    </div>
  );
}
