import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ToolCategory } from "@/components/common/ToolCategory";
import { TOOL_CATEGORIES } from "@/config/navigation";

export const metadata: Metadata = {
  title: "PDF Guides — Step-by-Step Instructions | EditDocsNow",
  description:
    "Step-by-step instructions for every PDF tool on EditDocsNow. Pick a tool to see its full how-to guide.",
  alternates: { canonical: "/pdf-guides" },
};

export default function PdfGuidesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "PDF Guides" }]} />

      <div className="mx-auto mt-6 max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">PDF Guides</h1>
        <p className="mt-3 text-white/55">
          Every tool page has its own step-by-step &quot;How to use&quot; guide. Pick a tool below
          to open its guide.
        </p>
      </div>

      <div className="mt-12 space-y-14">
        {TOOL_CATEGORIES.map((category) => (
          <ToolCategory key={category.key} title={category.label} tools={category.tools} />
        ))}
      </div>
    </div>
  );
}
