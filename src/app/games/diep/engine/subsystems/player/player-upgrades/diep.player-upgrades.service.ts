// src/app/diep/engine/subsystems/player-upgrades/diep.player-upgrades.service.ts
import { Injectable } from '@angular/core';
import { Player, PlayerProgression, DifficultyMode, Enemy } from '../../../../core/diep.interfaces';
import { UPGRADE_REGISTRY } from './diep.upgrade-registry';
import { AchievementService } from '../../../../core/diep.achievement.service';
import { DiepStatsService } from '../../../../core/diep.stats.service';

@Injectable({ providedIn: 'root' })
export class DiepPlayerUpgradesService {
  private readonly INITIAL_XP_NEEDED = 100;
  private readonly XP_INCREMENT_PER_LEVEL = 50;

  constructor(
    private achievementService: AchievementService,
    private diepStatsService: DiepStatsService
  ) {}

  /**
   * Processes all progression rewards, scoring, callbacks, and achievement mutations
   * associated with a verified enemy kill.
   */
  public processKillRewards(engine: any, enemy: Enemy, player: Player): void {
    // 1. Accumulate tracking stats directly on the engine instance
    engine.score += enemy.scoreValue;
    engine.sessionKills++;

    // 2. Feed the internal progression metrics safely using the passed player reference
    if (player && player.progression) {
      this.addXp(player.progression, enemy.scoreValue);
    }

    // 3. Trigger individual enemy callbacks (like splitting or exploding)
    enemy.onDeath?.(engine.enemies, engine.spawner, enemy, player);
    enemy.health = 0;

    // 4. Safely broadcast statistics to the achievement systems
    const meta = (enemy as any).metadata || {};
    this.achievementService.incrementKills(enemy.type, meta.faction, engine.sessionKills);
    this.achievementService.updateProgress('SCORE', engine.score);
  }

  public applyUpgrade(player: Player, upgradeId: string): void {
    const spent = player.upgrades[upgradeId] || 0;
    if (player.progression.upgradePoints <= 0 || spent >= 10) return;

    const path = UPGRADE_REGISTRY.find(u => u.id === upgradeId);
    if (!path) return;

    const increment = Array.isArray(path.increments) ? path.increments[spent] : path.increments;
    
    // Perform the mutation
    player.progression.upgradePoints--;
    player.upgrades[upgradeId] = spent + 1;

    switch (upgradeId) {
      case 'maxHealth':
        player.maxHealth += increment;
        player.health += increment;
        break;
      case 'maxSpeed':
        player.maxSpeed += increment;
        break;
      case 'bulletDamage':
        player.bulletDamage += increment;
        break;
      case 'reloadSpeed':
        player.fireRate += increment;
        break;
      case 'healthRegen':
        player.healthRegen += increment;
        break;
    }

    // Log the allocated upgrade attribute point to your profile metrics
    this.diepStatsService.recordUpgradeSpent(1);

    // Check for achievement updates
    this.achievementService.checkUpgradeAchievements(player.upgrades);
  }

  public getDefaultProgression(difficulty: DifficultyMode = 'MEDIUM', carryOverXp: number = 0): PlayerProgression {
    const startingXp = this.calculateCarryOver(difficulty, carryOverXp);
    let state: PlayerProgression = {
      level: 1, currentXp: startingXp, nextLevelXp: this.getXpForLevel(1),
      totalXpEarned: startingXp, upgradePoints: 0, difficulty: difficulty
    };
    while (state.currentXp >= state.nextLevelXp) {
      state.currentXp -= state.nextLevelXp;
      state.level++;
      state.upgradePoints++;
      state.nextLevelXp = this.getXpForLevel(state.level);
    }
    return state;
  }

  public getXpForLevel(level: number): number {
    return this.INITIAL_XP_NEEDED + (level - 1) * this.XP_INCREMENT_PER_LEVEL;
  }

  public addXp(progression: PlayerProgression, amount: number): boolean {
    const multiplier = this.getDifficultyMultiplier(progression.difficulty);
    const actualXp = amount * multiplier;
    progression.currentXp += actualXp;
    progression.totalXpEarned += actualXp;
    let leveledUp = false;
    while (progression.currentXp >= progression.nextLevelXp) {
      this.levelUp(progression);
      leveledUp = true;
    }
    return leveledUp;
  }

  private levelUp(progression: PlayerProgression): void {
    progression.currentXp -= progression.nextLevelXp;
    progression.level++;
    if (progression.level % 2 === 0) {
      progression.upgradePoints++;
    }
    progression.nextLevelXp = this.getXpForLevel(progression.level);
  }

  private getDifficultyMultiplier(mode: DifficultyMode): number {
    switch (mode) {
      case 'EASY': return 0.5; case 'MEDIUM': return 1.0; case 'HARD': return 1.5;
      default: return 1.0;
    }
  }

  private calculateCarryOver(mode: DifficultyMode, xp: number): number {
    switch (mode) {
      case 'EASY': return xp; case 'MEDIUM': return xp * 0.5;
      default: return 0;
    }
  }
}