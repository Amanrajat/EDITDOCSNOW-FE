"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Spinner } from "@astryxdesign/core/Spinner";

interface LoadingOverlayProps {
  isVisible: boolean;
  label?: string;
}

export function LoadingOverlay({ isVisible, label = "Loading…" }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm dark:bg-dark-surface/70"
        >
          <Spinner size="lg" label={label} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
