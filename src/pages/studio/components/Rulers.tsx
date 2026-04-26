import React from "react";

interface RulersProps {
  zoom: number;
  offset: { x: number; y: number };
  canvasSize: { width: number; height: number };
}

export const Rulers: React.FC<RulersProps> = ({ zoom, offset, canvasSize }) => {
  const rulerSize = 24;
  const tickStep = 100;

  const renderTicks = (type: "horizontal" | "vertical") => {
    const isH = type === "horizontal";
    const totalSize = isH ? 4000 : 4000; // Large enough to cover panning
    const ticks = [];
    
    for (let i = -2000; i < totalSize; i += tickStep) {
      const pos = i * zoom + (isH ? offset.x : offset.y);
      if (pos < 0) continue;
      
      ticks.push(
        <g key={i} transform={isH ? `translate(${pos}, 0)` : `translate(0, ${pos})`}>
          <line 
            x1="0" y1="0" 
            x2={isH ? "0" : "10"} 
            y2={isH ? "10" : "0"} 
            stroke="#444" strokeWidth="1" 
          />
          <text 
            x={isH ? "4" : "12"} 
            y={isH ? "14" : "10"} 
            fontSize="8" fill="#666" fontStyle="normal"
            transform={isH ? "" : "rotate(90, 12, 10)"}
          >
            {i}
          </text>
        </g>
      );
    }
    return ticks;
  };

  return (
    <>
      {/* Top Ruler */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-zinc-950/80 border-b border-zinc-800 z-30 overflow-hidden pointer-events-none">
        <svg className="w-full h-full">
          {renderTicks("horizontal")}
        </svg>
      </div>
      {/* Left Ruler */}
      <div className="absolute top-0 left-0 bottom-0 w-6 bg-zinc-950/80 border-r border-zinc-800 z-30 overflow-hidden pointer-events-none">
        <svg className="w-full h-full">
          {renderTicks("vertical")}
        </svg>
      </div>
      {/* Origin Corner */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-zinc-950 border-r border-b border-zinc-800 z-40 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-blue-500" />
      </div>
    </>
  );
};
