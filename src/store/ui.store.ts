import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentDocument {
  id: string;
  name: string;
  uploadedAt: number;
  totalPages: number;
  /**
   * Bearer token for anonymous ownership of this document. Only ever
   * returned once, from the upload response - persisted here (not just in
   * the in-memory document store) so a page reload of /editor/[documentId]
   * doesn't lose access to a document the user just created.
   */
  ownerToken?: string;
}

interface UIState {
  recentDocuments: RecentDocument[];
  addRecentDocument: (doc: RecentDocument) => void;
  clearRecentDocuments: () => void;
  getOwnerToken: (documentId: string) => string | null;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      recentDocuments: [],

      addRecentDocument: (doc) => {
        const existing = get().recentDocuments.filter((d) => d.id !== doc.id);
        set({ recentDocuments: [doc, ...existing].slice(0, 8) });
      },
      clearRecentDocuments: () => set({ recentDocuments: [] }),
      getOwnerToken: (documentId) =>
        get().recentDocuments.find((d) => d.id === documentId)?.ownerToken ?? null,
    }),
    {
      name: "editdocsnow-ui",
      partialize: (state) => ({
        recentDocuments: state.recentDocuments,
      }),
    },
  ),
);
