import { useState, useCallback, useMemo } from "react";
import { Layer, ImageLayer, TextLayer, ShapeLayer } from "../types";
import { generateId } from "../utils";

export function useLayers(canvasSize: { width: number; height: number }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [draggedLayerIndex, setDraggedLayerIndex] = useState<number | null>(null);

  const selectedLayer = useMemo(
    () => layers.find((l) => l.id === selectedLayerId) || null,
    [layers, selectedLayerId],
  );

  const measureTextLayer = (layer: TextLayer): Partial<TextLayer> => {
    const measureCanvas = document.createElement("canvas");
    const ctx = measureCanvas.getContext("2d");
    if (!ctx) return {};

    ctx.font = `${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
    const lines = layer.text.split("\n");
    let maxWidth = 0;
    lines.forEach((line) => {
      const metrics = ctx.measureText(line);
      const width = metrics.width + line.length * layer.letterSpacing;
      if (width > maxWidth) maxWidth = width;
    });
    const height = lines.length * layer.fontSize * layer.lineHeight;

    if (Math.abs(layer.width - maxWidth) > 1 || Math.abs(layer.height - height) > 1) {
      return { width: maxWidth, height: height };
    }
    return {};
  };

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers((prev) =>
      prev.map((layer) => {
        if (layer.id === id) {
          const updated = { ...layer, ...updates } as Layer;
          if (updated.type === "text") {
            const textUpdates = updates as Partial<TextLayer>;
            if (
              textUpdates.text !== undefined ||
              textUpdates.fontSize !== undefined ||
              textUpdates.fontFamily !== undefined ||
              textUpdates.fontWeight !== undefined ||
              textUpdates.letterSpacing !== undefined ||
              textUpdates.lineHeight !== undefined
            ) {
              const dims = measureTextLayer(updated as TextLayer);
              return { ...updated, ...dims };
            }
          }
          return updated;
        }
        return layer;
      })
    );
  }, []);

  const addLayerFromImageFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let width = img.width, height = img.height;
      const maxW = canvasSize.width * 0.9;
      const maxH = canvasSize.height * 0.9;

      if (width > maxW || height > maxH) {
        const ratio = Math.min(maxW / width, maxH / height);
        width *= ratio;
        height *= ratio;
      }

      const newLayer: ImageLayer = {
        id: generateId(),
        type: "image",
        name: file.name || "Pasted Image",
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
      setLayers((prev) => [newLayer, ...prev]);
      setSelectedLayerId(newLayer.id);
    };
    img.src = url;
  }, [canvasSize, setLayers, setSelectedLayerId]);

  const addImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addLayerFromImageFile(file);
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
    const dims = measureTextLayer(textLayer);
    const finalLayer = { ...textLayer, ...dims };
    
    setLayers((prev) => [finalLayer, ...prev]);
    setSelectedLayerId(finalLayer.id);
  };

  const addShapeLayer = (shapeType: "rect" | "circle" | "triangle" | "star") => {
    const shapeLayer: ShapeLayer = {
      id: generateId(),
      type: "shape",
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Layer`,
      shapeType,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 100,
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 100,
      hidden: false,
      locked: false,
      blendMode: "source-over",
      fill: "#3b82f6",
      stroke: "transparent",
      strokeWidth: 0,
    };
    setLayers((prev) => [shapeLayer, ...prev]);
    setSelectedLayerId(shapeLayer.id);
  };

  const setCanvasBackground = (color: string) => {
    const bgLayer = layers.find((l) => l.name === "Project Background") as ShapeLayer | undefined;
    if (bgLayer) {
      updateLayer(bgLayer.id, { fill: color });
    } else {
      const newBg: ShapeLayer = {
        id: generateId(),
        type: "shape",
        name: "Project Background",
        shapeType: "rect",
        x: 0,
        y: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        rotation: 0,
        opacity: 100,
        hidden: false,
        locked: true,
        blendMode: "source-over",
        fill: color,
        stroke: "transparent",
        strokeWidth: 0,
      };
      setLayers((prev) => [...prev, newBg]);
    }
  };

  const deleteLayer = useCallback((id: string) => {
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSelectedLayerId((prev) => (prev === id ? null : prev));
  }, []);

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

  const duplicateLayer = useCallback((id: string) => {
    setLayers((prev) => {
      const layerToDuplicate = prev.find((l) => l.id === id);
      if (!layerToDuplicate) return prev;

      const newLayer = {
        ...JSON.parse(JSON.stringify(layerToDuplicate)),
        id: generateId(),
        name: `${layerToDuplicate.name} (Copy)`,
        x: layerToDuplicate.x + 20,
        y: layerToDuplicate.y + 20,
        locked: false,
      };

      // Handle image reference if it's an image layer
      if (layerToDuplicate.type === "image") {
        newLayer.image = (layerToDuplicate as ImageLayer).image;
      }

      return [newLayer, ...prev];
    });
  }, []);

  return {
    layers,
    setLayers,
    selectedLayer,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    addImageLayer,
    addLayerFromImageFile,
    addTextLayer,
    addShapeLayer,
    setCanvasBackground,
    deleteLayer,
    duplicateLayer,
    draggedLayerIndex,
    setDraggedLayerIndex,
    handleDragOver,
  };
}
