// src/app/diep/engine/subsystems/diep.combat-resolver.service.ts
import { Injectable } from '@angular/core';
import { Player, Bullet, Enemy } from '../../core/diep.interfaces';
import { EnemySpawnerService } from '../../enemies/diep.enemy-spawner';
import { DiepGameEngineService } from '../diep.game-engine.service';
import { DiepStatsService } from '../../core/diep.stats.service';

@Injectable({ providedIn: 'root' })
export class DiepCombatResolverService {
    constructor(
        private spawner: EnemySpawnerService,
        private diepStatsService: DiepStatsService
    ) {}

    public handleBulletVsEnemy(
        engine: DiepGameEngineService,
        player: Player,
        bullets: Bullet[],
        enemies: Enemy[],
        onKillEnemy: (enemy: Enemy) => void
    ): void {
        bullets.forEach(bullet => {
            if (bullet.ownerType !== 'PLAYER' || bullet.health <= 0) return;
            enemies.forEach(enemy => {
                if (enemy.isGhost || enemy.health <= 0 || bullet.health <= 0) return;
                
                const dist = this.getDist(bullet, enemy);
                const combinedRadius = bullet.radius + enemy.radius;

                if (dist < combinedRadius) {
                    this.resolveHealthTrade(bullet, enemy, true);
                    this.diepStatsService.recordShotHit();

                    if (enemy.onHit) enemy.onHit(enemies, this.spawner, bullet);
                    if (enemy.health <= 0) {
                        if (enemy.onDeath) enemy.onDeath(enemies, this.spawner, enemy, player);
                        
                        engine.sessionKills++;
                        this.diepStatsService.recordKill(enemy.type, enemy, engine.sessionKills);
                        onKillEnemy(enemy);
                    }
                    
                    const angle = Math.atan2(bullet.y - enemy.y, bullet.x - enemy.x);
                    const overlap = combinedRadius - dist;
                    bullet.dx += Math.cos(angle) * overlap * 0.3; 
                    bullet.dy += Math.sin(angle) * overlap * 0.3;
                    enemy.vx -= Math.cos(angle) * overlap * 0.05; 
                    enemy.vy -= Math.sin(angle) * overlap * 0.05;
                }
            });
        });
    }

    public handleBulletVsPlayer(bullets: Bullet[], player: Player): void {
        bullets.forEach(bullet => {
            if (bullet.ownerType !== 'ENEMY' || bullet.health <= 0) return;
            const dist = this.getDist(bullet, player);
            if (dist < bullet.radius + player.radius) {
                this.resolveHealthTrade(bullet, player, false);
                player.vx += bullet.dx * 0.01;
                player.vy += bullet.dy * 0.01;
            }
        });
    }

    public handleEnemyVsPlayer(
        engine: DiepGameEngineService,
        player: Player,
        enemies: Enemy[],
        onKillEnemy: (enemy: Enemy) => void
    ): void {
        enemies.forEach(enemy => {
            if (enemy.isGhost || enemy.health <= 0) return;
            const dist = this.getDist(player, enemy);
            const combinedRadius = enemy.radius + player.radius;
            if (dist < combinedRadius) {
                this.resolveHealthTrade(player, enemy, true);
                if (enemy.health <= 0 && !enemy.isInvulnerable) {
                    if (enemy.onDeath) enemy.onDeath(enemies, this.spawner, enemy, player);
                    
                    engine.sessionKills++;
                    this.diepStatsService.recordKill(enemy.type, enemy.color || '', engine.sessionKills);
                    onKillEnemy(enemy);
                }
                this.applyOverlapPush(player, enemy, dist, combinedRadius, 0.4);
            }
        });
    }

    public handleEnemyVsEnemy(enemies: Enemy[]): void {
        for (let i = 0; i < enemies.length; i++) {
            for (let j = i + 1; j < enemies.length; j++) {
                const e1 = enemies[i]; 
                const e2 = enemies[j];
                if (e1.health <= 0 || e2.health <= 0 || e1.isGhost || e2.isGhost) continue;
                const dist = this.getDist(e1, e2);
                const combinedRadius = e1.radius + e2.radius;
                if (dist < combinedRadius) {
                    this.applyOverlapPush(e1, e2, dist, combinedRadius, 0.25);
                }
            }
        }
    }

    public handleBulletVsBullet(bullets: Bullet[]): void {
        for (let i = 0; i < bullets.length; i++) {
            for (let j = i + 1; j < bullets.length; j++) {
                const b1 = bullets[i]; 
                const b2 = bullets[j];
                if (b1.ownerType === b2.ownerType || b1.health <= 0 || b2.health <= 0) continue;
                if (this.getDist(b1, b2) < b1.radius + b2.radius) {
                    this.resolveHealthTrade(b1, b2, false);
                }
            }
        }
    }

    public applyOverlapPush(a: any, b: any, dist: number, combinedRadius: number, strength: number): void {
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        const overlap = combinedRadius - dist;
        const weightA = b.radius / (a.radius + b.radius);
        const weightB = a.radius / (a.radius + b.radius);
        a.vx -= Math.cos(angle) * overlap * strength * weightA;
        a.vy -= Math.sin(angle) * overlap * strength * weightA;
        b.vx += Math.cos(angle) * overlap * strength * weightB;
        b.vy += Math.sin(angle) * overlap * strength * weightB;
    }

    public resolveHealthTrade(a: any, b: any, isPlayerSource: boolean = false): void {
        const dmgToA = (b.damage || b.bodyDamage || 15);
        const dmgToB = (a.damage || a.bodyDamage || 15);
        
        if (isPlayerSource && !b.isInvulnerable) {
            const actualDamageApplied = Math.min(b.health, dmgToB);
            if (actualDamageApplied > 0) {
                this.diepStatsService.recordDamageDealt(actualDamageApplied);
            }
        }

        a.health -= dmgToA;
        if (!b.isInvulnerable) b.health -= dmgToB;
    }

    private getDist(obj1: any, obj2: any): number {
        return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
    }
}