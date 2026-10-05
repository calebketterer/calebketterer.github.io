import { Achievement, DiepButton } from '../../../core/diep.interfaces';
import { AchievementListSorter } from './achievement-list.sorter';
import { AchievementCardRenderer } from './achievement-card.renderer';
import { DiepAchievementNavigator } from './diep.achievement-nav-bar';
import { DiepButtonRenderer } from '../../buttons/diep.button-renderer';

export class DiepAchievementMenu {
  private static scrollY = 0;
  private static targetScrollY = 0;
  private static isDragging = false;
  private static lastMouseY = 0;

  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    DiepAchievementNavigator.updateGroups(g.achievementService.achievements);
    DiepAchievementNavigator.handleInput(g);
    
    const totalScore = g.achievementService.achievements
      .filter((a: Achievement) => a.isUnlocked)
      .reduce((sum: number, a: Achievement) => sum + (a.weight || 0), 0);

    const filtered = DiepAchievementNavigator.getFiltered(g.achievementService.achievements);
    const sorted = AchievementListSorter.getSortedAchievements(filtered);
    
    const colCount = 2;
    const rowSpacing = 110;
    const colWidth = (width - 120) / colCount; 
    const totalRows = Math.ceil(sorted.length / colCount);
    
    const startY = 80; 
    const viewHeight = height - startY - 20; 
    const contentHeight = totalRows * rowSpacing;

    const canScroll = contentHeight > viewHeight;
    const totalHeight = contentHeight;

    if (canScroll) {
      this.handleKeyboardScroll(g);
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.15;
    } else {
      this.targetScrollY = 0;
      this.scrollY = 0;
    }

    ctx.fillStyle = 'rgba(12, 10, 5, 0.99)'; 
    ctx.fillRect(0, 0, width, height);

    let displayOffset = 0;
    if (canScroll) {
      displayOffset = this.scrollY % totalHeight;
      if (displayOffset > 0) displayOffset -= totalHeight;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, startY - 10, width, viewHeight + 10);
    ctx.clip();

    const loops = canScroll ? 2 : 1;
    for (let loop = 0; loop < loops; loop++) {
      sorted.forEach((ach, i) => {
        const row = Math.floor(i / colCount);
        const col = i % colCount;
        const x = 60 + (col * colWidth);
        const y = 140 + displayOffset + (row * rowSpacing) + (loop * totalHeight);
        
        if (y < startY - 150 || y > height + 150) return;
        AchievementCardRenderer.drawEntry(ctx, ach, x, y, colWidth - 20, startY, viewHeight);
      });
    }
    ctx.restore();

    this.drawFades(ctx, width, height, startY, viewHeight);
    this.drawHeader(ctx, width, totalScore);
    DiepAchievementNavigator.drawTabs(ctx, width);

    if (canScroll) {
      this.drawScrollbar(ctx, width, startY, viewHeight, totalHeight);
    }

    DiepButtonRenderer.drawCollection(ctx, g, this.getButtons(g, width, height));
  }

  private static drawHeader(ctx: CanvasRenderingContext2D, width: number, score: number): void {
    ctx.fillStyle = 'rgba(12, 10, 5, 1)';
    ctx.fillRect(0, 0, width, 75);

    ctx.textAlign = 'center';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillStyle = '#f1c40f'; 
    ctx.fillText('ACHIEVEMENTS', width / 2, 45);
    
    ctx.font = '900 9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(241, 196, 18, 0.5)';
    ctx.fillText('A / D TO SWAP GROUPS • W / S TO SCROLL', width / 2, 62);

    ctx.textAlign = 'right';
    ctx.font = '900 10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(241, 196, 18, 0.6)';
    ctx.fillText('TOTAL SCORE', width - 60, 35);
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(score.toLocaleString(), width - 60, 60);
  }

  private static drawFades(ctx: CanvasRenderingContext2D, w: number, h: number, startY: number, viewH: number): void {
    const fadeColor = 'rgba(12, 10, 5, 1)';
    const transparent = 'rgba(12, 10, 5, 0)';
    
    const topGrad = ctx.createLinearGradient(0, startY - 15, 0, startY + 5);
    topGrad.addColorStop(0, fadeColor);
    topGrad.addColorStop(1, transparent);
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, startY - 15, w, 20); 

    const bottomY = startY + viewH;
    const botGrad = ctx.createLinearGradient(0, bottomY - 20, 0, bottomY + 10);
    botGrad.addColorStop(0, transparent);
    botGrad.addColorStop(1, fadeColor);
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, bottomY - 20, w, 30);
    
    const floorFadeHeight = 20; 
    const floorGrad = ctx.createLinearGradient(0, h - floorFadeHeight, 0, h);
    floorGrad.addColorStop(0, 'rgba(12, 10, 5, 0.99)');
    floorGrad.addColorStop(1, transparent);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h - floorFadeHeight, w, floorFadeHeight);
  }

  private static drawScrollbar(ctx: CanvasRenderingContext2D, w: number, startY: number, viewH: number, totalH: number): void {
    const barHeight = 80;
    const barX = w - 10;
    const scrollNormalized = ((-this.scrollY % totalH) + totalH) % totalH;
    const scrollPercent = scrollNormalized / totalH;
    const barY = startY + (scrollPercent * (viewH - barHeight));
    ctx.fillStyle = `rgba(241, 196, 15, 0.4)`;
    ctx.beginPath();
    ctx.roundRect(barX, barY, 4, barHeight, 2);
    ctx.fill();
  }

  public static handleInputDown(mouseY: number): void { this.isDragging = true; this.lastMouseY = mouseY; }
  public static handleInputUp(): void { this.isDragging = false; }
  public static handleInputMove(mouseY: number): void {
    if (!this.isDragging) return;
    this.targetScrollY += (mouseY - this.lastMouseY);
    this.lastMouseY = mouseY;
  }
  private static handleKeyboardScroll(g: any): void {
    const speed = 12;
    if (g.keys['w'] || g.keys['W'] || g.keys['arrowup']) this.targetScrollY += speed;
    if (g.keys['s'] || g.keys['S'] || g.keys['arrowdown']) this.targetScrollY -= speed;
  }
  
  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    return [
      {
        id: 'back-to-menu-btn',
        label: 'BACK',
        x: width / 2 - 100, y: height - 80, w: 200, h: 50,
        color: '#e74c3c', borderColor: '#c0392b',
        hoverEffect: 'grow',
        action: () => g.arenaReset.transition.fadeOut(() => g.showingAchievements = false)
      },
      ...DiepAchievementNavigator.getButtons(g, width)
    ];
  }
}