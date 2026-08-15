import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { CropClient } from "./CropClient";

export const metadata: Metadata = {
  title: "Crop PDF Online — Trim PDF Margins",
  description: "Drag to crop your PDF's pages, or use margin presets, then download the trimmed file. Free, in your browser.",
  alternates: { canonical: "/crop" },
};

export default function CropPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Crop PDF" }]} />
      </div>
      <CropClient />
      <HowToUse toolName="Crop PDF" steps={getHowToSteps("crop")} />
      <FAQSection faqs={getToolFaqs("crop")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("crop"))} />
    </div>
  );
}
