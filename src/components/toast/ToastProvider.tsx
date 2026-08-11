"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import { ToastViewport, useToast as useAstryxToast } from "@astryxdesign/core/Toast";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastViewport position="topEnd" maxVisible={4}>
      {children}
    </ToastViewport>
  );
}

interface AppToast {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

function toastBody(icon: ReactNode, message: string) {
  return (
    <span className="flex items-center gap-2">
      {icon}
      <span>{message}</span>
    </span>
  );
}

/** App-level toast API layered on top of Astryx's info/error Toast primitive. */
export function useToast(): AppToast {
  const show = useAstryxToast();

  const success = useCallback(
    (message: string) =>
      void show({
        body: toastBody(<CheckCircle2 className="h-4 w-4 text-success" aria-hidden />, message),
        type: "info",
      }),
    [show],
  );

  const error = useCallback(
    (message: string) =>
      void show({
        body: toastBody(<XCircle className="h-4 w-4" aria-hidden />, message),
        type: "error",
        isAutoHide: false,
      }),
    [show],
  );

  const info = useCallback(
    (message: string) =>
      void show({
        body: toastBody(<Info className="h-4 w-4 text-primary" aria-hidden />, message),
        type: "info",
      }),
    [show],
  );

  const warning = useCallback(
    (message: string) =>
      void show({
        body: toastBody(<TriangleAlert className="h-4 w-4 text-warning" aria-hidden />, message),
        type: "info",
        autoHideDuration: 7000,
      }),
    [show],
  );

  return useMemo(() => ({ success, error, info, warning }), [success, error, info, warning]);
}
