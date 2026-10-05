import { DiepShape } from './title.interfaces';
import { TitleStateManager } from './title.state-manager';

export class TitleFXRenderer {
  public static shapes: DiepShape[] = [];
  private static readonly GLOBAL_SPEED = 0.6;

  public static drawGrid(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, intensity: number): void {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 * intensity})`;
    const offX = (frame * 0.3) % 50;
    const offY = (frame * 0.1) % 50;
    ctx.beginPath();
    for (let i = -600; i <= 600; i += 50) {
      ctx.moveTo(x + i + offX, y - 400); ctx.lineTo(x + i + offX, y + 400);
      ctx.moveTo(x - 600, y + i + offY); ctx.lineTo(x + 600, y + i + offY);
    }
    ctx.stroke();
    ctx.restore();
  }

  public static drawScanlines(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, intensity: number): void {
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * intensity})`;
    const offset = (frame * 2) % 20;
    ctx.beginPath();
    for (let i = -150; i < 150; i += 10) {
      ctx.moveTo(x - 450, y + i + offset);
      ctx.lineTo(x + 450, y + i + offset);
    }
    ctx.stroke();
    ctx.restore();
  }

  public static updateAndDrawShapes(ctx: CanvasRenderingContext2D, cx: number, cy: number, intensity: number): void {
    this.shapes.forEach(s => {
      if (!TitleStateManager.isPaused) {
        s.x += s.vx * this.GLOBAL_SPEED;
        s.y += s.vy * this.GLOBAL_SPEED;
        s.rotation += s.vr * this.GLOBAL_SPEED;
        if (Math.abs(s.x - cx) > 500) s.vx *= -1;
        if (Math.abs(s.y - cy) > 300) s.vy *= -1;
      }
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = intensity;
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.borderColor;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < s.type; i++) {
        const px = Math.cos(i * (Math.PI * 2 / s.type)) * 18;
        const py = Math.sin(i * (Math.PI * 2 / s.type)) * 18;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  }
}