"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card } from "@astryxdesign/core/Card";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  index?: number;
}

export function FeatureCard({ icon, title, description, index = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <Card
        variant="default"
        padding={6}
        className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-700 dark:text-primary-400">
          {icon}
        </span>
        <h3 className="mt-4 text-base font-semibold text-black dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-black/55 dark:text-white/55">{description}</p>
      </Card>
    </motion.div>
  );
}
