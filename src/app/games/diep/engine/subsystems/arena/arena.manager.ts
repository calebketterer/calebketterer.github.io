// src/app/diep/engine/subsystems/arena/arena.manager.ts
import { Injectable } from '@angular/core';
import { GameSystem } from '../../../core/diep.interfaces';
import { DiepFloorDirector } from './arena.floor-director.service';

export enum TileType {
  EMPTY = 'EMPTY',
  HOLE = 'HOLE',
  WALL = 'WALL'
}

export interface ArenaTile {
  type: TileType;
  targetType: TileType;
  transition: number; // 0 to 1
  x: number;
  y: number;
  warningTime: number; // For the blinking warning
}

@Injectable({ providedIn: 'root' })
export class DiepArenaManager implements GameSystem {
  public readonly tileSize = 50;
  private grid: Map<string, ArenaTile> = new Map();
  private columns: number = 0;
  private rows: number = 0;

  // 1500ms allows for 3 distinct blinks at 500ms intervals
  private readonly WARNING_DURATION = 1500;

  constructor(private hazardDirector: DiepFloorDirector) {}

  public init(width: number, height: number): void {
    this.columns = Math.ceil(width / this.tileSize);
    this.rows = Math.ceil(height / this.tileSize);
    this.grid.clear();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        const key = `${x},${y}`;
        this.grid.set(key, { 
          type: TileType.EMPTY, 
          targetType: TileType.EMPTY, 
          transition: 0, 
          x, 
          y,
          warningTime: 0 
        });
      }
    }
  }

  /**
   * Satisfies the GameSystem contract.
   * Encapsulates grid evaluation and layout direction calculations entirely.
   */
  public update(engine: any, tick: number, ms: number): void {
    if (!engine.arenaEnabled) return;

    // Tick the grid tile matrix transformations using the exact engine time delta
    this.tickGrid(ms);

    // Coordinate the pattern generation sequences and pass the instance downward
    this.hazardDirector.update(ms, engine.width, engine.height, this);
  }

  private tickGrid(deltaTime: number): void {
    this.grid.forEach(tile => {
      const target = tile.targetType;

      // HANDLE HOLE LIFECYCLE
      if (target === TileType.HOLE) {
        if (tile.type !== TileType.HOLE) {
          if (tile.warningTime < this.WARNING_DURATION) {
            tile.warningTime += deltaTime;
          } else {
            tile.type = TileType.HOLE;
            tile.transition = 0;
          }
        } else if (tile.transition < 1) {
          tile.transition += deltaTime * 0.001; 
          if (tile.transition > 1) tile.transition = 1;
        }
      } 
      // HANDLE WALL LIFECYCLE
      else if (target === TileType.WALL) {
        if (tile.type !== TileType.WALL) {
          tile.type = TileType.WALL;
          tile.transition = 0;
        }
        
        if (tile.transition < 1) {
          tile.transition += deltaTime * 0.002;
          if (tile.transition >= 1) {
            tile.transition = 1;
          }
        }
      }
      // HANDLE CLEARING / FADING BACK TO EMPTY
      else if (target === TileType.EMPTY) {
        if (tile.transition > 0) {
          tile.transition -= deltaTime * 0.0015;
          if (tile.transition <= 0) {
            tile.transition = 0;
            tile.type = TileType.EMPTY;
            tile.warningTime = 0;
          }
        } else {
          tile.type = TileType.EMPTY;
          tile.warningTime = 0;
        }
      }
    });
  }

  /**
   * Resets all tiles to empty target for director cleanup
   */
  public clearAll(): void {
    this.grid.forEach(tile => {
      tile.targetType = TileType.EMPTY;
    });
  }

  public triggerHazard(x: number, y: number, type: TileType): void {
    const gridX = Math.floor(x / this.tileSize);
    const gridY = Math.floor(y / this.tileSize);
    const tile = this.grid.get(`${gridX},${gridY}`);
    if (tile) {
      tile.targetType = type;
      tile.warningTime = 0; // Reset warning for new hazards
    }
  }

  public getTileAt(worldX: number, worldY: number): ArenaTile | undefined {
    const x = Math.floor(worldX / this.tileSize);
    const y = Math.floor(worldY / this.tileSize);
    return this.grid.get(`${x},${y}`);
  }

  public getAllTiles(): ArenaTile[] {
    return Array.from(this.grid.values());
  }
}