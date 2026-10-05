import { DiepButton } from '../../core/diep.interfaces';
import { DiepDynamicTitle } from './diep.dynamic-title';
import { DiepTipsManager } from './diep.tips-manager';
import { DiepSettingsManager } from './diep.arena-settings-manager';
import { DiepArenaCheckboxRenderer } from './diep.arena-checkbox-renderer';
import { DiepButtonRenderer } from '../buttons/diep.button-renderer';

export class DiepMainMenu {
  public static draw(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, width, height);

    const frame = g.frameCounter || 0;
    DiepDynamicTitle.draw(ctx, width / 2, height / 2 - 120, frame);

    ctx.font = 'italic bold 20px Inter, sans-serif';
    ctx.fillStyle = '#bdc3c7';
    ctx.textAlign = 'center';
    ctx.fillText('Shape Warfare: Destroy Shapes and Dodge Enemies', width / 2, height / 2 - 60);

    const buttons = this.getButtons(g, width, height);
    const isArenaEnabled = g.hazardDirector?.enabled === true;

    buttons.forEach((btn) => {
      // The Renderer handles the hover check, animator logic, and text label execution internally
      DiepButtonRenderer.draw(ctx, btn, g);
      
      if (btn.id === 'arena-toggle-btn') {
        // Pass the work to the specialized renderer
        DiepArenaCheckboxRenderer.draw(ctx, btn, g, isArenaEnabled, frame);
        
        ctx.textAlign = 'left';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Dynamic Arena', btn.x + btn.w + 12, btn.y + 16);

        // Beta Label
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = isArenaEnabled ? '#3498db' : '#7f8c8d';
        ctx.fillText('Beta', btn.x + btn.w + 12, btn.y + 32);
      }
    });

    DiepTipsManager.draw(ctx, width, height);
  }

  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    const centerX = width / 2;
    const centerY = height / 2;
    const isActive = g.hazardDirector?.enabled === true;

    return [
      // Top Row - Primary Mode Actions (Width: 190 each, Side-by-Side)
      { id: 'sectors-btn', label: 'ENTER SECTORS', x: centerX - 200, y: centerY + 20, w: 190, h: 50, color: '#e67e22', borderColor: '#d35400', hoverEffect: 'grow', action: () => { g.currentMode = 'SECTORS'; g.sectorsReset.startNewGame(g); } },
      { id: 'start-btn', label: 'ENTER ARENA', x: centerX + 10, y: centerY + 20, w: 190, h: 50, color: '#2ecc71', borderColor: '#27ae60', hoverEffect: 'grow', action: () => { g.currentMode = 'ARENA'; g.arenaReset.startNewGame(g); } },

      // Bottom Row - Secondary Menus (Width: 190 each, Side-by-Side)
      { id: 'quadrivium-btn', label: 'QUADRIVIUM', x: centerX - 200, y: centerY + 90, w: 190, h: 50, color: '#9b59b6', borderColor: '#7c4592', hoverEffect: 'grow', action: () => g.arenaReset.transition.fadeOut(() => g.showingQuadrivium = true) },
      { id: 'achievements-btn', label: 'ACHIEVEMENTS', x: centerX + 10, y: centerY + 90, w: 190, h: 50, color: '#f1c40f', borderColor: '#f39c12', hoverEffect: 'grow', action: () => g.arenaReset.transition.fadeOut(() => g.showingAchievements = true) },

      // Utility Buttons
      { id: 'market-btn', label: 'M', x: centerX - 265, y: centerY + 90, w: 50, h: 50, color: 'rgba(26, 188, 156, 0.5)', borderColor: 'rgba(22, 160, 132, 0.5)', hoverEffect: 'grow', action: () => g.enterMarketMode() },
      { id: 'collection-btn', label: 'C', x: centerX + 215, y: centerY + 90, w: 50, h: 50, color: 'rgba(52, 152, 219, 0.5)', borderColor: 'rgba(41, 127, 185, 0.5)', hoverEffect: 'grow', action: () => g.arenaReset.transition.fadeOut(() => g.showingCollection = true) },
      { id: 'arena-toggle-btn', label: '', x: centerX + 215, y: centerY + 25, w: 40, h: 40, color: '#1a1a1a', borderColor: isActive ? '#3498db' : '#444', action: () => DiepSettingsManager.toggleArena(g) }
    ];
  }
}