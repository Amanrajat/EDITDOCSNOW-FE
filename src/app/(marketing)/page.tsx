import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { ToolCategory } from "@/components/common/ToolCategory";
import { COMPRESS_TOOLS, CONVERT_FROM_PDF, CONVERT_TO_PDF, EDIT_TOOLS, OCR_TOOL, ORGANIZE_TOOLS } from "@/config/navigation";

export const metadata: Metadata = {
  title: "EditDocsNow — Edit, Convert, Compress & Organize PDFs Online",
  description:
    "Everything you need to work with PDFs — merge, split, compress, convert, OCR, and edit PDFs directly in your browser. No installs, no sign-up.",
};

export default function LandingPage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl space-y-14 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to work with PDFs
          </h2>
          <p className="mt-3 text-white/55">
            Twenty-plus tools to organize, compress, convert, edit, and OCR your documents.
          </p>
        </div>

        <ToolCategory title="Organize PDFs" tools={ORGANIZE_TOOLS} />
        <ToolCategory title="Compress PDFs" tools={COMPRESS_TOOLS} />
        <ToolCategory title="Convert PDFs" tools={[...CONVERT_FROM_PDF, ...CONVERT_TO_PDF]} />
        <ToolCategory title="Edit PDFs" tools={EDIT_TOOLS} />
        <ToolCategory title="OCR" tools={[OCR_TOOL]} />
      </section>

      <HowItWorks />
      <FAQ />
      <CTA />
    </>
  );
}
