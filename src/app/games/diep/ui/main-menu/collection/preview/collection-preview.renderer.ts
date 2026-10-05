// src/app/diep/ui/main-menu/collection/item-preview.renderer.ts
import { InventoryItem } from '../../../../core/diep.interfaces';
import { ItemTextProcessor } from './item-text-processor';

export class ItemPreviewRenderer {
  // Shared UI Layout Styling Constants
  private static readonly COLOR_BG = '#161616';
  private static readonly COLOR_BORDER = '#2d2d2d';
  private static readonly PADDING_X = 30;

  /**
   * Renders the right-hand inspection details panel for a selected inventory item.
   */
  public static render(
    ctx: CanvasRenderingContext2D,
    selectedItem: InventoryItem | null,
    panelX: number,
    panelY: number,
    panelW: number,
    panelH: number
  ): void {
    // Render Inspection Right-Side Base Overlay Box Container
    ctx.fillStyle = this.COLOR_BG;
    ctx.strokeStyle = this.COLOR_BORDER;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    if (!selectedItem) {
      ctx.fillStyle = '#666666';
      ctx.font = 'italic 15px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Select an item to inspect details.', panelX + panelW / 2, panelY + panelH / 2);
      ctx.textBaseline = 'alphabetic';
      return;
    }

    ctx.textBaseline = 'alphabetic';

    // Render Item Title Header Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(selectedItem.name, panelX + this.PADDING_X, panelY + 50);

    // Render Type Badge Category Tag
    const tagText = selectedItem.type.replace('_', ' ');
    ctx.font = 'bold 11px Inter, sans-serif';
    const tagW = ctx.measureText(tagText).width;

    ctx.fillStyle = '#2980b9';
    ctx.beginPath();
    ctx.roundRect(panelX + this.PADDING_X, panelY + 68, tagW + 16, 22, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(tagText, panelX + this.PADDING_X + 8, panelY + 83);

    // Extract pre-processed structural text definitions
    const { abilityText, flavorText } = ItemTextProcessor.processDescription(selectedItem);
    let textCursorY = panelY + 130;

    // 1. Draw Ability modifier line if extracted
    if (abilityText) {
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 15px Inter, sans-serif';
      
      const heightSpent = this.wrapText(ctx, abilityText, panelX + this.PADDING_X, textCursorY, panelW - 60, 22);
      textCursorY += heightSpent + 16;
    }

    // 2. Draw Flavor lore sub-text block underneath
    if (flavorText) {
      ctx.fillStyle = 'rgba(236, 240, 241, 0.45)';
      ctx.font = 'italic 13px Inter, sans-serif';
      this.wrapText(ctx, flavorText, panelX + this.PADDING_X, textCursorY, panelW - 60, 20);
    }
  }

  /**
   * Draws text wrapped across multiple lines and returns the total vertical height consumed.
   */
  private static wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
    const words = text.split(' ');
    let line = '';
    let linesCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
        linesCount++;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    linesCount++;

    return linesCount * lineHeight;
  }
}