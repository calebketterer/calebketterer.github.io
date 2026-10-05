// src/app/diep/engine/subsystems/market/decor/tree.prop.ts
import { MarketDecorProp } from './decor.interface';

export class MarketTree implements MarketDecorProp {
  public id = 'prop-tree';
  public type = 'TREE';
  public radius = 14; // Footprint of the trunk for player blocking collisions
  public isSolid = true;
  public baseColor = '#2e7d32'; 
  public accentColor = '#1b5e20'; 

  public scale = 1;
  public minScale = 0.80;
  public maxScale = 1.35;

  private readonly CANOPY_VISUAL_RADIUS = 38;

  constructor(public x: number, public y: number, public angle: number = 0) {}

  // Ground layer base elements
  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.scale !== 1) {
      ctx.scale(this.scale, this.scale);
    }

    // Shadow base covering the area of the canopy
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(5, 5, this.CANOPY_VISUAL_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Solid Wood Trunk
    ctx.fillStyle = '#5d4037';
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // FIXED: Renamed to match your exact structural architecture choice
  public renderAsTopLayer(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.scale !== 1) {
      ctx.scale(this.scale, this.scale);
    }

    const numClumps = 6;
    const clusterOffset = this.CANOPY_VISUAL_RADIUS * 0.4;
    const clumpRadius = this.CANOPY_VISUAL_RADIUS * 0.65;

    // Outer interlocking canopy shapes
    ctx.fillStyle = this.baseColor;
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let i = 0; i < numClumps; i++) {
      const clusterAngle = (i * Math.PI * 2) / numClumps;
      const cx = Math.cos(clusterAngle) * clusterOffset;
      const cy = Math.sin(clusterAngle) * clusterOffset;
      ctx.arc(cx, cy, clumpRadius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}