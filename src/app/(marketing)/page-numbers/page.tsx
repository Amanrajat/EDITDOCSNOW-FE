import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { PageNumbersClient } from "./PageNumbersClient";

export const metadata: Metadata = {
  title: "Add Page Numbers to PDF Online",
  description: "Stamp page numbers onto your PDF — choose position, style, and which pages to number. Free, in your browser.",
  alternates: { canonical: "/page-numbers" },
};

export default function PageNumbersPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Page Numbers" }]} />
      </div>
      <PageNumbersClient />
      <HowToUse toolName="Page Numbers" steps={getHowToSteps("page-numbers")} />
      <FAQSection faqs={getToolFaqs("page-numbers")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("page-numbers"))} />
    </div>
  );
}
