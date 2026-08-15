"use client";

import { useQuery } from "@tanstack/react-query";
import { getOcrStatus } from "@/services/pdf.service";

const TERMINAL_STATUSES = new Set(["completed", "failed"]);
const POLL_INTERVAL_MS = 2000;

/** Polls one OCR job's status every 2s until it reaches a terminal
 * state, then stops - same convention as Batch Processing's status hook. */
export function useOcrStatus(jobId: string | null, token: string | null) {
  return useQuery({
    queryKey: ["ocr-status", jobId],
    queryFn: () => getOcrStatus(jobId as string, token as string),
    enabled: !!jobId && !!token,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL_STATUSES.has(status) ? false : POLL_INTERVAL_MS;
    },
  });
}
