export type FactionType = 'NU' | 'MO' | 'NR' | 'NG' | 'ST' | 'SY';

export interface CardAbility {
  type: 'deploy' | 'order' | 'passive' | 'none' | string;
  keyword: 'damage' | 'boost' | 'destroy' | 'summon';
  target: 'highest' | 'lowest' | 'manual' | 'all-highest' | 'all-lowest';
  description?: string;
  value?: number;
}

export interface GwentCard {
  id: string;
  name: string;
  type: 'unit' | 'special' | 'artefact';
  power: number;
  provisions: number;
  artwork: string;
  faction: FactionType; // Uses the literal types above
  rarity: 'gold' | 'silver' | 'bronze';
  ability?: CardAbility;
  tags: string;
  flavorText: string;
}