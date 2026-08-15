import { api } from "@/lib/api";
import type {
  DocumentEntity,
  EditorObject,
  EditorObjectDTO,
  EditorObjectWritableFields,
  ExtractResponse,
  SaveBlockInput,
  SaveResponse,
  UploadResponse,
} from "@/types/document";

export const MAX_UPLOAD_SIZE_BYTES = 20 * 1024 * 1024;

export function validatePdfFile(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Only PDF files are supported.";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return "File exceeds the 20MB size limit.";
  return null;
}

export async function uploadPDF(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("original_file", file);

  const { data } = await api.post<UploadResponse>("/upload/", formData, {
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  return data;
}

export async function extractBlocks(documentId: string, token: string): Promise<ExtractResponse> {
  const { data } = await api.post<ExtractResponse>(`/${documentId}/extract/`, undefined, {
    params: { token },
  });
  return data;
}

export async function getDocument(documentId: string, token: string): Promise<DocumentEntity> {
  const { data } = await api.get<DocumentEntity>(`/${documentId}/`, { params: { token } });
  return data;
}

export async function saveBlocks(
  documentId: string,
  token: string,
  blocks: SaveBlockInput[],
): Promise<SaveResponse> {
  const { data } = await api.post<SaveResponse>(
    `/${documentId}/save/`,
    { blocks },
    { params: { token } },
  );
  return data;
}

export async function listObjects(documentId: string, token: string): Promise<EditorObjectDTO[]> {
  const { data } = await api.get<EditorObjectDTO[]>(`/${documentId}/objects/`, {
    params: { token },
  });
  return data;
}

function buildObjectFormData(fields: EditorObjectWritableFields, image?: File | null): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (key === "bbox" || key === "points") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  if (image) formData.append("image", image);

  return formData;
}

export async function createObject(
  documentId: string,
  token: string,
  fields: EditorObjectWritableFields,
  image?: File | null,
): Promise<EditorObjectDTO> {
  const { data } = await api.post<EditorObjectDTO>(
    `/${documentId}/objects/`,
    buildObjectFormData(fields, image),
    { params: { token } },
  );
  return data;
}

export async function updateObject(
  documentId: string,
  token: string,
  objectId: string,
  fields: EditorObjectWritableFields,
  image?: File | null,
): Promise<EditorObjectDTO> {
  const { data } = await api.patch<EditorObjectDTO>(
    `/${documentId}/objects/${objectId}/`,
    buildObjectFormData(fields, image),
    { params: { token } },
  );
  return data;
}

export async function deleteObject(documentId: string, token: string, objectId: string): Promise<void> {
  await api.delete(`/${documentId}/objects/${objectId}/`, { params: { token } });
}

const OBJECT_FIELD_KEYS: (keyof EditorObjectWritableFields)[] = [
  "page_number",
  "object_type",
  "z_index",
  "bbox",
  "points",
  "rotation",
  "opacity",
  "fill_color",
  "stroke_color",
  "stroke_width",
  "text_content",
  "font_family",
  "font_size",
  "is_bold",
  "is_italic",
  "text_align",
];

function toWritableFields(object: EditorObject): EditorObjectWritableFields {
  const fields: EditorObjectWritableFields = {};
  for (const key of OBJECT_FIELD_KEYS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fields as any)[key] = object[key];
  }
  return fields;
}

function hasObjectChanged(previous: EditorObject, next: EditorObject): boolean {
  if (next.pendingImage) return true;
  return OBJECT_FIELD_KEYS.some((key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]));
}

/**
 * Objects are edited entirely client-side (like block text edits) and only
 * synced to the backend right before the final /save/ call, diffed against
 * `previous` (the last-known-synced snapshot, captured after load/extract or
 * the previous save). Returns the authoritative post-sync list, refetched
 * from the server so client-temp ids are replaced with real ones.
 */
export async function reconcileObjects(
  documentId: string,
  token: string,
  previous: EditorObject[],
  current: EditorObject[],
): Promise<EditorObjectDTO[]> {
  const previousById = new Map(previous.map((o) => [o.id, o]));
  const currentById = new Map(current.map((o) => [o.id, o]));

  const toCreate = current.filter((o) => o.isNew);
  const toUpdate = current.filter((o) => {
    if (o.isNew) return false;
    const prior = previousById.get(o.id);
    return prior !== undefined && hasObjectChanged(prior, o);
  });
  const toDelete = previous.filter((o) => !o.isNew && !currentById.has(o.id));

  await Promise.all([
    ...toCreate.map((o) => createObject(documentId, token, toWritableFields(o), o.pendingImage)),
    ...toUpdate.map((o) => updateObject(documentId, token, o.id, toWritableFields(o), o.pendingImage)),
    ...toDelete.map((o) => deleteObject(documentId, token, o.id)),
  ]);

  return listObjects(documentId, token);
}

export const documentService = {
  uploadPDF,
  extractBlocks,
  getDocument,
  saveBlocks,
  validatePdfFile,
  listObjects,
  createObject,
  updateObject,
  deleteObject,
  reconcileObjects,
};
