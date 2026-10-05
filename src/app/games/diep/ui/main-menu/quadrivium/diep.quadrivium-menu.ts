// src/app/diep/ui/main-menu/quadrivium/diep.quadrivium-menu.ts
import { EnemyRegistry } from '../../../enemies/enemy.registry';
import { DiepMorphologySorter } from './diep.morphology-sorter';
import { DiepMorphologyRenderer } from './diep.morphology-renderer';
import { DiepQuadriviumNavigator } from './diep.quadrivium-nav-bar';
import { DiepTelemetryRenderer } from './diep.telemetry-renderer';
import { DiepRecordsRenderer } from './diep.records-renderer';
import { DiepQuadriviumScroller } from './diep.quadrivium-scroller';
import { DiepQuadriviumFxRenderer } from './diep.quadrivium-fx-renderer';
import { DiepButton } from '../../../core/diep.interfaces';
import { DiepButtonRenderer } from '../../buttons/diep.button-renderer';

export class DiepQuadriviumMenu {
  private static rotation = 0;

  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    DiepQuadriviumNavigator.handleInput(g);
    DiepQuadriviumNavigator.updateTransition();
    this.rotation += 0.015;

    ctx.fillStyle = 'rgba(8, 8, 15, 0.99)';
    ctx.fillRect(0, 0, width, height);

    const currentTab = DiepQuadriviumNavigator.tabs[DiepQuadriviumNavigator.activeTabIndex];
    const rawTypes = EnemyRegistry.getRegisteredTypes();
    const sortedTypes = DiepMorphologySorter.sortEnemies(rawTypes);

    const startY = 80;
    const viewHeight = height - startY; 
    let contentHeight = 0;

    if (currentTab === 'MORPHOLOGY') {
      contentHeight = DiepMorphologyRenderer.getHeight(sortedTypes);
    } else if (currentTab === 'TELEMETRY') {
      contentHeight = DiepTelemetryRenderer.getHeight(); 
    } else if (currentTab === 'RECORDS') {
      contentHeight = DiepRecordsRenderer.getHeight(g);
    }

    const canScroll = contentHeight > viewHeight;
    const displayOffset = DiepQuadriviumScroller.update(g, canScroll, contentHeight);

    // Clip rendering visual view bounding box
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, startY - 10, width, viewHeight + 10);
    ctx.clip();

    const loops = canScroll ? 2 : 1;
    for (let loop = 0; loop < loops; loop++) {
      const currentScrollOffset = displayOffset + (loop * contentHeight);

      if (currentTab === 'MORPHOLOGY') {
        DiepMorphologyRenderer.render(ctx, sortedTypes, width, height, startY, currentScrollOffset, this.rotation);
      } else if (currentTab === 'TELEMETRY') {
        DiepTelemetryRenderer.render(ctx, g, width, currentScrollOffset, startY, height);
      } else if (currentTab === 'RECORDS') {
        DiepRecordsRenderer.render(ctx, g, width, currentScrollOffset, startY, height);
      }
    }

    // --- SOLID BLACK TRANSITION MASK OVERLAY ---
    if (DiepQuadriviumNavigator.maskAlpha > 0) {
      ctx.fillStyle = `rgba(8, 8, 15, ${DiepQuadriviumNavigator.maskAlpha})`;
      ctx.fillRect(0, startY - 10, width, viewHeight + 10);
    }
    
    ctx.restore();

    // Elements outside content layout maintain normal steady opacity visibility profiles
    DiepQuadriviumFxRenderer.drawFades(ctx, width, height, startY, viewHeight);
    DiepQuadriviumFxRenderer.drawHeader(ctx, width);
    DiepQuadriviumNavigator.drawTabs(ctx, width);

    if (canScroll) {
      DiepQuadriviumFxRenderer.drawScrollbar(ctx, width, startY, viewHeight, contentHeight, DiepQuadriviumScroller.scrollY);
    }

    DiepButtonRenderer.drawCollection(ctx, g, this.getButtons(g, width, height));
  }

  public static handleInputDown(mouseY: number): void { DiepQuadriviumScroller.handleInputDown(mouseY); }
  public static handleInputUp(): void { DiepQuadriviumScroller.handleInputUp(); }
  public static handleInputMove(mouseY: number): void { DiepQuadriviumScroller.handleInputMove(mouseY); }

  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    return [
      {
        id: 'back-to-menu-btn',
        label: 'BACK',
        x: width / 2 - 100, y: height - 80, w: 200, h: 50,
        color: '#e74c3c', borderColor: '#c0392b',
        hoverEffect: 'grow',
        action: () => g.arenaReset.transition.fadeOut(() => g.showingQuadrivium = false)
      },
      ...DiepQuadriviumNavigator.getButtons(g, width)
    ];
  }
}