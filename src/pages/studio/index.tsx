import { useState, useRef, useEffect, useCallback } from "react";
import { generateId, drawAllLayers } from "./utils";
import { Topbar } from "./components/Topbar";
import { SidebarLeft } from "./components/SidebarLeft";
import { CanvasArea } from "./components/CanvasArea";
import { PropertiesPanel } from "./components/PropertiesPanel";
import { LayersPanel } from "./components/LayersPanel";
import { ProjectSetup } from "./components/ProjectSetup";
import { CropInterface } from "./components/CropInterface";
import { ExportModal, ExportSettings } from "./components/ExportModal";
import { GuideModal } from "./components/GuideModal";
import { AboutModal } from "./components/AboutModal";
import { ProjectSettingsModal } from "./components/ProjectSettingsModal";
import { ImageLayer } from "./types";

// Import hooks
import { useProjectState } from "./hooks/useProjectState";
import { useLayers } from "./hooks/useLayers";
import { useViewport } from "./hooks/useViewport";
import { useCanvasInteraction } from "./hooks/useCanvasInteraction";

const FONT_FAMILIES = [
  "Inter", "Roboto", "Playfair Display", "Montserrat",
  "Oswald", "Lora", "Outfit", "Poppins",
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

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    layers, setLayers, selectedLayer, selectedLayerId, setSelectedLayerId,
    updateLayer, addImageLayer, addLayerFromImageFile, addTextLayer, addShapeLayer,
    setCanvasBackground, deleteLayer, duplicateLayer, draggedLayerIndex, handleDragOver, setDraggedLayerIndex
  } = useLayers(canvasSize);

  const {
    zoom, setZoom, canvasOffset, setCanvasOffset,
    isSpacePressed, isPanning, setIsPanning, showGuidelines, setShowGuidelines,
    showGrid, setShowGrid, handleResetView
  } = useViewport(containerRef, canvasSize, isInitialized);

  const {
    isExporting, setIsExporting,
    showGuide, setShowGuide,
    showAbout, setShowAbout,
    showSettings, setShowSettings,
    fileInputRef,
    handleInitProject,
    handleOpenProjectClick,
    handleOpenProject,
    handleSaveProject
  } = useProjectState({
    canvasSize, setCanvasSize, setLayers, setZoom, setCanvasOffset, containerRef, setIsInitialized
  });

  const interaction = useCanvasInteraction({
    layers, selectedLayerId, setSelectedLayerId, updateLayer, deleteLayer,
    containerRef, zoom, canvasOffset, setCanvasOffset,
    isSpacePressed, isPanning, setIsPanning
  });

  // Handle beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (layers.length > 0) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [layers]);

  // Handle global paste & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      const isCmd = e.metaKey || e.ctrlKey;
      if (isCmd && e.key === "c" && selectedLayerId) {
        localStorage.setItem("copiedLayerId", selectedLayerId);
      }
      if (isCmd && e.key === "v") {
        const copiedId = localStorage.getItem("copiedLayerId");
        if (copiedId) {
          e.preventDefault();
          duplicateLayer(copiedId);
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            addLayerFromImageFile(file);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [addLayerFromImageFile, duplicateLayer, selectedLayerId]);

  // Open image handler
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
        interaction.isCropping,
        isExport,
        "#3b82f6"
      );
    },
    [layers, selectedLayerId, zoom, interaction.isCropping],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && isInitialized) {
      const ctx = canvas.getContext("2d");
      if (ctx) drawLayers(ctx, canvas.width, canvas.height, false);
    }
  }, [drawLayers, isInitialized]);

  const handleFinalExport = (settings: ExportSettings) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawAllLayers(ctx, canvas.width, canvas.height, layers, null, 1, false, true, "#3b82f6");
      const link = document.createElement("a");
      link.download = `${settings.filename}.${settings.format.split("/")[1]}`;
      link.href = canvas.toDataURL(settings.format, settings.quality);
      link.click();
      setIsExporting(false);
    }
  };

  if (!isInitialized) {
    return (
      <ProjectSetup
        onConfirm={handleInitProject}
        onOpenImage={handleOpenImageProject}
        onOpenProject={handleOpenProject}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
      {isExporting && (
        <ExportModal
          canvasRef={canvasRef}
          canvasSize={canvasSize}
          filename="design"
          onClose={() => setIsExporting(false)}
          onExport={handleFinalExport}
        />
      )}
      {interaction.isCropping && selectedLayer && selectedLayer.type === "image" && (
        <CropInterface
          layer={selectedLayer as ImageLayer}
          onConfirm={interaction.handleCropConfirm}
          onCancel={interaction.handleCropCancel}
        />
      )}
      <Topbar
        onExport={() => setIsExporting(true)}
        onNew={() => setIsInitialized(false)}
        onClearAll={() => setLayers([])}
        onOpenGuide={() => setShowGuide(true)}
        onOpenAbout={() => setShowAbout(true)}
        onOpenSettings={() => setShowSettings(true)}
        onSaveProject={() => handleSaveProject(layers)}
        onOpenProject={handleOpenProjectClick}
        onResetZoom={handleResetView}
        showGuidelines={showGuidelines}
        onToggleGuidelines={() => setShowGuidelines(!showGuidelines)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <SidebarLeft 
          onAddImage={addImageLayer} 
          onAddText={addTextLayer} 
          onAddShape={addShapeLayer}
          onUpdateBg={setCanvasBackground}
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
          editingTextId={interaction.editingTextId}
          setEditingTextId={interaction.setEditingTextId}
          onUpdateLayer={updateLayer}
          setZoom={setZoom}
          setSelectedLayerId={setSelectedLayerId}
          onPointerDown={interaction.handlePointerDown}
          onPointerMove={interaction.handlePointerMove}
          onPointerUp={interaction.handlePointerUp}
          showGuidelines={showGuidelines}
          showGrid={showGrid}
          onResetView={handleResetView}
        />
        <aside className="w-[300px] border-l border-zinc-800/50 bg-zinc-900/20 backdrop-blur-xl flex flex-col z-10 shrink-0 overflow-hidden">
          <PropertiesPanel
            selectedLayer={selectedLayer}
            isProcessingBg={interaction.isProcessingBg}
            onUpdate={updateLayer}
            onToggleCrop={() => interaction.setIsCropping(!interaction.isCropping)}
            onRemoveBg={interaction.handleRemoveBg}
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
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleOpenProject} 
        accept=".kuwas" 
        className="hidden" 
      />

      {showSettings && (
        <ProjectSettingsModal 
          currentWidth={canvasSize.width}
          currentHeight={canvasSize.height}
          onClose={() => setShowSettings(false)}
          onUpdate={(w, h) => {
            setCanvasSize({ width: w, height: h });
            setShowSettings(false);
          }}
        />
      )}

      {showGuide && (
        <GuideModal onClose={() => setShowGuide(false)} />
      )}
      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}
    </div>
  );
}
