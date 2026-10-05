// src/app/diep/engine/subsystems/sectors/sectors.reset.ts
import { Injectable } from '@angular/core';
import { TransitionManager } from '../../../ui/diep.transition-manager';
import { DiepTimeManager } from '../../../core/diep.time-manager';
import { DiepWeaponController } from '../player/diep.weapon-controller';
import { DiepGameOverService } from '../diep.game-over.service';
import { SectorsManagerService } from './sectors.manager';

@Injectable({ providedIn: 'root' })
export class SectorsResetService {
  public transition = new TransitionManager();

  constructor(
    private weaponController: DiepWeaponController,
    private gameOverService: DiepGameOverService,
    private sectorsManager: SectorsManagerService
  ) {
    this.transition.fadeIn();
  }

  public updateTransition(): void {
    this.transition.update(DiepTimeManager.uiTick * 16.67);
  }

  public startNewGame(engine: any): void {
    this.transition.fadeOut(() => {
      this.resetState(engine, true);
    });
    engine.startTicker(engine.onRenderCallback);
  }

  public resetState(engine: any, startGameImmediately: boolean): void {
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

    if (startGameImmediately) {
      engine.currentMode = 'SECTORS';
      this.sectorsManager.init(engine.width, engine.height);
    } else {
      engine.currentMode = 'MENU';
    }
    
    this.weaponController.resetCooldown();
    engine.topScores = engine.highScoresService.getHighScores();
    this.gameOverService.reset();
  }
}