"use client";

import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSetZoom: (zoom: number) => void;
  onFitWidth: () => void;
  onFitHeight: () => void;
  onRotate: () => void;
}

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onSetZoom,
  onFitWidth,
  onFitHeight,
  onRotate,
}: ZoomControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <IconButton label="Zoom out" icon={<ZoomOut className="h-4 w-4" />} variant="ghost" size="sm" onClick={onZoomOut} />
      <DropdownMenu
        button={{ label: `${Math.round(zoom * 100)}%`, variant: "ghost", size: "sm" }}
        items={[
          { label: "Fit width", onClick: onFitWidth },
          { label: "Fit height", onClick: onFitHeight },
          { type: "divider" },
          { label: "50%", onClick: () => onSetZoom(0.5) },
          { label: "100%", onClick: () => onSetZoom(1) },
          { label: "150%", onClick: () => onSetZoom(1.5) },
        ]}
      />
      <IconButton label="Zoom in" icon={<ZoomIn className="h-4 w-4" />} variant="ghost" size="sm" onClick={onZoomIn} />
      <IconButton label="Rotate page" icon={<RotateCw className="h-4 w-4" />} variant="ghost" size="sm" onClick={onRotate} />
    </div>
  );
}
