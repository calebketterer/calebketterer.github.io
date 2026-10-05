// src/app/diep/engine/subsystems/arena/arena.wave-manager.ts
import { Injectable } from '@angular/core';
import { Enemy } from '../../../core/diep.interfaces';
import { EnemySpawnerService } from '../../../enemies/diep.enemy-spawner';
import { DiepPixelsService } from '../../../core/diep.pixels.service';

@Injectable({
    providedIn: 'root'
})
export class DiepWaveManagerService {
    public waveCount = 1;
    public enemySpawnCount = 5;
    public isRegularWaveActive = false;

    // Direct reference hook filled by modern DI context or engine pipelines dynamically if needed
    private diepStatsService: any = null;

    constructor(
        private spawner: EnemySpawnerService,
        private pixelsService: DiepPixelsService
    ) {}

    /**
     * Resets wave progression for a new game session.
     */
    public reset() {
        this.waveCount = 1;
        this.enemySpawnCount = 5;
        this.isRegularWaveActive = false;
    }

    /**
     * Checks the current enemy list and determines if a new wave needs to be triggered.
     */
    public updateWaves(enemies: Enemy[], width: number, height: number) {
        const hasRegularEnemies = enemies.some(e => e.color === '#e74c3c');
        const combatEnemies = enemies.filter(e => !e.isPassive);

        // Logic for triggering the next wave
        if (combatEnemies.length === 0) {
            this.prepareNextWave();
            this.spawner.spawnEnemies(enemies, this.enemySpawnCount, this.waveCount, width, height);
        } else if (this.isRegularWaveActive && !hasRegularEnemies) {
            this.prepareNextWave();
            this.spawner.spawnEnemies(enemies, this.enemySpawnCount, this.waveCount, width, height);
        }
    }

    private prepareNextWave() {
        // Calculate and award wave reward (10 pixels * completed wave number)
        // Run this before tracking adjustments increment this.waveCount
        const rewardAmount = 10 * this.waveCount;
        const dropped = this.pixelsService.add(rewardAmount);
        console.log(`Earned +${dropped} Pixels!`);

        // Log that a wave has been completed successfully before changing configuration values
        if (this.diepStatsService) {
            this.diepStatsService.recordWaveConquered(1);
        }

        this.enemySpawnCount++;
        this.waveCount++;
        this.isRegularWaveActive = false;
    }

    /**
     * Helper to initiate the very first wave.
     */
    public startFirstWave(enemies: Enemy[], width: number, height: number) {
        this.isRegularWaveActive = false;
        this.spawner.spawnEnemies(enemies, this.enemySpawnCount, this.waveCount, width, height);
    }
}