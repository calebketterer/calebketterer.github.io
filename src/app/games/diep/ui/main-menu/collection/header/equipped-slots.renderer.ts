// src/app/diep/ui/main-menu/collection/equipped-slots-renderer.ts
import { DiepButton } from '../../../../core/diep.interfaces';
import { InventoryRenderer } from '../inventory.renderer';

export class EquippedSlotsRenderer {
  private static lastClickedId: string | null = null;
  private static lastClickTime: number = 0;
  
  // Persistent tracking array to lock visual positions (0, 1, 2)
  private static visualSlots: (string | null)[] = [null, null, null];

  /**
   * Synchronizes our stable visual slots with the backend service state without collapsing positions.
   */
  public static syncVisualSlots(equippedIds: string[]): void {
    for (let i = 0; i < this.visualSlots.length; i++) {
      const id = this.visualSlots[i];
      if (id && !equippedIds.includes(id)) {
        this.visualSlots[i] = null;
      }
    }

    for (const id of equippedIds) {
      if (!this.visualSlots.includes(id)) {
        const emptyIndex = this.visualSlots.indexOf(null);
        if (emptyIndex !== -1) {
          this.visualSlots[emptyIndex] = id;
        }
      }
    }
  }

  /**
   * Renders the modular sub-panel of fixed equipment grid boxes.
   */
  public static render(ctx: CanvasRenderingContext2D, g: any, startX: number, startY: number, slotSize: number, gap: number, buttons: DiepButton[]): void {
    const inv = g.playerService.player.inventory;
    const frame = g.frameCounter || 0;

    ctx.font = '900 11px Inter, sans-serif';
    ctx.fillStyle = '#3498db';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText('EQUIPPED', startX - 12, startY + slotSize / 2);
    ctx.textBaseline = 'alphabetic'; 

    for (let e = 0; e < 3; e++) {
      const sx = startX + e * (slotSize + gap);
      
      const slotButton = buttons.find(b => b.id === `equipped-slot-${e}`);
      const isEqHovered = slotButton && g.mouseX >= sx && g.mouseX <= sx + slotSize && g.mouseY >= startY && g.mouseY <= startY + slotSize;

      ctx.fillStyle = isEqHovered ? '#1c2833' : '#141419';
      ctx.strokeStyle = isEqHovered ? '#3498db' : '#2c3e50';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.roundRect(sx, startY, slotSize, slotSize, 6);
      ctx.fill();
      ctx.stroke();

      const itemId = this.visualSlots[e];
      if (itemId) {
        const item = inv.slots.find((s: any) => s.id === itemId);
        if (item) {
          ctx.save();
          item.drawIllustration(ctx, sx, startY, slotSize, frame);
          ctx.restore();
        }
      }
    }
  }

  /**
   * Generates interactive bindings for the isolated loadout boxes.
   */
  public static addButtons(list: DiepButton[], g: any, startX: number, startY: number, slotSize: number, gap: number): void {
    const inv = g.playerService?.player?.inventory;
    if (!inv) return;

    for (let e = 0; e < 3; e++) {
      const currentButtonId = `equipped-slot-${e}`;

      list.push({
        id: currentButtonId,
        label: '',
        x: startX + e * (slotSize + gap),
        y: startY,
        w: slotSize,
        h: slotSize,
        color: 'transparent',
        borderColor: 'transparent',
        action: () => {
          const itemId = this.visualSlots[e];
          if (!itemId) return;
          
          const now = Date.now();
          const isDoubleClick = (this.lastClickedId === currentButtonId) && (now - this.lastClickTime < 300);
          
          this.lastClickedId = currentButtonId;
          this.lastClickTime = now;

          if (isDoubleClick) {
            g.playerService.unequipItem(itemId);
            this.visualSlots[e] = null;
          } else {
            const inventoryIndex = inv.slots.findIndex((s: any) => s.id === itemId);
            if (inventoryIndex !== -1) {
              InventoryRenderer.selectedIndex = inventoryIndex;
            }
          }
        }
      });
    }
  }
}