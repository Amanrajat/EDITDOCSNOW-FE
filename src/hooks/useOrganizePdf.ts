"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { organizePdf } from "@/services/pdf.service";
import { useToast } from "@/components/toast/ToastProvider";
import type { OrganizeResponseData } from "@/types/pdf";
import { ApiError } from "@/types/api";

interface OrganizeInput {
  file: File;
  order: number[];
}

export function useOrganizePdf() {
  const toast = useToast();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<OrganizeResponseData, ApiError, OrganizeInput>({
    mutationFn: ({ file, order }) => {
      setProgress(0);
      return organizePdf(file, order, setProgress);
    },
    onError: (error) => {
      toast.error(error.message || "Organize failed. Please try again.");
    },
  });

  return {
    organize: (file: File, order: number[]) => mutation.mutate({ file, order }),
    result: mutation.data,
    progress,
    isOrganizing: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}
