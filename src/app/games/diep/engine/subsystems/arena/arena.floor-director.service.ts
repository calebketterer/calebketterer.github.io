// src/app/diep/engine/subsystems/arena/arena.floor-director.service.ts
import { Injectable } from '@angular/core';
import { DiepWaveManagerService } from './arena.wave-manager';
import { TileType } from './arena.manager';

type ArenaPattern = 'NONE' | 'CHAOS' | 'CENTER_PIT' | 'VERTICAL_STRIPES' | 'RANDOM_MAZE' | 'VOID_POCKETS';

@Injectable({ providedIn: 'root' })
export class DiepFloorDirector {
  private updateTimer = 0;
  private currentPattern: ArenaPattern = 'NONE';
  private lastWaveProcessed = -1;
  private patternInitialized = false;
  public enabled = false;

  constructor(private waveManager: DiepWaveManagerService) {}

  /**
   * Accepts the arena instance dynamically to execute grid mutations without circular DI
   */
  public update(deltaTime: number, width: number, height: number, arena: any): void {
    if (!this.enabled) return;
    this.checkWaveTransition(arena);
    this.runActivePattern(deltaTime, width, height, arena);
  }

  private checkWaveTransition(arena: any): void {
    const wave = this.waveManager.waveCount;
    
    if (wave !== this.lastWaveProcessed) {
      this.lastWaveProcessed = wave;
      this.updateTimer = 0;
      this.patternInitialized = false;

      // 75% chance to gently clear old layouts
      if (Math.random() < 0.75) {
        arena.clearAll();
      }

      const weights: ArenaPattern[] = ['CHAOS', 'CENTER_PIT', 'VERTICAL_STRIPES', 'RANDOM_MAZE', 'VOID_POCKETS'];
      this.currentPattern = weights[Math.floor(Math.random() * weights.length)];

      if (wave <= 0) this.currentPattern = 'NONE';
      
      console.log(`%c ⚡ ARENA SHIFT: ${this.currentPattern}`, 'background: #222; color: #bada55; font-weight: bold;');
    }
  }

  private runActivePattern(deltaTime: number, width: number, height: number, arena: any): void {
    this.updateTimer += deltaTime;

    switch (this.currentPattern) {
      case 'CHAOS': {
        const spawnRate = 450; 
        if (this.updateTimer > spawnRate) {
          const rand = Math.random();
          let type: TileType;
          
          if (rand < 0.35) type = TileType.WALL;
          else if (rand < 0.70) type = TileType.HOLE;
          else type = TileType.EMPTY; // 30% chance to clear a tile

          arena.triggerHazard(Math.random() * width, Math.random() * height, type);
          this.updateTimer = 0;
        }
        break;
      }

      case 'CENTER_PIT': {
        const delay = 1000;
        const radius = 2; // 5x5 area
        if (!this.patternInitialized && this.updateTimer > delay) {
          const midX = width / 2;
          const midY = height / 2;
          for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
              arena.triggerHazard(midX + (i * 50), midY + (j * 50), TileType.HOLE);
            }
          }
          this.patternInitialized = true;
        }
        break;
      }

      case 'VERTICAL_STRIPES': {
        const xSpacing = 500;
        if (!this.patternInitialized && this.updateTimer > 500) {
          for (let x = 300; x < width; x += xSpacing) { 
            const gateY = Math.floor(Math.random() * (height / 50)) * 50;
            for (let y = 0; y < height; y += 50) {
              if (Math.abs(y - gateY) < 100) continue; 
              arena.triggerHazard(x, y, TileType.WALL);
            }
          }
          this.patternInitialized = true;
        }
        break;
      }

      case 'RANDOM_MAZE': {
        const wallCount = 18;
        if (!this.patternInitialized && this.updateTimer > 500) {
          for (let i = 0; i < wallCount; i++) {
            arena.triggerHazard(Math.random() * width, Math.random() * height, TileType.WALL);
          }
          this.patternInitialized = true;
        }
        break;
      }

      case 'VOID_POCKETS': {
        const spawnRate = 2200;
        const clusterSize = 2; // 2x2
        if (this.updateTimer > spawnRate) {
          const rx = Math.random() * width;
          const ry = Math.random() * height;
          for(let i = 0; i < clusterSize; i++) {
            for(let j = 0; j < clusterSize; j++) {
                arena.triggerHazard(rx + (i * 50), ry + (j * 50), TileType.HOLE);
            }
          }
          this.updateTimer = 0;
        }
        break;
      }

      default:
        break;
    }
  }

  public reset(): void {
    this.updateTimer = 0;
    this.currentPattern = 'NONE';
    this.lastWaveProcessed = -1;
    this.patternInitialized = false;
  }
}