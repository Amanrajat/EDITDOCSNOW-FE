"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";

export function CTA() {
  return (
    <section className="px-4 pb-24 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-black px-8 py-16 text-center shadow-glass sm:px-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_50%_0%,rgba(255,107,0,0.25),transparent)]"
        />
        <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to get started?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-white/60">
          No sign-up required. Upload a file and start using any tool in seconds.
        </p>
        <div className="relative mt-8 flex justify-center">
          <Button
            label="Upload PDF"
            variant="primary"
            size="lg"
            endContent={<ArrowRight className="h-4 w-4" />}
            as={Link}
            href="/upload"
          />
        </div>
      </motion.div>
    </section>
  );
}
