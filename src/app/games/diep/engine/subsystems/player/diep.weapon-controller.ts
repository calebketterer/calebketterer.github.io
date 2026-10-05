// src/app/diep/engine/subsystems/player/diep.weapon-controller.ts
import { Injectable } from '@angular/core';
import { Player, Bullet } from '../../../core/diep.interfaces';
import { DiepTimeManager } from '../../../core/diep.time-manager';
import { DiepStatsService } from '../../../core/diep.stats.service';

@Injectable({
    providedIn: 'root'
})
export class DiepWeaponController {
    private shotTimer = 0;

    constructor(private diepStatsService: DiepStatsService) {}

    /**
     * Ticks the internal shooting weapon clock and processes firing commands if requested.
     */
    public updateWeapon(
        deltaTime: number,
        isTryingToShoot: boolean,
        player: Player, 
        mousePos: { x: number; y: number }, 
        mouseAiming: boolean, 
        lastAngle: number, 
        bullets: Bullet[],
        cameraConfig?: { x: number; y: number; scale: number }
    ): void {
        const fireDelay = 1000 / player.fireRate;

        // Continuously run the weapon cooldown in the background
        if (this.shotTimer < fireDelay) {
            this.shotTimer += deltaTime;
        }

        // Clamp the timer to the fire delay threshold so extra idle time isn't stored
        if (this.shotTimer > fireDelay) {
            this.shotTimer = fireDelay;
        }

        // Guard against firing checks if player isn't actively pressing keys/mouse triggers
        if (!isTryingToShoot) return;
        if (this.shotTimer < fireDelay) return;
        
        // Consume the delay amount instead of wiping to 0 so fractional frame time carries over
        this.shotTimer -= fireDelay; 

        // FIXED: Factor in viewport scaling matrices when computing world target trajectories
        const currentScale = cameraConfig ? cameraConfig.scale : 1.0;
        const targetMouseX = cameraConfig ? (mousePos.x / currentScale) + cameraConfig.x : mousePos.x;
        const targetMouseY = cameraConfig ? (mousePos.y / currentScale) + cameraConfig.y : mousePos.y;

        const angle = mouseAiming 
            ? Math.atan2(targetMouseY - player.y, targetMouseX - player.x) 
            : lastAngle;
            
        const barrelLength = player.radius * 2.0;
        const radius = 7.5;
        
        const bulletMass = (Math.pow(radius, 2) * Math.PI) * (player.bulletHealth * 0.001);
        const recoilForce = (bulletMass * player.bulletSpeed) / player.mass;

        player.vx -= Math.cos(angle) * recoilForce;
        player.vy -= Math.sin(angle) * recoilForce;

        bullets.push({
            id: Math.random().toString(36).substr(2, 9),
            x: player.x + Math.cos(angle) * barrelLength,
            y: player.y + Math.sin(angle) * barrelLength,
            dx: Math.cos(angle) * player.bulletSpeed,
            dy: Math.sin(angle) * player.bulletSpeed,
            radius: radius,
            mass: bulletMass,
            color: player.color,
            ownerType: 'PLAYER',
            health: player.bulletHealth,
            maxHealth: player.bulletHealth,
            damage: player.bulletDamage,
            isFlying: true,
            isGhost: false,
        });

        this.diepStatsService.recordShotFired();
    }

    public resetCooldown(): void {
        this.shotTimer = 1000;
    }
}