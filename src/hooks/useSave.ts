"use client";

import { useMutation } from "@tanstack/react-query";
import { saveBlocks } from "@/services/document.service";
import { useDocumentStore } from "@/store/document.store";
import { useToast } from "@/components/toast/ToastProvider";
import type { SaveResponse } from "@/types/document";
import { ApiError } from "@/types/api";

export function useSave(documentId: string | undefined) {
  const toast = useToast();
  const getSaveableBlocks = useDocumentStore((state) => state.getSaveableBlocks);
  const markSaved = useDocumentStore((state) => state.markSaved);
  const setDownloadUrl = useDocumentStore((state) => state.setDownloadUrl);

  const mutation = useMutation<SaveResponse, ApiError, void>({
    mutationFn: () => {
      if (!documentId) throw new ApiError("No document loaded.");
      return saveBlocks(documentId, getSaveableBlocks());
    },
    onSuccess: (result) => {
      setDownloadUrl(result.download_url);
      markSaved();
      toast.success("Changes saved. Your PDF is ready to download.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save changes.");
    },
  });

  return {
    save: mutation.mutate,
    saveAsync: mutation.mutateAsync,
    isSaving: mutation.isPending,
    error: mutation.error,
  };
}
