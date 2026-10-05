// src/app/diep/ui/main-menu/quadrivium/diep.morphology-sorter.ts
import { EnemyRegistry } from '../../../enemies/enemy.registry';
import { EnemyType } from '../../../core/diep.interfaces';

export class DiepMorphologySorter {
  // Define the Priority of Factions (ROYGBIV)
  private static readonly FACTION_ORDER: Record<string, number> = {
    'Red': 1,
    'Orange': 2,
    'Yellow': 3,
    'Green': 4,
    'Blue': 5,
    'Indigo': 6,
    'Violet': 7,
    'Unknown': 99
  };

  public static sortEnemies(types: EnemyType[]): EnemyType[] {
    return [...types].sort((a, b) => {
      const metaA = EnemyRegistry.getMetadata(a);
      const metaB = EnemyRegistry.getMetadata(b);

      // 1. PRIORITIZE KNOWLEDGE (Completeness)
      // A "Known" enemy has a real name and description (not "Unknown")
      const scoreA = this.getCompletenessScore(metaA);
      const scoreB = this.getCompletenessScore(metaB);

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // Higher score (more known) goes to the top
      }

      // 2. FACTION SORT (ROYGBIV)
      const factionA = metaA.faction || 'Unknown';
      const factionB = metaB.faction || 'Unknown';
      const orderA = this.FACTION_ORDER[factionA] || 99;
      const orderB = this.FACTION_ORDER[factionB] || 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      // 3. ALPHABETICAL (A-Z)
      return metaA.name.localeCompare(metaB.name);
    });
  }

  private static getCompletenessScore(meta: any): number {
    let score = 0;
    if (meta.name && !meta.name.includes('Unknown')) score += 1;
    if (meta.description && !meta.description.includes('Unknown')) score += 1;
    return score;
  }
}