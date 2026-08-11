import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentDocument {
  id: string;
  name: string;
  uploadedAt: number;
  totalPages: number;
}

interface UIState {
  theme: "light" | "dark";
  recentDocuments: RecentDocument[];
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  addRecentDocument: (doc: RecentDocument) => void;
  clearRecentDocuments: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "light",
      recentDocuments: [],

      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setTheme: (theme) => set({ theme }),

      addRecentDocument: (doc) => {
        const existing = get().recentDocuments.filter((d) => d.id !== doc.id);
        set({ recentDocuments: [doc, ...existing].slice(0, 8) });
      },
      clearRecentDocuments: () => set({ recentDocuments: [] }),
    }),
    {
      name: "editdocsnow-ui",
      partialize: (state) => ({
        theme: state.theme,
        recentDocuments: state.recentDocuments,
      }),
    },
  ),
);
