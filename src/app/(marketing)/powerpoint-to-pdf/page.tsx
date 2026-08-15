import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PowerpointToPdfClient } from "./PowerpointToPdfClient";

export const metadata: Metadata = {
  title: "PowerPoint to PDF Converter — Convert PPTX to PDF",
  description: "Convert your slide deck to a PDF, preserving layout and formatting. Free, in your browser.",
  alternates: { canonical: "/powerpoint-to-pdf" },
};

export default function PowerPointToPdfPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PowerPoint to PDF" }]} />
      </div>
      <PowerpointToPdfClient />
      <HowToUse toolName="PowerPoint to PDF" steps={getHowToSteps("powerpoint-to-pdf")} />
      <FAQSection faqs={getToolFaqs("powerpoint-to-pdf")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("powerpoint-to-pdf"))} />
    </div>
  );
}
