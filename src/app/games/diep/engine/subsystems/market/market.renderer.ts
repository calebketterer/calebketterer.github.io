// src/app/diep/engine/subsystems/market/market.renderer.ts
import { Player } from '../../../core/diep.interfaces';
import { MARKET_NPCS, MarketNpc } from './market-npc.config';
import { DiepWorldRenderer } from '../diep.world-renderer';
import { DiepEntityRenderer } from '../diep.entity-renderer';

export class MarketRenderer {
  
  /**
   * Handles canvas backdrop visuals, populated NPCs, and cosmetic entity layers
   */
  public static drawMarket(ctx: CanvasRenderingContext2D, g: any, player: Player, width: number, height: number): void {
    const camX = g.marketCameraSystem.x;
    const camY = g.marketCameraSystem.y;
    const worldW = g.marketCameraSystem.worldWidth;
    const worldH = g.marketCameraSystem.worldHeight;
    const currentScale = g.marketCameraSystem.scale;

    // 1. Draw solid backdrop color across the viewport frame window bounds
    ctx.fillStyle = '#11161b';
    ctx.fillRect(0, 0, width, height);

    // Save context state to shift into camera relative drawing coordinate layouts
    ctx.save();
    
    // Apply scale matrix transformation first to capture zooming view extensions
    ctx.scale(currentScale, currentScale);
    ctx.translate(-camX, -camY);

    // 2. Render blueprint grids tracking crosswise spaces across full world bounds
    ctx.strokeStyle = 'rgba(52, 152, 219, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= worldW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, worldH);
      ctx.stroke();
    }
    for (let y = 0; y <= worldH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldW, y);
      ctx.stroke();
    }

    // Draw visual neon perimeter boundaries tracking world box edges
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, worldW, worldH);

    // FIXED: Render procedural environment props beneath active entities layer loop
    if (g.marketDecorRuntimeManager && g.marketDecorRuntimeManager.activeProps) {
      for (const prop of g.marketDecorRuntimeManager.activeProps) {
        prop.render(ctx);
      }
    }

    // 3. Loop through and render all active market NPCs matching world layouts
    for (const npc of MARKET_NPCS) {
      // FIXED: Cleared old multiplication calculation artifact lines. Natively rendering clean pixels.
      this.drawMarketNpc(ctx, npc.x, npc.y, npc);
    }

    // 4. Leverage shared player and entity rendering loops inside translated camera coordinate blocks
    if (g.isGameStarted && player) {
      DiepEntityRenderer.drawPlayer(ctx, player, g.gameOver);
      DiepEntityRenderer.drawBullets(ctx, g.bullets);
    }

    // FIXED: Render dynamic overhead/top layer asset components over players and bullets
    if (g.marketDecorRuntimeManager && g.marketDecorRuntimeManager.activeProps) {
      for (const prop of g.marketDecorRuntimeManager.activeProps) {
        if (prop.renderAsTopLayer) {
          prop.renderAsTopLayer(ctx);
        }
      }
    }

    // Restore context space to clear viewport modifications for clean HUD rendering downstream
    ctx.restore();
  }

  /**
   * Visual renderer structure for market NPCs matching tank geometric styling mechanics
   */
  private static drawMarketNpc(ctx: CanvasRenderingContext2D, x: number, y: number, npc: MarketNpc): void {
    const radius = npc.radius;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(npc.currentAngle);
    
    // Barrel underlay
    ctx.fillStyle = '#95a5a6';
    ctx.strokeStyle = '#7f8c8d';
    ctx.lineWidth = 2;
    ctx.fillRect(0, -radius * 0.4, radius * 1.8, radius * 0.8); 
    ctx.strokeRect(0, -radius * 0.4, radius * 1.8, radius * 0.8);

    // Main geometric body core circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = npc.baseColor;
    ctx.fill();
    ctx.strokeStyle = npc.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();

    // Typography Information Headings
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = npc.baseColor;
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, x, y - radius - 20);

    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText(npc.subtitle, x, y - radius - 6);
  }
}