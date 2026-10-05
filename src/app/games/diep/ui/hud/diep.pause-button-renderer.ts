import { DiepButton } from '../../core/diep.interfaces';
import { DiepButtonAnimator } from '../buttons/diep.button-animator';

export class DiepPauseButtonRenderer {
  public static draw(ctx: CanvasRenderingContext2D, g: any, width: number): void {
    if (g.gameOver || !g.isGameStarted) return;

    const btnRadius = 20;
    const btnX = width / 2;
    const btnY = 35;

    const mouse = g.mousePos || { x: -1, y: -1 };
    const dist = Math.sqrt(Math.pow(mouse.x - btnX, 2) + Math.pow(mouse.y - btnY, 2));
    const isHovered = dist <= btnRadius;

    // Subtle growth animation (2.5px max expansion instead of 5px)
    const anim = DiepButtonAnimator.getValues('pause-btn', isHovered);
    const currentRadius = btnRadius + (anim.hover * 2.5);

    ctx.save();

    // Hover Highlight Glow
    if (anim.hover > 0) {
      ctx.shadowColor = '#3498db';
      ctx.shadowBlur = 6 * anim.hover;
    }

    // Button Base Circle
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(btnX, btnY, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Outer Border
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 3 + (anim.hover * 1);
    ctx.stroke();

    // White Highlight Overlay on Hover
    if (anim.hover > 0) {
      ctx.globalAlpha = anim.hover * 0.15;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(btnX, btnY, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // Icon (Play triangle or Pause bars)
    ctx.fillStyle = '#ffffff';
    if (g.isPaused) {
      ctx.beginPath();
      ctx.moveTo(btnX - 4, btnY - 7);
      ctx.lineTo(btnX - 4, btnY + 7);
      ctx.lineTo(btnX + 7, btnY);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillRect(btnX - 6, btnY - 7, 4, 14);
      ctx.fillRect(btnX + 2, btnY - 7, 4, 14);
    }

    ctx.restore();
  }
}