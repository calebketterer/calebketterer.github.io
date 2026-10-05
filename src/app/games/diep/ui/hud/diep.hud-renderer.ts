// src/app/diep/ui/hud/diep.hud-renderer.ts
import { Player } from '../../core/diep.interfaces';
import { DiepXpBarRenderer } from './diep.xp-bar-renderer';
import { DiepHealthBarRenderer } from './diep.health-bar-renderer';
import { DiepUpgradeMenuRenderer } from './upgrade-menu/diep.upgrade-menu-renderer';
import { DiepPauseButtonRenderer } from './diep.pause-button-renderer';
import { DiepAchievementToastRenderer } from './diep.achievement-toast';
import { DiepPixelOdometer } from './diep.pixel-odometer';

/**
 * DiepHudRenderer handles all fixed-position UI elements.
 * This separates the "Game World" (tanks/bullets) from the "Interface" (bars/text).
 */
export class DiepHudRenderer {

  public static draw(ctx: CanvasRenderingContext2D, g: any, player: Player, width: number, height: number): void {
    if (!g.isGameStarted) return;

    const isOverlayActive = g.isPaused || (g.gameOver && !g.gameOverService.isAnimationActive());
    const uiTextColor = isOverlayActive ? '#fff' : (g.isDarkMode ? '#ecf0f1' : '#333');

    DiepHealthBarRenderer.draw(ctx, player);
    DiepXpBarRenderer.draw(ctx, player, width, height);
    DiepUpgradeMenuRenderer.draw(ctx, g, player, height); 
    
    this.drawSessionStats(ctx, g, width, uiTextColor);
    this.drawNotifications(ctx, g, width);
    DiepPauseButtonRenderer.draw(ctx, g, width);
  }

  private static drawSessionStats(ctx: CanvasRenderingContext2D, g: any, width: number, textColor: string): void {
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'right';
    
    // 1. Draw Score Label Normally
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText('SCORE: ' + g.score, width - 20, 35);

    // 2. Draw encapsulated pixel balance layout and math tracker completely inline
    const actualBalance = g.pixelsService?.balance ?? 0;
    DiepPixelOdometer.draw(ctx, actualBalance, width, textColor);
  }

  private static drawNotifications(ctx: CanvasRenderingContext2D, g: any, width: number): void {
    DiepAchievementToastRenderer.draw(ctx, width);
  }
}