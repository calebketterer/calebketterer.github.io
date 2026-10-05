import { DiepButton } from '../../core/diep.interfaces';
import { DiepButtonAnimator } from './diep.button-animator';

export class DiepButtonRenderer {
  private static readonly GROW_AMOUNT = 5;

  public static drawCollection(ctx: CanvasRenderingContext2D, g: any, buttons: DiepButton[]): void {
    buttons.forEach(btn => this.draw(ctx, btn, g));
  }

  public static draw(ctx: CanvasRenderingContext2D, btn: DiepButton, g: any): void {
    if ((btn as any).hidden) return;

    const mouse = g.mousePos || { x: -1, y: -1 };
    const isHovered = mouse.x >= btn.x && mouse.x <= btn.x + btn.w && 
                      mouse.y >= btn.y && mouse.y <= btn.y + btn.h;

    const anim = DiepButtonAnimator.getValues(btn.id, isHovered);
    
    const effect = btn.hoverEffect || 'none';
    const useGrow = effect === 'grow';
    
    const rect = useGrow 
      ? DiepButtonAnimator.getBloomedRect(btn, anim.hover, this.GROW_AMOUNT)
      : { x: btn.x, y: btn.y, w: btn.w, h: btn.h };

    ctx.lineJoin = 'round';
    ctx.fillStyle = btn.color;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    
    ctx.strokeStyle = btn.borderColor;
    ctx.lineWidth = useGrow ? (3 + anim.hover * 2) : 3;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

    if (effect !== 'none' && anim.hover > 0) {
      ctx.save();
      const alpha = effect === 'highlight' ? 0.25 : 0.15;
      ctx.globalAlpha = anim.hover * alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }

    if (btn.label) {
      ctx.font = btn.fontSize || 'bold 20px Inter, sans-serif';
      ctx.fillStyle = btn.textColor || '#fff';
      ctx.textAlign = 'center';
      const isLarge = ctx.font.includes('30px');
      const offset = isLarge ? 10 : 7;
      ctx.fillText(btn.label, rect.x + rect.w / 2, rect.y + rect.h / 2 + offset);
    }
  }
}