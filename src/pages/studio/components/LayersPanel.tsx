import React from "react";
import { Layer } from "../types";
import { 
  Image as ImageIcon, 
  Type as TypeIcon, 
  Eye, 
  EyeOff, 
  Trash2, 
  Lock, 
  Unlock,
  GripVertical,
  Square
} from "lucide-react";

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  draggedLayerIndex: number | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string, hidden: boolean) => void;
  onUpdate: (id: string, updates: Partial<Layer>) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  selectedLayerId,
  draggedLayerIndex,
  onSelect,
  onToggleVisibility,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-zinc-950/20 border-t border-zinc-800/50">
      <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
         <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Layers Stack</h3>
         <span className="text-[10px] font-mono text-zinc-600">{layers.length} layers</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {layers.map((layer, index) => (
          <div 
            key={layer.id} 
            draggable 
            onDragStart={() => onDragStart(index)} 
            onDragOver={(e) => onDragOver(e, index)} 
            onDragEnd={onDragEnd} 
            onClick={() => onSelect(layer.id)} 
            className={`group flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border ${selectedLayerId === layer.id ? 'bg-zinc-800 border-zinc-700/50 shadow-lg' : 'bg-transparent border-transparent hover:bg-zinc-900/50'} ${draggedLayerIndex === index ? 'opacity-50 border-blue-500 border-dashed' : ''}`}
          >
            <div className="text-zinc-700 group-hover:text-zinc-500 transition-colors">
               <GripVertical size={14} />
            </div>

            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedLayerId === layer.id ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-500'}`}>
                {layer.type === 'image' && <ImageIcon size={16} />}
                {layer.type === 'text' && <TypeIcon size={16} />}
                {layer.type === 'shape' && <Square size={16} />}
              </div>
              <div className="flex flex-col min-w-0">
                 <span className={`text-[11px] font-medium truncate ${layer.hidden ? 'text-zinc-600' : 'text-zinc-300'}`}>{layer.name}</span>
                 <span className="text-[9px] text-zinc-600 uppercase tracking-tighter">{layer.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onUpdate(layer.id, { locked: !layer.locked }) }} 
                className={`p-1.5 rounded-md transition-colors ${layer.locked ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700'}`}
                title={layer.locked ? "Unlock" : "Lock"}
              >
                {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id, !layer.hidden) }} 
                className={`p-1.5 rounded-md transition-colors ${layer.hidden ? 'text-zinc-400 bg-zinc-800' : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-700'}`}
                title={layer.hidden ? "Show" : "Hide"}
              >
                {layer.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(layer.id) }} 
                className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {layers.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center opacity-40">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-2">
               <ImageIcon size={20} className="text-zinc-600" />
            </div>
            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">No Layers</span>
          </div>
        )}
      </div>
    </div>
  );
};
