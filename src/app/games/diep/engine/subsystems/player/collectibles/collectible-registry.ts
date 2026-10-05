// src/app/diep/engine/subsystems/player/collectibles/collectible-registry.ts
import { InventoryItem } from '../../../../core/diep.interfaces';
import { PlasmaThrusterMod } from './mods/plasma-thruster.mod';
import { CycloneBarrelMod } from './mods/cyclone-barrel.mod';
import { HeavyPlatingMod } from './mods/heavy-plating.mod';
import { NanoporousPixelsMod } from './mods/nanoporous-pixels.mod';

export class CollectibleRegistry {
  /**
   * Statically mapped registry blueprint templates dictionary array.
   * As you build new subfolders (blueprints, cards), simply add their standalone exports here.
   */
  private static readonly registryMap: Record<string, InventoryItem> = {
    [PlasmaThrusterMod.id]: PlasmaThrusterMod,
    [CycloneBarrelMod.id]: CycloneBarrelMod,
    [HeavyPlatingMod.id]: HeavyPlatingMod,
    [NanoporousPixelsMod.id]: NanoporousPixelsMod
  };

  /**
   * Spawns a pristine instance of a registered item configuration blueprint.
   * Deep copies primitives while maintaining functional context hooks like drawIllustration.
   */
  public static createItem(id: string): InventoryItem | null {
    const baseline = this.registryMap[id];
    if (!baseline) return null;

    return {
      ...baseline,
      id: baseline.id,
      name: baseline.name,
      description: baseline.description,
      quantity: baseline.quantity,
      maxStack: baseline.maxStack,
      type: baseline.type,
      drawIllustration: baseline.drawIllustration
    };
  }

  /**
   * Utility helper to build default starter playtesting inventories cleanly.
   */
  public static getStarterInventoryList(): InventoryItem[] {
    return Object.keys(this.registryMap)
      .map(id => this.createItem(id)!)
      .filter(Boolean);
  }
}