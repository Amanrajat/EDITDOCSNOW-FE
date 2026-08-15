import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { FAQSection } from "@/components/common/FAQSection";
import { GENERAL_FAQS } from "@/data/tool-faqs";

export const metadata: Metadata = {
  title: "FAQ — EditDocsNow",
  description: "Answers to common questions about using EditDocsNow's PDF tools.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />

      <div className="mx-auto mt-6 max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-white/55">
          General questions about EditDocsNow. Each tool page also has its own FAQ specific to
          that tool.
        </p>
      </div>

      <FAQSection faqs={GENERAL_FAQS} title="" />
    </div>
  );
}
