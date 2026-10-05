import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DiepSettingsManager {
  public static toggleArena(g: any): void {
    if (!g.hazardDirector) return;

    // Toggle the flag inside the service itself
    g.hazardDirector.enabled = !g.hazardDirector.enabled;
    
    // If we turned it off, clear existing objects so they fade out
    if (!g.hazardDirector.enabled && g.arenaManager) {
      g.arenaManager.clearAll();
    }
    
    console.log(`Hazard Director Enabled: ${g.hazardDirector.enabled}`);
  }

  public static getArenaLabel(g: any): string {
    const isEnabled = g.hazardDirector?.enabled !== false;
    return `ARENA: ${isEnabled ? 'DYNAMIC' : 'STATIC'}`;
  }
}