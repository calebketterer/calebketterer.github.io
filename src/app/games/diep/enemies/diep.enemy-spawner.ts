import { Injectable } from '@angular/core';
import { Enemy, EnemyType, EnemySpawnWeight } from '../core/diep.interfaces';
import { EnemyRegistry } from './enemy.registry';

const ENEMY_SPAWN_WEIGHTS: EnemySpawnWeight[] = [
    { type: 'ROLLER', weight: 0.25 },
    { type: 'SNIPER', weight: 0.05 },
    { type: 'SMASHER', weight: 0.05 },
    { type: 'CRASHER', weight: 0.05 },
    { type: 'MOTHER', weight: 0.05 },
    /* { type: 'BLOATER', weight: 0.05 }, */
    { type: 'GUNNER', weight: 0.05 },
    { type: 'HEALER', weight: 0.05 },
    { type: 'HAUNTER', weight: 0.05 },
    { type: 'BOMBER', weight: 0.05 },
    { type: 'BLASTER', weight: 0.05 },
    { type: 'CASTER', weight: 0.05 },
    { type: 'FLOATER', weight: 0.05 },
    { type: 'MEDIC', weight: 0.05 },
    { type: 'DETONATOR', weight: 0.05 },
    { type: 'DIGGER', weight: 0.05 },
    { type: 'POLLUTER', weight: 0.05 },
];

@Injectable({
    providedIn: 'root'
})
export class EnemySpawnerService {

    public spawnSingleEnemy(
        enemies: Enemy[],
        canvasWidth: number,
        canvasHeight: number,
        spawnPadding: number
    ): void {
        let type: EnemyType = 'ROLLER';

        const totalWeight = ENEMY_SPAWN_WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
        let randomRoll = Math.random() * totalWeight;

        for (const item of ENEMY_SPAWN_WEIGHTS) {
            if (randomRoll < item.weight) {
                type = item.type;
                break;
            }
            randomRoll -= item.weight;
        }

        const { x, y } = this.calculateSpawnPosition(canvasWidth, canvasHeight, spawnPadding);

        if (type === 'CRASHER') {
            const swarmSize = Math.floor(Math.random() * 4) + 3;
            for (let i = 0; i < swarmSize; i++) {
                const jitterX = (Math.random() - 0.5) * 40;
                const jitterY = (Math.random() - 0.5) * 40;
                this.finalizeEnemySpawn('CRASHER', x + jitterX, y + jitterY, enemies, canvasWidth, canvasHeight);
            }
        } else {
            this.finalizeEnemySpawn(type, x, y, enemies, canvasWidth, canvasHeight);
        }
    }

    private finalizeEnemySpawn(type: EnemyType, x: number, y: number, enemies: Enemy[], w: number, h: number): void {
        const enemy = EnemyRegistry.createEnemy(type, x, y);
        (enemy as any).metadata = EnemyRegistry.getMetadata(type);
        if (enemy.onSpawn) enemy.onSpawn(enemy, w, h);
        enemies.push(enemy as Enemy);
    }

    private calculateSpawnPosition(width: number, height: number, padding: number): { x: number, y: number } {
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: return { x: Math.random() * width, y: -padding };
            case 1: return { x: width + padding, y: Math.random() * height };
            case 2: return { x: Math.random() * width, y: height + padding };
            case 3: default: return { x: -padding, y: Math.random() * height };
        }
    }

    public spawnEnemies(
        enemies: Enemy[],
        count: number,
        _currentWave: number,
        canvasWidth: number,
        canvasHeight: number
    ): void {
        const spawnPadding = 50;
        for (let i = 0; i < count; i++) {
            this.spawnSingleEnemy(enemies, canvasWidth, canvasHeight, spawnPadding);
        }
    }
}