import React, { useEffect } from "react";
import { X, Brush, Heart } from "lucide-react";

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative">
        {/* Animated Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[100px] -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-zinc-800 text-zinc-500 hover:text-white rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 flex flex-col items-center text-center">
          {/* Logo */}
          <div className="w-20 h-20 rounded-[28px] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 mb-6 group transition-transform hover:scale-105 active:scale-95 duration-300">
            <Brush size={40} strokeWidth={2.5} />
          </div>

          {/* Branding */}
          <div className="space-y-1 mb-6">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
              Kuwas
            </h1>
            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em] pl-1">
              Creative Studio
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-zinc-400 text-sm leading-relaxed px-4">
              A high-fidelity, open source image editor designed for
              professional artists and designers.
            </p>
          </div>

          {/* Lab Credit */}
          <div className="w-full p-6 bg-zinc-950/50 border border-zinc-800 rounded-3xl mb-8 space-y-4">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                Proudly Created By
              </span>
              <span className="text-lg font-bold text-zinc-200 tracking-tight">
                CekCok Labs
              </span>
            </div>

            {/* <div className="flex items-center justify-center gap-4 pt-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold rounded-xl border border-zinc-800 transition-all">
                <Github size={14} /> GitHub
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold rounded-xl border border-zinc-800 transition-all">
                <Globe size={14} /> Website
              </button>
            </div> */}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium italic">
            Made with{" "}
            <Heart size={10} className="text-red-500 fill-red-500 inline" /> for
            the Creative Community
          </div>
        </div>

        {/* Legal Strip */}
        <div className="px-10 py-4 bg-zinc-950/50 border-t border-zinc-800/50 flex justify-center">
          <span className="text-[8px] text-zinc-700 font-bold uppercase tracking-widest">
            © 2026 CekCok Labs • MIT LICENSE
          </span>
        </div>
      </div>
    </div>
  );
};
