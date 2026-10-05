import { Player, DiepButton } from '../../../core/diep.interfaces';
import { UPGRADE_REGISTRY, UpgradePath } from '../../../engine/subsystems/player/player-upgrades/diep.upgrade-registry';
import { UpgradeBarRenderer } from './upgrade-bar-renderer';
import { UpgradeMenuManager } from './diep.upgrade-menu.manager';

export class DiepUpgradeMenuRenderer {
  private static readonly MENU_WIDTH = 200;
  private static readonly ROW_HEIGHT = 15;
  private static readonly ROW_SPACING = 10;
  private static readonly COLORS = {
    bg: '#3d3d3d',
    stroke: '#444444',
    default: '#999999'
  };
  private static readonly WEIGHTS = {
    master: 5,
    circle: 2.5
  };

  public static draw(ctx: CanvasRenderingContext2D, g: any, player: Player, height: number): void {
    if (!player) return;

    const startY = UpgradeMenuManager.getMenuStartY(height, this.ROW_HEIGHT, this.ROW_SPACING);
    const menuHeight = UPGRADE_REGISTRY.length * (this.ROW_HEIGHT + this.ROW_SPACING);
    
    const isHovered = g.mousePos.x <= (UpgradeMenuManager.slideX + this.MENU_WIDTH + 40) &&
                      g.mousePos.y >= (startY - 40) && 
                      g.mousePos.y <= (startY + menuHeight + 20);

    // Pass the whole player object now for the "canStillUpgrade" check
    UpgradeMenuManager.updateSlide(player, this.MENU_WIDTH, isHovered, g.deltaTime || 16.6);

    if (UpgradeMenuManager.slideX < -this.MENU_WIDTH - 90) return;

    // Draw Points Label with the calculated offset
    if (player.progression.upgradePoints > 0) {
      this.drawPointsLabel(ctx, player.progression.upgradePoints, UpgradeMenuManager.slideX + UpgradeMenuManager.labelX, startY - 15);
    }

    UPGRADE_REGISTRY.forEach((path: UpgradePath, i: number) => {
      const rowY = startY + (i * (this.ROW_HEIGHT + this.ROW_SPACING));
      const visualSpent = UpgradeMenuManager.getVisualSpent(path.id, player.upgrades[path.id] || 0);

      UpgradeBarRenderer.draw(
        ctx,
        UpgradeMenuManager.slideX,
        rowY,
        this.MENU_WIDTH,
        this.ROW_HEIGHT,
        path,
        visualSpent,
        { ...this.COLORS, theme: path.color || this.COLORS.default },
        this.WEIGHTS
      );
    });
  }

  private static drawPointsLabel(ctx: CanvasRenderingContext2D, points: number, x: number, y: number): void {
    ctx.save();
    ctx.font = '900 22px Inter, sans-serif';
    ctx.textAlign = 'center'; // Center alignment for perfect button-sync
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(`x${points}`, x, y);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`x${points}`, x, y);
    ctx.restore();
  }

  public static getButtons(g: any, player: Player, height: number): DiepButton[] {
    if (!player || player.progression.upgradePoints <= 0 || UpgradeMenuManager.slideX < -280) return [];

    const startY = UpgradeMenuManager.getMenuStartY(height, this.ROW_HEIGHT, this.ROW_SPACING);

    return UPGRADE_REGISTRY.map((path, i) => {
      const spent = player.upgrades[path.id] || 0;
      if (spent >= 10) return null;

      return {
        id: `upgrade-${path.id}`,
        label: '',
        x: UpgradeMenuManager.slideX,
        y: startY + (i * (this.ROW_HEIGHT + this.ROW_SPACING)),
        w: this.MENU_WIDTH + 50,
        h: this.ROW_HEIGHT,
        color: 'transparent',
        borderColor: 'transparent',
        action: () => {
          g.upgradeService.applyUpgrade(player, path.id);
        }
      } as DiepButton;
    }).filter(btn => btn !== null) as DiepButton[];
  }
}