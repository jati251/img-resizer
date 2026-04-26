import React, { useState, useRef, useEffect, useCallback } from "react";
import { removeBackground } from "@imgly/background-removal";
import { Layer, ImageLayer, TextLayer } from "./types";
import { generateId, getMousePos, isPosOnLayer, drawAllLayers } from "./utils";
import { Topbar } from "./components/Topbar";
import { SidebarLeft } from "./components/SidebarLeft";
import { CanvasArea } from "./components/CanvasArea";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { LayersPanel } from "./components/LayersPanel";
import { ProjectSetup } from "./components/ProjectSetup";
import { CropInterface } from "./components/CropInterface";
import { ExportModal, ExportSettings } from "./components/ExportModal";

const SELECTION_COLOR = "#3b82f6";

const FONT_FAMILIES = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Montserrat",
  "Oswald",
  "Lora",
  "Outfit",
  "Poppins",
];

export default function Studio() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?${FONT_FAMILIES.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`).join("&")}&display=swap`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  const [isInitialized, setIsInitialized] = useState(false);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [isFreeTransform, setIsFreeTransform] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(
    null,
  );
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const lastClickTimeRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const handleOpenImageProject = (img: HTMLImageElement) => {
    const { width, height } = img;
    handleInitProject(width, height);

    const bgLayer: ImageLayer = {
      id: generateId(),
      type: "image",
      name: "Background",
      image: img,
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      opacity: 100,
      hidden: false,
      locked: true,
      blendMode: "source-over",
      aspectRatio: width / height,
      filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, grayscale: 0, hueRotate: 0, invert: 0 },
    };
    setLayers([bgLayer]);
  };

  const selectedLayer = React.useMemo(
    () => layers.find((l) => l.id === selectedLayerId) || null,
    [layers, selectedLayerId],
  );

  const handleInitProject = (width: number, height: number) => {
    setCanvasSize({ width, height });
    setIsInitialized(true);

    // Fit to screen and center
    setTimeout(() => {
      if (containerRef.current) {
        const padding = 100;
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        const fitZoom = Math.min(
          (cw - padding) / width,
          (ch - padding) / height,
          1,
        );
        setZoom(fitZoom);
        setCanvasOffset({
          x: (cw - width * fitZoom) / 2,
          y: (ch - height * fitZoom) / 2,
        });
      }
    }, 50);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? ({ ...layer, ...updates } as Layer) : layer,
      ),
    );
  };

  const addImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let width = img.width,
        height = img.height;
      const maxW = canvasSize.width * 0.9;
      const maxH = canvasSize.height * 0.9;

      // Scale down image if it's larger than the canvas
      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width *= ratio;
        height *= ratio;
      }

      const newLayer: ImageLayer = {
        id: generateId(),
        type: "image",
        name: file.name,
        image: img,
        x: (canvasSize.width - width) / 2,
        y: (canvasSize.height - height) / 2,
        width,
        height,
        aspectRatio: img.width / img.height,
        rotation: 0,
        opacity: 100,
        hidden: false,
        locked: false,
        blendMode: "source-over",
        filters: { brightness: 100, contrast: 100, saturation: 100, blur: 0, sepia: 0, grayscale: 0, hueRotate: 0, invert: 0 },
      };
      setLayers([newLayer, ...layers]);
      setSelectedLayerId(newLayer.id);
    };
    img.src = url;
    e.target.value = "";
  };

  const addTextLayer = () => {
    const textLayer: TextLayer = {
      id: generateId(),
      type: "text",
      name: "Text Layer",
      text: "Edit text in properties",
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 25,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 100,
      hidden: false,
      locked: false,
      blendMode: "source-over",
      fontSize: 48,
      fontFamily: "Inter, sans-serif",
      color: "#ffffff",
      fontWeight: "bold",
      textAlign: "center",
      letterSpacing: 0,
      lineHeight: 1.2,
    };
    setLayers([textLayer, ...layers]);
    setSelectedLayerId(textLayer.id);
  };

  // Dynamic text measurement
  useEffect(() => {
    const measureCanvas = document.createElement("canvas");
    const ctx = measureCanvas.getContext("2d");
    if (!ctx) return;

    let changed = false;
    const newLayers = layers.map((layer) => {
      if (layer.type === "text") {
        const tl = layer as TextLayer;
        ctx.font = `${tl.fontWeight} ${tl.fontSize}px ${tl.fontFamily}`;
        const lines = tl.text.split("\n");
        let maxWidth = 0;
        lines.forEach((line) => {
          const metrics = ctx.measureText(line);
          const width = metrics.width + line.length * tl.letterSpacing;
          if (width > maxWidth) maxWidth = width;
        });
        const height = lines.length * tl.fontSize * tl.lineHeight;

        if (
          Math.abs(layer.width - maxWidth) > 1 ||
          Math.abs(layer.height - height) > 1
        ) {
          changed = true;
          return { ...layer, width: maxWidth, height: height };
        }
      }
      return layer;
    });

    if (changed) setLayers(newLayers as Layer[]);
  }, [layers]);

  // Canvas interaction: Wheel Zoom & Pan
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Zoom logic (Ctrl + Wheel or Pinch)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const zoomSpeed = 0.002;
        const newZoom = Math.min(Math.max(zoom * (1 + delta * zoomSpeed), 0.1), 10);
        
        // Calculate mouse position relative to container
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate new offset to keep mouse position fixed on canvas
        const newOffsetX = mouseX - (mouseX - canvasOffset.x) * (newZoom / zoom);
        const newOffsetY = mouseY - (mouseY - canvasOffset.y) * (newZoom / zoom);

        setZoom(newZoom);
        setCanvasOffset({ x: newOffsetX, y: newOffsetY });
      } else {
        // Natural Pan (Touchpad 2-finger scroll or Mouse Wheel)
        // If Space is held, we already handle it in handlePointerMove, 
        // but this allows for effortless touchpad panning.
        setCanvasOffset(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, canvasOffset]);

  const deleteLayer = (id: string) => {
    setLayers(layers.filter((l) => l.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedLayerIndex === null || draggedLayerIndex === index) return;
    const newLayers = [...layers];
    const draggedItem = newLayers[draggedLayerIndex];
    newLayers.splice(draggedLayerIndex, 1);
    newLayers.splice(index, 0, draggedItem);
    setLayers(newLayers);
    setDraggedLayerIndex(index);
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

  const drawLayers = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      isExport = false,
    ) => {
      drawAllLayers(
        ctx,
        width,
        height,
        layers,
        selectedLayerId,
        zoom,
        isCropping,
        isExport,
        SELECTION_COLOR,
      );
    },
    [layers, selectedLayerId, zoom, isCropping],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isInitialized) {
      const ctx = canvas.getContext("2d");
      if (ctx) drawLayers(ctx, canvas.width, canvas.height, false);
    }
  }, [drawLayers, isInitialized]);

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getMousePos(e, containerRef.current, zoom, canvasOffset);

    if (isSpacePressed) {
      setIsPanning(true);
      dragStartRef.current = { x: (e as any).clientX, y: (e as any).clientY };
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
      const centerX = x + width / 2,
        centerY = y + height / 2;
      const hitHandle = handles.find((h) => {
        const dx = h.x - centerX,
          dy = h.y - centerY;
        const rx =
          centerX +
          dx * Math.cos(selectedLayer.rotation) -
          dy * Math.sin(selectedLayer.rotation);
        const ry =
          centerY +
          dx * Math.sin(selectedLayer.rotation) +
          dy * Math.cos(selectedLayer.rotation);
        return (
          Math.abs(rx - pos.x) < threshold && Math.abs(ry - pos.y) < threshold
        );
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
    if (isPanning) {
      const dx = (e as any).clientX - dragStartRef.current.x;
      const dy = (e as any).clientY - dragStartRef.current.y;
      setCanvasOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      dragStartRef.current = { x: (e as any).clientX, y: (e as any).clientY };
      return;
    }

    const pos = getMousePos(e, containerRef.current, zoom, canvasOffset);

    if (resizeHandle && selectedLayer) {
      const dx = pos.x - dragStartRef.current.x,
        dy = pos.y - dragStartRef.current.y;
      let { x, y, width, height } = selectedLayer;

      if (isCropping && selectedLayer.type === "image") {
        const img = (selectedLayer as ImageLayer).image;
        const currentCrop = (selectedLayer as ImageLayer).crop || {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        };
        const scaleX = img.width / width;
        const scaleY = img.height / height;

        let newCrop = { ...currentCrop };
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

  const handleExport = () => {
    setIsExporting(true);
  };

  const handleFinalExport = (settings: ExportSettings) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawLayers(ctx, canvas.width, canvas.height, true);
      const link = document.createElement("a");
      link.download = `${settings.filename}.${settings.format.split("/")[1]}`;
      link.href = canvas.toDataURL(settings.format, settings.quality);
      link.click();
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(true);
      }
      if (selectedLayerId && (e.key === "Backspace" || e.key === "Delete")) {
        if (
          document.activeElement?.tagName === "TEXTAREA" ||
          document.activeElement?.tagName === "INPUT"
        )
          return;
        deleteLayer(selectedLayerId);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedLayerId]);

  if (!isInitialized)
    return (
      <ProjectSetup
        onConfirm={handleInitProject}
        onOpenImage={handleOpenImageProject}
      />
    );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
      {isExporting && (
        <ExportModal
          canvas={canvasRef.current}
          filename="design"
          onClose={() => setIsExporting(false)}
          onExport={handleFinalExport}
        />
      )}
      {isCropping && selectedLayer && selectedLayer.type === "image" && (
        <CropInterface
          layer={selectedLayer as ImageLayer}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <Topbar
        onExport={handleExport}
        showGuidelines={showGuidelines}
        onToggleGuidelines={() => setShowGuidelines(!showGuidelines)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarLeft
          onAddImage={addImageLayer}
          onAddText={addTextLayer}
          onClearAll={() => setLayers([])}
        />
        <CanvasArea
          canvasRef={canvasRef}
          containerRef={containerRef}
          canvasSize={canvasSize}
          zoom={zoom}
          canvasOffset={canvasOffset}
          isSpacePressed={isSpacePressed}
          layers={layers}
          editingTextId={editingTextId}
          setEditingTextId={setEditingTextId}
          onUpdateLayer={updateLayer}
          setZoom={setZoom}
          setSelectedLayerId={setSelectedLayerId}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          showGuidelines={showGuidelines}
          showGrid={showGrid}
        />
        <aside className="w-[300px] border-l border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl flex flex-col z-10 shrink-0 overflow-hidden">
          <PropertiesPanel
            selectedLayer={selectedLayer}
            isFreeTransform={isFreeTransform}
            isCropping={isCropping}
            isProcessingBg={isProcessingBg}
            onUpdate={updateLayer}
            onToggleFree={() => setIsFreeTransform(!isFreeTransform)}
            onToggleCrop={() => setIsCropping(!isCropping)}
            onRemoveBg={handleRemoveBg}
            onDelete={deleteLayer}
          />
          <LayersPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            draggedLayerIndex={draggedLayerIndex}
            onSelect={setSelectedLayerId}
            onToggleVisibility={(id, hidden) => updateLayer(id, { hidden })}
            onUpdate={updateLayer}
            onDelete={deleteLayer}
            onDragStart={setDraggedLayerIndex}
            onDragOver={handleDragOver}
            onDragEnd={() => setDraggedLayerIndex(null)}
          />
        </aside>
      </div>
    </div>
  );
}
