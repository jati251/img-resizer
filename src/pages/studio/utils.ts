import { Layer, ImageLayer, TextLayer, ShapeLayer } from "./types";

export const generateId = () => `layer_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

import React from "react";

export const getMousePos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent, element: HTMLElement | null, zoom: number, offset: { x: number, y: number }) => {
  if (!element) return { x: 0, y: 0 };
  const rect = element.getBoundingClientRect();
  let clientX, clientY;
  
  if ("touches" in e && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if ("clientX" in e) {
    clientX = (e as React.MouseEvent | MouseEvent).clientX;
    clientY = (e as React.MouseEvent | MouseEvent).clientY;
  } else {
    clientX = 0;
    clientY = 0;
  }
  
  return { 
    x: (clientX - rect.left - offset.x) / zoom, 
    y: (clientY - rect.top - offset.y) / zoom 
  };
};

export const isPosOnLayer = (pos: { x: number; y: number }, layer: Layer) => {
  if (layer.hidden || layer.locked) return false;
  const layerCenterX = layer.x + layer.width / 2;
  const layerCenterY = layer.y + layer.height / 2;
  const dx = pos.x - layerCenterX;
  const dy = pos.y - layerCenterY;
  const rotatedX = dx * Math.cos(-layer.rotation) - dy * Math.sin(-layer.rotation);
  const rotatedY = dx * Math.sin(-layer.rotation) + dy * Math.cos(-layer.rotation);
  return Math.abs(rotatedX) <= layer.width / 2 && Math.abs(rotatedY) <= layer.height / 2;
};

export const drawAllLayers = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  layers: Layer[], 
  selectedLayerId: string | null, 
  zoom: number, 
  isCropping: boolean, 
  isExport: boolean,
  selectionColor: string,
  backgroundColor?: string
) => {
  ctx.clearRect(0, 0, width, height);

  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }
  
  if (!isExport) {
    const size = 20;
    ctx.fillStyle = "#1e1e24";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#2a2a35";
    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
        if ((x / size + y / size) % 2 === 0) ctx.fillRect(x, y, size, size);
      }
    }
  }

  [...layers].reverse().forEach((layer) => {
    if (layer.hidden) return;
    ctx.save();
    ctx.translate(layer.x + layer.width / 2, layer.y + layer.height / 2);
    ctx.rotate(layer.rotation);
    ctx.globalAlpha = layer.opacity / 100;
    ctx.globalCompositeOperation = layer.blendMode || "source-over";

    if (layer.type === "image") {
      const imgLayer = layer as ImageLayer;
      const f = imgLayer.filters;
      ctx.filter = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) sepia(${f.sepia || 0}%) grayscale(${f.grayscale || 0}%) hue-rotate(${f.hueRotate || 0}deg) invert(${f.invert || 0}%)`;
      
      if (imgLayer.crop) {
        ctx.save(); // Save before clip
        ctx.beginPath();
        
        const hw = layer.width / 2;
        const hh = layer.height / 2;
        
        if (imgLayer.crop.shape === 'round') {
          ctx.arc(0, 0, Math.min(layer.width, layer.height) / 2, 0, Math.PI * 2);
        } else if (imgLayer.crop.shape === 'star') {
          const spikes = 5; 
          const outerRadius = Math.min(hw, hh); 
          const innerRadius = outerRadius * 0.4;
          let rot = Math.PI / 2 * 3;
          const step = Math.PI / spikes;
          ctx.moveTo(0, -outerRadius);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
        } else if (imgLayer.crop.shape === 'triangle') {
          ctx.moveTo(0, -hh);
          ctx.lineTo(hw, hh);
          ctx.lineTo(-hw, hh);
          ctx.closePath();
        } else if (imgLayer.crop.shape === 'heart') {
          const w = layer.width * 0.8;
          const h = layer.height * 0.8;
          ctx.save();
          ctx.translate(0, h * 0.1);
          ctx.moveTo(0, h / 4);
          ctx.bezierCurveTo(0, h / 4, -w / 2, -h / 2, -w / 2, h / 4);
          ctx.bezierCurveTo(-w / 2, (h * 3) / 4, 0, h, 0, h);
          ctx.bezierCurveTo(0, h, w / 2, (h * 3) / 4, w / 2, h / 4);
          ctx.bezierCurveTo(w / 2, -h / 2, 0, h / 4, 0, h / 4);
          ctx.restore();
          // Adjust to center
          ctx.translate(0, -h * 0.5);
        } else if (imgLayer.crop.shape === 'cloud') {
          const w = layer.width;
          const h = layer.height;
          ctx.moveTo(-w * 0.2, h * 0.2);
          ctx.bezierCurveTo(-w * 0.4, h * 0.2, -w * 0.5, 0, -w * 0.3, -h * 0.1);
          ctx.bezierCurveTo(-w * 0.4, -h * 0.4, 0, -h * 0.5, w * 0.1, -h * 0.2);
          ctx.bezierCurveTo(w * 0.4, -h * 0.4, w * 0.5, 0, w * 0.3, h * 0.1);
          ctx.bezierCurveTo(w * 0.4, h * 0.4, 0, h * 0.4, -w * 0.1, h * 0.2);
          ctx.closePath();
        } else {
          ctx.rect(-hw, -hh, layer.width, layer.height);
        }
        
        ctx.clip();
        ctx.drawImage(imgLayer.image, imgLayer.crop.x, imgLayer.crop.y, imgLayer.crop.width, imgLayer.crop.height, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
        ctx.restore(); // Restore to remove clip for selection drawing
      } else {
        ctx.drawImage(imgLayer.image, -layer.width / 2, -layer.height / 2, layer.width, layer.height);
      }
    } else if (layer.type === "text") {
      const txtLayer = layer as TextLayer;
      ctx.font = `${txtLayer.fontWeight} ${txtLayer.fontSize}px ${txtLayer.fontFamily}`;
      ctx.fillStyle = txtLayer.color;
      ctx.textAlign = txtLayer.textAlign;
      ctx.textBaseline = "middle";
      if ("letterSpacing" in ctx) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ctx as any).letterSpacing = `${txtLayer.letterSpacing}px`;
      }
      
      const lines = txtLayer.text.split("\n");
      const lineHeight = txtLayer.fontSize * txtLayer.lineHeight;
      const startY = -layer.height / 2 + lineHeight / 2;
      
      lines.forEach((line, index) => {
        let alignX = 0;
        if (txtLayer.textAlign === "left") alignX = -layer.width / 2;
        else if (txtLayer.textAlign === "right") alignX = layer.width / 2;
        ctx.fillText(line, alignX, startY + index * lineHeight);
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("letterSpacing" in ctx) (ctx as any).letterSpacing = "0px";
    } else if (layer.type === "shape") {
        const shp = layer as ShapeLayer;
        ctx.beginPath();
        const hw = layer.width / 2;
        const hh = layer.height / 2;

        if (shp.shapeType === "rect") {
          ctx.rect(-hw, -hh, layer.width, layer.height);
        } else if (shp.shapeType === "circle") {
          ctx.arc(0, 0, Math.min(hw, hh), 0, Math.PI * 2);
        } else if (shp.shapeType === "triangle") {
          ctx.moveTo(0, -hh);
          ctx.lineTo(hw, hh);
          ctx.lineTo(-hw, hh);
          ctx.closePath();
        } else if (shp.shapeType === "star") {
          const spikes = 5;
          const outerRadius = Math.min(hw, hh);
          const innerRadius = outerRadius * 0.4;
          let rot = (Math.PI / 2) * 3;
          const step = Math.PI / spikes;
          ctx.moveTo(0, -outerRadius);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(Math.cos(rot) * outerRadius, Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(Math.cos(rot) * innerRadius, Math.sin(rot) * innerRadius);
            rot += step;
          }
          ctx.lineTo(0, -outerRadius);
        }

        if (shp.fill) {
          ctx.fillStyle = shp.fill;
          ctx.fill();
        }
        if (shp.stroke && shp.strokeWidth > 0) {
          ctx.strokeStyle = shp.stroke;
          ctx.lineWidth = shp.strokeWidth;
          ctx.stroke();
        }
      }

    if (!isExport && layer.id === selectedLayerId && !layer.locked) {
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.strokeStyle = isCropping ? "#fbbf24" : selectionColor;
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
      ctx.fillStyle = "#fff";
      const cpSize = 8 / zoom;
      const halfSize = cpSize / 2;
      ctx.fillRect(-layer.width / 2 - halfSize, -layer.height / 2 - halfSize, cpSize, cpSize);
      ctx.fillRect(layer.width / 2 - halfSize, -layer.height / 2 - halfSize, cpSize, cpSize);
      ctx.fillRect(layer.width / 2 - halfSize, layer.height / 2 - halfSize, cpSize, cpSize);
      ctx.fillRect(-layer.width / 2 - halfSize, layer.height / 2 - halfSize, cpSize, cpSize);
      if (isCropping) {
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.strokeRect(-layer.width / 2, -layer.height / 2, layer.width, layer.height);
        ctx.setLineDash([]);
      }
    }
    ctx.restore();
  });
};
