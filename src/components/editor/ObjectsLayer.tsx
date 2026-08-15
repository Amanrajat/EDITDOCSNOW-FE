"use client";

import { useRef, useState } from "react";
import { useDocumentStore } from "@/store/document.store";
import { ObjectItem } from "@/components/editor/ObjectItem";
import { clampBBoxToPage, objectContainsPoint } from "@/utils/objectGeometry";
import {
  createImageObject,
  createPathObject,
  createShapeObject,
  createTextObject,
  nextZIndex,
} from "@/utils/objectDefaults";
import type { EditorObjectType } from "@/types/document";

interface ObjectsLayerProps {
  scale: number;
  pageWidth: number;
  pageHeight: number;
  currentPage: number;
}

const SHAPE_TOOLS: EditorObjectType[] = ["rectangle", "ellipse", "line", "arrow"];
const MIN_DRAG_PX = 3;

export function ObjectsLayer({ scale, pageWidth, pageHeight, currentPage }: ObjectsLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePointRef = useRef<[number, number] | null>(null);

  const [draftRect, setDraftRect] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  const objects = useDocumentStore((state) => state.objects);
  const selectedObjectId = useDocumentStore((state) => state.selectedObjectId);
  const currentTool = useDocumentStore((state) => state.currentTool);
  const selectObject = useDocumentStore((state) => state.selectObject);
  const addObject = useDocumentStore((state) => state.addObject);
  const removeObject = useDocumentStore((state) => state.removeObject);
  const setTool = useDocumentStore((state) => state.setTool);

  const pageObjects = objects.filter((o) => o.page_number === currentPage).sort((a, b) => a.z_index - b.z_index);

  function toPagePoint(clientX: number, clientY: number): [number, number] {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box) return [0, 0];
    return [(clientX - box.left) / scale, (clientY - box.top) / scale];
  }

  function handleContainerPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    // Only reached while a drawing tool is active - see the pointerEvents
    // toggle below. In "select" mode the container is pointer-events:none
    // so clicks pass through to whatever's underneath (block-text
    // textareas), and only individual ObjectItems (pointer-events:auto)
    // intercept clicks.
    if (currentTool === "image") {
      imagePointRef.current = toPagePoint(event.clientX, event.clientY);
      fileInputRef.current?.click();
      return;
    }

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const [startX, startY] = toPagePoint(event.clientX, event.clientY);

    if (SHAPE_TOOLS.includes(currentTool as EditorObjectType)) {
      setDraftRect({ x0: startX, y0: startY, x1: startX, y1: startY });

      function onMove(ev: PointerEvent) {
        const box = containerRef.current?.getBoundingClientRect();
        if (!box) return;
        const x1 = (ev.clientX - box.left) / scale;
        const y1 = (ev.clientY - box.top) / scale;
        setDraftRect({ x0: startX, y0: startY, x1, y1 });
      }

      function onUp(ev: PointerEvent) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);

        const box = containerRef.current?.getBoundingClientRect();
        const endX = box ? (ev.clientX - box.left) / scale : startX;
        const endY = box ? (ev.clientY - box.top) / scale : startY;
        setDraftRect(null);

        const dxPx = Math.abs(endX - startX) * scale;
        const dyPx = Math.abs(endY - startY) * scale;
        const x0 = Math.min(startX, endX);
        const y0 = Math.min(startY, endY);
        let x1 = Math.max(startX, endX);
        let y1 = Math.max(startY, endY);
        if (dxPx < MIN_DRAG_PX && dyPx < MIN_DRAG_PX) {
          x1 = x0 + 120;
          y1 = y0 + 80;
        }

        const bbox = clampBBoxToPage([x0, y0, x1, y1], pageWidth, pageHeight);
        addObject(
          createShapeObject(
            currentTool as "rectangle" | "ellipse" | "line" | "arrow",
            currentPage,
            bbox,
            nextZIndex(objects, currentPage),
          ),
        );
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return;
    }

    if (currentTool === "text") {
      const bbox = clampBBoxToPage(
        [startX - 80, startY - 15, startX + 80, startY + 15],
        pageWidth,
        pageHeight,
      );
      addObject(createTextObject(currentPage, bbox, nextZIndex(objects, currentPage)));
      return;
    }

    if (currentTool === "pen" || currentTool === "highlighter") {
      let points: [number, number][] = [[startX, startY]];

      function onMove(ev: PointerEvent) {
        const box = containerRef.current?.getBoundingClientRect();
        if (!box) return;
        const x = (ev.clientX - box.left) / scale;
        const y = (ev.clientY - box.top) / scale;
        const last = points[points.length - 1];
        if (!last || Math.hypot((x - last[0]) * scale, (y - last[1]) * scale) >= 2) {
          points = [...points, [x, y]];
        }
      }

      function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (points.length >= 2) {
          addObject(
            createPathObject("path", currentPage, points, nextZIndex(objects, currentPage), currentTool === "highlighter"),
          );
        }
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      return;
    }

    if (currentTool === "eraser") {
      const erased = new Set<string>();

      function eraseAt(clientX: number, clientY: number) {
        const [x, y] = toPagePoint(clientX, clientY);
        for (const object of pageObjects) {
          if (erased.has(object.id)) continue;
          if (objectContainsPoint(object, x, y)) {
            erased.add(object.id);
            removeObject(object.id);
          }
        }
      }

      eraseAt(event.clientX, event.clientY);

      function onMove(ev: PointerEvent) {
        eraseAt(ev.clientX, ev.clientY);
      }
      function onUp() {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }
  }

  function handleImageFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    const point = imagePointRef.current;
    imagePointRef.current = null;
    if (!file || !point) {
      setTool("select");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    const [cx, cy] = point;
    const bbox = clampBBoxToPage([cx - 90, cy - 90, cx + 90, cy + 90], pageWidth, pageHeight);
    addObject(createImageObject(currentPage, bbox, nextZIndex(objects, currentPage), file, localUrl));
  }

  const isDrawingTool = currentTool !== "select";

  return (
    <div
      ref={containerRef}
      data-objects-layer=""
      className="absolute inset-0"
      style={{ pointerEvents: isDrawingTool ? "auto" : "none", cursor: isDrawingTool ? "crosshair" : "default" }}
      onPointerDown={handleContainerPointerDown}
    >
      {pageObjects.map((object) => (
        <ObjectItem
          key={object.id}
          object={object}
          scale={scale}
          pageWidth={pageWidth}
          pageHeight={pageHeight}
          isSelected={selectedObjectId === object.id}
          isInteractive={currentTool === "select"}
          onSelect={() => selectObject(object.id)}
        />
      ))}

      {draftRect && (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-primary bg-primary/10"
          style={{
            left: Math.min(draftRect.x0, draftRect.x1) * scale,
            top: Math.min(draftRect.y0, draftRect.y1) * scale,
            width: Math.abs(draftRect.x1 - draftRect.x0) * scale,
            height: Math.abs(draftRect.y1 - draftRect.y0) * scale,
          }}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleImageFileChange}
      />
    </div>
  );
}
