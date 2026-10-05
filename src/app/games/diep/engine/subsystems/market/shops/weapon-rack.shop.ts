// src/app/diep/engine/subsystems/market/shops/weapon-rack.shop.ts
import { MarketShopProp } from './shop.interface';

export class WeaponRackShop implements MarketShopProp {
  public id = 'shop-rack';
  public type = 'WEAPON_RACK_SHOP';
  public radius = 50;
  
  public isRectangular = true;
  public width = 100;
  public height = 30;
  
  public isSolid = true;
  public ownerId: string | null = null;

  public baseColor = '#7f8c8d';
  public accentColor = '#566573';

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

    // Base iron rail frame
    ctx.fillStyle = '#2c3e50';
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 3;
    ctx.fillRect(-halfW, -halfH, this.width, this.height);
    ctx.strokeRect(-halfW, -halfH, this.width, this.height);

    // Display brackets using custom canvas strokes
    ctx.strokeStyle = this.baseColor;
    ctx.lineWidth = 4;
    for (let offset = -halfW + 20; offset < halfW; offset += 30) {
      ctx.beginPath();
      ctx.moveTo(offset, -halfH + 5);
      ctx.lineTo(offset, halfH - 5);
      ctx.moveTo(offset - 5, 0);
      ctx.lineTo(offset + 5, 0);
      ctx.stroke();
    }

    ctx.restore();
  }
}