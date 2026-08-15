import { create } from "zustand";
import type { DocumentBlock, DocumentEntity, EditorObject, EditorObjectDTO, EditorTool } from "@/types/document";

interface BlockHistoryEntry {
  kind: "block";
  blockId: string;
  previousText: string;
  nextText: string;
}

/**
 * A single entry covers add/update/delete/reorder for objects uniformly:
 * `previous === null` means the object didn't exist before this entry (undo
 * removes it); `next === null` means the object no longer exists after this
 * entry (undo restores `previous`). Anything else is a plain before/after
 * field change (move/resize/rotate/restyle/reorder/text edit).
 */
interface ObjectHistoryEntry {
  kind: "object";
  objectId: string;
  previous: EditorObject | null;
  next: EditorObject | null;
}

type HistoryEntry = BlockHistoryEntry | ObjectHistoryEntry;

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
  lastObjectEditAt: number | null;

  objects: EditorObject[];
  syncedObjects: EditorObject[];
  objectsDirty: boolean;
  selectedObjectId: string | null;
  currentTool: EditorTool;
  dragSnapshot: EditorObject | null;

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

  setObjects: (objects: EditorObjectDTO[]) => void;
  addObject: (object: EditorObject) => void;
  updateObjectImmediate: (objectId: string, patch: Partial<EditorObject>) => void;
  updateObjectText: (objectId: string, text: string) => void;
  beginObjectEdit: (objectId: string) => void;
  updateObjectLive: (objectId: string, patch: Partial<EditorObject>) => void;
  commitObjectEdit: (objectId: string) => void;
  removeObject: (objectId: string) => void;
  reorderObject: (objectId: string, direction: "front" | "back" | "forward" | "backward") => void;
  selectObject: (objectId: string | null) => void;
  setTool: (tool: EditorTool) => void;
  duplicateObject: (objectId: string) => void;
  getSelectedObject: () => EditorObject | null;
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
  lastObjectEditAt: null,
  objects: [],
  syncedObjects: [],
  objectsDirty: false,
  selectedObjectId: null,
  currentTool: "select" as EditorTool,
  dragSnapshot: null,
} satisfies Partial<DocumentState>;

const UNDO_COALESCE_MS = 800;

function toEditorObject(dto: EditorObjectDTO): EditorObject {
  return { ...dto };
}

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
      objects: [],
      syncedObjects: [],
      objectsDirty: false,
      selectedObjectId: null,
      currentTool: "select",
    }),

  setBlocks: (blocks) => set({ blocks, editedText: {}, undoStack: [], redoStack: [] }),

  updateBlockText: (blockId, text) => {
    const state = get();
    const previousText = state.getBlockText(blockId);
    if (previousText === text) return;

    const now = Date.now();
    const lastEntry = state.undoStack.at(-1);
    const canCoalesce =
      lastEntry?.kind === "block" &&
      lastEntry.blockId === blockId &&
      state.lastEditAt !== null &&
      now - state.lastEditAt < UNDO_COALESCE_MS;

    const undoStack = canCoalesce
      ? [...state.undoStack.slice(0, -1), { ...(lastEntry as BlockHistoryEntry), nextText: text }]
      : [...state.undoStack, { kind: "block" as const, blockId, previousText, nextText: text }];

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
    const { undoStack, redoStack, objects } = get();
    const entry = undoStack.at(-1);
    if (!entry) return;

    if (entry.kind === "block") {
      set({
        editedText: { ...get().editedText, [entry.blockId]: entry.previousText },
        undoStack: undoStack.slice(0, -1),
        redoStack: [...redoStack, entry],
      });
      return;
    }

    let nextObjects: EditorObject[];
    if (entry.previous === null) {
      nextObjects = objects.filter((o) => o.id !== entry.objectId);
    } else if (objects.some((o) => o.id === entry.objectId)) {
      nextObjects = objects.map((o) => (o.id === entry.objectId ? entry.previous! : o));
    } else {
      nextObjects = [...objects, entry.previous];
    }

    set({
      objects: nextObjects,
      selectedObjectId: entry.previous ? entry.objectId : null,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, entry],
      objectsDirty: true,
    });
  },

  redo: () => {
    const { undoStack, redoStack, objects } = get();
    const entry = redoStack.at(-1);
    if (!entry) return;

    if (entry.kind === "block") {
      set({
        editedText: { ...get().editedText, [entry.blockId]: entry.nextText },
        redoStack: redoStack.slice(0, -1),
        undoStack: [...undoStack, entry],
      });
      return;
    }

    let nextObjects: EditorObject[];
    if (entry.next === null) {
      nextObjects = objects.filter((o) => o.id !== entry.objectId);
    } else if (objects.some((o) => o.id === entry.objectId)) {
      nextObjects = objects.map((o) => (o.id === entry.objectId ? entry.next! : o));
    } else {
      nextObjects = [...objects, entry.next];
    }

    set({
      objects: nextObjects,
      selectedObjectId: entry.next ? entry.objectId : null,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, entry],
      objectsDirty: true,
    });
  },

  markSaved: () => set({ lastSavedAt: Date.now(), undoStack: [], redoStack: [], objectsDirty: false }),

  resetEdits: () =>
    set((state) => ({
      editedText: {},
      undoStack: [],
      redoStack: [],
      objects: state.syncedObjects,
      selectedObjectId: null,
      objectsDirty: false,
    })),

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

  isDirty: () => Object.keys(get().editedText).length > 0 || get().objectsDirty,

  setObjects: (dtos) => {
    const objects = dtos.map(toEditorObject);
    set({
      objects,
      syncedObjects: objects,
      objectsDirty: false,
      selectedObjectId: null,
      undoStack: get().undoStack.filter((e) => e.kind === "block"),
      redoStack: get().redoStack.filter((e) => e.kind === "block"),
    });
  },

  addObject: (object) => {
    const state = get();
    set({
      objects: [...state.objects, object],
      selectedObjectId: object.id,
      currentTool: "select",
      undoStack: [...state.undoStack, { kind: "object", objectId: object.id, previous: null, next: object }],
      redoStack: [],
      objectsDirty: true,
    });
  },

  updateObjectImmediate: (objectId, patch) => {
    const state = get();
    const current = state.objects.find((o) => o.id === objectId);
    if (!current) return;
    const previous = { ...current };
    const next = { ...current, ...patch };
    if (JSON.stringify(previous) === JSON.stringify(next)) return;

    set({
      objects: state.objects.map((o) => (o.id === objectId ? next : o)),
      undoStack: [...state.undoStack, { kind: "object", objectId, previous, next }],
      redoStack: [],
      objectsDirty: true,
    });
  },

  updateObjectText: (objectId, text) => {
    const state = get();
    const current = state.objects.find((o) => o.id === objectId);
    if (!current || current.text_content === text) return;

    const now = Date.now();
    const lastEntry = state.undoStack.at(-1);
    const canCoalesce =
      lastEntry?.kind === "object" &&
      lastEntry.objectId === objectId &&
      lastEntry.next?.object_type === "text" &&
      state.lastObjectEditAt !== null &&
      now - state.lastObjectEditAt < UNDO_COALESCE_MS;

    const next = { ...current, text_content: text };

    const undoStack = canCoalesce
      ? [...state.undoStack.slice(0, -1), { ...(lastEntry as ObjectHistoryEntry), next }]
      : [...state.undoStack, { kind: "object" as const, objectId, previous: { ...current }, next }];

    set({
      objects: state.objects.map((o) => (o.id === objectId ? next : o)),
      undoStack,
      redoStack: [],
      objectsDirty: true,
      lastObjectEditAt: now,
    });
  },

  beginObjectEdit: (objectId) => {
    const current = get().objects.find((o) => o.id === objectId);
    set({ dragSnapshot: current ? { ...current } : null });
  },

  updateObjectLive: (objectId, patch) => {
    const state = get();
    set({
      objects: state.objects.map((o) => (o.id === objectId ? { ...o, ...patch } : o)),
    });
  },

  commitObjectEdit: (objectId) => {
    const state = get();
    const snapshot = state.dragSnapshot;
    const current = state.objects.find((o) => o.id === objectId);
    if (!snapshot || !current || snapshot.id !== objectId) {
      set({ dragSnapshot: null });
      return;
    }
    if (JSON.stringify(snapshot) === JSON.stringify(current)) {
      set({ dragSnapshot: null });
      return;
    }
    set({
      dragSnapshot: null,
      undoStack: [...state.undoStack, { kind: "object", objectId, previous: snapshot, next: { ...current } }],
      redoStack: [],
      objectsDirty: true,
    });
  },

  removeObject: (objectId) => {
    const state = get();
    const current = state.objects.find((o) => o.id === objectId);
    if (!current) return;
    set({
      objects: state.objects.filter((o) => o.id !== objectId),
      selectedObjectId: state.selectedObjectId === objectId ? null : state.selectedObjectId,
      undoStack: [...state.undoStack, { kind: "object", objectId, previous: current, next: null }],
      redoStack: [],
      objectsDirty: true,
    });
  },

  reorderObject: (objectId, direction) => {
    const state = get();
    const current = state.objects.find((o) => o.id === objectId);
    if (!current) return;

    const siblings = [...state.objects]
      .filter((o) => o.page_number === current.page_number)
      .sort((a, b) => a.z_index - b.z_index);
    const idx = siblings.findIndex((o) => o.id === objectId);

    if (direction === "front") {
      const maxZ = Math.max(...siblings.map((o) => o.z_index));
      if (current.z_index < maxZ) get().updateObjectImmediate(objectId, { z_index: maxZ + 1 });
    } else if (direction === "back") {
      const minZ = Math.min(...siblings.map((o) => o.z_index));
      if (current.z_index > minZ) get().updateObjectImmediate(objectId, { z_index: minZ - 1 });
    } else if (direction === "forward" && idx >= 0 && idx < siblings.length - 1) {
      const neighbor = siblings[idx + 1];
      if (neighbor) {
        get().updateObjectImmediate(objectId, { z_index: neighbor.z_index });
        get().updateObjectImmediate(neighbor.id, { z_index: current.z_index });
      }
    } else if (direction === "backward" && idx > 0) {
      const neighbor = siblings[idx - 1];
      if (neighbor) {
        get().updateObjectImmediate(objectId, { z_index: neighbor.z_index });
        get().updateObjectImmediate(neighbor.id, { z_index: current.z_index });
      }
    }
  },

  selectObject: (objectId) => set({ selectedObjectId: objectId }),
  setTool: (tool) => set({ currentTool: tool, selectedObjectId: tool === "select" ? get().selectedObjectId : null }),

  duplicateObject: (objectId) => {
    const state = get();
    const current = state.objects.find((o) => o.id === objectId);
    if (!current) return;
    const offset = 16;
    const duplicated: EditorObject = {
      ...current,
      id: `obj-${crypto.randomUUID()}`,
      isNew: true,
      bbox:
        current.bbox.length === 4
          ? [current.bbox[0] + offset, current.bbox[1] + offset, current.bbox[2] + offset, current.bbox[3] + offset]
          : current.bbox,
      points: current.points.map(([x, y]) => [x + offset, y + offset] as [number, number]),
    };
    get().addObject(duplicated);
  },

  getSelectedObject: () => {
    const state = get();
    return state.objects.find((o) => o.id === state.selectedObjectId) ?? null;
  },
}));
