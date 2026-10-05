export interface UpgradePath {
  id: string;
  name: string;
  color: string;
  increments: number | number[]; 
}

export const UPGRADE_REGISTRY: UpgradePath[] = [
  {
    id: 'healthRegen',
    name: 'HEALTH REGEN',
    color: '#FFD180', 
    increments: .25
  },
  {
    id: 'maxHealth',
    name: 'Max Health',
    color: '#F177DD',
    increments: 20
  },
  {
    id: 'bulletDamage',
    name: 'Bullet Damage',
    color: '#E91E63',
    increments: 5
  },
  { 
    id: 'reloadSpeed', 
    name: 'Reload', 
    color: '#9EE573', 
    increments: 1 
  },
  {
    id: 'maxSpeed',
    name: 'Movement Speed',
    color: '#76EEFE',
    increments: [0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2]
  },
];