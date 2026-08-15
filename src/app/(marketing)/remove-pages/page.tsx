import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { RemovePagesClient } from "./RemovePagesClient";

export const metadata: Metadata = {
  title: "Remove Pages from PDF Online",
  description: "Delete unwanted pages from a PDF and download a new copy. Free, in your browser.",
  alternates: { canonical: "/remove-pages" },
};

export default function RemovePagesPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Remove Pages" }]} />
      </div>
      <RemovePagesClient />
      <HowToUse toolName="Remove Pages" steps={getHowToSteps("remove-pages")} />
      <FAQSection faqs={getToolFaqs("remove-pages")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("remove-pages"))} />
    </div>
  );
}
