import React from "react";
import { Layer, TextLayer } from "../types";
import { Rulers } from "./Rulers";

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
  showGrid = true
}) => {
  const editingLayer = layers.find(l => l.id === editingTextId) as TextLayer | undefined;

  return (
    <main 
      ref={containerRef} 
      onMouseDown={(e) => { if (e.target === containerRef.current) { setSelectedLayerId(null); setEditingTextId(null); } }} 
      onPointerDown={onPointerDown} 
      onPointerMove={onPointerMove} 
      onPointerUp={onPointerUp} 
      onPointerLeave={onPointerUp} 
      className={`flex-1 bg-[#09090b] relative overflow-hidden outline-none touch-none ${isSpacePressed ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`} 
      style={{ 
        backgroundImage: showGrid 
          ? 'linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)' 
          : 'none', 
        backgroundSize: '40px 40px' 
      }}
    >
      {showGuidelines && <Rulers zoom={zoom} offset={canvasOffset} canvasSize={canvasSize} />}
      
      <div 
        className="shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border border-zinc-800/30"
        style={{ 
          width: canvasSize.width, 
          height: canvasSize.height, 
          transform: `translate3d(${canvasOffset.x}px, ${canvasOffset.y}px, 0) scale(${zoom})`, 
          transformOrigin: '0 0',
          backgroundImage: 'conic-gradient(#1a1a1a 90deg, #111 90deg 180deg, #1a1a1a 180deg 270deg, #111 270deg)',
          backgroundSize: '20px 20px'
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
            onChange={(e) => onUpdateLayer(editingLayer.id, { text: e.target.value })}
            onBlur={() => setEditingTextId(null)}
            className="absolute z-50 bg-transparent border-none outline-none resize-none p-0 m-0 overflow-hidden leading-tight whitespace-pre-wrap text-white selection:bg-blue-500/30"
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
              transformOrigin: 'center center'
            }}
          />
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/60 backdrop-blur-md border border-zinc-800/50 rounded-full px-4 py-1.5 flex items-center gap-4 shadow-xl">
        <button onClick={() => setZoom(z => Math.max(0.1, z - 0.1))} className="text-zinc-500 hover:text-white transition-colors">-</button>
        <span className="text-[11px] font-bold text-zinc-400 w-10 text-center uppercase tracking-tighter">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-zinc-500 hover:text-white transition-colors">+</button>
      </div>
    </main>
  );
};
