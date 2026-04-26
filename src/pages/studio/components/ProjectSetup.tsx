import React, { useState } from "react";
import { Brush, Image as ImageIcon, FolderOpen, Settings, RotateCcw, Smartphone, Monitor } from "lucide-react";

interface ProjectSetupProps {
  onConfirm: (width: number, height: number, transparent: boolean) => void;
  onOpenImage: (img: HTMLImageElement) => void;
  onOpenProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PRESETS = [
  { name: "Instagram", w: 1080, h: 1080 },
  { name: "HD Video", w: 1920, h: 1080 },
  { name: "A4 Paper", w: 2480, h: 3508 },
  { name: "Story", w: 1080, h: 1920 },
];

export const ProjectSetup: React.FC<ProjectSetupProps> = ({
  onConfirm,
  onOpenImage,
  onOpenProject,
}) => {
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

  const isPortrait = customHeight > customWidth;

  const toggleOrientation = () => {
    setCustomWidth(customHeight);
    setCustomHeight(customWidth);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-[400px] w-full bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-zinc-800/50 bg-zinc-950/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Brush size={16} />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-sm font-black tracking-tighter text-white uppercase italic">
                Kuwas
              </span>
              <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-widest">
                Creative Studio
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Setup
          </span>
        </div>

        <div className="p-6 space-y-4">
          {/* Main Actions */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all cursor-pointer group active:scale-95">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ImageIcon size={20} />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Image</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            <label className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-800/30 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all cursor-pointer group active:scale-95 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <FolderOpen size={20} />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">Project</span>
              <input type="file" accept=".kuwas" onChange={onOpenProject} className="hidden" />
            </label>
          </div>

          {/* Presets Grid */}
          <div className="space-y-3">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Quick Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setCustomWidth(p.w);
                    setCustomHeight(p.h);
                  }}
                  className={`flex flex-col p-3 border rounded-xl transition-all text-left group ${customWidth === p.w && customHeight === p.h ? "bg-blue-600/10 border-blue-500/50" : "bg-zinc-950/50 border-zinc-800/50 hover:border-zinc-600"}`}
                >
                  <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white">
                    {p.name}
                  </span>
                  <span className="text-[9px] text-zinc-600 font-mono">
                    {p.w} × {p.h}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Settings */}
          <div className="space-y-4 pt-4 border-t border-zinc-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                Custom Size
              </h3>
              <button
                onClick={toggleOrientation}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[9px] font-bold rounded-lg border border-zinc-700/50 transition-all active:scale-95"
              >
                {isPortrait ? <Smartphone size={12} /> : <Monitor size={12} />}
                {isPortrait ? "PORTRAIT" : "LANDSCAPE"}
                <RotateCcw size={10} className="ml-1 opacity-50" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-700 font-bold uppercase ml-1">
                  Width
                </span>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-700 font-bold uppercase ml-1">
                  Height
                </span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsTransparent(false)}
                className={`flex-1 py-3 text-[9px] font-bold rounded-xl border transition-all ${!isTransparent ? "bg-zinc-100 border-white text-black shadow-lg" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
              >
                WHITE BACKGROUND
              </button>
              <button
                onClick={() => setIsTransparent(true)}
                className={`flex-1 py-3 text-[9px] font-bold rounded-xl border transition-all ${isTransparent ? "bg-zinc-100 border-white text-black shadow-lg" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
              >
                TRANSPARENT
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-zinc-950 border-t border-zinc-800/50 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(customWidth, customHeight, isTransparent)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            Start Project
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </button>
          <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-600 font-medium italic">
            <Settings size={12} />
            Adjustable later in Edit menu
          </div>
        </div>
      </div>
    </div>
  );
};
