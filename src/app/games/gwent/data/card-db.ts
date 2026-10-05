import { GwentCard } from '../interfaces/gwent-card';

// Import Faction Databases
import { NU_CARD_DATABASE } from './NU-db';
import { MO_CARD_DATABASE } from './MO-db';

/**
 * MASTER CARD DATABASE
 * This combines all faction-specific files into one unified list.
 */
export const CARD_DATABASE: GwentCard[] = [
  ...NU_CARD_DATABASE,
  ...MO_CARD_DATABASE,
];

/**
 * Helper to get a fresh copy of the database for deck building or starting a new game.
 */
export function getFullDatabase(): GwentCard[] {
  return JSON.parse(JSON.stringify(CARD_DATABASE));
}