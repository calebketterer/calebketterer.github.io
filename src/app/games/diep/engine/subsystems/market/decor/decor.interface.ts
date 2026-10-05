// src/app/diep/engine/subsystems/market/decor/decor.interface.ts
export interface MarketDecorProp {
  id: string;
  type: string;
  x: number;
  y: number;
  radius: number;
  
  isRectangular?: boolean;
  width?: number;
  height?: number;
  angle?: number;
  disableDefaultRotation?: boolean;
  
  scale?: number; 
  minScale?: number; 
  maxScale?: number; 
  
  centerOffset?: { x: number; y: number };
  isSolid: boolean;
  baseColor: string;
  accentColor: string;
  
  render(ctx: CanvasRenderingContext2D): void;
  renderAsTopLayer?(ctx: CanvasRenderingContext2D): void;
}