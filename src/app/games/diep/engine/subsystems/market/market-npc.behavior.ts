// src/app/diep/engine/subsystems/market/market-npc.behavior.ts
import { MARKET_NPCS, MarketNpc, MarketNpcConfigRegistry as Cfg } from './market-npc.config';

export class MarketNpcBehaviorEngine {

  /**
   * Processes all custom AI kinematics, objective path selections, and steering rotations
   */
  public static updateBehavior(npc: MarketNpc, g: any, playerX: number, playerY: number, tick: number, ms: number): void {
    // FIXED: Removed screen dimensions scaling. Working with absolute world pixels natively.
    const npcX = npc.x;
    const npcY = npc.y;

    if (!npc.interactionTimer) npc.interactionTimer = 0;
    if (npc.interactionTimer > 0) npc.interactionTimer -= ms;

    if (npc.behaviorType === 'WANDER') {
      this.processWanderAi(npc, g, npcX, npcY, playerX, playerY, ms);
      this.applySeparationAndSocializing(npc, g, npcX, npcY);
    } else {
      npc.vx = 0;
      npc.vy = 0;
    }

    // FIXED: Native velocity increments added directly without fractional screen scaling step calculations
    npc.x += npc.vx * tick;
    npc.y += npc.vy * tick;

    // Outer Map Boundary Constraints to prevent running off edge boundaries
    const worldW = g.marketCameraSystem.worldWidth;
    const worldH = g.marketCameraSystem.worldHeight;
    if (npc.x < npc.radius) { npc.x = npc.radius; npc.vx *= -0.5; }
    if (npc.y < npc.radius) { npc.y = npc.radius; npc.vy *= -0.5; }
    if (npc.x > worldW - npc.radius) { npc.x = worldW - npc.radius; npc.vx *= -0.5; }
    if (npc.y > worldH - npc.radius) { npc.y = worldH - npc.radius; npc.vy *= -0.5; }

    Cfg.sessionPositionCache.set(npc.id, { x: npc.x, y: npc.y });

    this.processLookingOrientation(npc, g, npc.x, npc.y, playerX, playerY, tick);
  }

  private static processWanderAi(npc: MarketNpc, g: any, currentX: number, currentY: number, playerX: number, playerY: number, ms: number): void {
    if (!npc.wanderTimer) npc.wanderTimer = 0;
    npc.wanderTimer -= ms;

    const pDx = playerX - currentX;
    const pDy = playerY - currentY;
    const distToPlayer = Math.sqrt(pDx * pDx + pDy * pDy);

    if (distToPlayer < Cfg.ENGAGE_PROXIMITY) {
      npc.vx = 0;
      npc.vy = 0;
      return; 
    }

    if (npc.wanderState === 'IDLE' && npc.wanderTimer <= 0) {
      npc.focusedNpcId = null; 

      if (Math.random() > 0.4) {
        npc.wanderState = 'MOVING_AIMLESS';
        npc.wanderTargetX = Math.random() * (Cfg.MAP_BOUNDS.maxX - Cfg.MAP_BOUNDS.minX) + Cfg.MAP_BOUNDS.minX;
        npc.wanderTargetY = Math.random() * (Cfg.MAP_BOUNDS.maxY - Cfg.MAP_BOUNDS.minY) + Cfg.MAP_BOUNDS.minY;
      } else {
        npc.wanderState = 'MOVING_TO_STALL';
        // FIXED: Pull positions out of camera bounds definitions dynamically
        npc.wanderTargetX = g.marketCameraSystem.worldWidth * 0.5; 
        npc.wanderTargetY = g.marketCameraSystem.worldHeight * 0.5;
      }
      npc.wanderTimer = 0; 
    }

    if ((npc.wanderState === 'MOVING_AIMLESS' || npc.wanderState === 'MOVING_TO_STALL') && npc.wanderTargetX !== undefined && npc.wanderTargetY !== undefined) {
      const tDx = npc.wanderTargetX - currentX;
      const tDy = npc.wanderTargetY - currentY;
      const tDist = Math.sqrt(tDx * tDx + tDy * tDy);

      if (tDist > Cfg.TARGET_ARRIVE_RADIUS) {
        let desiredVx = (tDx / tDist) * Cfg.WANDER_SPEED;
        let desiredVy = (tDy / tDist) * Cfg.WANDER_SPEED;

        // FIXED: Added central gravity preference force vector pulling wander choices back to market core center coordinates
        const centerWorldX = g.marketCameraSystem.worldWidth * 0.5;
        const centerWorldY = g.marketCameraSystem.worldHeight * 0.5;
        const cDx = centerWorldX - currentX;
        const cDy = centerWorldY - currentY;
        const cDist = Math.sqrt(cDx * cDx + cDy * cDy);

        if (cDist > 0) {
          desiredVx += (cDx / cDist) * Cfg.WANDER_SPEED * Cfg.CENTER_GRAVITY_WEIGHT;
          desiredVy += (cDy / cDist) * Cfg.WANDER_SPEED * Cfg.CENTER_GRAVITY_WEIGHT;
        }

        npc.vx += (desiredVx - npc.vx) * Cfg.STEERING_EASE;
        npc.vy += (desiredVy - npc.vy) * Cfg.STEERING_EASE;

        npc.lastHeadingAngle = Math.atan2(npc.vy, npc.vx);
      } else {
        npc.wanderState = 'IDLE';
        npc.wanderTimer = Cfg.MIN_IDLE_DURATION + Math.random() * (Cfg.MAX_IDLE_DURATION - Cfg.MIN_IDLE_DURATION);
        npc.vx = 0;
        npc.vy = 0;
      }
    }
  }

  private static applySeparationAndSocializing(npc: MarketNpc, g: any, npcX: number, npcY: number): void {
    for (const other of MARKET_NPCS) {
      if (other.id === npc.id) continue;

      const otherX = other.x;
      const otherY = other.y;

      const dx = npcX - otherX;
      const dy = npcY - otherY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = npc.radius + other.radius + Cfg.SEPARATION_BUFFER;

      if (dist < minDist && dist > 0) {
        const force = ((minDist - dist) / minDist) * Cfg.SEPARATION_FORCE_WEIGHT;
        npc.vx += (dx / dist) * force;
        npc.vy += (dy / dist) * force;
      }

      if (dist < Cfg.SOCIAL_PROXIMITY && npc.wanderState === 'IDLE' && other.wanderState === 'IDLE') {
        if (npc.focusedNpcId === null && (npc.interactionTimer || 0) <= 0) {
          npc.focusedNpcId = other.id;
          npc.interactionTimer = Cfg.MIN_CHAT_DURATION + Math.random() * (Cfg.MAX_CHAT_DURATION - Cfg.MIN_CHAT_DURATION);
        }
      }
      
      if (npc.focusedNpcId === other.id && (npc.interactionTimer || 0) <= 0) {
        npc.focusedNpcId = 'BREAK_AWAY'; 
      }
    }
  }

  private static processLookingOrientation(npc: MarketNpc, g: any, npcX: number, npcY: number, playerX: number, playerY: number, tick: number): void {
    const pDx = playerX - npcX;
    const pDy = playerY - npcY;
    const distToPlayer = Math.sqrt(pDx * pDx + pDy * pDy);

    if (distToPlayer < Cfg.ENGAGE_PROXIMITY) {
      npc.targetAngle = Math.atan2(pDy, pDx);
    } 
    else if (npc.wanderState !== 'IDLE' && (Math.abs(npc.vx) > 0.1 || Math.abs(npc.vy) > 0.1)) {
      npc.targetAngle = Math.atan2(npc.vy, npc.vx);
    } 
    else if (npc.focusedNpcId && npc.focusedNpcId !== 'BREAK_AWAY') {
      const buddy = MARKET_NPCS.find(n => n.id === npc.focusedNpcId);
      if (buddy) {
        npc.targetAngle = Math.atan2(buddy.y - npcY, buddy.x - npcX);
      }
    } 
    else {
      npc.targetAngle = npc.lastHeadingAngle;
    }

    let angleDiff = npc.targetAngle - npc.currentAngle;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    npc.currentAngle += angleDiff * 0.08 * tick;
  }
}