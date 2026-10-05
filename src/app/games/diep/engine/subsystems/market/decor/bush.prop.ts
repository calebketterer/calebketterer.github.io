// src/app/diep/engine/subsystems/market/decor/bush.prop.ts
import { MarketDecorProp } from './decor.interface';

export class MarketBush implements MarketDecorProp {
  public id = 'prop-bush';
  public type = 'BUSH';
  public radius = 28;
  public isSolid = true;
  public baseColor = '#155724'; // Dark green border/shadow base
  public accentColor = '#0b2e13'; // Added to satisfy interface requirement (used for outline)

  public scale = 1;

  constructor(public x: number, public y: number, public angle: number = 0) {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.scale !== 1) {
      ctx.scale(this.scale, this.scale);
    }

    const numClumps = 5;
    const clusterOffset = this.radius * 0.35;
    const clumpRadius = this.radius * 0.6;

    // Outer shadow drop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.beginPath();
    for (let i = 0; i < numClumps; i++) {
      const clusterAngle = (i * Math.PI * 2) / numClumps;
      const cx = Math.cos(clusterAngle) * clusterOffset + 3;
      const cy = Math.sin(clusterAngle) * clusterOffset + 4;
      ctx.arc(cx, cy, clumpRadius, 0, Math.PI * 2);
    }
    ctx.fill();

    // Interlocking dark green leaf clusters
    ctx.fillStyle = this.baseColor;
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 3;
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