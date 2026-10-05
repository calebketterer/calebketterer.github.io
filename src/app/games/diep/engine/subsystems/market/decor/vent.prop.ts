// src/app/diep/engine/subsystems/market/decor/vent.prop.ts
import { MarketDecorProp } from './decor.interface';

export class FloorVent implements MarketDecorProp {
  public id = 'prop-vent';
  public type = 'VENT';
  public radius = 40;
  public isSolid = false; // Cosmetic layer: non-solid player passage allowed
  public baseColor = '#1a1f25';
  public accentColor = '#2c3e50';

  constructor(public x: number, public y: number) {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Perimeter grill rim boundaries
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2);

    // Decorative inner vertical slats lines
    ctx.strokeStyle = '#11161b';
    ctx.lineWidth = 3;
    for (let offset = -this.radius + 10; offset < this.radius; offset += 12) {
      ctx.beginPath();
      ctx.moveTo(offset, -this.radius + 6);
      ctx.lineTo(offset, this.radius - 6);
      ctx.stroke();
    }

    ctx.restore();
  }
}