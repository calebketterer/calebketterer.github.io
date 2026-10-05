// src/app/diep/engine/subsystems/market/shops/shop.interface.ts
import { MarketDecorProp } from '../decor/decor.interface';

export interface MarketShopProp extends MarketDecorProp {
  ownerId: string | null;
  /**
   * Applies custom color profiles derived from the assigned vendor entity
   */
  applyVendorColors(base: string, accent: string): void;
}