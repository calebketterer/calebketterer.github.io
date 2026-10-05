// src/app/diep/engine/subsystems/diep.game-over.service.ts
import { Injectable } from '@angular/core';
import { Enemy, GameSystem } from '../../core/diep.interfaces';
import { HighScoresService } from '../../core/diep.high-scores.service';
import { DiepPlayerService } from './player/diep.player.service';
import { DiepArenaCleanupAnimationService } from './arena/arena.cleanup-animation.service';

@Injectable({ providedIn: 'root' })
export class DiepGameOverService implements GameSystem {

  constructor(
    private highScoresService: HighScoresService,
    private playerService: DiepPlayerService,
    private cleanupAnimation: DiepArenaCleanupAnimationService
  ) {}

  /**
   * Implementation of GameSystem interface.
   * Runs sequentially to evaluate victory/defeat states without handling graphics layout code.
   */
  public update(engine: any, F: number, ms: number): void {
    if (!engine.isGameStarted || engine.isPaused) return;

    if (engine.gameOver) {
      this.cleanupAnimation.updateAnimation();
      return;
    }

    if (this.playerService.isPlayerDead) {
      this.handleGameOver(engine);
    }
  }

  public handleGameOver(engine: any): void {
    const player = this.playerService.player;
    if (!player) return;

    this.highScoresService.addHighScore(engine.score);
    engine.topScores = this.highScoresService.getHighScores();
    player.health = 0;
    engine.gameOver = true;
    
    this.cleanupAnimation.startAnimation(engine.enemies);
    engine.enemies = [];
  }

  public isAnimationActive(): boolean {
    return this.cleanupAnimation.deathAnimationTimeStart !== null;
  }

  public getAnimationEnemies(currentEnemies: Enemy[]): Enemy[] {
    return this.cleanupAnimation.getVisibleEnemies(currentEnemies);
  }

  public reset(): void {
    this.cleanupAnimation.reset();
  }
}