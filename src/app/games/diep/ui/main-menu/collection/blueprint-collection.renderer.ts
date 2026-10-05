// src/app/diep/ui/main-menu/collection/blueprints-renderer.ts
export class BlueprintsRenderer {
  public static render(ctx: CanvasRenderingContext2D, width: number, gridStartY: number): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = 'italic 16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLUEPRINTS content modules coming soon', width / 2, gridStartY + 100);
  }
}