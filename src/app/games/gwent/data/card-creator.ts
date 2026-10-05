import { GwentCard, CardAbility, FactionType } from '../interfaces/gwent-card';

export function createCard(
  id: string,
  name: string,
  type: 'unit' | 'special' | 'artefact',
  power: number,
  provisions: number,
  artwork: string,
  faction: FactionType,
  rarity: 'gold' | 'silver' | 'bronze',
  ability?: CardAbility,
  tags: string = '',
  flavorText: string = ''
): GwentCard {
  return { id, name, type, power, provisions, artwork, faction, rarity, ability, tags, flavorText };
}