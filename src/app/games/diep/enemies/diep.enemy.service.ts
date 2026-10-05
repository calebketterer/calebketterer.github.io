import { Injectable } from '@angular/core';
import { Enemy, Player, Bullet, EnemyType, GameSystem } from '../core/diep.interfaces';
import { DiepEnemyLogic } from './diep.enemy-logic';
import { DiepPhysics } from '../core/diep.physics';
import { DiepGameEngineService } from '../engine/diep.game-engine.service';
import { DiepPlayerService } from '../engine/subsystems/player/diep.player.service';

@Injectable({ providedIn: 'root' })
export class DiepEnemyService implements GameSystem {

    constructor(private playerService: DiepPlayerService) {}

    /**
     * Factory method that applies automatic defaults to ANY enemy.
     * Use this to prevent "Missing Property" errors in the future.
     */
    public spawnEnemy(config: Partial<Enemy> & { type: EnemyType }): Enemy {
        const defaults: Partial<Enemy> = {
            id: Math.random().toString(36).substr(2, 9),
            vx: 0, vy: 0,
            mass: 10,
            canDespawn: true,
            isGhost: false,
            isInvulnerable: false,
            isFlying: false,
        };

        const enemy = { ...defaults, ...config } as Enemy;
        
        // Final safety check: if mass wasn't provided, calculate it.
        if (!enemy.mass) {
            enemy.mass = DiepPhysics.calculateMass(enemy.radius, enemy.maxHealth);
        }

        return enemy;
    }

    /**
     * Implementation of GameSystem interface.
     * Manages AI ticks, simulation states, and edge boundary array cleanup.
     */
    public update(engine: DiepGameEngineService, tick: number, ms: number): void {
        if (!engine.isGameStarted || engine.isPaused || engine.gameOver) return;

        const activePlayer = this.playerService.player;

        if (activePlayer.health > 0) {
            if (!engine.isStartingNewGame) {
                this.updateAI(engine.enemies, engine.bullets, activePlayer, ms, engine.width, engine.height);
            } else {
                engine.isStartingNewGame = false;
            }
        }

        engine.enemies = this.cleanup(engine.enemies, engine.width, engine.height);
    }

    public updateAI(enemies: Enemy[], bullets: Bullet[], player: Player, deltaTime: number, width: number, height: number) {
        enemies.forEach(enemy => {
            (enemy as any).allEnemies = enemies;
            enemy.onUpdate?.(enemy, player, deltaTime);
        });
        DiepEnemyLogic.updateAllEnemies(enemies, bullets, player, deltaTime, width, height, performance.now());
    }

    public cleanup(enemies: Enemy[], width: number, height: number): Enemy[] {
        return enemies.filter(e => {
            const isOffScreen = e.x < -150 || e.x > width + 150 || e.y < -150 || e.y > height + 150;
            return !(e.canDespawn && isOffScreen) && e.health > 0;
        });
    }
}