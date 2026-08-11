"use client";

import { Download, Maximize, Minimize, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Divider } from "@astryxdesign/core/Divider";
import { Badge } from "@astryxdesign/core/Badge";
import { ZoomControls } from "@/components/editor/ZoomControls";
import { PageNavigator } from "@/components/editor/PageNavigator";
import type { usePdfViewer } from "@/hooks/usePdfViewer";

interface ToolbarProps {
  viewer: ReturnType<typeof usePdfViewer>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  downloadUrl: string | null;
  onDownload: () => void;
}

export function Toolbar({
  viewer,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  isDirty,
  isSaving,
  onSave,
  downloadUrl,
  onDownload,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-white/80 px-3 py-2 backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface/80">
      <div className="flex items-center gap-1">
        <IconButton label="Undo" icon={<Undo2 className="h-4 w-4" />} variant="ghost" size="sm" isDisabled={!canUndo} onClick={onUndo} />
        <IconButton label="Redo" icon={<Redo2 className="h-4 w-4" />} variant="ghost" size="sm" isDisabled={!canRedo} onClick={onRedo} />
        <IconButton label="Reset all edits" icon={<RotateCcw className="h-4 w-4" />} variant="ghost" size="sm" isDisabled={!isDirty} onClick={onReset} />
      </div>

      <Divider orientation="vertical" />

      <ZoomControls
        zoom={viewer.zoom}
        onZoomIn={viewer.zoomIn}
        onZoomOut={viewer.zoomOut}
        onSetZoom={viewer.setZoom}
        onFitWidth={viewer.fitWidth}
        onFitHeight={viewer.fitHeight}
        onRotate={viewer.rotate}
      />

      <Divider orientation="vertical" />

      <PageNavigator
        currentPage={viewer.currentPage}
        totalPages={viewer.totalPages}
        onPrev={viewer.prevPage}
        onNext={viewer.nextPage}
        onGoToPage={viewer.goToPage}
      />

      <div className="ml-auto flex items-center gap-2">
        {isDirty && !isSaving && <Badge variant="warning" label="Unsaved changes" />}
        <IconButton
          label={viewer.isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          icon={viewer.isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          variant="ghost"
          size="sm"
          onClick={viewer.toggleFullscreen}
        />
        <Button
          label="Save"
          variant="primary"
          size="sm"
          isLoading={isSaving}
          isDisabled={!isDirty && Boolean(downloadUrl)}
          onClick={onSave}
        />
        <Button
          label="Download"
          variant="secondary"
          size="sm"
          icon={<Download className="h-4 w-4" />}
          isDisabled={!downloadUrl}
          onClick={onDownload}
        />
      </div>
    </div>
  );
}
