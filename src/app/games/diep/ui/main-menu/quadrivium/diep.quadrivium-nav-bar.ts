// src/app/diep/ui/main-menu/quadrivium/diep.quadrivium-navigator.ts
import { DiepButton } from '../../../core/diep.interfaces';
import { DiepQuadriviumScroller } from './diep.quadrivium-scroller';

export class DiepQuadriviumNavigator {
  public static tabs = ['MORPHOLOGY', 'TELEMETRY', 'RECORDS'];
  public static activeTabIndex = 0;

  private static tabSpacing = 140;
  private static tabY = 75;

  // Transition parameters
  public static isTransitioning = false;
  public static maskAlpha = 0; // Outward opacity value used by the renderer mask
  
  private static transitionTime = 0; // Continuous step time
  private static duration = 2;       // Total frames for full dip-to-black sequence
  private static pendingTabIndex = 0;

  public static drawTabs(ctx: CanvasRenderingContext2D, width: number): void {
    const startX = (width / 2) - ((this.tabs.length - 1) * this.tabSpacing) / 2;
    
    ctx.textAlign = 'center';
    ctx.font = '900 12px Inter, sans-serif';

    this.tabs.forEach((tab, i) => {
      const x = startX + (i * this.tabSpacing);
      const isActive = i === this.activeTabIndex;

      if (isActive) {
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(x - 35, this.tabY + 20, 70, 3);
      }
      
      ctx.fillStyle = isActive ? '#fff' : 'rgba(255, 255, 255, 0.3)';
      ctx.fillText(tab, x, this.tabY + 10);
    });
  }

  public static getButtons(g: any, width: number): DiepButton[] {
    const startX = (width / 2) - ((this.tabs.length - 1) * this.tabSpacing) / 2;

    return this.tabs.map((tab, i) => ({
      id: `quad-tab-${tab}`,
      label: '', 
      x: startX + (i * this.tabSpacing) - 55,
      y: this.tabY - 10,
      w: 110,
      h: 40,
      color: 'transparent',
      borderColor: 'transparent',
      hidden: true,
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
    
    // Normalized timeline percentage (0.0 to 1.0)
    const progress = this.transitionTime / this.duration;

    // Cosine ease curve mapped to create a dip-to-black peak at exactly halfway
    // -cos(p * 2PI) shifts the curve down, multiplying by 0.5 balances it back into 0 to 1 range
    this.maskAlpha = 0.5 * (1 - Math.cos(progress * Math.PI * 2));

    // Midpoint benchmark frame: swap panel logic cleanly while fully occluded by black mask
    if (this.transitionTime === Math.floor(this.duration / 2)) {
      this.activeTabIndex = this.pendingTabIndex;
      DiepQuadriviumScroller.resetScroll();
    }

    if (this.transitionTime >= this.duration) {
      this.isTransitioning = false;
      this.maskAlpha = 0;
    }
  }
}