import { Player } from '../../core/diep.interfaces';

/**
 * Handles the rendering and animation logic specifically for the Diep-style XP bar.
 */
export class DiepXpBarRenderer {
  private static lerpXp: number = 0;
  private static lastLevel: number = 1;

  public static draw(ctx: CanvasRenderingContext2D, player: Player, width: number, height: number): void {
    const prog = player.progression;
    if (!prog) return;

    // Handle Animation Logic
    if (prog.level !== this.lastLevel) {
      this.lerpXp = 0;
      this.lastLevel = prog.level;
    }

    const speed = 0.1;
    const diff = prog.currentXp - this.lerpXp;
    if (Math.abs(diff) > 0.1) {
      this.lerpXp += diff * speed;
    } else {
      this.lerpXp = prog.currentXp;
    }

    const barHeight = 22;
    const barWidth = 350;
    const x = (width - barWidth) / 2;
    const y = height - 45;
    const radius = barHeight / 2;
    const visualRatio = Math.max(0, Math.min(1, this.lerpXp / prog.nextLevelXp));

    // 1. XP Info Text
    const fractionText = `${Math.floor(prog.currentXp)} / ${prog.nextLevelXp}`;
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 2;
    ctx.strokeText(fractionText, width / 2, y - 10);
    ctx.fillText(fractionText, width / 2, y - 10);

    // 2. Background Capsule (Drawn first with thick stroke)
    this.drawCapsule(ctx, x, y, barWidth, barHeight, radius, '#555555', '#444444', 6);

    // 3. Animated Fill
    const fillWidth = Math.max(barHeight, barWidth * visualRatio);
    this.drawCapsule(ctx, x, y, fillWidth, barHeight, radius, '#ffe46b', 'transparent', 0);

    // 4. Level Label
    const levelText = `Lvl ${prog.level}`;
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3;
    ctx.strokeText(levelText, width / 2, y + radius);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(levelText, width / 2, y + radius);

    ctx.textBaseline = 'alphabetic';
  }

  private static drawCapsule(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    r: number,
    fill: string,
    stroke: string,
    weight: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (stroke !== 'transparent' && weight > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight;
      ctx.stroke();
    }

    ctx.fillStyle = fill;
    ctx.fill();
  }
}