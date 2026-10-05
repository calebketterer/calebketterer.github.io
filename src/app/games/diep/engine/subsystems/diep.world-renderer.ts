import { Player, Enemy, Bullet } from '../../core/diep.interfaces';
import { EnemyRegistry } from '../../enemies/enemy.registry';
import { DiepBackgroundRenderer } from './arena/arena.grid-renderer';
import { DiepEntityRenderer } from './diep.entity-renderer';
import { DiepWorldHealthbarRenderer } from '../../ui/diep.world-healthbar.renderer';

export class DiepWorldRenderer {
  /**
   * Master Render Call.
   * Handles correct depth layering (Ground -> World -> Walls -> Flying).
   */
  public static renderWorld(
    ctx: CanvasRenderingContext2D,
    g: any,
    player: Player,
    width: number,
    height: number
  ): void {
    const tiles = g.arenaManager?.getAllTiles() || [];
    const tileSize = g.arenaManager?.tileSize || 50;
    const isArenaActive = g.arenaEnabled !== false;

    // 1. Layer: Ground (Grid and Holes)
    if (g.arenaManager) {
      DiepBackgroundRenderer.drawGround(ctx, width, height, tileSize, tiles);
    } else {
      this.drawSimpleBackground(ctx, width, height);
    }

    // 2. Layer: World Objects & Ground Enemies
    if (g.isGameStarted || g.gameOver) {
      DiepEntityRenderer.drawToxicTrails(ctx, g.toxicTrails);

      const visibleEnemies = g.gameOverService.getAnimationEnemies(g.enemies);
      const groundEnemies = visibleEnemies.filter((e: any) => !e.isFlying);

      this.drawEnemiesWithBars(ctx, groundEnemies, player, g.bullets);
      DiepEntityRenderer.drawPlayer(ctx, player, g.gameOver);
      DiepEntityRenderer.drawBullets(ctx, g.bullets);
    }

    // 3. Layer: Walls
    if (g.arenaManager && isArenaActive) {
      DiepBackgroundRenderer.drawWalls(ctx, tileSize, tiles);
    }

    // 4. Layer: Flying Entities (Drawn over walls)
    if (g.isGameStarted || g.gameOver) {
      const visibleEnemies = g.gameOverService.getAnimationEnemies(g.enemies);
      const flyingEnemies = visibleEnemies.filter((e: any) => e.isFlying);
      if (flyingEnemies.length > 0) {
        this.drawEnemiesWithBars(ctx, flyingEnemies, player, g.bullets);
      }
    }
  }

  public static drawEnemiesWithBars(
    ctx: CanvasRenderingContext2D,
    enemies: Enemy[],
    player: Player,
    bullets: Bullet[]
  ): void {
    enemies.forEach(enemy => {
      EnemyRegistry.draw(ctx, enemy, player, bullets);
      DiepWorldHealthbarRenderer.drawEnemyHealthBar(ctx, enemy);
    });
  }

  private static drawSimpleBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);
  }
}