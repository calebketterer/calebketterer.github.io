// src/app/diep/engine/subsystems/arena/arena.reset.ts
import { Injectable } from '@angular/core';
import { TransitionManager } from '../../../ui/diep.transition-manager';
import { DiepTimeManager } from '../../../core/diep.time-manager';
import { DiepWeaponController } from '../player/diep.weapon-controller';
import { DiepGameOverService } from '../diep.game-over.service';

@Injectable({ providedIn: 'root' })
export class DiepArenaResetService {
    public transition = new TransitionManager();

    // Best Practice: Directly inject the exact service we need to manipulate
    constructor(
        private weaponController: DiepWeaponController,
        private gameOverService: DiepGameOverService
    ) {
        this.transition.fadeIn();
    }

    public updateTransition() {
        this.transition.update(DiepTimeManager.uiTick * 16.67);
    }

    public startNewGame(engine: any) {
        this.transition.fadeOut(() => {
            this.resetState(engine, true);
            engine.waveManager.startFirstWave(engine.enemies, engine.width, engine.height);
        });
        engine.startTicker(engine.onRenderCallback);
    }

    public restartGame(engine: any) {
        this.transition.fadeOut(() => {
            this.resetState(engine, true);
            engine.waveManager.startFirstWave(engine.enemies, engine.width, engine.height);
        });
        engine.startTicker(engine.onRenderCallback);
    }

    public exitToMenu(engine: any) {
        this.transition.fadeOut(() => {
            this.resetState(engine, false);
        });
        engine.startTicker(engine.onRenderCallback);
    }

    public resetState(engine: any, startGameImmediately: boolean) {
        const activePlayer = engine.playerService.player;
        if (activePlayer) { 
            engine.persistentXp = activePlayer.progression.totalXpEarned; 
        }
        
        engine.playerService.initializePlayer(engine.currentDifficulty, engine.persistentXp);
        engine.bullets = []; 
        engine.enemies = []; 
        engine.toxicTrails = [];
        engine.score = 0; 
        engine.sessionKills = 0; 
        engine.gameOver = false; 
        engine.isPaused = false;
        engine.lastAngle = 0; 
        engine.isGameStarted = startGameImmediately;
        engine.isStartingNewGame = startGameImmediately;

        // Sync mode variables explicitly so the scene selector router can never desync
        if (startGameImmediately) {
            engine.currentMode = 'ARENA';
        } else {
            engine.currentMode = 'MENU';
        }
        
        engine.waveManager.reset();
        this.weaponController.resetCooldown();
        engine.topScores = engine.highScoresService.getHighScores();
        engine.arenaManager.init(engine.width, engine.height);
        this.gameOverService.reset();
        if (startGameImmediately && engine.diepStatsService) {
            engine.diepStatsService.recordGameStarted();
        }
    }
}