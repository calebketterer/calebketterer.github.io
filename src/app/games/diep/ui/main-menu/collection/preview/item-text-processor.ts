// src/app/diep/ui/main-menu/collection/item-text-processor.ts
import { InventoryItem } from '../../../../core/diep.interfaces';

export interface ProcessedItemText {
  abilityText: string;
  flavorText: string;
}

export class ItemTextProcessor {
  /**
   * Separates an item's description into gameplay mechanics and flavor lore text.
   */
  public static processDescription(item: InventoryItem): ProcessedItemText {
    let abilityText = '';
    let flavorText = item.description;

    const sentences = item.description.split(/(?<=\.)\s+/);
    const abilityIndex = sentences.findIndex((s: string) => 
      s.toLowerCase().includes('%') || 
      s.toLowerCase().includes('equipped') || 
      s.toLowerCase().includes('doubles')
    );

    if (abilityIndex !== -1) {
      abilityText = sentences[abilityIndex];
      flavorText = sentences.filter((_, idx) => idx !== abilityIndex).join(' ');
    }

    return { abilityText, flavorText };
  }
}