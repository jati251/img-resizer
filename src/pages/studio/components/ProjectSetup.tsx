import React, { useState } from "react";
import { Brush } from "lucide-react";

interface ProjectSetupProps {
  onConfirm: (width: number, height: number, transparent: boolean) => void;
  onOpenImage: (img: HTMLImageElement) => void;
}

const PRESETS = [
  { name: "A4 Portrait", width: 2480, height: 3508 },
  { name: "A4 Landscape", width: 3508, height: 2480 },
  { name: "Instagram Post", width: 1080, height: 1080 },
  { name: "Instagram Story", width: 1080, height: 1920 },
  { name: "Full HD", width: 1920, height: 1080 },
];

export const ProjectSetup: React.FC<ProjectSetupProps> = ({ onConfirm, onOpenImage }) => {
  const [customWidth, setCustomWidth] = useState(1920);
  const [customHeight, setCustomHeight] = useState(1080);
  const [isTransparent, setIsTransparent] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => onOpenImage(img);
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Brush size={20} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col -space-y-1">
                <span className="text-xl font-black tracking-tighter text-white uppercase italic leading-none">Kuwas</span>
                <span className="text-[8px] text-zinc-500 font-medium uppercase tracking-[0.3em] pl-0.5">Creative Studio</span>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2 leading-tight">Create your next<br />masterpiece.</h1>
              <p className="text-zinc-400 text-sm max-w-[240px]">Select a canvas preset or upload an image to begin.</p>
            </div>
          </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Quick Start</h3>
              <label className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl cursor-pointer transition-all shadow-lg shadow-blue-500/20 group active:scale-[0.98]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <div className="text-left">
                  <div className="font-bold text-base">Open from Image</div>
                  <div className="text-[10px] text-blue-100/70">Use image size as canvas</div>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Presets</h3>
              <div className="max-h-[240px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => onConfirm(p.width, p.height, false)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
                  >
                    <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono group-hover:text-zinc-300 transition-colors">{p.width} × {p.height}</span>
                  </button>
                ))}
              </div>
            </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-[24px] space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Custom Dimensions</h3>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-medium ml-1">Width</label>
                <input 
                  type="number" 
                  value={customWidth} 
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:border-white transition-colors outline-none" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-500 font-medium ml-1">Height</label>
                <input 
                  type="number" 
                  value={customHeight} 
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-white focus:border-white transition-colors outline-none" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-1 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
              <button 
                onClick={() => setIsTransparent(false)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${!isTransparent ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                SOLID WHITE
              </button>
              <button 
                onClick={() => setIsTransparent(true)}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${isTransparent ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                TRANSPARENT
              </button>
            </div>

            <button
              onClick={() => onConfirm(customWidth, customHeight, isTransparent)}
              className="w-full py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>

          <div className="pt-6 border-t border-zinc-800">
             <div className="flex items-center gap-3 text-zinc-500">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </div>
                <p className="text-[10px] leading-relaxed italic">You can change canvas size later in settings.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
