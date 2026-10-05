// src/app/diep/ui/main-menu/collection/collection-nav-bar.ts
import { DiepButton } from '../../../../core/diep.interfaces';

export class DiepCollectionNavigator {
  public static tabs = ['INVENTORY', 'BLUEPRINTS', 'CARDS'];
  public static activeTabIndex = 0;

  private static tabSpacing = 140;
  private static tabY = 110;

  // Transition parameters following your exact Quadrivium timing mechanics
  public static isTransitioning = false;
  public static maskAlpha = 0; 
  
  private static transitionTime = 0; 
  private static duration = 12; 
  private static pendingTabIndex = 0;

  public static drawTabs(ctx: CanvasRenderingContext2D, width: number): void {
    const startX = 50 + 40; 
    
    ctx.textAlign = 'center';
    ctx.font = '900 12px Inter, sans-serif';

    this.tabs.forEach((tab, i) => {
      const x = startX + (i * this.tabSpacing);
      const isActive = i === this.activeTabIndex;

      if (isActive) {
        ctx.fillStyle = '#3498db'; 
        ctx.fillRect(x - 35, this.tabY + 12, 70, 3);
      }
      
      ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.3)';
      ctx.fillText(tab, x, this.tabY);
    });
  }

  public static getButtons(g: any, width: number): DiepButton[] {
    const startX = 50 + 40;

    return this.tabs.map((tab, i) => ({
      id: `collection-tab-${tab}`,
      label: '', 
      x: startX + (i * this.tabSpacing) - 55,
      y: this.tabY - 20,
      w: 110,
      h: 35,
      color: 'transparent',
      borderColor: 'transparent',
      action: () => { this.triggerTabTransition(i); }
    }));
  }

  public static handleInput(g: any): void {
    if (this.isTransitioning) return;

    if (g.keys['d'] || g.keys['D'] || g.keys['arrowright']) {
      g.keys['d'] = g.keys['D'] = g.keys['arrowright'] = false;
      this.triggerTabTransition((this.activeTabIndex + 1) % this.tabs.length);
    }
    if (g.keys['a'] || g.keys['A'] || g.keys['arrowleft']) {
      g.keys['a'] = g.keys['A'] = g.keys['arrowleft'] = false;
      this.triggerTabTransition((this.activeTabIndex - 1 + this.tabs.length) % this.tabs.length);
    }
  }

  public static triggerTabTransition(targetIndex: number): void {
    if (targetIndex === this.activeTabIndex || this.isTransitioning) return;
    this.pendingTabIndex = targetIndex;
    this.isTransitioning = true;
    this.transitionTime = 0;
    this.maskAlpha = 0;
  }

  public static updateTransition(): void {
    if (!this.isTransitioning) {
      this.maskAlpha = 0;
      return;
    }

    this.transitionTime++;
    const progress = this.transitionTime / this.duration;

    this.maskAlpha = 0.5 * (1 - Math.cos(progress * Math.PI * 2));

    if (this.transitionTime === Math.floor(this.duration / 2)) {
      this.activeTabIndex = this.pendingTabIndex;
    }

    if (this.transitionTime >= this.duration) {
      this.isTransitioning = false;
      this.maskAlpha = 0;
    }
  }
}