"use client";

import { useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Copy,
  Italic,
  SendToBack,
  BringToFront,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Selector } from "@astryxdesign/core/Selector";
import { Slider } from "@astryxdesign/core/Slider";
import { Divider } from "@astryxdesign/core/Divider";
import { useDocumentStore } from "@/store/document.store";
import type { EditorObject, FontFamily, TextAlign } from "@/types/document";

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: "sans", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
];

function useLiveField(objectId: string) {
  const beginObjectEdit = useDocumentStore((state) => state.beginObjectEdit);
  const updateObjectLive = useDocumentStore((state) => state.updateObjectLive);
  const commitObjectEdit = useDocumentStore((state) => state.commitObjectEdit);
  const isDragging = useRef(false);

  function onChange(patch: Partial<EditorObject>) {
    if (!isDragging.current) {
      beginObjectEdit(objectId);
      isDragging.current = true;
    }
    updateObjectLive(objectId, patch);
  }

  function onChangeEnd() {
    isDragging.current = false;
    commitObjectEdit(objectId);
  }

  return { onChange, onChangeEnd };
}

export function ObjectPropertiesPanel() {
  const object = useDocumentStore((state) => state.getSelectedObject());
  const updateObjectImmediate = useDocumentStore((state) => state.updateObjectImmediate);
  const removeObject = useDocumentStore((state) => state.removeObject);
  const duplicateObject = useDocumentStore((state) => state.duplicateObject);
  const reorderObject = useDocumentStore((state) => state.reorderObject);
  const selectObject = useDocumentStore((state) => state.selectObject);

  const objectId = object?.id;
  const live = useLiveField(objectId ?? "");

  if (!object || !objectId) return null;

  const isShape = object.object_type === "rectangle" || object.object_type === "ellipse";
  const hasStroke = object.object_type !== "text" && object.object_type !== "image";
  const isText = object.object_type === "text";

  return (
    <div className="flex flex-col gap-4 border-b border-border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold capitalize text-white">{object.object_type} properties</h2>
        <IconButton label="Close" icon={<span className="text-xs">✕</span>} variant="ghost" size="sm" onClick={() => selectObject(null)} />
      </div>

      {isText && (
        <>
          <Selector
            label="Font"
            options={FONT_OPTIONS}
            value={object.font_family}
            onChange={(value: string) => updateObjectImmediate(objectId, { font_family: value as FontFamily })}
            size="sm"
            width="100%"
          />

          <Slider
            label="Font size"
            value={object.font_size}
            min={6}
            max={96}
            step={1}
            onChange={(value: number) => live.onChange({ font_size: value })}
            onChangeEnd={live.onChangeEnd}
            formatValue={(v) => `${v}pt`}
          />

          <div className="flex items-center gap-1">
            <IconButton
              label="Bold"
              icon={<Bold className="h-4 w-4" />}
              variant={object.is_bold ? "primary" : "ghost"}
              size="sm"
              onClick={() => updateObjectImmediate(objectId, { is_bold: !object.is_bold })}
            />
            <IconButton
              label="Italic"
              icon={<Italic className="h-4 w-4" />}
              variant={object.is_italic ? "primary" : "ghost"}
              size="sm"
              onClick={() => updateObjectImmediate(objectId, { is_italic: !object.is_italic })}
            />
            <Divider orientation="vertical" />
            <IconButton
              label="Align left"
              icon={<AlignLeft className="h-4 w-4" />}
              variant={object.text_align === "left" ? "primary" : "ghost"}
              size="sm"
              onClick={() => updateObjectImmediate(objectId, { text_align: "left" as TextAlign })}
            />
            <IconButton
              label="Align center"
              icon={<AlignCenter className="h-4 w-4" />}
              variant={object.text_align === "center" ? "primary" : "ghost"}
              size="sm"
              onClick={() => updateObjectImmediate(objectId, { text_align: "center" as TextAlign })}
            />
            <IconButton
              label="Align right"
              icon={<AlignRight className="h-4 w-4" />}
              variant={object.text_align === "right" ? "primary" : "ghost"}
              size="sm"
              onClick={() => updateObjectImmediate(objectId, { text_align: "right" as TextAlign })}
            />
          </div>

          <label className="flex items-center justify-between text-xs text-white/60">
            Text color
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(object.stroke_color) ? object.stroke_color : "#111827"}
              onChange={(e) => updateObjectImmediate(objectId, { stroke_color: e.target.value })}
              className="h-7 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
          </label>
        </>
      )}

      {isShape && (
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Fill color</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(object.fill_color) ? object.fill_color : "#3b82f6"}
              onChange={(e) => updateObjectImmediate(objectId, { fill_color: e.target.value })}
              className="h-7 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
            <IconButton
              label="No fill"
              icon={<span className="text-xs">∅</span>}
              variant={object.fill_color ? "ghost" : "primary"}
              size="sm"
              onClick={() => updateObjectImmediate(objectId, { fill_color: object.fill_color ? "" : "#3b82f6" })}
            />
          </div>
        </div>
      )}

      {hasStroke && (
        <>
          <label className="flex items-center justify-between text-xs text-white/60">
            Stroke color
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(object.stroke_color) ? object.stroke_color : "#111827"}
              onChange={(e) => updateObjectImmediate(objectId, { stroke_color: e.target.value })}
              className="h-7 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
          </label>
          <Slider
            label="Stroke width"
            value={object.stroke_width}
            min={0.5}
            max={30}
            step={0.5}
            onChange={(value: number) => live.onChange({ stroke_width: value })}
            onChangeEnd={live.onChangeEnd}
            formatValue={(v) => `${v}pt`}
          />
        </>
      )}

      <Slider
        label="Opacity"
        value={Math.round(object.opacity * 100)}
        min={0}
        max={100}
        step={1}
        onChange={(value: number) => live.onChange({ opacity: value / 100 })}
        onChangeEnd={live.onChangeEnd}
        formatValue={(v) => `${v}%`}
      />

      <Slider
        label="Rotation"
        value={object.rotation}
        min={0}
        max={359}
        step={1}
        onChange={(value: number) => live.onChange({ rotation: value })}
        onChangeEnd={live.onChangeEnd}
        formatValue={(v) => `${v}°`}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <IconButton label="Send to back" icon={<SendToBack className="h-4 w-4" />} variant="ghost" size="sm" onClick={() => reorderObject(objectId, "back")} />
          <IconButton label="Send backward" icon={<ChevronDown className="h-4 w-4" />} variant="ghost" size="sm" onClick={() => reorderObject(objectId, "backward")} />
          <IconButton label="Bring forward" icon={<ChevronUp className="h-4 w-4" />} variant="ghost" size="sm" onClick={() => reorderObject(objectId, "forward")} />
          <IconButton label="Bring to front" icon={<BringToFront className="h-4 w-4" />} variant="ghost" size="sm" onClick={() => reorderObject(objectId, "front")} />
        </div>
        <div className="flex items-center gap-1">
          <IconButton label="Duplicate" icon={<Copy className="h-4 w-4" />} variant="ghost" size="sm" onClick={() => duplicateObject(objectId)} />
          <IconButton label="Delete" icon={<Trash2 className="h-4 w-4" />} variant="destructive" size="sm" onClick={() => removeObject(objectId)} />
        </div>
      </div>
    </div>
  );
}
