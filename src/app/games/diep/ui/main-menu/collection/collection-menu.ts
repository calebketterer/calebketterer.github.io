// src/app/diep/ui/main-menu/collection/collection-menu.ts
import { DiepButton } from '../../../core/diep.interfaces';
import { DiepButtonRenderer } from '../../buttons/diep.button-renderer';
import { DiepCollectionNavigator } from './header/collection-nav-bar';
import { CollectionHeaderRenderer } from './header/collection-header.renderer';
import { InventoryRenderer } from './inventory.renderer';
import { BlueprintsRenderer } from './blueprint-collection.renderer';
import { CardsRenderer } from './card-collection.renderer';

export class DiepCollectionMenu {
  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    // Process tab inputs and updates before calculations
    DiepCollectionNavigator.handleInput(g); 
    DiepCollectionNavigator.updateTransition();

    const buttons = this.getButtons(g, width, height);

    // 1. Solid Deep Background Fill
    ctx.fillStyle = 'rgba(8, 8, 15, 0.99)';
    ctx.fillRect(0, 0, width, height);

    // 2. Delegate Top Status Row Bar Render
    CollectionHeaderRenderer.render(ctx, g, width, buttons);

    // 3. Draw Tab Navigation Headers
    DiepCollectionNavigator.drawTabs(ctx, width);

    // 4. Render active route module content
    const gridStartY = 135; 
    const currentTab = DiepCollectionNavigator.tabs[DiepCollectionNavigator.activeTabIndex];

    const inv = g.playerService?.player?.inventory;
    if (inv) {
      if (currentTab === 'INVENTORY') {
        InventoryRenderer.render(ctx, g, width, height, gridStartY, buttons);
      } else if (currentTab === 'BLUEPRINTS') {
        BlueprintsRenderer.render(ctx, width, gridStartY);
      } else if (currentTab === 'CARDS') {
        CardsRenderer.render(ctx, width, gridStartY);
      }
    }

    // Solid Black Transition Fade Masks mirroring Quadrivium animations
    if (DiepCollectionNavigator.maskAlpha > 0) {
      ctx.fillStyle = `rgba(8, 8, 15, ${DiepCollectionNavigator.maskAlpha})`;
      ctx.fillRect(0, gridStartY - 10, width, height - gridStartY);
    }

    // Loop and execute standard layout buttons manually
    buttons.forEach(btn => {
      DiepButtonRenderer.draw(ctx, btn, g);
    });
  }

  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    const list: DiepButton[] = [
      {
        id: 'back-to-menu-btn',
        label: 'BACK',
        x: width / 2 - 100, 
        y: height - 80, 
        w: 200, 
        h: 50,
        color: '#e74c3c', 
        borderColor: '#c0392b',
        hoverEffect: 'grow',
        action: () => g.arenaReset.transition.fadeOut(() => g.showingCollection = false)
      },
      ...DiepCollectionNavigator.getButtons(g, width)
    ];

    // Delegate layout interaction areas cleanly
    CollectionHeaderRenderer.addButtons(list, g, width);

    const currentTab = DiepCollectionNavigator.tabs[DiepCollectionNavigator.activeTabIndex];
    if (currentTab === 'INVENTORY') {
      InventoryRenderer.addButtons(list, g, width, height);
    }

    return list;
  }
}