// src/app/diep/ui/diep.menus-manager.ts
import { DiepQuadriviumMenu } from './main-menu/quadrivium/diep.quadrivium-menu';
import { DiepAchievementMenu } from './main-menu/achievements/diep.achievement-menu';
import { DiepCollectionMenu } from './main-menu/collection/collection-menu';
import { DiepMainMenu } from './main-menu/diep.main-menu';
import { DiepPauseOverlay } from './overlays/pause-overlay';
import { DiepGameOverOverlay } from './overlays/game-over-overlay';
import { MarketOverlay } from './overlays/market-overlay';

export class DiepMenus {
  /**
   * UI ROUTER: Only handles menus and overlays.
   * Arena rendering has been moved to DiepArenaRenderer.
   */
  public static renderUI(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    // 1. Menu Routing
    if (g.showingQuadrivium) {
      DiepQuadriviumMenu.render(ctx, g, width, height);
    } else if (g.showingAchievements) {
      DiepAchievementMenu.render(ctx, g, width, height);
    } else if (g.showingCollection) {
      DiepCollectionMenu.render(ctx, g, width, height);
    } else {
      if (!g.isGameStarted) {
        DiepMainMenu.draw(ctx, g, width, height);
      } else if (g.isPaused) {
        DiepPauseOverlay.draw(ctx, g, width, height);
      } else if (g.gameOver && !g.gameOverService.isAnimationActive()) {
        DiepGameOverOverlay.draw(ctx, g, width, height);
      } else if (g.currentMode === 'MARKET') {
        MarketOverlay.draw(ctx, g, width, height);
      }
    }

    if (g.arenaReset.transition) {
      g.arenaReset.transition.draw(ctx, width, height);
    }

    if (g.sectorsReset.transition) {
      g.sectorsReset.transition.draw(ctx, width, height);
    }
  }
}