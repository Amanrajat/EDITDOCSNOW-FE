import type { Metadata } from "next";
import { Edit3, Layers, Lock, ScanSearch, Undo2, Zap } from "lucide-react";
import { Hero } from "@/components/marketing/Hero";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";

export const metadata: Metadata = {
  title: "EditDocsNow — Edit PDF text visually, in your browser",
};

const FEATURES = [
  {
    icon: <ScanSearch className="h-5 w-5" />,
    title: "Automatic block extraction",
    description: "Every paragraph, heading, and label is detected with its original font, size, and color.",
  },
  {
    icon: <Edit3 className="h-5 w-5" />,
    title: "Edit directly on the page",
    description: "Click any overlay to rewrite text exactly where it appears — no separate form to fill out.",
  },
  {
    icon: <Layers className="h-5 w-5" />,
    title: "Pixel-accurate overlays",
    description: "Bounding boxes scale precisely with zoom, so edits always line up with the rendered PDF.",
  },
  {
    icon: <Undo2 className="h-5 w-5" />,
    title: "Undo & redo",
    description: "Made a mistake? Step backward and forward through your edit history at any time.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Fast regeneration",
    description: "Save once or many times — every save rebuilds a clean PDF from your original file.",
  },
  {
    icon: <Lock className="h-5 w-5" />,
    title: "Your layout, untouched",
    description: "Only text content changes. Positioning, fonts, and styling stay exactly as designed.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to edit a PDF
          </h2>
          <p className="mt-3 text-white/55">
            Built for quick, accurate edits — without touching the original design.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </section>

      <HowItWorks />
      <FAQ />
      <CTA />
    </>
  );
}
