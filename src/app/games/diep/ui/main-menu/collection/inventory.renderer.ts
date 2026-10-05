// src/app/diep/ui/main-menu/collection/inventory-renderer.ts
import { DiepButton } from '../../../core/diep.interfaces';
import { ItemPreviewRenderer } from './preview/collection-preview.renderer';
import { ItemPreviewLayout } from './preview/collection-preview.layout';

export class InventoryRenderer {
  public static selectedIndex: number = 0;
  
  private static lastClickedId: string | null = null;
  private static lastClickTime: number = 0;

  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, height: number, gridStartY: number, buttons: DiepButton[]): void {
    const inv = g.playerService.player.inventory;
    const frame = g.frameCounter || 0;

    const gridStartX = 50;
    const slotSize = 90;
    const gap = 16;
    const columns = 4;

    for (let i = 0; i < inv.maxSlots; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const slotX = gridStartX + col * (slotSize + gap);
      const slotY = gridStartY + row * (slotSize + gap);

      const isOccupied = i < inv.slots.length;
      const isSelected = i === this.selectedIndex;
      const item = isOccupied ? inv.slots[i] : null;
      
      const isEquipped = item ? inv.equippedIds.includes(item.id) : false;

      const slotButton = buttons.find(b => b.id === `slot-${i}`);
      const isHovered = slotButton && g.mouseX >= slotX && g.mouseX <= slotX + slotSize && g.mouseY >= slotY && g.mouseY <= slotY + slotSize;

      if (isSelected) {
        ctx.fillStyle = '#1c2833';
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
      } else if (isEquipped) {
        ctx.fillStyle = '#112211';
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 2.5;
      } else {
        ctx.fillStyle = isHovered ? '#252525' : '#1e1e1e';
        ctx.strokeStyle = isHovered ? '#555555' : '#333333';
        ctx.lineWidth = 2;
      }

      ctx.beginPath();
      ctx.roundRect(slotX, slotY, slotSize, slotSize, 12);
      ctx.fill();
      ctx.stroke();

      if (item) {
        ctx.save();
        item.drawIllustration(ctx, slotX, slotY, slotSize, frame);
        ctx.restore();

        if (item.quantity > 1) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText(`x${item.quantity}`, slotX + slotSize - 10, slotY + slotSize - 10);
        }

        if (isEquipped) {
          ctx.save();
          const badgeSize = 20;
          const badgeX = slotX + slotSize - badgeSize - 6;
          const badgeY = slotY + 6;

          ctx.fillStyle = '#2ecc71';
          ctx.beginPath();
          ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(badgeX + 6, badgeY + 10);
          ctx.lineTo(badgeX + 9, badgeY + 13);
          ctx.lineTo(badgeX + 15, badgeY + 7);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    const panelX = gridStartX + columns * (slotSize + gap) + 20;
    const panelY = gridStartY;
    const panelW = width - panelX - 50;
    const panelH = inv.maxSlots / columns * (slotSize + gap) - gap;

    const selectedItem = this.selectedIndex < inv.slots.length ? inv.slots[this.selectedIndex] : null;

    ItemPreviewRenderer.render(ctx, selectedItem, panelX, panelY, panelW, panelH);
  }

  public static addButtons(list: DiepButton[], g: any, width: number, height: number): void {
    const inv = g.playerService?.player?.inventory;
    const gridStartX = 50;
    const gridStartY = 135;
    const slotSize = 90;
    const gap = 16;
    const columns = 4;
    const maxSlots = inv?.maxSlots || 12;

    for (let i = 0; i < maxSlots; i++) {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const currentButtonId = `slot-${i}`;

      list.push({
        id: currentButtonId,
        label: '',
        x: gridStartX + col * (slotSize + gap),
        y: gridStartY + row * (slotSize + gap),
        w: slotSize,
        h: slotSize,
        color: 'transparent',
        borderColor: 'transparent',
        action: () => {
          if (!inv) return;
          
          const now = Date.now();
          const isDoubleClick = (this.lastClickedId === currentButtonId) && (now - this.lastClickTime < 300);
          
          this.lastClickedId = currentButtonId;
          this.lastClickTime = now;

          this.selectedIndex = i;

          if (isDoubleClick && i < inv.slots.length) {
            const item = inv.slots[i];
            const isEquipped = inv.equippedIds.includes(item.id);

            if (isEquipped) {
              g.playerService.unequipItem(item.id);
            } else if (inv.equippedIds.length < 3) {
              g.playerService.equipItem(item.id);
            }
          }
        }
      });
    }

    if (inv) {
      const panelX = gridStartX + columns * (slotSize + gap) + 20;
      const panelY = gridStartY;
      const panelW = width - panelX - 50;
      const panelH = maxSlots / columns * (slotSize + gap) - gap;
      
      const selectedItem = this.selectedIndex < inv.slots.length ? inv.slots[this.selectedIndex] : null;
      
      ItemPreviewLayout.addPanelButtons(list, selectedItem, panelX, panelY, panelW, panelH, inv, g);
    }
  }
}