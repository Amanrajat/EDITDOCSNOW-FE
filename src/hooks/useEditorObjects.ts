"use client";

import { useMutation } from "@tanstack/react-query";
import { listObjects } from "@/services/document.service";
import { useDocumentStore } from "@/store/document.store";
import { useUIStore } from "@/store/ui.store";
import { useToast } from "@/components/toast/ToastProvider";
import type { EditorObjectDTO } from "@/types/document";
import { ApiError } from "@/types/api";

/** Fetches the current set of editor-added objects (text/image/shapes/paths) for a document. */
export function useEditorObjects() {
  const toast = useToast();
  const setObjects = useDocumentStore((state) => state.setObjects);
  const getOwnerToken = useUIStore((state) => state.getOwnerToken);

  const mutation = useMutation<EditorObjectDTO[], ApiError, string>({
    mutationFn: (documentId: string) => {
      const token = getOwnerToken(documentId);
      if (!token) throw new ApiError("No access token for this document.");
      return listObjects(documentId, token);
    },
    onSuccess: (objects) => setObjects(objects),
    onError: (error) => {
      toast.error(error.message || "Failed to load editor objects.");
    },
  });

  return {
    loadObjects: mutation.mutate,
    isLoadingObjects: mutation.isPending,
    error: mutation.error,
  };
}
