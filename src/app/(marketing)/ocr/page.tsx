import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { OcrClient } from "./OcrClient";

export const metadata: Metadata = {
  title: "OCR PDF Online — Make Scanned PDFs Searchable",
  description: "Turn scanned or image-only PDF pages into searchable, selectable text. Supports English, French, German, Spanish, and Hindi. Free, in your browser.",
  alternates: { canonical: "/ocr" },
};

export default function OcrPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "OCR" }]} />
      </div>
      <OcrClient />
      <HowToUse toolName="OCR" steps={getHowToSteps("ocr")} />
      <FAQSection faqs={getToolFaqs("ocr")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("ocr"))} />
    </div>
  );
}
