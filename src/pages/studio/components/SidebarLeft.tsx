import React from "react";
import { IconImage, IconType, IconTrash } from "../icons";

interface SidebarLeftProps {
  onAddImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddText: () => void;
  onClearAll: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ onAddImage, onAddText, onClearAll }) => {
  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20">
      <aside className="w-14 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl flex flex-col items-center py-4 gap-4 shadow-2xl">
        <label className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer group relative">
          <IconImage />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Add Image</div>
          <input type="file" className="hidden" accept="image/*" onChange={onAddImage} />
        </label>
        <button onClick={onAddText} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all group relative">
          <IconType />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Add Text</div>
        </button>
        <div className="w-8 h-[1px] bg-zinc-800 my-1"></div>
        <button onClick={() => { if (window.confirm("Clear all layers?")) onClearAll(); }} className="p-2.5 rounded-xl hover:bg-zinc-800 text-zinc-500 transition-all group relative">
          <IconTrash />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-800 text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">Clear All</div>
        </button>
      </aside>
    </div>
  );
};
