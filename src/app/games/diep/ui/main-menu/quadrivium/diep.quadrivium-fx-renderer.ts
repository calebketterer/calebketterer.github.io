// src/app/diep/ui/main-menu/quadrivium/diep.quadrivium-fx-renderer.ts
export class DiepQuadriviumFxRenderer {

  public static drawHeader(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.fillStyle = 'rgba(8, 8, 15, 1)';
    ctx.fillRect(0, 0, width, 25);

    ctx.textAlign = 'center';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('THE QUADRIVIUM', width / 2, 45);

    ctx.font = '900 9px Inter, sans-serif';
    ctx.fillStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.fillText('A / D TO SWAP MODULES • W / S TO EXPLORE', width / 2, 62);
  }

  public static drawFades(ctx: CanvasRenderingContext2D, w: number, h: number, startY: number, viewH: number): void {
    const fadeColor = 'rgba(8, 8, 15, 1)';
    const transparent = 'rgba(8, 8, 15, 0)';

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
    floorGrad.addColorStop(0, 'rgba(8, 8, 15, 0.99)');
    floorGrad.addColorStop(1, transparent);
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, h - floorFadeHeight, w, floorFadeHeight);
  }

  public static drawScrollbar(ctx: CanvasRenderingContext2D, w: number, startY: number, viewH: number, totalH: number, scrollY: number): void {
    const barHeight = 80;
    const barX = w - 10;
    const scrollNormalized = ((-scrollY % totalH) + totalH) % totalH;
    const scrollPercent = scrollNormalized / totalH;
    const barY = startY + (scrollPercent * (viewH - barHeight));

    ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, 4, barHeight, 2);
    ctx.fill();
  }
}