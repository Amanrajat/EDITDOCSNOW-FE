export type DocumentStatus = "uploaded" | "extracted" | "saved" | "failed";

export interface DocumentBlock {
  id: string;
  page_number: number;
  text: string;
  bbox: [number, number, number, number];
  font_name: string;
  font_size: number;
  color: string;
  is_bold: boolean;
  is_italic: boolean;
  has_link: boolean;
}

export interface DocumentEntity {
  id: string;
  original_file: string;
  edited_file: string | null;
  original_name: string;
  file_type: string;
  file_size: number;
  total_pages: number;
  status: DocumentStatus;
  error_message: string;
  blocks: DocumentBlock[];
}

/** Only present in DocumentUploadView's response - never returned again afterwards. */
export type UploadResponse = DocumentEntity & { owner_token: string };

export type EditorObjectType =
  | "text"
  | "image"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "path";

export type FontFamily = "sans" | "serif" | "mono";
export type TextAlign = "left" | "center" | "right";

/** Matches apps.docs_editor.serializers.DocumentObjectSerializer's output shape. */
export interface EditorObjectDTO {
  id: string;
  page_number: number;
  object_type: EditorObjectType;
  z_index: number;
  bbox: [number, number, number, number] | [];
  points: [number, number][];
  rotation: number;
  opacity: number;
  fill_color: string;
  stroke_color: string;
  stroke_width: number;
  text_content: string;
  font_family: FontFamily;
  font_size: number;
  is_bold: boolean;
  is_italic: boolean;
  text_align: TextAlign;
  /** Absolute, token-gated URL to the image (via DocumentObjectImageView) - not a raw storage path. */
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Client-side working copy of an editor object. Extends the server DTO with
 * purely local bookkeeping: `isNew` marks an object never yet POSTed to the
 * backend (its `id` is a client-generated temp id, not a real UUID), and
 * `pendingImage`/`localImageUrl` hold an unsaved image upload's File and a
 * blob: preview URL until the object is reconciled with the server at save
 * time (see reconcileObjects in document.service.ts).
 */
export interface EditorObject extends EditorObjectDTO {
  isNew?: boolean;
  pendingImage?: File | null;
  localImageUrl?: string | null;
}

export type EditorTool =
  | "select"
  | "text"
  | "image"
  | "rectangle"
  | "ellipse"
  | "line"
  | "arrow"
  | "pen"
  | "highlighter"
  | "eraser";

/** Fields accepted by the create/update object endpoint (multipart or JSON). */
export type EditorObjectWritableFields = Partial<
  Omit<EditorObjectDTO, "id" | "image_url" | "created_at" | "updated_at">
>;

export interface ExtractResponse {
  document_id: string;
  total_blocks: number;
  blocks: DocumentBlock[];
}

export interface SaveBlockInput {
  id: string;
  text: string;
}

export interface SaveRequest {
  blocks: SaveBlockInput[];
}

export interface SaveResponse {
  document_id: string;
  download_url: string;
}
