import React, { useState, useCallback } from "react";
import { Layer, TextLayer } from "../types";
import { Rulers } from "./Rulers";
import { getMousePos } from "../utils";

interface CanvasAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasSize: { width: number; height: number };
  zoom: number;
  canvasOffset: { x: number; y: number };
  isSpacePressed: boolean;
  layers: Layer[];
  editingTextId: string | null;
  setEditingTextId: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onPointerDown: (e: React.MouseEvent | React.TouchEvent) => void;
  onPointerMove: (e: React.MouseEvent | React.TouchEvent) => void;
  onPointerUp: () => void;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setSelectedLayerId: (id: string | null) => void;
  showGuidelines?: boolean;
  showGrid?: boolean;
  canvasBg?: string;
  onResetView?: () => void;
}

export const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvasRef,
  containerRef,
  canvasSize,
  zoom,
  canvasOffset,
  isSpacePressed,
  layers,
  editingTextId,
  setEditingTextId,
  onUpdateLayer,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  setZoom,
  setSelectedLayerId,
  showGuidelines = true,
  showGrid = true,
  canvasBg = "#09090b",
  onResetView,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const editingLayer = layers.find((l) => l.id === editingTextId) as
    | TextLayer
    | undefined;

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Intercept to update local mousePos for the status bar, preventing root re-renders
    const pos = getMousePos(e, containerRef.current, zoom, canvasOffset);
    setMousePos(pos);
    
    // Pass to original handler for drag math
    onPointerMove(e);
  }, [containerRef, zoom, canvasOffset, onPointerMove]);

  return (
    <main
      ref={containerRef}
      onMouseDown={(e) => {
        if (e.target === containerRef.current) {
          setSelectedLayerId(null);
          setEditingTextId(null);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      className={`flex-1 bg-[#09090b] relative overflow-hidden outline-none touch-none ${isSpacePressed ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
      style={{
        backgroundImage: showGrid
          ? "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)"
          : "none",
        backgroundSize: "40px 40px",
      }}
    >
      {showGuidelines && (
        <Rulers zoom={zoom} offset={canvasOffset} canvasSize={canvasSize} />
      )}

      <div
        className="shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border border-zinc-800/30"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          transform: `translate3d(${canvasOffset.x}px, ${canvasOffset.y}px, 0) scale(${zoom})`,
          transformOrigin: "0 0",
          backgroundColor: canvasBg,
          backgroundImage:
            !canvasBg || canvasBg === "transparent"
              ? "conic-gradient(#1a1a1a 90deg, #111 90deg 180deg, #1a1a1a 180deg 270deg, #111 270deg)"
              : "none",
          backgroundSize: "20px 20px",
        }}
      >
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="absolute inset-0 z-0 bg-transparent"
        />

        {editingLayer && (
          <textarea
            autoFocus
            value={editingLayer.text}
            onChange={(e) =>
              onUpdateLayer(editingLayer.id, { text: e.target.value })
            }
            onBlur={() => setEditingTextId(null)}
            className="absolute z-50 bg-transparent border-none outline-none resize-none p-0 m-0 overflow-hidden leading-tight whitespace-pre-wrap text-white selection:bg-blue-500/30 font-mono"
            style={{
              left: editingLayer.x,
              top: editingLayer.y,
              width: editingLayer.width + 10,
              height: editingLayer.height + 10,
              fontSize: editingLayer.fontSize,
              fontFamily: editingLayer.fontFamily,
              fontWeight: editingLayer.fontWeight,
              textAlign: editingLayer.textAlign,
              color: editingLayer.color,
              letterSpacing: `${editingLayer.letterSpacing}px`,
              lineHeight: editingLayer.lineHeight,
              transform: `rotate(${editingLayer.rotation}rad)`,
              transformOrigin: "center center",
            }}
          />
        )}
      </div>

      {/* Floating Status Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl z-50">
        <div className="flex items-center gap-2 px-3 border-r border-zinc-800">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
            Pos
          </span>
          <span className="text-[10px] font-mono text-zinc-300 w-16">
            {Math.round(mousePos.x)}, {Math.round(mousePos.y)}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 border-r border-zinc-800">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
            Size
          </span>
          <span className="text-[10px] font-mono text-zinc-300">
            {canvasSize.width}×{canvasSize.height}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
            className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
          >
            -
          </button>
          <button
            onClick={onResetView}
            className="px-2 h-7 flex items-center justify-center text-[10px] font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-all min-w-[50px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(10, z + 0.1))}
            className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-all"
          >
            +
          </button>
        </div>

        {onResetView && (
          <button
            onClick={onResetView}
            className="ml-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Reset View
          </button>
        )}
      </div>
    </main>
  );
};

