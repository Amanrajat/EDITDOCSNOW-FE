import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { OrganizeClient } from "./OrganizeClient";

export const metadata: Metadata = {
  title: "Organize PDF Online — Reorder PDF Pages",
  description: "Drag to reorder your PDF's pages, then generate a new PDF in that order. Free, in your browser.",
  alternates: { canonical: "/organize" },
};

export default function OrganizePage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Organize PDF" }]} />
      </div>
      <OrganizeClient />
      <HowToUse toolName="Organize PDF" steps={getHowToSteps("organize")} />
      <FAQSection faqs={getToolFaqs("organize")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("organize"))} />
    </div>
  );
}
