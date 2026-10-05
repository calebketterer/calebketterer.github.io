// src/app/diep/engine/subsystems/sectors/sectors.renderer.ts
import { Player } from '../../../core/diep.interfaces';
import { FactionColor, FACTION_COLOR_HEX } from './sectors.interfaces';
import { DiepWorldRenderer } from '../diep.world-renderer';
import { DiepHudRenderer } from '../../../ui/hud/diep.hud-renderer';
import { SectorsDecorDirector } from './structures/sectors.decor-director';
import { SectorsDoorRenderer } from './structures/sectors.door-renderer';
import { DiepEntityRenderer } from '../diep.entity-renderer';

interface RGB {
  r: number;
  g: number;
  b: number;
}

export class SectorsRenderer {
  private static decorDirector = new SectorsDecorDirector();
  private static doorRenderer = new SectorsDoorRenderer();

  // Color transition state
  private static currentRgb: RGB = { r: 52, g: 152, b: 219 }; // Default blue
  private static targetRgb: RGB = { r: 52, g: 152, b: 219 };
  private static startRgb: RGB = { r: 52, g: 152, b: 219 };
  private static transitionStartTime: number = 0;
  private static readonly TRANSITION_DURATION: number = 300; // ms
  private static lastFaction: FactionColor | null = null;

  /**
   * Renders the complete Sectors game mode scene using authentic Diep visual styling.
   */
  public static renderSectors(
    ctx: CanvasRenderingContext2D,
    g: any,
    player: Player,
    width: number,
    height: number
  ): void {
    const director = g.sectorsManager?.roomDirector;
    const room = director?.currentRoom;

    const factionKey = (room?.faction ?? 'blue') as FactionColor;
    const targetHex = FACTION_COLOR_HEX[factionKey] || FACTION_COLOR_HEX.blue;

    // Update color transition animation state
    this.updateColorTransition(factionKey, targetHex);

    const activeHex = this.rgbToHex(this.currentRgb);

    // 1. Base Dark Grid Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines tinted by active smoothly-interpolated color
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${Math.round(this.currentRgb.r)}, ${Math.round(this.currentRgb.g)}, ${Math.round(this.currentRgb.b)}, 0.2)`;
    ctx.lineWidth = 1;
    const tileSize = 50;
    for (let x = 0; x <= width; x += tileSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += tileSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 2. Toxic Trails & Ground Layer
    if (g.isGameStarted || g.gameOver) {
      DiepEntityRenderer.drawToxicTrails(ctx, g.toxicTrails || []);

      const visibleEnemies = g.gameOverService?.getAnimationEnemies(g.enemies || []) || (g.enemies || []);
      const groundEnemies = visibleEnemies.filter((e: any) => !e.isFlying);

      DiepWorldRenderer.drawEnemiesWithBars(ctx, groundEnemies, player, g.bullets || []);
      DiepEntityRenderer.drawPlayer(ctx, player, g.gameOver);
      DiepEntityRenderer.drawBullets(ctx, g.bullets || []);
    }

    // 3. Doors & Sector Room Decor (Layered BELOW perimeter border)
    if (room && director) {
      this.doorRenderer.drawRoomDoors(
        ctx,
        room,
        director.rooms,
        director.getNeighborCoords.bind(director),
        width,
        height
      );

      this.decorDirector.drawRoomStructures(ctx, room, width, height);
    }

    // 4. Outer Perimeter Border Line (Layered OVER doors & decor)
    ctx.strokeStyle = activeHex;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, width - 6, height - 6);

    // 5. Flying Layer
    if (g.isGameStarted || g.gameOver) {
      const visibleEnemies = g.gameOverService?.getAnimationEnemies(g.enemies || []) || (g.enemies || []);
      const flyingEnemies = visibleEnemies.filter((e: any) => e.isFlying);
      if (flyingEnemies.length > 0) {
        DiepWorldRenderer.drawEnemiesWithBars(ctx, flyingEnemies, player, g.bullets || []);
      }
    }

    // 6. HUD Overlay
    DiepHudRenderer.draw(ctx, g, player, width, height);

    // 7. Sector Coordinates Text Overlay
    const paddingRight = 20;
    const paddingBottom = 40;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`FACTION: ${String(factionKey).toUpperCase()}`, width - paddingRight, height - paddingBottom);
    ctx.fillText(`SECTOR: [${room?.gridX ?? 0}, ${room?.gridY ?? 0}]`, width - paddingRight, height - (paddingBottom - 18));
  }

  /**
   * Smoothly interpolates the current color towards the target room color over time.
   */
  private static updateColorTransition(factionKey: FactionColor, targetHex: string): void {
    const now = performance.now();

    if (this.lastFaction !== factionKey) {
      this.lastFaction = factionKey;
      this.startRgb = { ...this.currentRgb };
      this.targetRgb = this.hexToRgb(targetHex);
      this.transitionStartTime = now;
    }

    const elapsed = now - this.transitionStartTime;
    const progress = Math.min(1, Math.max(0, elapsed / this.TRANSITION_DURATION));

    // Smooth step easing (easeInOutQuad)
    const easedProgress = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    this.currentRgb = {
      r: this.startRgb.r + (this.targetRgb.r - this.startRgb.r) * easedProgress,
      g: this.startRgb.g + (this.targetRgb.g - this.startRgb.g) * easedProgress,
      b: this.startRgb.b + (this.targetRgb.b - this.startRgb.b) * easedProgress,
    };
  }

  private static hexToRgb(hex: string): RGB {
    const cleanHex = hex.replace('#', '');
    const bigint = parseInt(cleanHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  private static rgbToHex(rgb: RGB): string {
    const r = Math.round(rgb.r).toString(16).padStart(2, '0');
    const g = Math.round(rgb.g).toString(16).padStart(2, '0');
    const b = Math.round(rgb.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }
}