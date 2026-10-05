import { Achievement } from '../../../core/diep.interfaces';

export class AchievementListSorter {
  public static getSortedAchievements(achievements: Achievement[]): Achievement[] {
    const groups = new Map<string, Achievement[]>();
    
    achievements.forEach(ach => {
      const key = ach.groupId || ach.id;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(ach);
    });

    const activeAchievements: Achievement[] = [];
    groups.forEach((list) => {
      const sortedTiers = list.sort((a, b) => (a.tier || 0) - (b.tier || 0));
      const currentTask = sortedTiers.find(a => !a.isUnlocked) || sortedTiers[sortedTiers.length - 1];
      
      // Store total tiers dynamically for the renderer to use
      (currentTask as any)._totalTiers = sortedTiers.length;
      activeAchievements.push(currentTask);
    });

    return activeAchievements.sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1;
      if (a.isUnlocked && b.isUnlocked) return b.weight - a.weight;

      // Tier-Weighted Progress Sorting (T2 @ 0% > T1 @ 99%)
      const aMasterProg = (a.tier || 1) + (a.currentValue / a.targetValue);
      const bMasterProg = (b.tier || 1) + (b.currentValue / b.targetValue);
      
      if (aMasterProg !== bMasterProg) return bMasterProg - aMasterProg;
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.name.localeCompare(b.name);
    });
  }
}