// src/app/diep/engine/subsystems/diep.collision.service.ts
import { Injectable } from '@angular/core';
import { Player, Bullet, Enemy, GameSystem } from '../../core/diep.interfaces';
import { DiepGameEngineService } from '../diep.game-engine.service';
import { DiepPlayerService } from './player/diep.player.service';
import { DiepStatsService } from '../../core/diep.stats.service';
import { DiepEnvironmentCollisionService } from './arena/arena.environment-collision';
import { DiepCombatResolverService } from './diep.combat-resolver.service';

@Injectable({ providedIn: 'root' })
export class DiepCollisionService implements GameSystem {
    constructor(
        private playerService: DiepPlayerService,
        private diepStatsService: DiepStatsService,
        private envCollisionService: DiepEnvironmentCollisionService,
        private combatResolverService: DiepCombatResolverService
    ) {}

    /**
     * Implementation of GameSystem interface.
     * Automatically handles both entity environmental boundaries and item/player collisions.
     */
    public update(engine: DiepGameEngineService, tick: number, ms: number): void {
        const activePlayer = this.playerService.player;

        // 1. Check entity collisions against environment tiles
        this.envCollisionService.handleEnvironmentCollision(activePlayer);
        engine.enemies.forEach(e => this.envCollisionService.handleEnvironmentCollision(e));
        
        for (let i = engine.bullets.length - 1; i >= 0; i--) {
            if (this.envCollisionService.handleEnvironmentCollision(engine.bullets[i], true)) {
                engine.bullets.splice(i, 1);
            }
        }

        // 2. Run object interaction layers if gameplay is active
        if (!engine.isGameStarted || engine.isPaused || engine.gameOver) return;

        // Skip calculations if player is dead or game state is initializing
        if (activePlayer.health <= 0 || engine.isStartingNewGame) return;

        // Process combat/object colliders and mutate collections directly
        const col = this.handleCollisions(
            engine,
            activePlayer, 
            engine.bullets, 
            engine.enemies, 
            (e: Enemy) => {
                if ((engine as any).upgradeService) {
                    (engine as any).upgradeService.processKillRewards(engine, e, activePlayer);
                }
            }
        );
        engine.bullets = col.bullets;
        engine.enemies = col.enemies;

        // 3. Keep player clamped inside the game simulation viewport canvas boundaries
        this.envCollisionService.clampToCanvas(activePlayer, engine.width, engine.height);
    }

    public handleCollisions(
        engine: DiepGameEngineService,
        player: Player,
        bullets: Bullet[],
        enemies: Enemy[],
        onKillEnemy: (enemy: Enemy) => void
    ) {
        // Lazily bridge wave manager telemetry backplane access via engine instantiation references
        if (engine.waveManager && !(engine.waveManager as any).diepStatsService) {
            (engine.waveManager as any).diepStatsService = this.diepStatsService;
        }

        // Delegate discrete collision layers to specialized combat solver handlers
        this.combatResolverService.handleBulletVsBullet(bullets);
        this.combatResolverService.handleBulletVsEnemy(engine, player, bullets, enemies, onKillEnemy);
        this.combatResolverService.handleBulletVsPlayer(bullets, player);
        this.combatResolverService.handleEnemyVsPlayer(engine, player, enemies, onKillEnemy);
        this.combatResolverService.handleEnemyVsEnemy(enemies);

        return {
            bullets: bullets.filter(b => b.health > 0),
            enemies: enemies.filter(e => e.health > 0 || e.isInvulnerable)
        };
    }
}