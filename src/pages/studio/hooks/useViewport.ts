import { useState, useEffect, useCallback } from "react";

export function useViewport(
  containerRef: React.RefObject<HTMLDivElement | null>,
  canvasSize: { width: number; height: number },
  isInitialized: boolean
) {
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Wheel Zoom & Pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const zoomSpeed = 0.002;
        
        setZoom((prevZoom) => {
          const newZoom = Math.min(Math.max(prevZoom * (1 + delta * zoomSpeed), 0.1), 10);
          
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          setCanvasOffset((prevOffset) => {
            const newOffsetX = mouseX - (mouseX - prevOffset.x) * (newZoom / prevZoom);
            const newOffsetY = mouseY - (mouseY - prevOffset.y) * (newZoom / prevZoom);
            return { x: newOffsetX, y: newOffsetY };
          });

          return newZoom;
        });
      } else {
        setCanvasOffset((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [containerRef, isInitialized]);

  // Spacebar panning toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (
          document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.tagName === "INPUT"
        ) return;
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleResetView = useCallback(() => {
    if (containerRef.current) {
      const padding = 100;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const fitZoom = Math.min(
        (cw - padding) / canvasSize.width,
        (ch - padding) / canvasSize.height,
        1,
      );
      setZoom(fitZoom);
      setCanvasOffset({
        x: (cw - canvasSize.width * fitZoom) / 2,
        y: (ch - canvasSize.height * fitZoom) / 2,
      });
    }
  }, [canvasSize, containerRef]);

  return {
    zoom,
    setZoom,
    canvasOffset,
    setCanvasOffset,
    isSpacePressed,
    isPanning,
    setIsPanning,
    showGuidelines,
    setShowGuidelines,
    showGrid,
    setShowGrid,
    handleResetView,
  };
}
