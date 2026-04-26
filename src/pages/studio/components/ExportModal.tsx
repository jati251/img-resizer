import React, { useState, useEffect } from "react";
import {
  X,
  Download,
  FileJson,
  FileImage,
  Settings,
  HardDrive,
} from "lucide-react";

interface ExportModalProps {
  canvas: HTMLCanvasElement | null;
  filename: string;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
}

export interface ExportSettings {
  format: "image/png" | "image/jpeg" | "image/webp";
  quality: number;
  filename: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  canvas,
  filename,
  onClose,
  onExport,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: "image/png",
    quality: 0.9,
    filename: filename || "my-design",
  });
  const [estimatedSize, setEstimatedSize] = useState<string>("0 KB");

  useEffect(() => {
    if (!canvas) return;
    const updateSize = () => {
      const dataUrl = canvas.toDataURL(settings.format, settings.quality);
      const size = Math.round((dataUrl.length * 3) / 4);
      setEstimatedSize(
        size > 1024 * 1024
          ? `${(size / (1024 * 1024)).toFixed(2)} MB`
          : `${(size / 1024).toFixed(0)} KB`,
      );
    };
    const timer = setTimeout(updateSize, 300);
    return () => clearTimeout(timer);
  }, [canvas, settings.format, settings.quality]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Download size={18} />
            </div>
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">
              Export Design
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 flex-1">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <FileJson size={12} /> Filename
            </label>
            <input
              type="text"
              value={settings.filename}
              onChange={(e) =>
                setSettings({ ...settings, filename: e.target.value })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-white focus:border-blue-500 transition-all outline-none"
              placeholder="Give your masterpiece a name"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <FileImage size={12} /> Format
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
              {(
                [
                  { id: "image/png", label: "PNG" },
                  { id: "image/jpeg", label: "JPG" },
                  { id: "image/webp", label: "WEBP" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSettings({ ...settings, format: f.id })}
                  className={`py-3 rounded-xl text-xs font-bold transition-all ${settings.format === f.id ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-600 hover:text-zinc-400"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {settings.format !== "image/png" && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Settings size={12} /> Quality
                </label>
                <span className="text-xs font-mono text-blue-400">
                  {Math.round(settings.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={settings.quality}
                onChange={(e) =>
                  setSettings({ ...settings, quality: Number(e.target.value) })
                }
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          )}

          <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 rounded-lg text-zinc-500">
                <HardDrive size={16} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase">
                  Estimated Size
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {estimatedSize}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-zinc-500 uppercase">
                Resolution
              </div>
              <div className="text-sm font-bold text-zinc-300 font-mono">
                {canvas?.width} × {canvas?.height}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/30 border-t border-zinc-800">
          <button
            onClick={() => onExport(settings)}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <Download
              size={18}
              className="group-hover:-translate-y-1 transition-transform"
            />
            Download Artwork
          </button>
        </div>
      </div>
    </div>
  );
};
