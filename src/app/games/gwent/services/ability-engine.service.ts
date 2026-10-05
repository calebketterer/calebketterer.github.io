import { Injectable } from '@angular/core';
import { GwentEngineService } from './gwent-engine.service';
import { GwentCard } from '../interfaces/gwent-card';

@Injectable({
  providedIn: 'root'
})
export class AbilityEngineService {

  constructor(private engine: GwentEngineService) {}

  /**
   * Scans the board to see if a manual ability has any valid targets 
   * before we lock the UI into targeting mode.
   */
  hasValidTargets(sourceCard: GwentCard): boolean {
    const ability = sourceCard.ability;
    if (!ability || ability.target !== 'manual') return true;

    if (ability.keyword === 'destroy') {
      const threshold = ability.value || 0;
      const allCards = this.engine.getAllCardsOnBoard();
      
      // Filter for cards on the ENEMY side that meet the power requirement
      return allCards.some(card => {
        const row = this.engine.getCardRow(card.id);
        const isEnemy = this.engine.activePlayer === 1 
          ? row?.startsWith('p2') 
          : row?.startsWith('p1');
        return isEnemy && card.power >= threshold;
      });
    }

    return true; 
  }

  resolve(sourceCard: GwentCard): void {
    const { ability } = sourceCard;
    if (!ability || ability.target === 'manual') return;

    if (ability.keyword === 'destroy' && ability.target === 'all-highest') {
      const allOnBoard = this.engine.getAllCardsOnBoard();
      if (allOnBoard.length === 0) return;
      const maxPower = Math.max(...allOnBoard.map(c => c.power));
      this.engine.removeCardsByPower(maxPower);
    }
  }

  resolveManualTarget(sourceCard: GwentCard, targetCard: GwentCard): boolean {
    const ability = sourceCard.ability;
    if (!ability) return false;

    if (ability.keyword === 'destroy') {
      const threshold = ability.value || 0;
      const targetRow = this.engine.getCardRow(targetCard.id);
      
      if (!targetRow) return false;

      const isEnemy = this.engine.activePlayer === 1 
        ? targetRow.startsWith('p2') 
        : targetRow.startsWith('p1');

      if (isEnemy && targetCard.power >= threshold) {
        this.engine.removeSpecificCard(targetCard);
        return true;
      }
    }

    return false;
  }
}