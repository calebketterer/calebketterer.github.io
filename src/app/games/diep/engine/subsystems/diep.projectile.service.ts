// src/app/diep/engine/subsystems/diep.projectile.service.ts
import { Injectable } from '@angular/core';
import { Bullet, TrailSegment, Player, GameSystem } from '../../core/diep.interfaces';
import { DiepTimeManager } from '../../core/diep.time-manager';
import { DiepGameEngineService } from '../diep.game-engine.service';
import { DiepPlayerService } from './player/diep.player.service';
import { DiepWeaponController } from './player/diep.weapon-controller';

@Injectable({
    providedIn: 'root'
})
export class DiepProjectileService implements GameSystem {

    constructor(
        private playerService: DiepPlayerService,
        private weaponController: DiepWeaponController
    ) {}

    public update(engine: DiepGameEngineService, tick: number, ms: number): void {
        const activePlayer = this.playerService.player;

        if (activePlayer && activePlayer.health > 0) {
            // Firing is active if holding mouse during mouseAiming, OR holding 'k' when mouseAiming is disabled
            const isTryingToShoot = (engine.mouseAiming && engine.mouseDown) || (!engine.mouseAiming && engine.keys['k']);

            const cameraConfig = engine.currentMode === 'MARKET' && engine.marketCameraSystem
                ? { x: engine.marketCameraSystem.x, y: engine.marketCameraSystem.y, scale: engine.marketCameraSystem.scale }
                : undefined;

            // Constantly update the weapon subsystem so cooldown clocks track fluidly
            this.weaponController.updateWeapon(
                ms,
                isTryingToShoot,
                activePlayer,
                engine.mousePos,
                engine.mouseAiming,
                engine.lastAngle,
                engine.bullets,
                cameraConfig
            );
        }

        engine.bullets = this.updateBullets(
            engine.bullets, 
            tick, 
            engine.width, 
            engine.height, 
            activePlayer, 
            ms,
            engine
        );

        engine.toxicTrails = this.updateTrails(
            engine.toxicTrails, 
            engine.bullets, 
            activePlayer, 
            ms
        );
    }

    public updateBullets(
        bullets: Bullet[], 
        F: number, 
        width: number, 
        height: number, 
        player: Player, 
        deltaTime: number,
        engine: DiepGameEngineService
    ): Bullet[] {
        if (deltaTime <= 0) return bullets;

        return bullets.map(b => {
            if (b.isBomb) {
                if (!b.isExploding) {
                    b.dx *= Math.pow(0.98, F);
                    b.dy *= Math.pow(0.98, F);
                } else {
                    b.dx = 0;
                    b.dy = 0;
                }
                
                if (b.timer !== undefined) {
                    b.timer -= deltaTime;
                }
            }

            b.x += b.dx * F;
            b.y += b.dy * F;
            return b;
        }).filter(b => {
            if (b.isBomb) {
                return b.timer !== undefined && b.timer > 0;
            }

            // FIXED: Factor in dynamic camera map boundary sizes to support large-scale open world rendering arrays
            if (engine.currentMode === 'MARKET' && engine.marketCameraSystem) {
                const limitW = engine.marketCameraSystem.worldWidth;
                const limitH = engine.marketCameraSystem.worldHeight;
                return b.health > 0 && b.x > -100 && b.x < limitW + 100 && b.y > -100 && b.y < limitH + 100;
            }

            return b.health > 0 && b.x > -100 && b.x < width + 100 && b.y > -100 && b.y < height + 100;
        });
    }

    public updateTrails(
        trails: TrailSegment[], 
        bullets: Bullet[], 
        player: Player, 
        ms: number
    ): TrailSegment[] {
        bullets.forEach(bullet => {
            if (bullet.hasTrail) {
                trails.push({
                    x: bullet.x, y: bullet.y,
                    radius: 5, maxRadius: 20,
                    color: '#27ae60', opacity: 0.6,
                    creationTime: 0, 
                    lifespan: 1000 
                });
            }
        });

        for (let i = trails.length - 1; i >= 0; i--) {
            const t = trails[i];
            t.lifespan -= ms;

            if (t.lifespan <= 0) {
                trails.splice(i, 1);
                continue;
            }

            const lifeRatio = 1 - (t.lifespan / 1000); 

            t.radius = 5 + (t.maxRadius - 5) * lifeRatio;
            t.opacity = 0.6 * (1 - lifeRatio);

            const dx = player.x - t.x;
            const dy = player.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (ms > 0 && dist < t.radius + player.radius) {
                player.health -= 0.04 * DiepTimeManager.gameTick; 
            }
        }
        return trails;
    }
}