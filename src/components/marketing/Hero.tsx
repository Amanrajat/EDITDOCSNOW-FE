"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { Badge } from "@astryxdesign/core/Badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-6 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-[36rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,107,0,0.14),transparent)]"
      />
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="orange" icon={<Sparkles className="h-3.5 w-3.5" />} label="Now with visual block editing" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl"
        >
          Edit any PDF&apos;s text,
          <br className="hidden sm:block" /> right in your browser.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-lg text-white/60"
        >
          Upload a PDF and EditDocsNow extracts every editable text block. Tweak the words
          directly on the page, then download a perfectly regenerated document — no design
          software required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button
            label="Upload a PDF"
            variant="primary"
            size="lg"
            endContent={<ArrowRight className="h-4 w-4" />}
            as={Link}
            href="/upload"
          />
          <Button label="See how it works" variant="ghost" size="lg" href="#how-it-works" as={Link} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/50"
        >
          <span className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-success" /> Up to 20MB per file
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" /> Original layout preserved
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="glass-card mx-auto mt-16 max-w-4xl rounded-2xl p-2 shadow-glass"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-danger/70" />
          <span className="h-3 w-3 rounded-full bg-warning/70" />
          <span className="h-3 w-3 rounded-full bg-success/70" />
          <span className="ml-3 text-xs font-medium text-white/40">editor — invoice.pdf</span>
        </div>
        <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-5">
          <div className="col-span-3 rounded-xl border border-dashed border-border bg-white/[0.03] p-6">
            <div className="h-3 w-1/2 rounded bg-white/10" />
            <div className="mt-4 h-2 w-full rounded bg-white/10" />
            <div className="mt-2 h-2 w-5/6 rounded bg-white/10" />
            <div className="mt-2 h-2 w-2/3 rounded bg-primary/40" />
            <div className="mt-6 h-2 w-full rounded bg-white/10" />
            <div className="mt-2 h-2 w-4/5 rounded bg-white/10" />
          </div>
          <div className="col-span-2 space-y-2 rounded-xl border border-border bg-surface p-4 text-left shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
              Editable blocks
            </p>
            <div className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary-400">
              Invoice #1024
            </div>
            <div className="rounded-lg px-3 py-2 text-xs text-white/50">Due 30 Aug 2026</div>
            <div className="rounded-lg px-3 py-2 text-xs text-white/50">Total: $2,400.00</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
