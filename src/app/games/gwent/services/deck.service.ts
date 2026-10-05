import { Injectable } from '@angular/core';
import { GwentCard } from '../interfaces/gwent-card';
import { CARD_DATABASE } from '../data/card-db';

@Injectable({
  providedIn: 'root'
})
export class DeckService {
  
  generateDeck(): GwentCard[] {
    // Start with a deep copy of the database
    let database: GwentCard[] = JSON.parse(JSON.stringify(CARD_DATABASE));
    let deck: GwentCard[] = [];

    // Assign unique IDs to the base cards first
    database.forEach((card, index) => {
      card.id = `${card.id}_${Math.random().toString(36).substr(2, 9)}`;
      deck.push(card);
    });

    // Fill remaining slots with unique generic cards
    while (deck.length < 25) {
      const roll = Math.random();
      let rarity: 'gold' | 'silver' | 'bronze';
      let power: number;

      if (roll > 0.9) {
        rarity = 'gold';
        power = Math.floor(Math.random() * 2) + 9;
      } else if (roll > 0.7) {
        rarity = 'silver';
        power = Math.floor(Math.random() * 2) + 7;
      } else {
        rarity = 'bronze';
        power = Math.floor(Math.random() * 3) + 4;
      }
      
      deck.push({
        id: `gen_${deck.length}_${Math.random().toString(36).substr(2, 9)}`,
        name: `Generic ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`,
        type: 'unit',
        power: power,
        provisions: power,
        artwork: '?',
        faction: 'NU',
        rarity: rarity,
        tags: 'Generic',
        flavorText: 'Frontline soldier.'
      });
    }

    return deck.sort(() => Math.random() - 0.5).slice(0, 25);
  }
}