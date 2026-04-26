import React from "react";
import { Download, Ruler, EyeOff, Grid3X3 } from "lucide-react";

interface TopbarProps {
  onExport: () => void;
  showGuidelines?: boolean;
  onToggleGuidelines?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ 
  onExport, 
  showGuidelines = true, 
  onToggleGuidelines,
  showGrid = true,
  onToggleGrid
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]">S</div>
        <h1 className="text-sm font-medium tracking-tight text-zinc-200">Studio <span className="text-zinc-500 font-normal">/ New Design</span></h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleGuidelines}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${showGuidelines ? 'bg-zinc-800 text-white shadow-inner' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
            title="Toggle Guidelines"
          >
            {showGuidelines ? <Ruler size={12} /> : <EyeOff size={12} />} 
            <span className="hidden lg:inline">{showGuidelines ? 'Rulers' : 'Rulers'}</span>
          </button>
          <button 
            onClick={onToggleGrid}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${showGrid ? 'bg-zinc-800 text-white shadow-inner' : 'bg-transparent text-zinc-500 hover:text-zinc-300'}`}
            title="Toggle Grid"
          >
            <Grid3X3 size={12} />
            <span className="hidden lg:inline">{showGrid ? 'Grid' : 'Grid'}</span>
          </button>
        </div>
        <div className="w-px h-4 bg-zinc-800 mx-1"></div>
        <button onClick={onExport} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Download size={14} /> Export
        </button>
      </div>
    </header>
  );
};
