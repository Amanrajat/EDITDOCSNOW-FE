import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { SplitClient } from "./SplitClient";

export const metadata: Metadata = {
  title: "Split PDF Online — Extract or Split PDF Pages",
  description: "Break a PDF into individual pages, custom ranges, or extract specific pages. Free, in your browser.",
  alternates: { canonical: "/split" },
};

export default function SplitPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Split PDF" }]} />
      </div>
      <SplitClient />
      <HowToUse toolName="Split PDF" steps={getHowToSteps("split")} />
      <FAQSection faqs={getToolFaqs("split")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("split"))} />
    </div>
  );
}
