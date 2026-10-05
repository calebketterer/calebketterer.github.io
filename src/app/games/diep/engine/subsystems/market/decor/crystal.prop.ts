// src/app/diep/engine/subsystems/market/decor/crystal.prop.ts
import { MarketDecorProp } from './decor.interface';

export class PowerCrystal implements MarketDecorProp {
  public id = 'prop-crystal';
  public type = 'CRYSTAL';
  public radius = 24;
  public isSolid = true;
  public baseColor = '#00f2fe';
  public accentColor = '#4facfe';
  private pulseFrame = Math.random() * 100;

  constructor(public x: number, public y: number, public angle: number = 0) {}

  public render(ctx: CanvasRenderingContext2D): void {
    this.pulseFrame += 0.05;
    const pulseRadius = this.radius + Math.sin(this.pulseFrame) * 3;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Dynamic glowing backing field
    ctx.beginPath();
    ctx.arc(0, 0, pulseRadius * 1.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.08)';
    ctx.fill();

    // Geometric Crystal Point drawing vectors using Math loops
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const r = i % 2 === 0 ? pulseRadius : pulseRadius * 0.6;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();

    ctx.fillStyle = this.baseColor;
    ctx.fill();
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  }
}