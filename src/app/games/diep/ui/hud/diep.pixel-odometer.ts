// src/app/diep/ui/hud/diep.pixel-odometer.ts
export class DiepPixelOdometer {
  private static visualBalance = -1;

  public static draw(ctx: CanvasRenderingContext2D, actualBalance: number, width: number, textColor: string): void {
    // 1. Process Odometer Rolling Calculations
    if (this.visualBalance === -1) {
      this.visualBalance = actualBalance;
    }

    if (this.visualBalance !== actualBalance) {
      const difference = actualBalance - this.visualBalance;
      
      let speedStep = difference * 0.05;
      if (Math.abs(speedStep) < 0.1) {
        speedStep = difference > 0 ? 0.1 : -0.1;
      }

      if (difference > 0) {
        this.visualBalance = Math.min(this.visualBalance + speedStep, actualBalance);
      } else {
        this.visualBalance = Math.max(this.visualBalance + speedStep, actualBalance);
      }
    }

    const continuousVisualValue = Math.floor(this.visualBalance);

    // 2. Render the animated text string
    ctx.fillStyle = textColor;
    ctx.fillText(`${continuousVisualValue}`, width - 42, 60);

    // 3. Render Geometric Blue Currency Diamond Icon
    const diamondSize = 12;
    ctx.save();
    ctx.translate(width - 26, 53); 
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
    ctx.restore();
  }
}