"use client";

import { useMutation } from "@tanstack/react-query";
import { reconcileObjects, saveBlocks } from "@/services/document.service";
import { useDocumentStore } from "@/store/document.store";
import { useUIStore } from "@/store/ui.store";
import { useToast } from "@/components/toast/ToastProvider";
import type { SaveResponse } from "@/types/document";
import { ApiError } from "@/types/api";

export function useSave(documentId: string | undefined) {
  const toast = useToast();
  const getSaveableBlocks = useDocumentStore((state) => state.getSaveableBlocks);
  const markSaved = useDocumentStore((state) => state.markSaved);
  const setDownloadUrl = useDocumentStore((state) => state.setDownloadUrl);
  const setObjects = useDocumentStore((state) => state.setObjects);
  const getOwnerToken = useUIStore((state) => state.getOwnerToken);

  const mutation = useMutation<SaveResponse, ApiError, void>({
    mutationFn: async () => {
      if (!documentId) throw new ApiError("No document loaded.");
      const token = getOwnerToken(documentId);
      if (!token) throw new ApiError("No access token for this document.");

      // Objects are edited entirely client-side (like block text) and only
      // synced to the backend right before regenerating the PDF - reconcile
      // (create/update/delete) against the last-known-synced snapshot, then
      // adopt the server's authoritative post-sync list (real ids replace
      // client-temp ones) before triggering /save/, which renders whatever
      // objects currently exist server-side.
      const { objects, syncedObjects } = useDocumentStore.getState();
      const synced = await reconcileObjects(documentId, token, syncedObjects, objects);
      setObjects(synced);

      return saveBlocks(documentId, token, getSaveableBlocks());
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
