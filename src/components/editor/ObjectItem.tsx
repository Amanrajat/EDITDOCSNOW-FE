"use client";

import { useRef, useState } from "react";
import { useDocumentStore } from "@/store/document.store";
import {
  angleFromCenter,
  pathBounds,
  resizeBBoxCorner,
  scaleObjectRect,
  screenDeltaToLocal,
  translateBBox,
  type ResizeCorner,
} from "@/utils/objectGeometry";
import { toCssColor } from "@/utils/color";
import { cn } from "@/utils/cn";
import type { EditorObject } from "@/types/document";

interface ObjectItemProps {
  object: EditorObject;
  scale: number;
  pageWidth: number;
  pageHeight: number;
  isSelected: boolean;
  isInteractive: boolean;
  onSelect: () => void;
}

const RESIZE_HANDLES: { corner: ResizeCorner; className: string; cursor: string }[] = [
  { corner: "nw", className: "-left-1.5 -top-1.5", cursor: "nwse-resize" },
  { corner: "ne", className: "-right-1.5 -top-1.5", cursor: "nesw-resize" },
  { corner: "sw", className: "-left-1.5 -bottom-1.5", cursor: "nesw-resize" },
  { corner: "se", className: "-right-1.5 -bottom-1.5", cursor: "nwse-resize" },
];

const FONT_STACKS: Record<string, string> = {
  sans: "var(--font-sans, system-ui), sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "'Courier New', monospace",
};

export function ObjectItem({
  object,
  scale,
  pageWidth,
  pageHeight,
  isSelected,
  isInteractive,
  onSelect,
}: ObjectItemProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [isEditingText, setIsEditingText] = useState(false);

  const beginObjectEdit = useDocumentStore((state) => state.beginObjectEdit);
  const updateObjectLive = useDocumentStore((state) => state.updateObjectLive);
  const commitObjectEdit = useDocumentStore((state) => state.commitObjectEdit);
  const updateObjectText = useDocumentStore((state) => state.updateObjectText);

  const isPath = object.object_type === "path";
  const bounds = isPath ? pathBounds(object.points) : (object.bbox as [number, number, number, number]);
  const rect = scaleObjectRect(bounds, scale);

  function handleBodyPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!isInteractive) return;
    if (object.object_type === "text" && isEditingText) return;
    event.stopPropagation();
    onSelect();

    const pointerId = event.pointerId;
    const target = event.currentTarget;
    target.setPointerCapture(pointerId);
    const startX = event.clientX;
    const startY = event.clientY;
    const startBbox = object.bbox;
    const startPoints = object.points;

    beginObjectEdit(object.id);

    function onMove(ev: PointerEvent) {
      const dxPx = ev.clientX - startX;
      const dyPx = ev.clientY - startY;
      const dx = dxPx / scale;
      const dy = dyPx / scale;

      if (isPath) {
        updateObjectLive(object.id, {
          points: startPoints.map(([x, y]) => [x + dx, y + dy] as [number, number]),
        });
      } else {
        updateObjectLive(object.id, {
          bbox: translateBBox(startBbox as [number, number, number, number], dx, dy, pageWidth, pageHeight),
        });
      }
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      commitObjectEdit(object.id);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleResizePointerDown(event: React.PointerEvent<HTMLDivElement>, corner: ResizeCorner) {
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const startBbox = object.bbox as [number, number, number, number];
    const rotation = object.rotation;

    beginObjectEdit(object.id);

    function onMove(ev: PointerEvent) {
      const dxPx = ev.clientX - startX;
      const dyPx = ev.clientY - startY;
      const [localDxPx, localDyPx] = screenDeltaToLocal(dxPx, dyPx, rotation);
      const dx = localDxPx / scale;
      const dy = localDyPx / scale;
      updateObjectLive(object.id, {
        bbox: resizeBBoxCorner(startBbox, corner, dx, dy, pageWidth, pageHeight),
      });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      commitObjectEdit(object.id);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function handleRotatePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.stopPropagation();
    const frameEl = frameRef.current;
    if (!frameEl) return;
    const box = frameEl.getBoundingClientRect();
    const center: [number, number] = [box.left + box.width / 2, box.top + box.height / 2];

    beginObjectEdit(object.id);

    function onMove(ev: PointerEvent) {
      const angle = angleFromCenter(center, [ev.clientX, ev.clientY]);
      updateObjectLive(object.id, { rotation: Math.round(angle) });
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      commitObjectEdit(object.id);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function renderContent() {
    switch (object.object_type) {
      case "rectangle":
      case "ellipse":
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              backgroundColor: object.fill_color ? toCssColor(object.fill_color) : "transparent",
              border: `${Math.max(object.stroke_width * scale, 1)}px solid ${toCssColor(object.stroke_color)}`,
              borderRadius: object.object_type === "ellipse" ? "50%" : 0,
            }}
          />
        );
      case "line":
      case "arrow": {
        const strokeWidth = Math.max(object.stroke_width * scale, 1);
        const markerId = `arrowhead-${object.id}`;
        return (
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {object.object_type === "arrow" && (
              <defs>
                <marker
                  id={markerId}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="4"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M0,0 L8,4 L0,8 Z" fill={toCssColor(object.stroke_color)} />
                </marker>
              </defs>
            )}
            <line
              x1={0}
              y1={0}
              x2={rect.width}
              y2={rect.height}
              stroke={toCssColor(object.stroke_color)}
              strokeWidth={strokeWidth}
              markerEnd={object.object_type === "arrow" ? `url(#${markerId})` : undefined}
            />
          </svg>
        );
      }
      case "path": {
        const [bx0, by0] = bounds;
        const localPoints = object.points.map(([x, y]) => `${(x - bx0) * scale},${(y - by0) * scale}`).join(" ");
        return (
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <polyline
              points={localPoints}
              fill="none"
              stroke={toCssColor(object.stroke_color)}
              strokeWidth={Math.max(object.stroke_width * scale, 1)}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      }
      case "image": {
        const src = object.localImageUrl ?? object.image_url ?? "";
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "fill", userSelect: "none" }}
          />
        );
      }
      case "text":
        return isEditingText ? (
          <textarea
            autoFocus
            value={object.text_content}
            onChange={(e) => updateObjectText(object.id, e.target.value)}
            onBlur={() => setIsEditingText(false)}
            onPointerDown={(e) => e.stopPropagation()}
            spellCheck={false}
            style={{
              width: "100%",
              height: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              padding: 2,
              fontFamily: FONT_STACKS[object.font_family],
              fontSize: Math.max(object.font_size * scale, 4),
              fontWeight: object.is_bold ? 700 : 400,
              fontStyle: object.is_italic ? "italic" : "normal",
              textAlign: object.text_align,
              color: toCssColor(object.stroke_color),
              lineHeight: 1.2,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              overflow: "hidden",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: 2,
              fontFamily: FONT_STACKS[object.font_family],
              fontSize: Math.max(object.font_size * scale, 4),
              fontWeight: object.is_bold ? 700 : 400,
              fontStyle: object.is_italic ? "italic" : "normal",
              textAlign: object.text_align,
              color: toCssColor(object.stroke_color),
              lineHeight: 1.2,
            }}
          >
            {object.text_content}
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div
      ref={frameRef}
      className={cn("absolute", isInteractive && "pointer-events-auto")}
      data-object-item={object.id}
      data-object-type={object.object_type}
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        transform: `rotate(${object.rotation}deg)`,
        transformOrigin: "50% 50%",
        cursor: isInteractive ? (object.object_type === "text" && isEditingText ? "text" : "move") : "default",
        pointerEvents: isInteractive ? "auto" : "none",
      }}
      onPointerDown={handleBodyPointerDown}
      onDoubleClick={() => {
        if (object.object_type === "text" && isInteractive) setIsEditingText(true);
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: object.opacity }}>{renderContent()}</div>

      {isSelected && isInteractive && (
        <>
          <div className="pointer-events-none absolute inset-0 border-2 border-primary" />
          {!isPath &&
            RESIZE_HANDLES.map(({ corner, className, cursor }) => (
              <div
                key={corner}
                data-resize-handle={corner}
                className={cn("absolute h-3 w-3 rounded-full border border-primary bg-white", className)}
                style={{ cursor }}
                onPointerDown={(e) => handleResizePointerDown(e, corner)}
              />
            ))}
          <div
            data-rotate-handle=""
            className="absolute left-1/2 -top-6 h-3 w-3 -translate-x-1/2 rounded-full border border-primary bg-white"
            style={{ cursor: "grab" }}
            onPointerDown={handleRotatePointerDown}
          />
          <div className="pointer-events-none absolute left-1/2 -top-6 h-6 w-px -translate-x-1/2 bg-primary/60" />
        </>
      )}
    </div>
  );
}
