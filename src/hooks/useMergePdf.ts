"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { mergePdfs } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { MergeResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface MergeInput {
  files: File[];
  order?: number[];
}

export function useMergePdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<MergeResponseData, ApiError, MergeInput>({
    mutationFn: ({ files, order }) => {
      setProgress(0);
      return mergePdfs(files, order, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Merge failed. Please try again.");
    },
  });

  return {
    merge: (files: File[], order?: number[]) => mutation.mutate({ files, order }),
    result: mutation.data,
    progress,
    isMerging: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
