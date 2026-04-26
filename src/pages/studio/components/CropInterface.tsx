import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import { ImageLayer } from "../types";
import { Square, Circle } from "lucide-react";

interface CropResult extends Area {
  shape: 'rect' | 'round' | 'star' | 'heart' | 'cloud' | 'triangle';
}

const SHAPES = [
  { id: 'rect', label: 'Rectangle', icon: <Square size={16} /> },
  { id: 'round', label: 'Circle', icon: <Circle size={16} /> },
  { id: 'star', label: 'Star', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
  { id: 'heart', label: 'Heart', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { id: 'cloud', label: 'Cloud', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg> },
  { id: 'triangle', label: 'Triangle', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg> },
] as const;

interface CropInterfaceProps {
  layer: ImageLayer;
  onConfirm: (crop: CropResult) => void;
  onCancel: () => void;
}

export const CropInterface: React.FC<CropInterfaceProps> = ({ layer, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const [shape, setShape] = useState<CropResult['shape']>('rect');
  const [completedCrop, setCompletedCrop] = useState<Area | null>(null);

  const onCropComplete = useCallback((_paragraphedArea: Area, pixelCrop: Area) => {
    setCompletedCrop(pixelCrop);
  }, []);

  const PRESETS = [
    { name: "Free", aspect: undefined },
    { name: "Square", aspect: 1 },
    { name: "Portrait", aspect: 4 / 5 },
    { name: "Landscape", aspect: 16 / 9 },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-8">
      <div className="relative w-full max-w-4xl h-[60vh] bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-800 shadow-2xl">
        <Cropper
          image={layer.image.src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={shape === 'round' ? 'round' : 'rect'}
          showGrid={true}
          onCropChange={setCrop}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
          classes={{
            containerClassName: "bg-zinc-900",
            mediaClassName: "max-w-full max-h-full",
            cropAreaClassName: "border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
          }}
        />
      </div>

      <div className="mt-8 bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] flex flex-col items-center gap-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-4xl">
        <div className="flex flex-col gap-4 w-full">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">Aspect Ratio</span>
            <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-x-auto no-scrollbar">
               {PRESETS.map(p => (
                 <button 
                    key={p.name} 
                    onClick={() => { setAspect(p.aspect); setShape('rect'); }}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${aspect === p.aspect && shape === 'rect' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'}`}
                 >
                    {p.name}
                 </button>
               ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-2">Shape Mask</span>
            <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-x-auto no-scrollbar">
               {SHAPES.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => {
                      setShape(s.id as CropResult['shape']);
                      if (s.id !== 'rect') setAspect(1);
                    }} 
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap ${shape === s.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
                  >
                    {s.icon} <span>{s.label}</span>
                  </button>
               ))}
            </div>
          </div>
        </div>

        <div className="w-64 flex items-center gap-4">
           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Zoom</span>
           <input 
              type="range" 
              min={1} 
              max={3} 
              step={0.1} 
              value={zoom} 
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
           />
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800 w-full justify-center">
           <button 
              onClick={onCancel}
              className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold transition-all active:scale-[0.98]"
           >
              Cancel
           </button>
           <button 
              onClick={() => completedCrop && onConfirm({ ...completedCrop, shape })}
              className="px-8 py-3 bg-white hover:bg-zinc-200 text-black rounded-2xl text-xs font-bold transition-all active:scale-[0.98]"
           >
              Apply Crop
           </button>
        </div>
      </div>
    </div>
  );
};
