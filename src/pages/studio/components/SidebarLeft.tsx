import React from "react";
import { Image as ImageIcon, Type, Square, Circle, Triangle, Star, Palette, Trash2 } from "lucide-react";

interface SidebarLeftProps {
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddText: () => void;
  onAddShape: (type: "rect" | "circle" | "triangle" | "star") => void;
  onUpdateBg: (color: string) => void;
  onClearAll: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ onAddImage, onAddText, onAddShape, onUpdateBg, onClearAll }) => {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex items-start gap-4">
      <aside className="w-14 bg-zinc-900/60 backdrop-blur-2xl border border-zinc-800/50 rounded-2xl flex flex-col items-center py-4 gap-4 shadow-2xl">
        <label className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer group relative">
          <ImageIcon size={20} />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Images</div>
          <input type="file" className="hidden" accept="image/*" onChange={onAddImage} />
        </label>

        <button onClick={onAddText} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all group relative">
          <Type size={20} />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Text</div>
        </button>

        <button 
          onClick={() => setActiveMenu(activeMenu === 'shapes' ? null : 'shapes')} 
          className={`p-2.5 rounded-xl transition-all group relative ${activeMenu === 'shapes' ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          <Square size={20} />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Shapes</div>
        </button>

        <button 
          onClick={() => setActiveMenu(activeMenu === 'bg' ? null : 'bg')}
          className={`p-2.5 rounded-xl transition-all group relative ${activeMenu === 'bg' ? 'bg-blue-600 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
        >
          <Palette size={20} />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Background</div>
        </button>

        <div className="w-8 h-[1px] bg-zinc-800 my-1"></div>

        <button onClick={() => { if (window.confirm("Clear all layers?")) onClearAll(); }} className="p-2.5 rounded-xl hover:bg-red-900/20 text-zinc-600 hover:text-red-500 transition-all group relative">
          <Trash2 size={20} />
          <div className="absolute left-full ml-3 px-2 py-1 bg-red-900/80 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Clear All</div>
        </button>
      </aside>

      {/* Floating Submenus */}
      {activeMenu === 'shapes' && (
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-3 rounded-2xl flex flex-col gap-2 shadow-2xl animate-in slide-in-from-left-2 duration-200">
          <button onClick={() => { onAddShape('rect'); setActiveMenu(null); }} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 text-xs font-bold transition-all pr-8">
            <Square size={16} /> Rectangle
          </button>
          <button onClick={() => { onAddShape('circle'); setActiveMenu(null); }} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 text-xs font-bold transition-all pr-8">
            <Circle size={16} /> Circle
          </button>
          <button onClick={() => { onAddShape('triangle'); setActiveMenu(null); }} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 text-xs font-bold transition-all pr-8">
            <Triangle size={16} /> Triangle
          </button>
          <button onClick={() => { onAddShape('star'); setActiveMenu(null); }} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg text-zinc-300 text-xs font-bold transition-all pr-8">
            <Star size={16} /> Star
          </button>
        </div>
      )}

      {activeMenu === 'bg' && (
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl w-48 shadow-2xl animate-in slide-in-from-left-2 duration-200">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Project Canvas</h4>
          <div className="grid grid-cols-4 gap-2">
            {['#000000', '#ffffff', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#09090b'].map(c => (
              <button 
                key={c} 
                onClick={() => {
                  onUpdateBg(c);
                  setActiveMenu(null);
                }}
                className="w-8 h-8 rounded-lg border border-zinc-800 hover:scale-110 transition-transform" 
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
