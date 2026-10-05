import { DiepButton } from '../../core/diep.interfaces';
import { DiepButtonRenderer } from '../buttons/diep.button-renderer';
import { DiepPixelOdometer } from '../hud/diep.pixel-odometer';

export class MarketOverlay {
  /**
   * Main overlay draw entry point. Paints titles and structural UI action zones.
   */
  public static draw(ctx: CanvasRenderingContext2D, g: any, width: number, height: number): void {
    // 1. Render Top Headline
    ctx.save();
    ctx.font = '1000 42px Inter, sans-serif'; 
    ctx.textAlign = 'center';

    // Thick dark drop-stroke for text depth
    ctx.strokeStyle = '#0d1117';
    ctx.lineWidth = 6;
    ctx.strokeText('ITEM MARKET', width / 2, 60);

    ctx.fillStyle = '#3498db';
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(52, 152, 219, 0.4)';
    ctx.fillText('ITEM MARKET', width / 2, 60);

    // 2. Render Beta Subtitle
    ctx.shadowBlur = 0; // Turn off glow effects so small text doesn't blur into a smear
    ctx.font = '500 16px Inter, sans-serif';
    ctx.fillStyle = '#95a5a6'; // Clean neutral slate gray
    ctx.fillText('Welcome to the market! This feature is in beta mode.', width / 2, 90);
    ctx.restore();

    // 3. Render the Encapsulated Odometer Wallet Balance
    ctx.save();
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    
    const actualBalance = g.pixelsService?.balance ?? 0;
    // Hardcoded to standard slate text frame color directly to mirror dark mode presentation
    DiepPixelOdometer.draw(ctx, actualBalance, width, '#ecf0f1');
    ctx.restore();

    // 4. Fetch and Render Layout Navigation Buttons
    const buttons = this.getButtons(g, width, height);
    buttons.forEach((btn) => {
      DiepButtonRenderer.draw(ctx, btn, g);
    });
  }

  /**
   * Matrix declaration for interactive UI control bindings
   */
  public static getButtons(g: any, width: number, height: number): DiepButton[] {
    return [
      {
        id: 'market-back-btn',
        label: 'BACK',
        x: 30,
        y: 30,
        w: 100,
        h: 40,
        color: '#e74c3c',
        borderColor: '#c0392b',
        hoverEffect: 'grow',
        action: () => g.marketManagerService.transitionToMenu(g)
      }
    ];
  }
}