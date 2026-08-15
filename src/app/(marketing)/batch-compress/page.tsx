import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowToUse } from "@/components/common/HowToUse";
import { FAQSection } from "@/components/common/FAQSection";
import { RelatedTools } from "@/components/common/RelatedTools";
import { getHowToSteps } from "@/data/tool-howto";
import { getToolFaqs } from "@/data/tool-faqs";
import { getRelatedSlugs } from "@/data/related-tools";
import { getToolsBySlugs } from "@/config/navigation";
import { BatchCompressClient } from "./BatchCompressClient";

export const metadata: Metadata = {
  title: "Batch Compress PDFs Online",
  description: "Compress many PDFs at once in the background, then download every result as one ZIP. Free, in your browser.",
  alternates: { canonical: "/batch-compress" },
};

export default function BatchCompressPage() {
  return (
    <div className="pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Batch Compress" }]} />
      </div>
      <BatchCompressClient />
      <HowToUse toolName="Batch Compress" steps={getHowToSteps("batch-compress")} />
      <FAQSection faqs={getToolFaqs("batch-compress")} />
      <RelatedTools tools={getToolsBySlugs(getRelatedSlugs("batch-compress"))} />
    </div>
  );
}
