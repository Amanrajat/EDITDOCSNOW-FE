"use client";

import { useCallback, useRef, useState } from "react";
import { useDocumentStore } from "@/store/document.store";

const ZOOM_STEP = 0.15;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;

interface PageSize {
  width: number;
  height: number;
}

export function usePdfViewer(totalPages: number) {
  const zoom = useDocumentStore((state) => state.zoom);
  const setZoom = useDocumentStore((state) => state.setZoom);
  const currentPage = useDocumentStore((state) => state.currentPage);
  const setCurrentPage = useDocumentStore((state) => state.setCurrentPage);

  const containerRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState<PageSize | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const zoomIn = useCallback(
    () => setZoom(Math.min(zoom + ZOOM_STEP, MAX_ZOOM)),
    [zoom, setZoom],
  );
  const zoomOut = useCallback(
    () => setZoom(Math.max(zoom - ZOOM_STEP, MIN_ZOOM)),
    [zoom, setZoom],
  );
  const setZoomExact = useCallback((value: number) => setZoom(value), [setZoom]);

  const fitWidth = useCallback(() => {
    const container = containerRef.current;
    if (!container || !pageSize) return;
    const available = container.clientWidth - 64;
    setZoom(Math.max(available / pageSize.width, MIN_ZOOM));
  }, [pageSize, setZoom]);

  const fitHeight = useCallback(() => {
    const container = containerRef.current;
    if (!container || !pageSize) return;
    const available = container.clientHeight - 64;
    setZoom(Math.max(available / pageSize.height, MIN_ZOOM));
  }, [pageSize, setZoom]);

  const nextPage = useCallback(
    () => setCurrentPage(Math.min(currentPage + 1, totalPages - 1)),
    [currentPage, totalPages, setCurrentPage],
  );
  const prevPage = useCallback(
    () => setCurrentPage(Math.max(currentPage - 1, 0)),
    [currentPage, setCurrentPage],
  );
  const goToPage = useCallback(
    (page: number) => setCurrentPage(Math.min(Math.max(page, 0), totalPages - 1)),
    [totalPages, setCurrentPage],
  );

  const rotate = useCallback(() => setRotation((prev) => (prev + 90) % 360), []);

  const toggleFullscreen = useCallback(() => setIsFullscreen((prev) => !prev), []);

  return {
    containerRef,
    zoom,
    setZoom: setZoomExact,
    zoomIn,
    zoomOut,
    fitWidth,
    fitHeight,
    pageSize,
    setPageSize,
    currentPage,
    nextPage,
    prevPage,
    goToPage,
    totalPages,
    rotation,
    rotate,
    isFullscreen,
    toggleFullscreen,
  };
}
