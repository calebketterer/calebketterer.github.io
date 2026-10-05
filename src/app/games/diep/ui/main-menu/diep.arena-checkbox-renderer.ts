import { TileType } from '../../engine/subsystems/arena/arena.manager';
import { DiepButton } from '../../core/diep.interfaces';
import { DiepButtonAnimator } from '../buttons/diep.button-animator';

export class DiepArenaCheckboxRenderer {
  private static readonly WARNING_DURATION = 1500;
  private static readonly HOLE_PERSIST_DURATION = 2000; 
  
  private static miniGrid = Array.from({ length: 9 }, () => ({
    type: TileType.EMPTY,
    targetType: TileType.EMPTY,
    transition: 0,
    warningTime: 0,
    life: 0 
  }));

  public static draw(ctx: CanvasRenderingContext2D, btn: DiepButton, g: any, isEnabled: boolean, frame: number): void {
    const mouse = g.mousePos || { x: -1, y: -1 };
    const isHovered = mouse.x >= btn.x && mouse.x <= btn.x + btn.w && 
                      mouse.y >= btn.y && mouse.y <= btn.y + btn.h;
    
    const anim = DiepButtonAnimator.getValues(btn.id, isHovered);
    
    // The background rect (still used for the renderer's logic context)
    const growAmt = btn.hoverEffect === 'none' ? 0 : 8;
    const rect = DiepButtonAnimator.getBloomedRect(btn, anim.hover, growAmt);

    const dt = 16; 
    
    // FIX: Use btn.w (static) instead of rect.w (dynamic) so the grid doesn't expand
    const cellSize = btn.w / 3; 
    const padding = 2;

    this.miniGrid.forEach((tile, i) => {
      if (isEnabled) {
        if (tile.targetType === TileType.EMPTY && tile.transition === 0 && Math.random() > 0.997) {
          tile.targetType = Math.random() > 0.6 ? TileType.WALL : TileType.HOLE;
          tile.warningTime = 0;
          tile.life = 0;
        }

        if (tile.targetType !== TileType.EMPTY) {
          tile.life += dt;
          const expiry = tile.targetType === TileType.WALL ? 3000 : (this.WARNING_DURATION + this.HOLE_PERSIST_DURATION);
          if (tile.life > expiry) {
            tile.targetType = TileType.EMPTY;
          }
        }
      } else {
        tile.targetType = TileType.EMPTY;
      }

      this.processTileLogic(tile, dt);

      const col = i % 3;
      const row = Math.floor(i / 3);
      
      // FIX: Use btn.x/y (static) instead of rect.x/y so the internal grid stays centered
      const cellX = btn.x + col * cellSize + padding;
      const cellY = btn.y + row * cellSize + padding;
      const drawSize = cellSize - (padding * 2);

      this.renderMiniTile(ctx, tile, cellX, cellY, drawSize);
    });
  }

  private static processTileLogic(tile: any, dt: number): void {
    const target = tile.targetType;
    const current = tile.type;

    if (target === TileType.HOLE) {
      if (current !== TileType.HOLE) {
        tile.warningTime += dt;
        if (tile.warningTime >= this.WARNING_DURATION) {
          tile.type = TileType.HOLE;
          tile.transition = 0;
        }
      } else if (tile.transition < 1) {
        tile.transition += dt * 0.001; 
      }
    } else if (target === TileType.WALL && tile.transition < 1) {
      tile.transition += dt * 0.002; 
      if (tile.transition >= 1) {
        tile.type = TileType.WALL;
        tile.transition = 1;
      }
    } else if (target === TileType.EMPTY && tile.transition > 0) {
      tile.transition -= dt * 0.0015; 
      if (tile.transition <= 0) {
        tile.transition = 0;
        tile.type = TileType.EMPTY;
        tile.warningTime = 0;
      }
    }
  }

  private static renderMiniTile(ctx: CanvasRenderingContext2D, tile: any, x: number, y: number, size: number): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(x, y, size, size);

    if (tile.targetType === TileType.HOLE && tile.type !== TileType.HOLE) {
      const isBlinkOn = Math.floor(tile.warningTime / 250) % 2 === 0;
      ctx.fillStyle = isBlinkOn ? 'rgba(231, 76, 60, 0.4)' : 'rgba(255, 255, 255, 0.1)';
    } else if (tile.type === TileType.HOLE) {
      ctx.fillStyle = `rgba(0, 0, 0, ${tile.transition * 0.9})`;
    } else if (tile.targetType === TileType.WALL || tile.type === TileType.WALL) {
      ctx.fillStyle = `rgba(255, 255, 255, ${tile.transition * 0.8})`;
    } else if (tile.transition > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${tile.transition * 0.15})`;
    }
    ctx.fillRect(x, y, size, size);
  }
}