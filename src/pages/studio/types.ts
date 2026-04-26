export type LayerType = "image" | "text" | "shape";

export type BlendMode = "source-over" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "color-dodge" | "color-burn" | "hard-light" | "soft-light" | "difference" | "exclusion" | "hue" | "saturation" | "color" | "luminosity";

export interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  hidden: boolean;
  locked: boolean;
  blendMode?: BlendMode;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  image: HTMLImageElement;
  aspectRatio: number;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
    sepia: number;
    grayscale: number;
    hueRotate: number;
    invert: number;
  };
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape?: "rect" | "round" | "star" | "heart" | "cloud" | "triangle";
  };
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  letterSpacing: number;
  lineHeight: number;
  textAlign: "left" | "center" | "right";
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  shapeType: "rect" | "circle" | "triangle" | "star";
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export type Layer = ImageLayer | TextLayer | ShapeLayer;
