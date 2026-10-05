// src/app/diep/engine/subsystems/market/decor/index.ts
import { StructuralPillar } from './pillar.prop';
import { PowerCrystal } from './crystal.prop';
import { FloorVent } from './vent.prop';
import { MarketTree } from './tree.prop';
import { MarketBush } from './bush.prop';
import { MarketBench } from './bench.prop';

export const REGISTERED_DECOR_BLUEPRINTS = [
  { classRef: StructuralPillar, type: 'PILLAR', weight: 3 },
  { classRef: PowerCrystal, type: 'CRYSTAL', weight: 2 },
  { classRef: FloorVent, type: 'VENT', weight: 1 },
  { classRef: MarketTree, type: 'TREE', weight: 5 },
  { classRef: MarketBush, type: 'BUSH', weight: 6 },
  { classRef: MarketBench, type: 'BENCH', weight: 2 }
];

export * from './decor.interface';