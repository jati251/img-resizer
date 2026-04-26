import React, { useState, useEffect } from "react";
import { X, Layout, Maximize2, Check } from "lucide-react";

interface ProjectSettingsModalProps {
  currentWidth: number;
  currentHeight: number;
  onClose: () => void;
  onUpdate: (width: number, height: number) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ 
  currentWidth, 
  currentHeight, 
  onClose, 
  onUpdate 
}) => {
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Maximize2 size={18} />
             </div>
             <h2 className="text-sm font-bold text-white uppercase tracking-widest">Project Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 text-zinc-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Adjust your canvas dimensions. Note: Layers will keep their current positions.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider ml-1">Width (px)</label>
              <input 
                type="number" 
                value={width} 
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 transition-all outline-none" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider ml-1">Height (px)</label>
              <input 
                type="number" 
                value={height} 
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 transition-all outline-none" 
              />
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
             <div className="mt-0.5 text-blue-400">
                <Layout size={14} />
             </div>
             <p className="text-[10px] text-blue-400/80 leading-relaxed italic">
                Pro tip: Larger canvases provide higher export quality but may impact performance on older devices.
             </p>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/30 border-t border-zinc-800 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onUpdate(width, height)}
            className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} /> Update Canvas
          </button>
        </div>
      </div>
    </div>
  );
};
