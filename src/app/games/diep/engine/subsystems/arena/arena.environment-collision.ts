// src/app/diep/engine/subsystems/arena/arena.environment-collision.ts
import { Injectable } from '@angular/core';
import { DiepArenaManager, TileType } from './arena.manager';

@Injectable({ providedIn: 'root' })
export class DiepEnvironmentCollisionService {
    constructor(private arenaManager: DiepArenaManager) {}

    /**
     * Keeps an entity clamped inside the game simulation viewport canvas boundaries.
     */
    public clampToCanvas(entity: { x: number; y: number; radius: number }, width: number, height: number): void {
        entity.x = Math.max(entity.radius, Math.min(width - entity.radius, entity.x));
        entity.y = Math.max(entity.radius, Math.min(height - entity.radius, entity.y));
    }

    /**
     * Evaluates entity position against wall, hole, and empty tile matrices.
     */
    public handleEnvironmentCollision(entity: any, isBullet: boolean = false): boolean {
        if (entity.isGhost) return false;

        const tileSize = this.arenaManager.tileSize;
        const margin = isBullet ? 2 : 0;
        const left = entity.x - entity.radius - margin;
        const right = entity.x + entity.radius + margin;
        const top = entity.y - entity.radius - margin;
        const bottom = entity.y + entity.radius + margin;

        const gridLeft = Math.floor(left / tileSize);
        const gridRight = Math.floor(right / tileSize);
        const gridTop = Math.floor(top / tileSize);
        const gridBottom = Math.floor(bottom / tileSize);

        for (let gy = gridTop; gy <= gridBottom; gy++) {
            for (let gx = gridLeft; gx <= gridRight; gx++) {
                const tile = this.arenaManager.getTileAt(gx * tileSize + 1, gy * tileSize + 1);
                if (!tile) continue;

                if (tile.type === TileType.HOLE && tile.transition > 0.8 && !entity.isFlying) {
                    const centerTile = this.arenaManager.getTileAt(entity.x, entity.y);
                    if (centerTile === tile) {
                        entity.health = 0;
                        return true;
                    }
                }

                const wallThreshold = isBullet ? 0.2 : 0.5;
                if (tile.type === TileType.WALL && tile.transition > wallThreshold) {
                    if (isBullet) {
                        entity.health = 0;
                        entity.dx = 0;
                        entity.dy = 0;
                        return true;
                    }

                    const tileCenterX = (gx * tileSize) + tileSize / 2;
                    const tileCenterY = (gy * tileSize) + tileSize / 2;
                    const diffX = entity.x - tileCenterX;
                    const diffY = entity.y - tileCenterY;
                    const overlapX = (tileSize / 2 + entity.radius) - Math.abs(diffX);
                    const overlapY = (tileSize / 2 + entity.radius) - Math.abs(diffY);

                    if (overlapX > 0 && overlapY > 0) {
                        if (overlapX < overlapY) {
                            entity.x += diffX > 0 ? overlapX : -overlapX;
                            entity.vx = 0;
                        } else {
                            entity.y += diffY > 0 ? overlapY : -overlapY;
                            entity.vy = 0;
                        }
                    }
                }
            }
        }
        return false;
    }
}