import { UpgradePath } from '../../../engine/subsystems/player/player-upgrades/diep.upgrade-registry';

export class UpgradeBarRenderer {
  public static draw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    path: UpgradePath,
    visualSpent: number,
    colors: { bg: string, stroke: string, theme: string },
    weights: { master: number, circle: number }
  ): void {
    const r = h / 2;
    const buttonAlpha = Math.max(0, Math.min(1, 10 - visualSpent));

    // 1. Background
    this.drawCapsule(ctx, x, y, w, h, r, colors.bg, colors.stroke, weights.master);

    // 2. Fill & Dividers
    ctx.save();
    this.drawCapsule(ctx, x, y, w, h, r, 'transparent', 'transparent', 0);
    ctx.clip();

    const fillWidth = w * (visualSpent / 10);
    ctx.fillStyle = colors.theme;
    ctx.fillRect(x, y, fillWidth, h);

    ctx.fillStyle = colors.bg;
    const slotWidth = w / 10;
    for (let s = 1; s < 10; s++) {
      ctx.fillRect(x + (s * slotWidth) - 1.5, y, 3, h);
    }
    ctx.restore();

    // 3. Label
    ctx.save();
    ctx.font = '900 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = colors.bg;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    
    const textY = y + r + 1.5;
    ctx.strokeText(path.name.toUpperCase(), x + (w / 2), textY, w * 0.85);
    ctx.fillText(path.name.toUpperCase(), x + (w / 2), textY, w * 0.85);
    ctx.restore();

    // 4. Plus Button (Fades out as the final segment fills)
    if (buttonAlpha > 0) {
      const circleX = x + w + 25;
      const circleY = y + r;
      const radius = 9;

      ctx.save();
      ctx.globalAlpha = buttonAlpha;
      ctx.beginPath();
      ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
      ctx.fillStyle = colors.theme;
      ctx.fill();
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = weights.circle;
      ctx.stroke();

      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 3;
      ctx.lineCap = 'butt';
      ctx.beginPath();
      ctx.moveTo(circleX - 4, circleY); ctx.lineTo(circleX + 4, circleY);
      ctx.moveTo(circleX, circleY - 4); ctx.lineTo(circleX, circleY + 4);
      ctx.stroke();
      ctx.restore();
    }
  }

  private static drawCapsule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke: string, weight: number): void {
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
    if (fill !== 'transparent') {
      ctx.fillStyle = fill;
      ctx.fill();
    }
  }
}