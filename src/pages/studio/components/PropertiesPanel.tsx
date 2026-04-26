import React from "react";
import { Layer, ImageLayer, TextLayer, ShapeLayer } from "../types";
import { 
  Trash2, 
  Layout, 
  Image as ImageIcon, 
  Crop, 
  Sparkles, 
  Sliders, 
  Type as TypeIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Maximize2,
  ChevronDown,
  Lock,
  Unlock
} from "lucide-react";

interface PropertiesPanelProps {
  selectedLayer: Layer | null;
  isFreeTransform: boolean;
  isCropping: boolean;
  isProcessingBg: boolean;
  onUpdate: (id: string, updates: Partial<Layer>) => void;
  onToggleFree: () => void;
  onToggleCrop: () => void;
  onRemoveBg: () => void;
  onDelete: (id: string) => void;
}

const FONTS = [
  "Inter, sans-serif",
  "Roboto, sans-serif",
  "Playfair Display, serif",
  "Montserrat, sans-serif",
  "Oswald, sans-serif",
  "Lora, serif",
  "Outfit, sans-serif",
  "Poppins, sans-serif",
  "system-ui, sans-serif"
];

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedLayer, 
  isFreeTransform, 
  isCropping, 
  isProcessingBg, 
  onUpdate, 
  onToggleFree, 
  onToggleCrop, 
  onRemoveBg,
  onDelete
}) => {
  if (!selectedLayer) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0c0c0e]">
      <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 text-zinc-700">
        <Layout size={24} />
      </div>
      <p className="text-zinc-500 text-xs font-medium">No layer selected</p>
      <p className="text-zinc-700 text-[10px] mt-1 max-w-[160px]">Select any element on the canvas to edit its properties</p>
    </div>
  );

  const isImage = selectedLayer.type === "image";
  const isText = selectedLayer.type === "text";
  const isShape = selectedLayer.type === "shape";

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0c0c0e] overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Properties</h2>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onUpdate(selectedLayer.id, { locked: !selectedLayer.locked })} 
            className={`p-2 rounded-lg transition-all active:scale-95 ${selectedLayer.locked ? 'text-blue-400 bg-blue-500/10' : 'text-zinc-600 hover:bg-zinc-800'}`}
            title={selectedLayer.locked ? "Unlock Layer" : "Lock Layer"}
          >
            {selectedLayer.locked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          <button 
            onClick={() => onDelete(selectedLayer.id)} 
            className="p-2 hover:bg-red-500/10 hover:text-red-400 text-zinc-600 rounded-lg transition-all active:scale-95"
            title="Delete Layer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* Layout Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Layout size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Layout</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] text-zinc-600 font-bold uppercase">X Position</label>
              <input type="number" value={Math.round(selectedLayer.x)} onChange={(e) => onUpdate(selectedLayer.id, { x: Number(e.target.value) })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-zinc-600 font-bold uppercase">Y Position</label>
              <input type="number" value={Math.round(selectedLayer.y)} onChange={(e) => onUpdate(selectedLayer.id, { y: Number(e.target.value) })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-zinc-600 font-bold uppercase">Width</label>
              <input type="number" value={Math.round(selectedLayer.width)} onChange={(e) => onUpdate(selectedLayer.id, { width: Number(e.target.value) })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-zinc-600 font-bold uppercase">Height</label>
              <input type="number" value={Math.round(selectedLayer.height)} onChange={(e) => onUpdate(selectedLayer.id, { height: Number(e.target.value) })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300" />
            </div>
          </div>
          <div className="pt-2 space-y-4">
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Rotation</label>
                  <span className="text-[10px] text-zinc-400 font-mono">{Math.round((selectedLayer.rotation * 180) / Math.PI)}°</span>
               </div>
               <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={selectedLayer.rotation} onChange={(e) => onUpdate(selectedLayer.id, { rotation: Number(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Opacity</label>
                  <span className="text-[10px] text-zinc-400 font-mono">{selectedLayer.opacity}%</span>
               </div>
               <input type="range" min={0} max={100} value={selectedLayer.opacity} onChange={(e) => onUpdate(selectedLayer.id, { opacity: Number(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>
            <div className="space-y-1.5">
               <label className="text-[9px] text-zinc-600 font-bold uppercase">Blend Mode</label>
               <div className="relative group">
                 <select 
                   value={selectedLayer.blendMode || "source-over"} 
                   onChange={(e) => onUpdate(selectedLayer.id, { blendMode: e.target.value as any })}
                   className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300 appearance-none cursor-pointer capitalize"
                 >
                   {["source-over", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"].map(mode => (
                     <option key={mode} value={mode}>{mode.replace('-', ' ')}</option>
                   ))}
                 </select>
                 <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-hover:text-zinc-400 transition-colors" />
               </div>
            </div>
          </div>
        </section>

        {isShape && (
          <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 text-zinc-500">
              <Sparkles size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Shape Styles</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-600 font-bold uppercase">Fill Color</label>
                <div className="flex items-center gap-3 h-10 bg-zinc-900/50 border border-zinc-800 rounded-xl px-2 group focus-within:border-zinc-600 transition-all">
                  <div 
                    className="w-6 h-6 rounded-lg border border-zinc-700/50 group-hover:scale-105 transition-transform shrink-0 relative"
                    style={{ backgroundColor: (selectedLayer as ShapeLayer).fill }}
                  >
                    <input 
                      type="color" 
                      value={(selectedLayer as ShapeLayer).fill} 
                      onChange={(e) => onUpdate(selectedLayer.id, { fill: e.target.value })} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={(selectedLayer as ShapeLayer).fill} 
                    onChange={(e) => onUpdate(selectedLayer.id, { fill: e.target.value })} 
                    className="w-full bg-transparent text-[10px] font-mono outline-none text-zinc-400 uppercase tracking-widest pl-0" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-600 font-bold uppercase">Stroke Color</label>
                <div className="flex items-center gap-3 h-10 bg-zinc-900/50 border border-zinc-800 rounded-xl px-2 group focus-within:border-zinc-600 transition-all">
                  <div 
                    className="w-6 h-6 rounded-lg border border-zinc-700/50 group-hover:scale-105 transition-transform shrink-0 relative"
                    style={{ backgroundColor: (selectedLayer as ShapeLayer).stroke }}
                  >
                    <input 
                      type="color" 
                      value={(selectedLayer as ShapeLayer).stroke} 
                      onChange={(e) => onUpdate(selectedLayer.id, { stroke: e.target.value })} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={(selectedLayer as ShapeLayer).stroke} 
                    onChange={(e) => onUpdate(selectedLayer.id, { stroke: e.target.value })} 
                    className="w-full bg-transparent text-[10px] font-mono outline-none text-zinc-400 uppercase tracking-widest pl-0" 
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Stroke Width</label>
                  <span className="text-[10px] text-zinc-400 font-mono">{(selectedLayer as ShapeLayer).strokeWidth}px</span>
                </div>
                <input 
                  type="range" 
                  min={0} 
                  max={20} 
                  value={(selectedLayer as ShapeLayer).strokeWidth} 
                  onChange={(e) => onUpdate(selectedLayer.id, { strokeWidth: Number(e.target.value) })} 
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" 
                />
              </div>
            </div>
          </section>
        )}

        {isImage && (
          <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 text-zinc-500">
              <ImageIcon size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Image Assets</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={onToggleCrop}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all group active:scale-95"
              >
                <Crop size={20} className="text-zinc-500 group-hover:text-white transition-colors" />
                <span className="text-[10px] font-medium text-zinc-400">Crop Mask</span>
              </button>
              <button 
                onClick={onRemoveBg}
                disabled={isProcessingBg}
                className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-700 transition-all disabled:opacity-50 group active:scale-95 overflow-hidden relative"
              >
                {isProcessingBg && <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />}
                <Sparkles size={20} className={`${isProcessingBg ? 'text-blue-400 animate-spin' : 'text-zinc-500 group-hover:text-white transition-colors'}`} />
                <span className="text-[10px] font-medium text-zinc-400">{isProcessingBg ? 'Magic...' : 'Magic BG'}</span>
              </button>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-zinc-800/50">
               <div className="flex items-center gap-2 text-zinc-500">
                 <Sliders size={12} />
                 <span className="text-[9px] font-bold uppercase tracking-wider">Pro Adjustments</span>
               </div>
               {Object.entries((selectedLayer as ImageLayer).filters).map(([key, value]) => {
                 let min = 0; let max = 200; let unit = '%';
                 if (key === 'blur') { max = 20; unit = 'px'; }
                 if (key === 'hueRotate') { max = 360; unit = '°'; }
                 if (key === 'sepia' || key === 'grayscale' || key === 'invert') { max = 100; }
                 
                 return (
                   <div key={key} className="space-y-2">
                     <div className="flex justify-between items-center">
                       <label className="text-[10px] text-zinc-600 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                       <span className="text-[10px] text-zinc-400 font-mono">{value}{unit}</span>
                     </div>
                     <input 
                       type="range" 
                       min={min} 
                       max={max} 
                       value={value} 
                       onChange={(e) => onUpdate(selectedLayer.id, { filters: { ...(selectedLayer as ImageLayer).filters, [key]: Number(e.target.value) } })} 
                       className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" 
                     />
                   </div>
                 );
               })}
            </div>
          </section>
        )}

        {isText && (
          <section className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 text-zinc-500">
              <TypeIcon size={12} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Typography</span>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-600 font-bold uppercase">Content</label>
                <textarea 
                  value={(selectedLayer as TextLayer).text} 
                  onChange={(e) => onUpdate(selectedLayer.id, { text: e.target.value })} 
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300 min-h-[80px] resize-none"
                  placeholder="Type something..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-zinc-600 font-bold uppercase">Font Family</label>
                <div className="relative group">
                  <select 
                    value={(selectedLayer as TextLayer).fontFamily} 
                    onChange={(e) => onUpdate(selectedLayer.id, { fontFamily: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300 appearance-none cursor-pointer"
                  >
                    {FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f.split(',')[0] }}>{f.split(',')[0]}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none group-hover:text-zinc-400 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Font Size</label>
                  <input type="number" value={(selectedLayer as TextLayer).fontSize} onChange={(e) => onUpdate(selectedLayer.id, { fontSize: Number(e.target.value) })} className="w-full h-10 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs focus:border-zinc-600 outline-none transition-all text-zinc-300" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-600 font-bold uppercase">Color</label>
                  <div className="flex items-center gap-3 h-10 bg-zinc-900/50 border border-zinc-800 rounded-xl px-2 group focus-within:border-zinc-600 transition-all">
                    <div 
                      className="w-6 h-6 rounded-lg border border-zinc-700/50 group-hover:scale-105 transition-transform shrink-0 relative"
                      style={{ backgroundColor: (selectedLayer as TextLayer).color }}
                    >
                      <input 
                        type="color" 
                        value={(selectedLayer as TextLayer).color} 
                        onChange={(e) => onUpdate(selectedLayer.id, { color: e.target.value })} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                    <input 
                      type="text" 
                      value={(selectedLayer as TextLayer).color} 
                      onChange={(e) => onUpdate(selectedLayer.id, { color: e.target.value })} 
                      className="w-full bg-transparent text-[10px] font-mono outline-none text-zinc-400 uppercase tracking-widest pl-0" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button 
                    key={align}
                    onClick={() => onUpdate(selectedLayer.id, { textAlign: align })}
                    className={`flex-1 py-1.5 rounded-lg flex justify-center transition-all ${ (selectedLayer as TextLayer).textAlign === align ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400' }`}
                  >
                    {align === 'left' && <AlignLeft size={16} />}
                    {align === 'center' && <AlignCenter size={16} />}
                    {align === 'right' && <AlignRight size={16} />}
                  </button>
                ))}
              </div>

              <div className="space-y-4 pt-2">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <label className="text-[9px] text-zinc-600 font-bold uppercase">Letter Spacing</label>
                       <span className="text-[10px] text-zinc-400 font-mono">{(selectedLayer as TextLayer).letterSpacing}px</span>
                    </div>
                    <input type="range" min={-5} max={20} step={0.5} value={(selectedLayer as TextLayer).letterSpacing} onChange={(e) => onUpdate(selectedLayer.id, { letterSpacing: Number(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
                 </div>

                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <label className="text-[9px] text-zinc-600 font-bold uppercase">Line Height</label>
                       <span className="text-[10px] text-zinc-400 font-mono">{(selectedLayer as TextLayer).lineHeight}</span>
                    </div>
                    <input type="range" min={0.5} max={3} step={0.1} value={(selectedLayer as TextLayer).lineHeight} onChange={(e) => onUpdate(selectedLayer.id, { lineHeight: Number(e.target.value) })} className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white" />
                 </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
