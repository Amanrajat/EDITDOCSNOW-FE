import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@astryxdesign/core/Button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HowItWorks } from "@/components/marketing/HowItWorks";

export const metadata: Metadata = {
  title: "How It Works — EditDocsNow",
  description:
    "See the upload-to-download flow that every EditDocsNow PDF tool follows: upload a file, choose a tool, configure it, and download the result.",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-4 pt-12 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "How It Works" }]} />

        <div className="mx-auto mt-6 max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">How EditDocsNow works</h1>
          <p className="mt-3 text-white/55">
            Every tool — from Merge PDF to OCR — follows the same simple flow. No account, no
            installed software.
          </p>
        </div>
      </div>

      <HowItWorks />

      <div className="flex justify-center pb-16">
        <Button label="Explore PDF Tools" variant="primary" as={Link} href="/tools" />
      </div>
    </>
  );
}
