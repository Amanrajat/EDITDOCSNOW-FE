"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LinkProvider } from "@astryxdesign/core/Link";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LinkProvider component={Link}>
      <ThemeProvider>
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </ThemeProvider>
    </LinkProvider>
  );
}
