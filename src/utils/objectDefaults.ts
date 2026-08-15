import type { EditorObject, EditorObjectType } from "@/types/document";

let counter = 0;

/** Client-generated temp id for a not-yet-synced object; replaced with a real UUID once reconciled. */
export function newClientObjectId(): string {
  counter += 1;
  return `obj-tmp-${Date.now()}-${counter}`;
}

const BASE_DEFAULTS: Omit<EditorObject, "id" | "page_number" | "object_type" | "bbox" | "points"> = {
  z_index: 0,
  rotation: 0,
  opacity: 1,
  fill_color: "",
  stroke_color: "#1f2937",
  stroke_width: 2,
  text_content: "",
  font_family: "sans",
  font_size: 16,
  is_bold: false,
  is_italic: false,
  text_align: "left",
  image_url: null,
  created_at: "",
  updated_at: "",
  isNew: true,
};

/** Next-highest z_index among existing objects on a page, so new objects always land on top. */
export function nextZIndex(objects: EditorObject[], pageNumber: number): number {
  const siblings = objects.filter((o) => o.page_number === pageNumber);
  if (siblings.length === 0) return 0;
  return Math.max(...siblings.map((o) => o.z_index)) + 1;
}

export function createShapeObject(
  type: Extract<EditorObjectType, "rectangle" | "ellipse" | "line" | "arrow">,
  pageNumber: number,
  bbox: [number, number, number, number],
  zIndex: number,
): EditorObject {
  return {
    ...BASE_DEFAULTS,
    id: newClientObjectId(),
    page_number: pageNumber,
    object_type: type,
    bbox,
    points: [],
    z_index: zIndex,
    fill_color: type === "rectangle" || type === "ellipse" ? "#3b82f6" : "",
    opacity: type === "rectangle" || type === "ellipse" ? 0.4 : 1,
  };
}

export function createTextObject(
  pageNumber: number,
  bbox: [number, number, number, number],
  zIndex: number,
): EditorObject {
  return {
    ...BASE_DEFAULTS,
    id: newClientObjectId(),
    page_number: pageNumber,
    object_type: "text",
    bbox,
    points: [],
    z_index: zIndex,
    text_content: "New text",
    stroke_color: "#111827",
  };
}

export function createPathObject(
  type: Extract<EditorObjectType, "path">,
  pageNumber: number,
  points: [number, number][],
  zIndex: number,
  isHighlighter: boolean,
): EditorObject {
  return {
    ...BASE_DEFAULTS,
    id: newClientObjectId(),
    page_number: pageNumber,
    object_type: type,
    bbox: [],
    points,
    z_index: zIndex,
    stroke_color: isHighlighter ? "#fde047" : "#111827",
    stroke_width: isHighlighter ? 14 : 2.5,
    opacity: isHighlighter ? 0.4 : 1,
  };
}

export function createImageObject(
  pageNumber: number,
  bbox: [number, number, number, number],
  zIndex: number,
  file: File,
  localUrl: string,
): EditorObject {
  return {
    ...BASE_DEFAULTS,
    id: newClientObjectId(),
    page_number: pageNumber,
    object_type: "image",
    bbox,
    points: [],
    z_index: zIndex,
    pendingImage: file,
    localImageUrl: localUrl,
  };
}
