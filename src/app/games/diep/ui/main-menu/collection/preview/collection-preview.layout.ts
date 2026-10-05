// src/app/diep/ui/main-menu/collection/item-preview.layout.ts
import { InventoryItem, DiepButton, PlayerInventory } from '../../../../core/diep.interfaces';

export class ItemPreviewLayout {
  /**
   * Generates and appends interactive context button registrations for the preview panel.
   */
  public static addPanelButtons(
    list: DiepButton[],
    selectedItem: InventoryItem | null,
    panelX: number,
    panelY: number,
    panelW: number,
    panelH: number,
    inv: PlayerInventory,
    g: any
  ): void {
    if (!selectedItem) return;

    const isEquipped = inv.equippedIds.includes(selectedItem.id);
    const slotsFull = inv.equippedIds.length >= 3;

    let btnLabel = isEquipped ? 'UNEQUIP ITEM' : 'EQUIP ITEM';
    let btnColor = isEquipped ? '#c0392b' : '#2ecc71';
    let borderC = isEquipped ? '#a93226' : '#27ae60';
    let isClickable = true;

    if (!isEquipped && slotsFull) {
      btnLabel = 'LOADOUT FULL';
      btnColor = '#2c3e50';
      borderC = '#34495e';
      isClickable = false;
    }

    const btnW = 160;
    const btnH = 40;
    const btnX = panelX + (panelW - btnW) / 2;
    const btnY = panelY + panelH - btnH - 40;

    list.push({
      id: 'preview-equip-toggle-btn',
      label: btnLabel,
      x: btnX,
      y: btnY,
      w: btnW,
      h: btnH,
      color: btnColor,
      borderColor: borderC,
      textColor: '#ffffff',
      hoverEffect: isClickable ? 'grow' : 'none',
      fontSize: 'bold 13px Inter, sans-serif',
      action: () => {
        if (!isClickable || !g.playerService) return;

        if (isEquipped) {
          g.playerService.unequipItem(selectedItem.id);
        } else {
          g.playerService.equipItem(selectedItem.id);
        }
      }
    });
  }
}