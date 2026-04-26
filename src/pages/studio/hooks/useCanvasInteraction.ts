import { useState, useRef, useEffect } from "react";
import { Layer, ImageLayer } from "../types";
import { getMousePos, isPosOnLayer } from "../utils";
import { removeBackground } from "@imgly/background-removal";

interface UseCanvasInteractionProps {
  layers: Layer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  canvasOffset: { x: number; y: number };
  setCanvasOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isSpacePressed: boolean;
  isPanning: boolean;
  setIsPanning: (val: boolean) => void;
}

export function useCanvasInteraction({
  layers,
  selectedLayerId,
  setSelectedLayerId,
  updateLayer,
  deleteLayer,
  containerRef,
  zoom,
  canvasOffset,
  setCanvasOffset,
  isSpacePressed,
  isPanning,
  setIsPanning
}: UseCanvasInteractionProps) {
  const [isFreeTransform, setIsFreeTransform] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const lastClickTimeRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const selectedLayer = layers.find(l => l.id === selectedLayerId) || null;

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e, containerRef.current, zoom, canvasOffset);

    if (isSpacePressed) {
      setIsPanning(true);
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
      dragStartRef.current = { x: clientX, y: clientY };
      return;
    }
    const now = Date.now();
    const isDoubleClick = now - lastClickTimeRef.current < 300;
    lastClickTimeRef.current = now;

    if (selectedLayer && !selectedLayer.locked) {
      const { x, y, width, height } = selectedLayer;
      const handles = [
        { id: "nw", x, y },
        { id: "ne", x: x + width, y },
        { id: "se", x: x + width, y: y + height },
        { id: "sw", x, y: y + height },
      ];
      const threshold = 15 / zoom;
      const centerX = x + width / 2, centerY = y + height / 2;
      const hitHandle = handles.find((h) => {
        const dx = h.x - centerX, dy = h.y - centerY;
        const rx = centerX + dx * Math.cos(selectedLayer.rotation) - dy * Math.sin(selectedLayer.rotation);
        const ry = centerY + dx * Math.sin(selectedLayer.rotation) + dy * Math.cos(selectedLayer.rotation);
        return Math.abs(rx - pos.x) < threshold && Math.abs(ry - pos.y) < threshold;
      });
      if (hitHandle) {
        setResizeHandle(hitHandle.id);
        dragStartRef.current = { x: pos.x, y: pos.y };
        return;
      }
    }

    let clickedLayer: Layer | null = null;
    for (let i = 0; i < layers.length; i++) {
      if (isPosOnLayer(pos, layers[i])) {
        if (layers[i].locked) continue;
        clickedLayer = layers[i];
        break;
      }
    }

    if (clickedLayer) {
      setSelectedLayerId(clickedLayer.id);
      if (isDoubleClick && clickedLayer.type === "text") {
        setEditingTextId(clickedLayer.id);
      } else {
        isDraggingRef.current = true;
        dragStartRef.current = {
          x: pos.x - clickedLayer.x,
          y: pos.y - clickedLayer.y,
        };
      }
    } else {
      setSelectedLayerId(null);
      setEditingTextId(null);
    }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    // Note: We intentionally don't update local state here to avoid massive re-renders.
    // The visual math is just executed directly.
    const pos = getMousePos(e, containerRef.current, zoom, canvasOffset);

    if (isPanning) {
      const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
      const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      setCanvasOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStartRef.current = { x: clientX, y: clientY };
      return;
    }

    if (resizeHandle && selectedLayer) {
      const dx = pos.x - dragStartRef.current.x;
      const dy = pos.y - dragStartRef.current.y;
      let { x, y, width, height } = selectedLayer;

      if (isCropping && selectedLayer.type === "image") {
        const imgLayer = selectedLayer as ImageLayer;
        const img = imgLayer.image;
        const currentCrop = imgLayer.crop || {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        };
        const scaleX = img.width / width;
        const scaleY = img.height / height;

        const newCrop = { ...currentCrop };
        if (resizeHandle === "se") {
          newCrop.width += dx * scaleX;
          newCrop.height += dy * scaleY;
        } else if (resizeHandle === "nw") {
          newCrop.x += dx * scaleX;
          newCrop.y += dy * scaleY;
          newCrop.width -= dx * scaleX;
          newCrop.height -= dy * scaleY;
        }
        updateLayer(selectedLayer.id, { crop: newCrop });
        dragStartRef.current = { x: pos.x, y: pos.y };
        return;
      }

      if (resizeHandle === "se") {
        width += dx;
        if (selectedLayer.type === "image" && !isFreeTransform)
          height = width / (selectedLayer as ImageLayer).aspectRatio;
        else height += dy;
      } else if (resizeHandle === "sw") {
        x += dx;
        width -= dx;
        if (selectedLayer.type === "image" && !isFreeTransform)
          height = width / (selectedLayer as ImageLayer).aspectRatio;
        else height += dy;
      } else if (resizeHandle === "ne") {
        y += dy;
        height -= dy;
        if (selectedLayer.type === "image" && !isFreeTransform)
          width = height * (selectedLayer as ImageLayer).aspectRatio;
        else width += dx;
      } else if (resizeHandle === "nw") {
        x += dx;
        y += dy;
        width -= dx;
        height -= dy;
        if (selectedLayer.type === "image" && !isFreeTransform) {
          const newW = height * (selectedLayer as ImageLayer).aspectRatio;
          x += width - newW;
          width = newW;
        }
      }
      updateLayer(selectedLayer.id, { x, y, width, height });
      dragStartRef.current = { x: pos.x, y: pos.y };
      return;
    }

    if (!isDraggingRef.current || !selectedLayerId) return;
    updateLayer(selectedLayerId, {
      x: pos.x - dragStartRef.current.x,
      y: pos.y - dragStartRef.current.y,
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    setResizeHandle(null);
    setIsPanning(false);
  };

  const handleRemoveBg = async () => {
    if (!selectedLayer || selectedLayer.type !== "image") return;
    setIsProcessingBg(true);
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = (selectedLayer as ImageLayer).image.width;
      tempCanvas.height = (selectedLayer as ImageLayer).image.height;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage((selectedLayer as ImageLayer).image, 0, 0);
        const dataUrl = tempCanvas.toDataURL("image/png");
        const blob = await removeBackground(dataUrl, {
          model: "isnet_fp16",
          proxyToWorker: true,
        });
        const newUrl = URL.createObjectURL(blob);
        const newImg = new Image();
        newImg.onload = () => {
          updateLayer(selectedLayer.id, {
            image: newImg,
            name: `${selectedLayer.name} (Clean)`,
          });
          setIsProcessingBg(false);
        };
        newImg.src = newUrl;
      }
    } catch (error) {
      console.error("BG Removal failed", error);
      setIsProcessingBg(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCropConfirm = (pixelCrop: any) => {
    if (selectedLayerId && selectedLayer) {
      const newWidth = selectedLayer.width;
      const newHeight = (newWidth * pixelCrop.height) / pixelCrop.width;
      updateLayer(selectedLayerId, {
        crop: pixelCrop,
        height: newHeight,
        aspectRatio: pixelCrop.width / pixelCrop.height,
      });
      setIsCropping(false);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
  };

  // Delete handler for keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedLayerId && (e.key === "Backspace" || e.key === "Delete")) {
        if (
          document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.tagName === "INPUT"
        )
          return;
        deleteLayer(selectedLayerId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayerId, deleteLayer]);

  return {
    isFreeTransform,
    setIsFreeTransform,
    isCropping,
    setIsCropping,
    isProcessingBg,
    editingTextId,
    setEditingTextId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleRemoveBg,
    handleCropConfirm,
    handleCropCancel
  };
}
