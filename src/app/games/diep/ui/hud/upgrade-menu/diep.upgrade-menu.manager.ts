import { Player } from '../../../core/diep.interfaces';
import { UPGRADE_REGISTRY } from '../../../engine/subsystems/player/player-upgrades/diep.upgrade-registry';

export class UpgradeMenuManager {
  public static slideX: number = -300;
  public static labelX: number = 0; 
  
  private static visualSpent: Record<string, number> = {};
  private static newPointTimer: number = 0; // The 5s "New Point" lock
  private static hoverExitTimer: number = 0; // The 250ms "Hover" snap-back
  private static lastPoints: number = 0;
  
  // --- TWEAKABLE VARIABLES ---
  private static readonly NEW_POINT_LINGER = 5000; 
  private static readonly HOVER_EXIT_DELAY = 500; 
  private static readonly PARTIAL_X_OFFSET = -205; 
  // ---------------------------

  public static updateSlide(player: Player, menuWidth: number, isHovered: boolean, deltaTime: number): void {
    if (!player || !player.progression) return;

    const points = player.progression.upgradePoints;
    const canStillUpgrade = UPGRADE_REGISTRY.some(path => (player.upgrades[path.id] || 0) < 10);
    const hasPoints = points > 0 && canStillUpgrade;

    // 1. New Point Linger Logic
    // Trigger only when going from 0 -> some points
    if (points > 0 && this.lastPoints === 0) {
      this.newPointTimer = this.NEW_POINT_LINGER;
    }
    this.lastPoints = points;

    if (this.newPointTimer > 0) {
      this.newPointTimer -= deltaTime;
    }

    // 2. Hover Exit Logic
    if (isHovered) {
      this.hoverExitTimer = this.HOVER_EXIT_DELAY;
    } else if (this.hoverExitTimer > 0) {
      this.hoverExitTimer -= deltaTime;
    }

    // 3. Determine Target X
    let targetX: number;

    // Priority 1: Force full visible if the 5s "New Point" timer is active
    // Priority 2: Force full visible if currently hovering OR in the 250ms exit window
    if (this.newPointTimer > 0 || isHovered || this.hoverExitTimer > 0) {
      targetX = 25; 
    } 
    // Priority 3: If we have points but timers expired, go to Docked (Partial)
    else if (hasPoints) {
      targetX = this.PARTIAL_X_OFFSET;
    } 
    // Priority 4: No points or tree full? Hide completely.
    else {
      targetX = -menuWidth - 100;
    }

    // 4. Calculate Label Target (moves to 220 when docked)
    const labelTarget = (targetX <= this.PARTIAL_X_OFFSET) ? 230 : 0;

    // 5. Smooth Lerping
    this.slideX += (targetX - this.slideX) * 0.12;
    this.labelX += (labelTarget - this.labelX) * 0.12;
  }

  public static getVisualSpent(id: string, actual: number): number {
    if (this.visualSpent[id] === undefined) this.visualSpent[id] = actual;
    const diff = actual - this.visualSpent[id];
    this.visualSpent[id] += diff * 0.1;
    return this.visualSpent[id];
  }

  public static getMenuStartY(canvasHeight: number, rowHeight: number, rowSpacing: number): number {
    const totalHeight = UPGRADE_REGISTRY.length * (rowHeight + rowSpacing);
    return canvasHeight - totalHeight - 65;
  }
}