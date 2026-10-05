import { DiepPixelsService } from '../core/diep.pixels.service';

export class DiepPixelCounterRenderer {
  /**
   * Draws a unified, clean pixel currency counter bubble onto any Canvas context workspace.
   * @param ctx The active target Canvas rendering pipeline.
   * @param pixelsService Injected global pixel core data state provider.
   * @param x Top-left X placement alignment coordinate.
   * @param y Top-left Y placement alignment coordinate.
   * @returns The calculated bounding box width (vital for chaining layouts dynamically).
   */
  public static draw(ctx: CanvasRenderingContext2D, pixelsService: DiepPixelsService, x: number, y: number): number {
    const pixelAmountText = `${pixelsService.balance}`;
    
    // Set text profiling configs before measuring bounding box footprint widths
    ctx.font = 'bold 16px Inter, sans-serif';
    const textW = ctx.measureText(pixelAmountText).width;
    
    const boxGap = 10;
    const diamondSize = 12;
    const paddingX = 18;
    const boxW = textW + boxGap + diamondSize + (paddingX * 2);
    const boxH = 38; 

    // Render Box Background Frame
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();

    // Render Text Numbers
    ctx.fillStyle = '#3498db';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(pixelAmountText, x + paddingX, y + 25);

    // Render Geometric Blue Currency Diamond Icon
    ctx.save();
    ctx.translate(x + paddingX + textW + boxGap + (diamondSize / 2), y + 18);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-6, -6, diamondSize, diamondSize);
    ctx.restore();

    return boxW;
  }

  /**
   * Layout calculator helper to predict bounding width space allocations without executing raw canvas paint commands.
   */
  public static calculateWidth(ctx: CanvasRenderingContext2D, pixelsService: DiepPixelsService): number {
    const pixelAmountText = `${pixelsService.balance}`;
    ctx.font = 'bold 16px Inter, sans-serif';
    const textW = ctx.measureText(pixelAmountText).width;
    return textW + 10 + 12 + (18 * 2);
  }
}