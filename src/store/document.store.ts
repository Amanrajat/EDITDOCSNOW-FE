import { create } from "zustand";
import type { DocumentBlock, DocumentEntity } from "@/types/document";

interface HistoryEntry {
  blockId: string;
  previousText: string;
  nextText: string;
}

interface DocumentState {
  document: DocumentEntity | null;
  blocks: DocumentBlock[];
  editedText: Record<string, string>;
  selectedBlockId: string | null;
  searchQuery: string;
  currentPage: number;
  zoom: number;
  downloadUrl: string | null;
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];
  lastSavedAt: number | null;
  lastEditAt: number | null;

  setDocument: (document: DocumentEntity) => void;
  setBlocks: (blocks: DocumentBlock[]) => void;
  updateBlockText: (blockId: string, text: string) => void;
  selectBlock: (blockId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  setZoom: (zoom: number) => void;
  setDownloadUrl: (url: string | null) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
  resetEdits: () => void;
  reset: () => void;

  getBlockText: (blockId: string) => string;
  getSaveableBlocks: () => { id: string; text: string }[];
  isDirty: () => boolean;
}

const initialState = {
  document: null,
  blocks: [],
  editedText: {},
  selectedBlockId: null,
  searchQuery: "",
  currentPage: 0,
  zoom: 1,
  downloadUrl: null,
  undoStack: [],
  redoStack: [],
  lastSavedAt: null,
  lastEditAt: null,
} satisfies Partial<DocumentState>;

const UNDO_COALESCE_MS = 800;

export const useDocumentStore = create<DocumentState>((set, get) => ({
  ...initialState,

  setDocument: (document) =>
    set({
      document,
      blocks: document.blocks ?? [],
      editedText: {},
      undoStack: [],
      redoStack: [],
      downloadUrl: document.edited_file,
    }),

  setBlocks: (blocks) => set({ blocks, editedText: {}, undoStack: [], redoStack: [] }),

  updateBlockText: (blockId, text) => {
    const state = get();
    const previousText = state.getBlockText(blockId);
    if (previousText === text) return;

    const now = Date.now();
    const lastEntry = state.undoStack.at(-1);
    const canCoalesce =
      lastEntry?.blockId === blockId &&
      state.lastEditAt !== null &&
      now - state.lastEditAt < UNDO_COALESCE_MS;

    const undoStack = canCoalesce
      ? [...state.undoStack.slice(0, -1), { ...lastEntry, nextText: text }]
      : [...state.undoStack, { blockId, previousText, nextText: text }];

    set({
      editedText: { ...state.editedText, [blockId]: text },
      undoStack,
      redoStack: [],
      lastEditAt: now,
    });
  },

  selectBlock: (blockId) => set({ selectedBlockId: blockId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setZoom: (zoom) => set({ zoom: Math.min(Math.max(zoom, 0.25), 4) }),
  setDownloadUrl: (downloadUrl) => set({ downloadUrl }),

  undo: () => {
    const { undoStack, redoStack } = get();
    const entry = undoStack.at(-1);
    if (!entry) return;
    set({
      editedText: { ...get().editedText, [entry.blockId]: entry.previousText },
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, entry],
    });
  },

  redo: () => {
    const { undoStack, redoStack } = get();
    const entry = redoStack.at(-1);
    if (!entry) return;
    set({
      editedText: { ...get().editedText, [entry.blockId]: entry.nextText },
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, entry],
    });
  },

  markSaved: () => set({ lastSavedAt: Date.now(), undoStack: [], redoStack: [] }),

  resetEdits: () => set({ editedText: {}, undoStack: [], redoStack: [] }),

  reset: () => set({ ...initialState }),

  getBlockText: (blockId) => {
    const state = get();
    if (blockId in state.editedText) return state.editedText[blockId] ?? "";
    return state.blocks.find((block) => block.id === blockId)?.text ?? "";
  },

  getSaveableBlocks: () => {
    const state = get();
    return state.blocks.map((block) => ({
      id: block.id,
      text: state.editedText[block.id] ?? block.text,
    }));
  },

  isDirty: () => Object.keys(get().editedText).length > 0,
}));
