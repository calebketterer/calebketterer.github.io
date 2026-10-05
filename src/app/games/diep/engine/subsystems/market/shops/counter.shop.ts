// src/app/diep/engine/subsystems/market/shops/counter.shop.ts
import { MarketShopProp } from './shop.interface';

export class CounterShop implements MarketShopProp {
  public id = 'shop-counter';
  public type = 'COUNTER_SHOP';
  public radius = 55;
  
  public isRectangular = true;
  // Cover the full structural area of the shop so sides and front are solid
  public width = 110;
  public height = 110; 
  
  // Shift the bounding block up slightly (-10) to perfectly encompass both the back beams and the front deck uniformly
  public centerOffset = { x: 0, y: -10 };
  
  public angle = 0;
  public isSolid = true;
  public ownerId: string | null = null;

  public baseColor = '#34495e';
  public accentColor = '#2c3e50';
  public countertopColor = '#7f8c8d';

  constructor(public x: number, public y: number, angle: number = 0) {
    this.angle = angle;
  }

  public applyVendorColors(base: string, accent: string): void {
    this.baseColor = base;
    this.accentColor = accent;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const r = this.radius;

    // 1. Draw the back-awning support columns
    ctx.fillStyle = '#11161b';
    ctx.strokeStyle = this.accentColor;
    ctx.lineWidth = 2;
    ctx.fillRect(-r + 10, -r + 10, 12, 12);
    ctx.strokeRect(-r + 10, -r + 10, 12, 12);
    ctx.fillRect(r - 22, -r + 10, 12, 12);
    ctx.strokeRect(r - 22, -r + 10, 12, 12);

    // 2. Main horizontal front service counter deck
    ctx.fillStyle = this.countertopColor;
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.fillRect(-r, 5, r * 2, r * 0.5);
    ctx.strokeRect(-r, 5, r * 2, r * 0.5);

    // 3. Accent colored side trims
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(-r, -r + 20, 8, r * 1.2);
    ctx.fillRect(r - 8, -r + 20, 8, r * 1.2);

    ctx.restore();
  }
}