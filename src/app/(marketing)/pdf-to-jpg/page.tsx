import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PdfToJpgClient } from "./PdfToJpgClient";

export const metadata: Metadata = {
  title: "PDF to JPG Converter — Convert PDF Pages to Images",
  description: "Render pages of your PDF as JPG images — pick pages, resolution, and quality. Free, in your browser.",
  alternates: { canonical: "/pdf-to-jpg" },
};

export default function PdfToJpgPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF to JPG" }]} />
      </div>
      <PdfToJpgClient />
      <HowToUse toolName="PDF to JPG" steps={getHowToSteps("pdf-to-jpg")} />
      <FAQSection faqs={getToolFaqs("pdf-to-jpg")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("pdf-to-jpg"))} />
    </div>
  );
}
