import { Enemy, Bullet } from '../core/diep.interfaces';

export class DiepWorldHealthbarRenderer {
  public static drawEnemyHealthBar(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    if (enemy.health >= enemy.maxHealth) return;
    const barWidth = enemy.radius * 2;
    const barHeight = 4;
    const x = enemy.x - enemy.radius;
    const y = enemy.y - enemy.radius - 12;

    ctx.fillStyle = '#34495e';
    ctx.fillRect(x, y, barWidth, barHeight);

    const healthPct = enemy.health / enemy.maxHealth;
    ctx.fillStyle = healthPct > 0.4 ? '#2ecc71' : '#e67e22';
    ctx.fillRect(x, y, barWidth * healthPct, barHeight);
  }

  public static drawBulletHealthBar(ctx: CanvasRenderingContext2D, bullet: Bullet): void {
    const barWidth = bullet.radius * 2.5;
    const barHeight = 3;
    const x = bullet.x - barWidth / 2;
    const y = bullet.y - bullet.radius - 8;

    ctx.fillStyle = 'rgba(52, 73, 94, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);

    const healthPct = bullet.health / bullet.maxHealth;
    ctx.fillStyle = healthPct > 0.4 ? '#2ecc71' : '#e67e22';
    ctx.fillRect(x, y, barWidth * healthPct, barHeight);
  }
}