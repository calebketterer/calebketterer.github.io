// src/app/diep/engine/subsystems/market/market-physics.processor.ts
import { Player, Bullet } from '../../../core/diep.interfaces';
import { MARKET_NPCS } from './market-npc.config';
import { MarketNpcBehaviorEngine } from './market-npc.behavior'; 

export class MarketPhysicsProcessor {
  /**
   * Orchestrates orientation updates, solid collisions, and projectile blocks for the market scene
   */
  public static process(g: any, player: Player, bullets: Bullet[], tick: number, ms: number): void {
    if (!player) return;

    for (const npc of MARKET_NPCS) {
      // 1. Update Kinematics, State Paths, and AI Rotations first
      MarketNpcBehaviorEngine.updateBehavior(npc, g, player.x, player.y, tick, ms);

      // FIXED: Dropped scalar world width/height multiplications since coordinates are absolute world pixels
      const npcX = npc.x;
      const npcY = npc.y;

      const dx = player.x - npcX;
      const dy = player.y - npcY;
      const distToPlayer = Math.sqrt(dx * dx + dy * dy);

      // 2. Handle Player Solid Circle Pushing Physics
      const minDist = player.radius + npc.radius;
      if (distToPlayer < minDist && distToPlayer > 0) {
        const overlap = minDist - distToPlayer;
        const nx = dx / distToPlayer;
        const ny = dy / distToPlayer;

        player.x += nx * overlap;
        player.y += ny * overlap;
      }

      // 3. Handle Cosmetic Bullet Intersection & Blockades
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        const bDx = b.x - npcX;
        const bDy = b.y - npcY;
        const bDist = Math.sqrt(bDx * bDx + bDy * bDy);

        if (bDist < npc.radius + (b.radius || 10)) {
          b.health = 0; 
        }
      }
    }
  }
}