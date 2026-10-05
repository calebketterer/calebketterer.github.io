import { DiepButton } from '../../core/diep.interfaces';
import { DiepHighScoreRenderer } from '../hud/diep.high-score-renderer';
import { DiepButtonRenderer } from '../buttons/diep.button-renderer';

export class DiepPauseOverlay {
  public static draw(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillStyle = '#f39c12';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', width / 2, height / 2 - 100);

    DiepHighScoreRenderer.drawList(ctx, width * 0.875, height / 2 - 200, g.topScores, null, '#f39c12');
    DiepButtonRenderer.drawCollection(ctx, g, this.getButtons(g, width, height));
  }

  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    return [
      {
        id: 'resume-btn',
        label: 'RESUME',
        x: width / 2 - 100, y: height / 2 - 30, w: 200, h: 50,
        color: '#2ecc71', borderColor: '#27ae60',
        hoverEffect: 'grow',
        action: () => g.togglePause()
      },
      {
        id: 'main-menu-pause-btn',
        label: 'MAIN MENU',
        x: width / 2 - 100, y: height / 2 + 40, w: 200, h: 50,
        color: '#e74c3c', borderColor: '#c0392b',
        hoverEffect: 'grow',
        action: () => g.arenaReset.exitToMenu(g)
      },
    ];
  }
}