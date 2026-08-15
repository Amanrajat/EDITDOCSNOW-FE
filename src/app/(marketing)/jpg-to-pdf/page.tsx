import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { JpgToPdfClient } from "./JpgToPdfClient";

export const metadata: Metadata = {
  title: "JPG to PDF Converter — Combine Images into a PDF",
  description: "Combine JPG or PNG images into a single PDF, one page per image, in the order you choose. Free, in your browser.",
  alternates: { canonical: "/jpg-to-pdf" },
};

export default function JpgToPdfPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "JPG to PDF" }]} />
      </div>
      <JpgToPdfClient />
      <HowToUse toolName="JPG to PDF" steps={getHowToSteps("jpg-to-pdf")} />
      <FAQSection faqs={getToolFaqs("jpg-to-pdf")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("jpg-to-pdf"))} />
    </div>
  );
}
