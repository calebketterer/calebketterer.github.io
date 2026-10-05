// src/app/diep/ui/diep.grid-renderer.ts
import { ArenaTile, TileType } from './arena.manager';

export class DiepBackgroundRenderer {
  /**
   * PASS 1: Draw Dark Base, Grid, and Holes
   * These stay BEHIND the player and enemies.
   */
  public static drawGround(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    tileSize: number, 
    tiles: ArenaTile[]
  ): void {
    // 1. Draw Base Dark Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw Static Grid Lines
    ctx.beginPath();
    ctx.strokeStyle = '#252525';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += tileSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += tileSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 3. Draw Holes (Warning & Square Lowering)
    tiles.forEach(tile => {
      const screenX = tile.x * tileSize;
      const screenY = tile.y * tileSize;
      
      const target = tile.targetType;
      const current = tile.type;

      // --- BLINKING WARNING PHASE ---
      if (target === TileType.HOLE && current !== TileType.HOLE) {
        // 3 blinks over 1500ms (250ms on/off)
        const blinkCycle = Math.floor(tile.warningTime / 250);
        if (blinkCycle % 2 === 0) {
          ctx.strokeStyle = '#c50000';
          ctx.lineWidth = 3;
          ctx.strokeRect(screenX + 2, screenY + 2, tileSize - 4, tileSize - 4);
        }
      }

      // --- HOLE RENDERING ---
      if (current === TileType.HOLE || target === TileType.HOLE) {
        // Skip drawing the dark hole void panel if we are still warning
        if (current !== TileType.HOLE && tile.transition <= 0) return;

        const t = tile.transition;

        // Draw the "Void" background
        ctx.fillStyle = '#000000';
        ctx.fillRect(screenX, screenY, tileSize, tileSize);

        // Draw the lowering floor panel
        if (t < 1) {
          ctx.save();
          ctx.globalAlpha = 1 - t;
          ctx.fillStyle = '#1a1a1a';
          
          // Shrink the square slightly as it "drops" for parallax effect
          const shrink = (tileSize / 2) * t * 0.4;
          const drawSize = tileSize - (shrink * 2);
          
          ctx.fillRect(screenX + shrink, screenY + shrink, drawSize, drawSize);
          
          // Panel border
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX + shrink, screenY + shrink, drawSize, drawSize);
          ctx.restore();
        }

        // Deep hole rim
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX, screenY, tileSize, tileSize);
      }
    });
  }

  /**
   * PASS 2: Draw the Walls
   * These are drawn ON TOP of ground entities for depth.
   */
  public static drawWalls(ctx: CanvasRenderingContext2D, tileSize: number, tiles: ArenaTile[]): void {
    tiles.forEach(tile => {
      const target = tile.targetType;
      const current = tile.type;

      if (current === TileType.WALL || target === TileType.WALL) {
        const screenX = tile.x * tileSize;
        const screenY = tile.y * tileSize;
        const t = tile.transition;

        // Ensure we have a transition layout value to render
        if (t <= 0 && current !== TileType.WALL) return;

        ctx.save();
        
        // Draw Shadow first (Static, behind the rising block)
        ctx.fillStyle = `rgba(0, 0, 0, ${t * 0.3})`;
        ctx.fillRect(screenX + 4, screenY + 4, tileSize, tileSize);

        // Calculate "Pop-up" Scale (starts small and grows)
        const scale = 0.8 + (0.2 * t);
        const offset = (tileSize * (1 - scale)) / 2;
        
        // Wall Colors
        const wallColor = t >= 1 ? '#555555' : `rgba(85, 85, 85, ${t})`;
        const borderColor = t >= 1 ? '#444444' : `rgba(68, 68, 68, ${t})`;
        const topLight = t >= 1 ? '#777777' : `rgba(119, 119, 119, ${t})`;

        // Main Body
        ctx.fillStyle = wallColor;
        ctx.fillRect(screenX + offset, screenY + offset, tileSize * scale, tileSize * scale);

        // Top-down depth border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(screenX + offset, screenY + offset, tileSize * scale, tileSize * scale);

        // Highlight top edge
        ctx.beginPath();
        ctx.strokeStyle = topLight;
        ctx.lineWidth = 2;
        ctx.moveTo(screenX + offset, screenY + offset);
        ctx.lineTo(screenX + offset + (tileSize * scale), screenY + offset);
        ctx.stroke();

        ctx.restore();
      }
    });
  }
}