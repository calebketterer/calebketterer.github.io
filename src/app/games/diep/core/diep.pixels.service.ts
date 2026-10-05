// src/app/diep/core/diep.pixels.service.ts
import { Injectable, Injector } from '@angular/core';
import { DiepPlayerService } from '../engine/subsystems/player/diep.player.service';

@Injectable({ providedIn: 'root' })
export class DiepPixelsService {
  private readonly PIXELS_KEY = 'diepSpAccountPixels';
  private readonly DEFAULT_STARTER_PIXELS = 100;

  private cachedBalance: number = this.DEFAULT_STARTER_PIXELS;
  private playerServiceCache: DiepPlayerService | null = null;

  constructor(private injector: Injector) {
    this.loadFromStorage();
  }

  /**
   * Lazily resolves the player service dependency on demand.
   * This completely breaks the synchronous constructor DI loop.
   */
  private get playerService(): DiepPlayerService {
    if (!this.playerServiceCache) {
      this.playerServiceCache = this.injector.get(DiepPlayerService);
    }
    return this.playerServiceCache;
  }

  /**
   * Safe getter to grab the player inventory sub-state block.
   */
  private get inventory() {
    return this.playerService.player?.inventory;
  }

  /**
   * Returns the current validated account balance.
   */
  public get balance(): number {
    return this.cachedBalance;
  }

  /**
   * Awards pixels to the account wallet and commits it directly to disk.
   */
  public add(amountOrMin: number, max?: number): number {
    if (amountOrMin <= 0) return 0;

    const amountToAdd = max !== undefined 
      ? Math.floor(Math.random() * (max - amountOrMin + 1)) + amountOrMin 
      : amountOrMin;

    this.cachedBalance += amountToAdd;
    this.saveToStorage();
    this.syncWithActivePlayer();

    return amountToAdd;
  }

  /**
   * Evaluates if the current wallet satisfies a purchase threshold requirement.
   */
  public canAfford(cost: number): boolean {
    return this.balance >= cost;
  }

  /**
   * Deducts a specific amount from the wallet and commits it directly to disk.
   */
  public spend(cost: number): boolean {
    if (cost <= 0 || !this.canAfford(cost)) {
      return false;
    }

    this.cachedBalance -= cost;
    this.saveToStorage();
    this.syncWithActivePlayer();
    return true;
  }

  /**
   * Pulls structural value down from LocalStorage on launch.
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.PIXELS_KEY);
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        this.cachedBalance = !isNaN(parsed) ? parsed : this.DEFAULT_STARTER_PIXELS;
      } else {
        this.cachedBalance = this.DEFAULT_STARTER_PIXELS;
      }
    } catch (e) {
      console.error('Error loading pixel balance from disk:', e);
      this.cachedBalance = this.DEFAULT_STARTER_PIXELS;
    }
  }

  /**
   * Forces state memory mutations into local storage logs.
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.PIXELS_KEY, this.cachedBalance.toString());
    } catch (e) {
      console.error('Error flushing pixel balance to disk:', e);
    }
  }

  /**
   * Ensures the active in-game runtime player object reflects the bank ledger instantly
   */
  private syncWithActivePlayer(): void {
    const inv = this.inventory;
    if (inv) {
      inv.pixels = this.cachedBalance;
    }
  }
}