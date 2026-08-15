"use client";

import {
  ArrowUpRight,
  Circle,
  Eraser,
  Highlighter,
  ImagePlus,
  Minus,
  MousePointer2,
  Pencil,
  Square,
  Type,
} from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { useDocumentStore } from "@/store/document.store";
import type { EditorTool } from "@/types/document";

const TOOLS: { tool: EditorTool; label: string; icon: React.ReactNode }[] = [
  { tool: "select", label: "Select", icon: <MousePointer2 className="h-4 w-4" /> },
  { tool: "text", label: "Add text", icon: <Type className="h-4 w-4" /> },
  { tool: "image", label: "Add image", icon: <ImagePlus className="h-4 w-4" /> },
  { tool: "rectangle", label: "Add rectangle", icon: <Square className="h-4 w-4" /> },
  { tool: "ellipse", label: "Add ellipse", icon: <Circle className="h-4 w-4" /> },
  { tool: "line", label: "Add line", icon: <Minus className="h-4 w-4" /> },
  { tool: "arrow", label: "Add arrow", icon: <ArrowUpRight className="h-4 w-4" /> },
  { tool: "pen", label: "Draw freehand", icon: <Pencil className="h-4 w-4" /> },
  { tool: "highlighter", label: "Highlighter", icon: <Highlighter className="h-4 w-4" /> },
  { tool: "eraser", label: "Erase objects", icon: <Eraser className="h-4 w-4" /> },
];

export function ToolPalette() {
  const currentTool = useDocumentStore((state) => state.currentTool);
  const setTool = useDocumentStore((state) => state.setTool);

  return (
    <div className="flex items-center gap-1">
      {TOOLS.map(({ tool, label, icon }) => (
        <IconButton
          key={tool}
          label={label}
          icon={icon}
          variant={currentTool === tool ? "primary" : "ghost"}
          size="sm"
          onClick={() => setTool(tool)}
        />
      ))}
    </div>
  );
}
