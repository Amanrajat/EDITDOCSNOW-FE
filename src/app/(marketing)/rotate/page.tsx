import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { RotateClient } from "./RotateClient";

export const metadata: Metadata = {
  title: "Rotate PDF Online — Fix Page Orientation",
  description: "Rotate individual pages or an entire PDF, then download the corrected file. Free, in your browser.",
  alternates: { canonical: "/rotate" },
};

export default function RotatePage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Rotate PDF" }]} />
      </div>
      <RotateClient />
      <HowToUse toolName="Rotate PDF" steps={getHowToSteps("rotate")} />
      <FAQSection faqs={getToolFaqs("rotate")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("rotate"))} />
    </div>
  );
}
