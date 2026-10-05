// src/app/diep/engine/diep.game-engine.service.ts
import { Injectable } from '@angular/core';
import { Bullet, Enemy, HighScore, TrailSegment, DifficultyMode, GameSystem } from '../core/diep.interfaces';
import { DiepTimeManager } from '../core/diep.time-manager';
import { DiepProjectileService } from './subsystems/diep.projectile.service';
import { DiepCollisionService } from './subsystems/diep.collision.service';
import { DiepPlayerService } from './subsystems/player/diep.player.service';
import { DiepEnemyService } from '../enemies/diep.enemy.service';
import { DiepWaveManagerService } from './subsystems/arena/arena.wave-manager';
import { DiepArenaManager } from './subsystems/arena/arena.manager';
import { DiepFloorDirector } from './subsystems/arena/arena.floor-director.service';
import { DiepGameOverService } from './subsystems/diep.game-over.service';
import { DiepArenaResetService } from './subsystems/arena/arena.reset';
import { DiepPlayerUpgradesService } from './subsystems/player/player-upgrades/diep.player-upgrades.service';
import { AchievementService } from '../core/diep.achievement.service';
import { HighScoresService } from '../core/diep.high-scores.service';
import { EnemySpawnerService } from '../enemies/diep.enemy-spawner';
import { DiepStatsService } from '../core/diep.stats.service';
import { MarketManagerService } from './subsystems/market/market.manager';
import { DiepPixelsService } from '../core/diep.pixels.service';
import { MarketCameraSystem } from './subsystems/market/market-camera.system';
import { SectorsManagerService } from './subsystems/sectors/sectors.manager';
import { SectorsResetService } from './subsystems/sectors/sectors.reset';

@Injectable({ providedIn: 'root' })
export class DiepGameEngineService {
    public width = 800;
    public height = 600;
    public bullets: Bullet[] = [];
    public enemies: Enemy[] = [];
    public toxicTrails: TrailSegment[] = [];
    public keys: { [key: string]: boolean } = {};
    public score = 0;
    public sessionKills = 0; 
    public showingQuadrivium = false;
    public showingAchievements = false;
    public showingCollection = false;
    public gameOver = false;
    public isPaused = false;
    public isDarkMode = true;
    public isStartingNewGame = false;
    public lastAngle = 0;
    public mouseAiming = true;
    public mousePos = { x: 0, y: 0 };
    public mouseDown = false;
    public isGameStarted = false;
    public topScores: HighScore[] = [];

    public currentMode: 'MENU' | 'ARENA' | 'MARKET' | 'SECTORS' = 'MENU';
    public currentDifficulty: DifficultyMode = 'MEDIUM';
    public persistentXp = 0;

    private animationFrameId: number | null = null;
    private lastTime: number = 0;
    public onRenderCallback: () => void = () => {};

    public arenaEnabled = true;
    private systems: GameSystem[] = [];

    constructor(
        public spawner: EnemySpawnerService,
        public highScoresService: HighScoresService,
        public projectileService: DiepProjectileService,
        public playerService: DiepPlayerService,
        public collisionService: DiepCollisionService,
        public enemyService: DiepEnemyService,
        public waveManager: DiepWaveManagerService,
        public achievementService: AchievementService,
        private upgradeService: DiepPlayerUpgradesService,
        public arenaManager: DiepArenaManager,
        public hazardDirector: DiepFloorDirector,
        public arenaReset: DiepArenaResetService,
        public sectorsManager: SectorsManagerService,
        public sectorsReset: SectorsResetService,
        public gameOverService: DiepGameOverService,
        public diepStatsService: DiepStatsService,
        public marketManagerService: MarketManagerService,
        public pixelsService: DiepPixelsService,
        public marketCameraSystem: MarketCameraSystem
    ) {
        this.playerService.initializePlayer(this.currentDifficulty, this.persistentXp);
        this.topScores = this.highScoresService.getHighScores();
        this.arenaManager.init(this.width, this.height);
        this.arenaReset.transition.fadeIn();

        this.systems = [
            this.playerService,
            this.projectileService,
            this.arenaManager,
            this.collisionService,
            this.enemyService,
            this.gameOverService
        ];

        (this as any).diepStatsService = this.diepStatsService;
    }

    public startTicker(renderFn: () => void) {
        this.onRenderCallback = renderFn;
        this.lastTime = performance.now();
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.ticker(this.lastTime);
    }

    private ticker = (time: number) => {
        const isLogicPaused = this.isPaused || (this.gameOver && !this.gameOverService.isAnimationActive());
        DiepTimeManager.update(isLogicPaused, time);

        this.update();
        this.onRenderCallback();

        this.animationFrameId = requestAnimationFrame(this.ticker);
    }

    public update() {
        const F = DiepTimeManager.gameTick;
        this.arenaReset.updateTransition();
        this.sectorsReset.updateTransition();

        if (this.currentMode === 'MARKET') {
            this.marketManagerService.updateMarket(this, F, DiepTimeManager.gameMs);
        } else if (this.currentMode === 'SECTORS') {
            this.sectorsManager.update(this, F, DiepTimeManager.gameMs);
            
            // Run core systems (player, projectiles, collisions, enemies, game over)
            for (const system of this.systems) {
                if (system !== this.arenaManager) { // Exclude standard arena hazard floor manager
                    system.update(this, F, DiepTimeManager.gameMs);
                }
            }

            if (this.isGameStarted && !this.isPaused && !this.gameOver) {
                this.diepStatsService.trackTime(DiepTimeManager.gameMs / 1000);
            }
        } else {
            for (const system of this.systems) {
                system.update(this, F, DiepTimeManager.gameMs);
            }

            if (this.isGameStarted && !this.isPaused && !this.gameOver) {
                this.waveManager.updateWaves(this.enemies, this.width, this.height);
                this.achievementService.updateProgress('WAVE', this.waveManager.waveCount);
                this.diepStatsService.trackTime(DiepTimeManager.gameMs / 1000);
            }
        }
    }

    public togglePause() { 
        if (!this.gameOver && this.isGameStarted) {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) this.startTicker(this.onRenderCallback);
        }
        return this.isPaused; 
    }

    public enterMarketMode(): void {
        this.marketManagerService.transitionToMarket(this);
    }
}