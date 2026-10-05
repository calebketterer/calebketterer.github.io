// src/app/diep/engine/subsystems/market/shops/tent.shop.ts
import { MarketShopProp } from './shop.interface';

export class TentShop implements MarketShopProp {
  public id = 'shop-tent';
  public type = 'TENT_SHOP';
  public radius = 55;
  
  public isRectangular = true;
  public width = 110;
  public height = 80;
  
  public isSolid = true;
  public ownerId: string | null = null;

  // Slate gray palette with distinct shadows
  public baseColor = '#95a5a6'; 
  public accentColor = '#7f8c8d';
  public groundShadowColor = '#161a1d';

  constructor(public x: number, public y: number, public angle: number = 0) {}

  public applyVendorColors(base: string, accent: string): void {
    this.baseColor = base;
    this.accentColor = accent;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const halfW = this.width / 2;
    const halfH = this.height / 2;

    // 1. Interior floor shadow & stall back wall blueprint depth
    ctx.fillStyle = this.groundShadowColor;
    ctx.fillRect(-halfW + 10, -halfH + 10, this.width - 20, this.height - 20);

    // 2. Corner Tension Support Ropes / Guy Lines (Extending outwards to stakes)
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    const ropeLength = 15;
    
    // Top-left line
    ctx.beginPath(); ctx.moveTo(-halfW + 10, -halfH + 10); ctx.lineTo(-halfW - ropeLength, -halfH - ropeLength); ctx.stroke();
    // Top-right line
    ctx.beginPath(); ctx.moveTo(halfW - 10, -halfH + 10); ctx.lineTo(halfW + ropeLength, -halfH - ropeLength); ctx.stroke();
    // Bottom-left line
    ctx.beginPath(); ctx.moveTo(-halfW + 10, halfH - 10); ctx.lineTo(-halfW - ropeLength, halfH + ropeLength); ctx.stroke();
    // Bottom-right line
    ctx.beginPath(); ctx.moveTo(halfW - 10, halfH - 10); ctx.lineTo(halfW + ropeLength, halfH + ropeLength); ctx.stroke();

    // Small circular anchor stakes at line ends
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath(); ctx.arc(-halfW - ropeLength, -halfH - ropeLength, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(halfW + ropeLength, -halfH - ropeLength, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-halfW - ropeLength, halfH + ropeLength, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(halfW + ropeLength, halfH + ropeLength, 3, 0, Math.PI * 2); ctx.fill();

    // 3. Main Overhead Canopy Fabric with a clean modern aesthetic ridge design
    ctx.fillStyle = this.baseColor;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    
    // Slanted polygon awning top flap
    ctx.beginPath();
    ctx.moveTo(-halfW + 8, -halfH + 15);
    ctx.lineTo(halfW - 8, -halfH + 15);
    ctx.lineTo(halfW, halfH - 15);
    ctx.lineTo(-halfW, halfH - 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Layered scalloped edge trim detailing
    ctx.fillStyle = this.accentColor;
    const scallopCount = 5;
    const scallopWidth = (this.width - 16) / scallopCount;
    let currentX = -halfW + 8;

    for (let i = 0; i < scallopCount; i++) {
      ctx.beginPath();
      ctx.arc(currentX + scallopWidth / 2, -halfH + 15, scallopWidth / 2, 0, Math.PI, false);
      ctx.fill();
      currentX += scallopWidth;
    }

    // 5. Central peaked ridge line pole trace shadow overlay
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -halfH + 15);
    ctx.lineTo(0, halfH - 15);
    ctx.stroke();

    ctx.restore();
  }
}