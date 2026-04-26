import { useState, useRef } from "react";
import { Layer } from "../types";
import { generateId } from "../utils";

interface UseProjectStateProps {
  canvasSize: { width: number; height: number };
  setCanvasSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setCanvasOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setIsInitialized: (val: boolean) => void;
}

export function useProjectState({ canvasSize, setCanvasSize, setLayers, setZoom, setCanvasOffset, containerRef, setIsInitialized }: UseProjectStateProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInitProject = (width: number, height: number, transparent: boolean = false) => {
    setCanvasSize({ width, height });
    setIsInitialized(true);
    
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

        if (!transparent) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const initialBg: any = {
            id: `bg-${Date.now()}`,
            type: "shape",
            name: "Project Background",
            shapeType: "rect",
            x: 0,
            y: 0,
            width,
            height,
            rotation: 0,
            opacity: 100,
            hidden: false,
            locked: true,
            blendMode: "source-over",
            fill: "#ffffff",
            stroke: "transparent",
            strokeWidth: 0,
          };
          initialBg.id = generateId();
          setLayers([initialBg]);
        } else {
          setLayers([]);
        }
      }
    }, 0);
  };

  const handleOpenProjectClick = () => {
    fileInputRef.current?.click();
  };

  const handleOpenProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.canvasSize && data.layers) {
          const hydratedLayers = await Promise.all(data.layers.map(async (layer: Layer & { imageData?: string }) => {
            if (layer.type === "image" && layer.imageData) {
              return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { imageData, ...rest } = layer;
                  resolve({ ...rest, image: img });
                };
                img.src = layer.imageData as string;
              });
            }
            return layer;
          }));

          setCanvasSize(data.canvasSize);
          setLayers(hydratedLayers as Layer[]);
          setIsInitialized(true);

          setTimeout(() => {
            if (containerRef.current) {
              const padding = 100;
              const cw = containerRef.current.clientWidth;
              const ch = containerRef.current.clientHeight;
              const fitZoom = Math.min(
                (cw - padding) / data.canvasSize.width,
                (ch - padding) / data.canvasSize.height,
                1,
              );
              setZoom(fitZoom);
              setCanvasOffset({
                x: (cw - data.canvasSize.width * fitZoom) / 2,
                y: (ch - data.canvasSize.height * fitZoom) / 2,
              });
            }
          }, 50);
        }
      } catch (err) {
        console.error(err);
        alert("Invalid Kuwas project file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveProject = async (layers: Layer[]) => {
    const serializedLayers = await Promise.all(layers.map(async (layer) => {
      if (layer.type === "image") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const img = (layer as any).image;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64 = tempCanvas.toDataURL("image/png");
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          const { image, ...rest } = layer as any;
          return { ...rest, imageData: base64 };
        }
      }
      return layer;
    }));

    const projectData = {
      version: "2.1.0",
      canvasSize,
      layers: serializedLayers
    };
    
    const blob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `project-${new Date().getTime()}.kuwas`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
    isExporting,
    setIsExporting,
    showGuide,
    setShowGuide,
    showAbout,
    setShowAbout,
    showSettings,
    setShowSettings,
    fileInputRef,
    handleInitProject,
    handleOpenProjectClick,
    handleOpenProject,
    handleSaveProject
  };
}
