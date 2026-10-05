// src/app/diep/engine/subsystems/market/decor/bench.prop.ts
import { MarketDecorProp } from './decor.interface';

export class MarketBench implements MarketDecorProp {
  public id = 'prop-bench';
  public type = 'BENCH';
  public radius = 25; // Sizing baseline fallback 
  
  // Rectangular boundary properties for multi-node physics tracking loop
  public isRectangular = true;
  public width = 72;
  public height = 26;
  public isSolid = true;

  public baseColor = '#a1887f'; // Finished wood board brown
  public accentColor = '#37474f'; // Iron support structure frames
  public scale = 1;

  constructor(public x: number, public y: number, public angle: number = 0) {}

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.scale !== 1) {
      ctx.scale(this.scale, this.scale);
    }

    const hw = this.width / 2;
    const hh = this.height / 2;

    // Structure Floor Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(-hw + 3, -hh + 4, this.width, this.height);

    // Twin Iron Armrest/Leg End Brackets
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(-hw, -hh, 6, this.height);
    ctx.fillRect(hw - 6, -hh, 6, this.height);

    // Main Wood Bench Planks/Slats Layer
    ctx.fillStyle = this.baseColor;
    ctx.strokeStyle = '#6d4c41';
    ctx.lineWidth = 1.5;

    // Plank 1 (Top / Backrest Seat Slat)
    ctx.fillRect(-hw + 6, -hh + 2, this.width - 12, hh - 3);
    ctx.strokeRect(-hw + 6, -hh + 2, this.width - 12, hh - 3);

    // Plank 2 (Bottom / Front Seat Slat)
    ctx.fillRect(-hw + 6, 1, this.width - 12, hh - 3);
    ctx.strokeRect(-hw + 6, 1, this.width - 12, hh - 3);

    // Center divider structural iron strip reinforcement
    ctx.fillStyle = this.accentColor;
    ctx.fillRect(-2, -hh, 4, this.height);

    ctx.restore();
  }
}