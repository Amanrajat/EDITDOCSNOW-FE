"use client";

import { useQuery } from "@tanstack/react-query";
import { getBatchStatus } from "@/services/pdf.service";
import type { BatchStatusResponseData } from "@/types/pdf";

const TERMINAL_STATUSES = new Set(["completed", "partial", "failed"]);
const POLL_INTERVAL_MS = 2000;

/** Query options for one batch's status - a plain factory (not a hook)
 * so a page tracking multiple concurrent batches (e.g. after retrying
 * failed files as a follow-up batch) can pass an array of these into
 * TanStack Query's `useQueries`. Polls every 2s until the batch reaches a
 * terminal state, then stops - never polls a finished batch forever. */
export function batchStatusQueryOptions(batchId: string | null, token: string | null) {
  return {
    queryKey: ["batch-status", batchId],
    queryFn: () => getBatchStatus(batchId as string, token as string),
    enabled: !!batchId && !!token,
    refetchInterval: (query: { state: { data?: BatchStatusResponseData } }) => {
      const status = query.state.data?.status;
      return status && TERMINAL_STATUSES.has(status) ? false : POLL_INTERVAL_MS;
    },
  };
}

/** Single-batch convenience hook built on the same query options. */
export function useBatchStatus(batchId: string | null, token: string | null) {
  return useQuery(batchStatusQueryOptions(batchId, token));
}
