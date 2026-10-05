// src/app/diep/engine/subsystems/player/diep.player.service.ts
import { Injectable } from '@angular/core';
import { Player, DifficultyMode, GameSystem } from '../../../core/diep.interfaces';
import { DiepPlayerUpgradesService } from './player-upgrades/diep.player-upgrades.service';
import { DiepGameEngineService } from '../../diep.game-engine.service';
import { CollectibleRegistry } from './collectibles/collectible-registry';
import { DiepPixelsService } from '../../../core/diep.pixels.service';

@Injectable({ providedIn: 'root' })
export class DiepPlayerService implements GameSystem {
    
    public player!: Player;

    constructor(
        private upgradeService: DiepPlayerUpgradesService,
        private pixelsService: DiepPixelsService
    ) {}

    public get isPlayerDead(): boolean {
        return this.player ? this.player.health <= 0 : false;
    }

    /**
     * Initializes the internal player entity state.
     * Hooks into the persistent Pixels Service to preserve wallet balances between games.
     */
    public initializePlayer(difficulty: DifficultyMode = 'MEDIUM', carryOverXp: number = 0): void {
        const existingEquipped = this.player?.inventory?.equippedIds || [];
        
        // Grab the saved long-term wallet balance from storage via our service cache safely
        const currentPixels = this.pixelsService.balance;

        this.player = { 
            x: 400, y: 300, vx: 0, vy: 0, 
            radius: 20, 
            mass: 25,
            angle: 0, 
            maxSpeed: 3, 
            color: '#3498db', 
            health: 100, maxHealth: 100,
            healthRegen: .5, 
            fireRate: 5, 
            bodyDamage: 20,
            bulletDamage: 10,
            bulletHealth: 10,
            bulletSpeed: 7.5,
            upgrades: {},
            progression: this.upgradeService.getDefaultProgression(difficulty, carryOverXp),
            
            inventory: {
                maxSlots: 16,
                pixels: currentPixels, 
                slots: CollectibleRegistry.getStarterInventoryList(),
                equippedIds: existingEquipped
            }
        };
    }

    /**
     * Cleanly handles equipping an item via state data mutations without UI-side math leaks.
     */
    public equipItem(id: string): void {
        if (!this.player || !this.player.inventory) return;
        const inv = this.player.inventory;

        if (inv.equippedIds.length < 3 && !inv.equippedIds.includes(id)) {
            inv.equippedIds.push(id);
        }
    }

    /**
     * Cleanly handles removing an item from the equipped array state.
     */
    public unequipItem(id: string): void {
        if (!this.player || !this.player.inventory) return;
        const inv = this.player.inventory;

        const idx = inv.equippedIds.indexOf(id);
        if (idx !== -1) {
            inv.equippedIds.splice(idx, 1);
        }
    }

    /**
     * Implementation of GameSystem interface.
     * Evaluates keyboard physics forces, friction limits, mouse aiming tracking, and regeneration increments.
     */
    public update(engine: DiepGameEngineService, F: number, ms: number): void {
        if (!engine.isGameStarted || engine.isPaused || engine.gameOver) return;

        // Provide dynamic camera parameters including scale modifier adjustments
        const cameraConfig = engine.currentMode === 'MARKET' && engine.marketCameraSystem 
            ? { x: engine.marketCameraSystem.x, y: engine.marketCameraSystem.y, scale: engine.marketCameraSystem.scale }
            : undefined;

        const results = this.updatePlayerPhysics(
            this.player,
            engine.keys,
            engine.mousePos,
            engine.mouseAiming,
            engine.width,
            engine.height,
            F,
            ms,
            cameraConfig
        );

        engine.lastAngle = results.lastAngle;
    }

    public updatePlayerPhysics(
        player: Player,
        keys: { [key: string]: boolean },
        mousePos: { x: number; y: number },
        mouseAiming: boolean,
        width: number,
        height: number,
        F: number,
        deltaTime: number,
        cameraConfig?: { x: number; y: number; scale: number }
    ): { lastAngle: number } {
        let lastAngle = player.angle;
        const FRICTION = Math.pow(0.9, F); 
        const ACCELERATION = 0.5 * F;

        if (keys['w']) player.vy -= ACCELERATION;
        if (keys['s']) player.vy += ACCELERATION;
        if (keys['a']) player.vx -= ACCELERATION;
        if (keys['d']) player.vx += ACCELERATION;

        player.x += player.vx * F;
        player.y += player.vy * F;

        player.vx *= FRICTION;
        player.vy *= FRICTION;

        const currentSpeed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (currentSpeed > player.maxSpeed) {
            const ratio = player.maxSpeed / currentSpeed;
            player.vx *= ratio;
            player.vy *= ratio;
        }

        if (mouseAiming) {
            // FIXED: Divide screen mouse positions by scaling ratios before translating with world offsets
            const currentScale = cameraConfig ? cameraConfig.scale : 1.0;
            const targetX = cameraConfig ? (mousePos.x / currentScale) + cameraConfig.x : mousePos.x;
            const targetY = cameraConfig ? (mousePos.y / currentScale) + cameraConfig.y : mousePos.y;
            
            player.angle = Math.atan2(targetY - player.y, targetX - player.x);
        } else if (Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1) {
            player.angle = Math.atan2(player.vy, player.vx);
        }
        lastAngle = player.angle;
        
        player.health = Math.min(player.maxHealth, player.health + (player.healthRegen * deltaTime / 1000));

        return { lastAngle };
    }
}