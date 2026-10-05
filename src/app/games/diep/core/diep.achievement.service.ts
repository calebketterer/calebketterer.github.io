import { Injectable } from '@angular/core';
import { Achievement } from './diep.interfaces';
import { DiepAchievementToastRenderer } from '../ui/hud/diep.achievement-toast';
import { INITIAL_ACHIEVEMENTS } from './diep.achievement-data';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  public achievements: Achievement[] = [...INITIAL_ACHIEVEMENTS];

  constructor() { 
    this.load(); 
    this.processTierMetadata();
  }

  private processTierMetadata() {
    this.achievements.forEach(ach => {
      const group = this.achievements.filter(a => a.groupId === ach.groupId);
      const previousTiers = group.filter(a => (a.tier || 1) < (ach.tier || 1));
      
      (ach as any).bankedValue = previousTiers.reduce((sum, a) => sum + (a.weight || 0), 0);
      (ach as any)._totalTiers = group.length;
    });
  }

  public checkUpgradeAchievements(playerUpgrades: Record<string, number>) {
    let changed = false;

    // 1. Update individual upgrade line achievements
    this.achievements.forEach(ach => {
      if (ach.type !== 'UPGRADE' || ach.isUnlocked || !ach.upgradeId) return;

      if (playerUpgrades[ach.upgradeId] >= 10) {
        ach.currentValue = 10;
        ach.isUnlocked = true;
        DiepAchievementToastRenderer.add(ach);
        changed = true;
      }
    });

    // 2. Count total maxed lines for aggregate achievements
    const maxedCount = Object.values(playerUpgrades).filter(val => val >= 10).length;

    // 3. Update aggregate progress (like Jack of All Trades or Completionist)
    this.achievements.forEach(ach => {
      if (ach.type === 'UPGRADE' && !ach.upgradeId && !ach.isUnlocked) {
        // ALWAYS update the current value so the UI shows progress (e.g., 3/8)
        if (maxedCount !== ach.currentValue) {
          ach.currentValue = maxedCount;
          changed = true;
        }

        // Check if we just hit the milestone
        if (ach.currentValue >= ach.targetValue) {
          ach.isUnlocked = true;
          DiepAchievementToastRenderer.add(ach);
        }
      }
    });

    if (changed) this.save();
  }

  public incrementKills(enemyType?: string, factionColor?: string, sessionKills?: number) {
    let changed = false;
    this.achievements.forEach(ach => {
      if (ach.type === 'KILL' && !ach.isUnlocked) {
        const typeMatch = !ach.enemyType || ach.enemyType === enemyType;
        const factionMatch = !ach.faction || ach.faction === factionColor;

        if (typeMatch && factionMatch) {
          if (ach.isSingleGame && sessionKills !== undefined) {
             if (sessionKills > ach.currentValue) {
                 ach.currentValue = sessionKills;
                 changed = true;
             }
          } else if (!ach.isSingleGame) {
             ach.currentValue++;
             changed = true;
          }
          if (ach.currentValue >= ach.targetValue) {
            ach.isUnlocked = true;
            DiepAchievementToastRenderer.add(ach);
          }
        }
      }
    });
    if (changed) this.save();
  }

  public updateProgress(type: 'WAVE' | 'KILL' | 'SCORE', value: number) {
    let changed = false;
    this.achievements.forEach(ach => {
      if (ach.type === type && !ach.isUnlocked) {
        if (value > ach.currentValue) {
          ach.currentValue = value;
          changed = true;
          if (ach.currentValue >= ach.targetValue) {
            ach.isUnlocked = true;
            DiepAchievementToastRenderer.add(ach);
          }
        }
      }
    });
    if (changed) this.save();
  }

  private save() {
    const data = this.achievements.map(a => ({ id: a.id, val: a.currentValue, unlocked: a.isUnlocked }));
    localStorage.setItem('diep_achievements', JSON.stringify(data));
  }

  private load() {
    const saved = localStorage.getItem('diep_achievements');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      parsed.forEach((s: any) => {
        const ach = this.achievements.find(a => a.id === s.id);
        if (ach) {
          ach.currentValue = s.val;
          ach.isUnlocked = s.unlocked;
        }
      });
    } catch (e) {}
  }
}