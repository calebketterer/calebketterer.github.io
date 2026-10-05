import { Bullet, FallingLetter } from './title.interfaces';
import { TitleStateManager } from './title.state-manager';

export class TitleParticleSystem {
  public static bullets: Bullet[] = [];
  public static fallingLetters: FallingLetter[] = [];
  private static readonly GLOBAL_SPEED = 0.6;

  public static updateAndDraw(
    ctx: CanvasRenderingContext2D, 
    getDarkerHue: (hex: string) => string,
    outlineInt: number // Added to maintain formatting
  ): void {
    const isPaused = TitleStateManager.isPaused;

    // Handle Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!isPaused) {
        b.y += b.velY * this.GLOBAL_SPEED;
        b.alpha -= 0.012 * this.GLOBAL_SPEED;
      }
      if (b.alpha <= 0) { this.bullets.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = b.color;
      ctx.strokeStyle = getDarkerHue(b.color);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Handle Falling Letters
    for (let i = this.fallingLetters.length - 1; i >= 0; i--) {
      const f = this.fallingLetters[i];
      if (!isPaused) {
        f.y += f.velY * this.GLOBAL_SPEED;
        f.velY += 0.15 * this.GLOBAL_SPEED;
        f.alpha -= 0.008 * this.GLOBAL_SPEED;
      }
      if (f.alpha <= 0 || !f.active) { this.fallingLetters.splice(i, 1); continue; }

      ctx.save();
      ctx.globalAlpha = f.alpha;
      ctx.font = '900 70px Inter, sans-serif'; // Restored bold weight
      
      // Draw outline if the transition state allows it
      if (outlineInt > 0) {
        ctx.strokeStyle = getDarkerHue(f.color);
        ctx.lineWidth = 10 * outlineInt;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(f.char, f.x, f.y);
      }

      ctx.fillStyle = f.color;
      ctx.fillText(f.char, f.x, f.y);
      ctx.restore();
    }
  }
}