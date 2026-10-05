import { Player, Bullet, TrailSegment } from '../../core/diep.interfaces';
import { DiepWorldHealthbarRenderer } from '../../ui/diep.world-healthbar.renderer';

export class DiepEntityRenderer {
  public static drawPlayer(ctx: CanvasRenderingContext2D, player: Player, isGameOver: boolean): void {
    if (isGameOver) return;
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Barrel
    ctx.fillStyle = '#95a5a6';
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.fillRect(0, -player.radius * 0.4, player.radius * 1.8, player.radius * 0.8);
    ctx.strokeRect(0, -player.radius * 0.4, player.radius * 1.8, player.radius * 0.8);

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  public static drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]): void {
    bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
      ctx.fillStyle = bullet.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (bullet.health < bullet.maxHealth) {
        DiepWorldHealthbarRenderer.drawBulletHealthBar(ctx, bullet);
      }
    });
  }

  public static drawToxicTrails(ctx: CanvasRenderingContext2D, trails: TrailSegment[]): void {
    trails.forEach(trail => {
      ctx.beginPath();
      ctx.globalAlpha = trail.opacity;
      ctx.fillStyle = trail.color;
      ctx.arc(trail.x, trail.y, trail.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    });
    ctx.globalAlpha = 1.0;
  }
}