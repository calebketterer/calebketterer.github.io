// src/app/diep/core/diep.stats.service.ts
import { Injectable, inject } from '@angular/core';
import { AchievementService } from './diep.achievement.service';

export interface LifetimeStats {
  playtime: number;       // Accumulates total seconds elapsed cleanly
  totalKills: number;     // Total shapes/entities destroyed
  shotsFired: number;     
  shotsHit: number;
  upgradesSpent: number;
  gamesPlayed: number;       // Tracks total game loops initiated
  wavesConquered: number;    // Running total of waves completed across all games
  damageDealt: number;       // Running total of damage inflicted across all runs
  factionKills: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class DiepStatsService {
  private readonly STORAGE_KEY = 'diep_stats_telemetry';
  private achievementService = inject(AchievementService);
  
  public stats: LifetimeStats = {
    playtime: 0,
    totalKills: 0,
    shotsFired: 0,
    shotsHit: 0,
    upgradesSpent: 0,
    gamesPlayed: 0,
    wavesConquered: 0,
    damageDealt: 0,
    factionKills: { 'Red': 0, 'Orange': 0, 'Yellow': 0, 'Green': 0, 'Blue': 0, 'Purple': 0 }
  };

  constructor() {
    this.load();
  }

  /**
   * Tracks game loop execution time converted precisely to seconds.
   */
  public trackTime(seconds: number): void {
    if (seconds > 0 && !isNaN(seconds)) {
      this.stats.playtime += seconds;
      this.save();
    }
  }

  /**
   * Logs an entity breakdown event, syncs faction matrices, and updates achievements.
   */
  public recordKill(enemyType: string, enemyRaw: any, sessionKills: number): void {
    this.stats.totalKills++;
    
    // Resolve faction name safely regardless of structure or hex values
    const faction = this.resolveFactionName(enemyRaw);
    if (faction && this.stats.factionKills[faction] !== undefined) {
      this.stats.factionKills[faction]++;
    }

    this.save();

    // Push updates downstream to achievements
    this.achievementService.incrementKills(enemyType, faction, sessionKills);
    this.achievementService.updateProgress('KILL', this.stats.totalKills);
  }

  /**
   * Helper matrix to normalize colors, metadata objects, and hex keys to key titles
   */
  private resolveFactionName(enemy: any): string {
    if (!enemy) return '';

    // 1. Extract raw token strings from metadata properties or base options
    let token = '';
    if (enemy.metadata && typeof enemy.metadata.faction === 'string') {
      token = enemy.metadata.faction;
    } else if (typeof enemy.faction === 'string') {
      token = enemy.faction;
    } else if (typeof enemy.color === 'string') {
      token = enemy.color;
    } else if (typeof enemy === 'string') {
      token = enemy;
    }

    token = token.trim().toLowerCase();

    // 2. Direct conversion mapping for hex color definitions or naming variants
    if (token === 'red' || token === '#e74c3c' || token === '#ff4757') return 'Red';
    if (token === 'orange' || token === '#e67e22' || token === '#ffa502') return 'Orange';
    if (token === 'yellow' || token === '#f1c40f' || token === '#eccc68') return 'Yellow';
    if (token === 'green' || token === '#2ecc71' || token === '#2ed573') return 'Green';
    if (token === 'blue' || token === '#3498db' || token === '#1e90ff') return 'Blue';
    if (token === 'purple' || token === '#9b59b6' || token === '#6c5ce7') return 'Purple';

    // 3. Fallback capitalization transformation
    return token.charAt(0).toUpperCase() + token.slice(1);
  }

  public recordShotFired(): void {
    this.stats.shotsFired++;
    this.save();
  }

  public recordShotHit(): void {
    this.stats.shotsHit++;
    this.save();
  }

  public recordUpgradeSpent(count: number = 1): void {
    this.stats.upgradesSpent += count;
    this.save();
  }

  /**
   * Increments the total count of matches or runs initialized.
   */
  public recordGameStarted(): void {
    this.stats.gamesPlayed++;
    this.save();
  }

  /**
   * Accumulates waves successfully completed over time.
   */
  public recordWaveConquered(count: number = 1): void {
    if (count > 0 && !isNaN(count)) {
      this.stats.wavesConquered += count;
      this.save();
    }
  }

  /**
   * Tallies the total amount of numeric damage dealt.
   */
  public recordDamageDealt(amount: number): void {
    if (amount > 0 && !isNaN(amount)) {
      this.stats.damageDealt += amount;
      this.save();
    }
  }

  private save(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stats));
  }

  private load(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      this.stats = { ...this.stats, ...parsed };
    } catch (e) {
      console.error('Error hydrating telemetry payload:', e);
    }
  }
}