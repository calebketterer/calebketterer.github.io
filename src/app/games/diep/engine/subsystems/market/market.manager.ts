// src/app/diep/engine/subsystems/market/market.manager.ts
import { Injectable } from '@angular/core';
import { Player } from '../../../core/diep.interfaces';
import { MarketRenderer } from './market.renderer';
import { MarketPhysicsProcessor } from './market-physics.processor';
import { MarketNpcInitializer } from './market-npc.initializer';
import { MarketDecorRuntimeManager } from './decor/decor-runtime.manager';

@Injectable({
  providedIn: 'root'
})
export class MarketManagerService {

  constructor(
    private decorRuntime: MarketDecorRuntimeManager
  ) {}

  /**
   * Performs data setup and entry mechanics for the store module
   */
  public transitionToMarket(g: any): void {
    g.arenaReset.transition.fadeOut(() => {
      g.currentMode = 'MARKET';
      g.isGameStarted = true;
      g.gameOver = false;
      g.isPaused = false;
      
      g.bullets = [];
      g.playerService.initializePlayer(g.currentDifficulty, g.persistentXp);
      
      const p = g.playerService.player;
      const worldW = g.marketCameraSystem.worldWidth;
      const worldH = g.marketCameraSystem.worldHeight;

      if (p) {
        // Place the player directly in the true middle of our expanded world map
        p.x = worldW / 2;
        p.y = worldH / 2;
      }

      // FIXED: Bind the runtime manager instance onto context state 'g' directly to keep engine clean
      g.marketDecorRuntimeManager = this.decorRuntime;

      // Populate random market decoration objects before initializing characters
      g.marketDecorRuntimeManager.generateMarketDecor(worldW, worldH);

      // Point to the isolated lifecycle initializer class
      MarketNpcInitializer.initializeDynamicNpcs();
      
      g.arenaReset.transition.fadeIn();
    });
  }

  /**
   * New exit sequence method to back out cleanly into the master main menu
   */
  public transitionToMenu(g: any): void {
    g.arenaReset.transition.fadeOut(() => {
      g.currentMode = 'MENU';
      g.isGameStarted = false;
      g.arenaReset.transition.fadeIn();
    });
  }

  /**
   * Encapsulates running logic for position updates, map constraints, and cosmetic weapon loops
   */
  public updateMarket(g: any, tick: number, ms: number): void {
    const p = g.playerService.player;

    // 1. Delegate player tracking kinematics
    g.playerService.update(g, tick, ms);
    
    // 2. Coordinate weapons and projectile translation loops
    if (g.weaponController) {
      g.weaponController.update(g, tick, ms);
    }
    g.projectileService.update(g, tick, ms);

    // 3. Delegate specialized static object and market entity collisions
    if (p) {
      if (g.marketDecorRuntimeManager) {
        g.marketDecorRuntimeManager.processDecorCollisions(p);
      }
      MarketPhysicsProcessor.process(g, p, g.bullets, tick, ms);
    }
    
    // 4. Run boundary containment loops matching expanded world bounds
    if (p) {
      if (p.x < p.radius) p.x = p.radius;
      if (p.x > g.marketCameraSystem.worldWidth - p.radius) p.x = g.marketCameraSystem.worldWidth - p.radius;
      if (p.y < p.radius) p.y = p.radius;
      if (p.y > g.marketCameraSystem.worldHeight - p.radius) p.y = g.marketCameraSystem.worldHeight - p.radius;
    }

    // 5. Fire camera updates to snap positions cleanly
    g.marketCameraSystem.update(g);
  }

  /**
   * Delegates rendering operations directly to the isolated graphics layer
   */
  public drawMarket(ctx: CanvasRenderingContext2D, g: any, player: Player, width: number, height: number): void {
    MarketRenderer.drawMarket(ctx, g, player, width, height);
  }
}