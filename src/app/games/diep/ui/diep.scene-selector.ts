// src/app/diep/ui/diep.scene-selector.ts
import { Player } from '../core/diep.interfaces';
import { DiepWorldRenderer } from '../engine/subsystems/diep.world-renderer';
import { DiepHudRenderer } from './hud/diep.hud-renderer';
import { SectorsRenderer } from '../engine/subsystems/sectors/sectors.renderer';

export class DiepSceneSelector {
  /**
   * Resolves structural layout state routes, maps HUD components, 
   * and intercepts corrupted mode parameters safely.
   */
  public static renderScene(ctx: CanvasRenderingContext2D, g: any, player: Player, width: number, height: number): void {
    switch (g.currentMode) {
      case 'MARKET':
        // Scene selector stays lightweight — the engine manager completely controls the draw composition
        g.marketManagerService.drawMarket(ctx, g, player, width, height);
        break;

      case 'ARENA':
        DiepWorldRenderer.renderWorld(ctx, g, player, width, height);
        DiepHudRenderer.draw(ctx, g, player, width, height);
        break;

      case 'SECTORS':
        SectorsRenderer.renderSectors(ctx, g, player, width, height);
        break;

      case 'MENU':
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        break;

      default:
        console.error(`[DiepSceneSelector] Unhandled game engine currentMode parsed: "${g.currentMode}". Dropping back safely to MENU layout views.`);
        g.currentMode = 'MENU';
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        break;
    }
  }
}