// src/app/diep/ui/main-menu/collection/header/collection-header.renderer.ts
import { DiepButton } from '../../../../core/diep.interfaces';
import { EquippedSlotsRenderer } from './equipped-slots.renderer';
import { DiepPixelCounterRenderer } from '../../../diep.pixel-counter.renderer';

export class CollectionHeaderRenderer {
  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, buttons: DiepButton[]): void {
    if (!g.playerService?.player) {
      g.playerService.initializePlayer();
    }
    const player = g.playerService.player;
    const inv = player.inventory;

    // Synchronize background state arrays using our newly decoupled sub-module
    EquippedSlotsRenderer.syncVisualSlots(inv.equippedIds || []);

    // 1. Title Block Labels
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillStyle = '#3498db';
    ctx.fillText('COLLECTION', 50, 65);

    ctx.font = '500 13px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('Manage your discovered items, body modifications, and upgrade cards', 50, 85);

    // 2. Right-Aligned Balance Box Dimensions using shared Renderer
    const boxW = DiepPixelCounterRenderer.calculateWidth(ctx, g.pixelsService);
    const boxX = width - boxW - 50;
    const boxY = 38;
    
    DiepPixelCounterRenderer.draw(ctx, g.pixelsService, boxX, boxY);

    // 3. Delegate Equipment Sub-Panel Layout cleanly relative to the currency bounding box
    const eqSlotSize = 38; 
    const eqGap = 10;
    const eqStartX = boxX - (eqSlotSize * 3) - (eqGap * 3); 
    const eqStartY = 38;

    EquippedSlotsRenderer.render(ctx, g, eqStartX, eqStartY, eqSlotSize, eqGap, buttons);
  }

  public static addButtons(list: DiepButton[], g: any, width: number): void {
    // Instantiate the temporary context harness BEFORE using it for metric lookups
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    const boxW = DiepPixelCounterRenderer.calculateWidth(ctx, g.pixelsService);
    const boxX = width - boxW - 50;

    const eqSlotSize = 38;
    const eqGap = 10;
    const eqStartX = boxX - (eqSlotSize * 3) - (eqGap * 3);
    const eqStartY = 38;

    // Pipe layout coordinates down directly to populate standard list interaction targets
    EquippedSlotsRenderer.addButtons(list, g, eqStartX, eqStartY, eqSlotSize, eqGap);
  }
}