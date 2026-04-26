import React, { useEffect, useState } from "react";
import {
  X,
  MousePointer2,
  Layers,
  Palette,
  Keyboard,
  ChevronRight,
  ChevronLeft,
  Brush,
} from "lucide-react";

interface GuideModalProps {
  onClose: () => void;
}

const GUIDE_PAGES = [
  {
    title: "Welcome to Kuwas",
    description:
      "Kuwas (Indonesian for 'Brush') is a professional-grade creative studio designed for top-tier artists. Let's get you familiar with the workspace.",
    icon: <Brush size={40} className="text-blue-500" />,
    image: "/guide/welcome.png", // We'll use icons/placeholders for now
    features: [
      "High-performance canvas engine",
      "Professional layer management",
      "Magic AI background removal",
    ],
  },
  {
    title: "Mastering Navigation",
    description:
      "Move through your masterpiece with ease. Kuwas uses natural interaction patterns used by industry professionals.",
    icon: <MousePointer2 size={40} className="text-purple-500" />,
    tips: [
      {
        key: "Zoom",
        value:
          "Use Mouse Wheel or Trackpad Pinch to zoom exactly where your cursor is.",
      },
      {
        key: "Pan",
        value: "Hold SPACE and Drag to move around the canvas effortlessly.",
      },
      {
        key: "Reset",
        value: "Go to View > Reset View to fit everything back to screen.",
      },
    ],
  },
  {
    title: "Creative Tools",
    description:
      "The left sidebar is your creative engine. Add images, text, and vector shapes to build your composition.",
    icon: <Palette size={40} className="text-emerald-500" />,
    features: [
      "Images: Drag & drop or upload any asset",
      "Shapes: Rectangles, Circles, Stars, and Triangles",
      "Magic BG: One-click AI background removal for any image layer",
    ],
  },
  {
    title: "Layers & Properties",
    description:
      "Control every detail of your elements using the right panels.",
    icon: <Layers size={40} className="text-orange-500" />,
    features: [
      "Layers: Drag layers to change their depth or lock them to prevent accidental edits.",
      "Properties: Adjust opacity, rotation, and advanced blend modes (Multiply, Overlay, etc).",
      "Styles: Customize shape fills, strokes, and typography with precision.",
    ],
  },
  {
    title: "Artist Shortcuts",
    description:
      "Work at the speed of thought with these essential keyboard shortcuts.",
    icon: <Keyboard size={40} className="text-pink-500" />,
    shortcuts: [
      { key: "SPACE", desc: "Pan Workspace" },
      { key: "⌘ + G", desc: "Toggle Grid" },
      { key: "⇧ + R", desc: "Toggle Rulers" },
      { key: "⌘ + E", desc: "Export Design" },
      { key: "⌘ + 0", desc: "Fit to Screen" },
    ],
  },
];

export const GuideModal: React.FC<GuideModalProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const page = GUIDE_PAGES[currentPage];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col h-[540px]">
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Brush size={16} />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-zinc-100">
              Artist Guide
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-2/5 bg-zinc-950/50 p-8 flex flex-col items-center justify-center text-center border-r border-zinc-800/30">
            <div className="mb-6 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl animate-in zoom-in-95 duration-500">
              {page.icon}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">
                Step {currentPage + 1} of {GUIDE_PAGES.length}
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {page.title}
              </h2>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
              {page.description}
            </p>

            {page.features && (
              <ul className="space-y-4">
                {page.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-150 transition-transform" />
                    <span className="text-xs text-zinc-300 font-medium">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {page.tips && (
              <div className="space-y-4">
                {page.tips.map((t, i) => (
                  <div
                    key={i}
                    className="p-3 bg-zinc-800/30 border border-zinc-800/50 rounded-xl space-y-1"
                  >
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {t.key}
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {t.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {page.shortcuts && (
              <div className="grid grid-cols-1 gap-2">
                {page.shortcuts.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50"
                  >
                    <span className="text-[11px] text-zinc-300 font-medium">
                      {s.desc}
                    </span>
                    <kbd className="px-2 py-1 bg-zinc-800 text-zinc-100 text-[10px] font-mono rounded-lg border border-zinc-700">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800/50 flex items-center justify-between">
          <div className="flex gap-1">
            {GUIDE_PAGES.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? "w-4 bg-blue-500" : "bg-zinc-800"}`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {currentPage > 0 && (
              <button
                onClick={() => setCurrentPage((c) => c - 1)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            <button
              onClick={() => {
                if (currentPage < GUIDE_PAGES.length - 1) {
                  setCurrentPage((c) => c + 1);
                } else {
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {currentPage === GUIDE_PAGES.length - 1
                ? "Start Designing"
                : "Next Step"}
              {currentPage < GUIDE_PAGES.length - 1 && (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
