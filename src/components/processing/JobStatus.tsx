import { Check, Clock, Loader2, X } from "lucide-react";
import { cn } from "@/utils/cn";

export type JobStatusValue = "queued" | "processing" | "completed" | "failed";

interface JobStatusProps {
  status: JobStatusValue;
  /** Shown only when status is "failed". */
  errorMessage?: string;
}

const LABELS: Record<JobStatusValue, string> = {
  queued: "Queued",
  processing: "Processing…",
  completed: "Done",
  failed: "Failed",
};

/**
 * Reusable queued/processing/completed/failed indicator for any
 * background/polled job (currently: Batch Processing's per-file rows).
 * Never shows a fake percentage - only the discrete state the backend
 * actually reports.
 */
export function JobStatus({ status, errorMessage }: JobStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full",
          status === "completed" && "bg-success/15 text-success",
          status === "failed" && "bg-danger/15 text-danger",
          (status === "queued" || status === "processing") && "bg-white/10 text-white/50",
        )}
        aria-hidden
      >
        {status === "completed" && <Check className="h-3.5 w-3.5" />}
        {status === "failed" && <X className="h-3.5 w-3.5" />}
        {status === "processing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {status === "queued" && <Clock className="h-3.5 w-3.5" />}
      </span>
      <span
        className={cn(
          "text-sm",
          status === "completed" && "text-success",
          status === "failed" && "text-danger",
          (status === "queued" || status === "processing") && "text-white/55",
        )}
        title={status === "failed" ? errorMessage : undefined}
      >
        {LABELS[status]}
      </span>
    </div>
  );
}
