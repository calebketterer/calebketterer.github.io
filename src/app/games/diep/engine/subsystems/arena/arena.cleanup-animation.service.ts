// src/app/diep/engine/subsystems/arena/arena.cleanup-animation.service.ts
import { Injectable } from '@angular/core';
import { Enemy } from '../../../core/diep.interfaces';

@Injectable({ providedIn: 'root' })
export class DiepArenaCleanupAnimationService {
  public deathAnimationTimeStart: number | null = null;
  public enemiesRemainingForAnimation: Enemy[] = [];

  /**
   * Starts the sequential screen-wipe countdown timer with an immutable snapshot copy of enemies.
   */
  public startAnimation(currentEnemies: Enemy[]): void {
    this.deathAnimationTimeStart = Date.now();
    this.enemiesRemainingForAnimation = [...currentEnemies];
  }

  public updateAnimation(): void {
    if (!this.deathAnimationTimeStart) return;
    
    if (Date.now() - this.deathAnimationTimeStart >= 1000) {
      this.enemiesRemainingForAnimation = [];
      this.deathAnimationTimeStart = null;
    }
  }

  /**
   * Slices the active visibility array based on time elapsed to make enemies vanish sequentially.
   */
  public getVisibleEnemies(currentEnemies: Enemy[]): Enemy[] {
    if (this.deathAnimationTimeStart !== null) {
      const timeElapsed = Date.now() - this.deathAnimationTimeStart;
      const enemiesToDisappear = Math.floor(
        (timeElapsed / 1000) * this.enemiesRemainingForAnimation.length
      );
      return this.enemiesRemainingForAnimation.slice(enemiesToDisappear);
    }
    return currentEnemies;
  }

  public reset(): void {
    this.deathAnimationTimeStart = null;
    this.enemiesRemainingForAnimation = [];
  }
}