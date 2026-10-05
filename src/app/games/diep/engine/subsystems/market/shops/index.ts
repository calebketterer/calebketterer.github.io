// src/app/diep/engine/subsystems/market/shops/index.ts
import { CounterShop } from './counter.shop';
import { WeaponRackShop } from './weapon-rack.shop';
import { TentShop } from './tent.shop';

export const REGISTERED_SHOP_BLUEPRINTS = [
  { classRef: CounterShop, type: 'COUNTER', weight: 5 }, 
  { classRef: WeaponRackShop, type: 'RACK', weight: 3, maxInstances: 2 }, 
  { classRef: TentShop, type: 'TENT', weight: 3 } 
];

export * from './shop.interface';