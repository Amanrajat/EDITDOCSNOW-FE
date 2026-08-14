import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentDocument {
  id: string;
  name: string;
  uploadedAt: number;
  totalPages: number;
}

interface UIState {
  recentDocuments: RecentDocument[];
  addRecentDocument: (doc: RecentDocument) => void;
  clearRecentDocuments: () => void;
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
    }),
    {
      name: "editdocsnow-ui",
      partialize: (state) => ({
        recentDocuments: state.recentDocuments,
      }),
    },
  ),
);
