import { DiepButton } from '../../core/diep.interfaces';
import { DiepHighScoreRenderer } from '../hud/diep.high-score-renderer';
import { DiepButtonRenderer } from '../buttons/diep.button-renderer';

export class DiepGameOverOverlay {
  public static draw(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillStyle = '#f1c40f';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', width / 2, height / 2 - 100);

    ctx.font = '32px Inter, sans-serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('Final Score: ' + g.score, width / 2, height / 2 - 50);

    DiepHighScoreRenderer.drawList(ctx, width * 0.875, height / 2 - 200, g.topScores, g.score, '#f39c12');
    DiepButtonRenderer.drawCollection(ctx, g, this.getButtons(g, width, height));
  }

  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    return [
      {
        id: 'play-again-btn',
        label: 'PLAY AGAIN',
        x: width / 2 - 110, y: height / 2 , w: 220, h: 60,
        color: '#2ecc71', borderColor: '#27ae60',
        fontSize: 'bold 30px Inter, sans-serif',
        hoverEffect: 'grow',
        action: () => {
          if (g.currentMode === 'SECTORS') {
            g.sectorsReset.startNewGame(g);
          } else {
            g.arenaReset.restartGame(g);
          }
        }
      },
      {
        id: 'main-menu-gameover-btn',
        label: 'MAIN MENU',
        x: width / 2 - 100, y: height / 2 + 80, w: 200, h: 50,
        color: '#34495e', borderColor: '#2c3e50',
        hoverEffect: 'grow',
        action: () => g.arenaReset.exitToMenu(g)
      }
    ];
  }
}