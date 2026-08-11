"use client";

import { motion } from "framer-motion";
import { Edit3, Download, ScanText, Upload } from "lucide-react";

const STEPS = [
  {
    icon: Upload,
    title: "Upload your PDF",
    description: "Drag and drop any PDF up to 20MB. We validate it instantly.",
  },
  {
    icon: ScanText,
    title: "We extract every block",
    description: "Text blocks, fonts, and positions are detected automatically.",
  },
  {
    icon: Edit3,
    title: "Edit visually",
    description: "Click any block on the page and rewrite it in place.",
  },
  {
    icon: Download,
    title: "Download the result",
    description: "Save your edits and get a freshly regenerated PDF.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-white">
          How it works
        </h2>
        <p className="mt-3 text-black/55 dark:text-white/55">
          Four steps between your original PDF and a perfectly edited one.
        </p>
      </div>

      <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-dark-border lg:block"
        />
        {STEPS.map((step, index) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative flex flex-col items-center text-center"
          >
            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-black shadow-soft">
              <step.icon className="h-5 w-5" aria-hidden />
            </span>
            <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
              Step {index + 1}
            </span>
            <h3 className="mt-1 text-base font-semibold text-black dark:text-white">{step.title}</h3>
            <p className="mt-2 max-w-[220px] text-sm text-black/55 dark:text-white/55">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
