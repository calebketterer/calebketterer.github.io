import { Achievement } from '../../../core/diep.interfaces';

export class AchievementCardRenderer {
  public static drawEntry(
    ctx: CanvasRenderingContext2D, 
    ach: Achievement, 
    x: number, 
    y: number, 
    width: number, 
    startY: number, 
    viewHeight: number
  ): void {
    const isUnlocked = ach.isUnlocked;
    // Clamp progress to safe range
    const progress = Math.max(0, Math.min(ach.currentValue / ach.targetValue, 1));
    const cardHeight = 90;
    const halfHeight = cardHeight / 2;
    const bottomEdge = startY + viewHeight;

    const cardTop = y - halfHeight;
    const cardBottom = y + halfHeight;
    const fadeDistance = 40; 

    let alpha = 1;
    if (cardTop < startY) alpha = Math.min(alpha, 1 - (startY - cardTop) / fadeDistance);
    if (cardBottom > bottomEdge) alpha = Math.min(alpha, 1 - (cardBottom - bottomEdge) / fadeDistance);

    const cardAlpha = Math.max(0, Math.min(1, alpha));
    if (cardAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = cardAlpha;

    const completedTiers = (ach.tier || 1) - 1;
    const totalTiers = (ach as any)._totalTiers || 1;
    // Clamp goldRatio to 0.999 to prevent addColorStop(1.00000...x) crashes
    const goldRatio = Math.max(0, Math.min(completedTiers / totalTiers, 0.999));

    // --- CARD BACKGROUND ---
    if (isUnlocked) {
      ctx.fillStyle = 'rgba(241, 196, 15, 0.15)';
    } else if (goldRatio > 0) {
      const bgGrad = ctx.createLinearGradient(x, 0, x + width, 0);
      bgGrad.addColorStop(0, 'rgba(241, 196, 15, 0.12)'); 
      bgGrad.addColorStop(goldRatio, 'rgba(241, 196, 15, 0.12)');
      bgGrad.addColorStop(goldRatio, 'rgba(255, 255, 255, 0.03)');
      ctx.fillStyle = bgGrad;
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    }
    
    ctx.beginPath();
    ctx.roundRect(x, y - halfHeight, width, cardHeight, 12);
    ctx.fill();

    // --- COMPLETION BUBBLE ---
    const bubbleX = x + 40;
    const bubbleRadius = 20;
    const bubbleLeft = bubbleX - bubbleRadius;
    const bubbleRight = bubbleX + bubbleRadius;

    if (isUnlocked) {
      ctx.fillStyle = '#f1c40f';
    } else if (goldRatio > 0) {
      const bubbleGrad = ctx.createLinearGradient(bubbleLeft, 0, bubbleRight, 0);
      bubbleGrad.addColorStop(0, '#f1c40f');
      bubbleGrad.addColorStop(goldRatio, '#f1c40f');
      const remainingColor = ach.currentValue > 0 ? '#3498db' : '#2c3e50';
      bubbleGrad.addColorStop(goldRatio, remainingColor);
      bubbleGrad.addColorStop(1, remainingColor);
      ctx.fillStyle = bubbleGrad;
    } else {
      ctx.fillStyle = ach.currentValue > 0 ? '#3498db' : '#2c3e50';
    }
    
    ctx.beginPath();
    ctx.arc(bubbleX, y, bubbleRadius, 0, Math.PI * 2);
    ctx.fill();

    // --- TEXT CONTENT ---
    ctx.textAlign = 'left';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = isUnlocked ? '#fff' : '#7f8c8d';
    const tierLabel = ach.tier ? ` ${ach.tier}` : '';
    ctx.fillText((ach.name + tierLabel).toUpperCase(), x + 75, y - 10);

    ctx.textAlign = 'right';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = isUnlocked ? '#f1c40f' : '#bdc3c7'; 
    ctx.fillText(`${Math.floor(ach.currentValue).toLocaleString()}/${ach.targetValue.toLocaleString()}`, x + width - 20, y - 10);

    ctx.textAlign = 'left';
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillStyle = '#95a5a6';
    ctx.fillText(ach.description, x + 75, y + 10);

    // --- VALUE BREAKDOWN & PROGRESS BAR ---
    const bottomY = y + 30;
    this.drawValueBreakdown(ctx, ach, x + 75, bottomY);

    const barW = 120;
    const barH = 14;
    const barX = x + width - barW - 20;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(barX, bottomY - 11, barW, barH, 4); 
    ctx.fill();

    ctx.fillStyle = isUnlocked ? '#f1c40f' : (ach.currentValue > 0 ? '#3498db' : '#5d6d7e');
    if (progress > 0) {
      ctx.beginPath();
      ctx.roundRect(barX, bottomY - 11, barW * progress, barH, 4);
      ctx.fill();
    }

    ctx.textAlign = 'center';
    ctx.font = '900 9px Inter, sans-serif';
    ctx.fillStyle = progress > 0.5 ? '#000' : '#fff';
    ctx.fillText(`${Math.floor(progress * 100)}%`, barX + (barW / 2), bottomY - 1);

    ctx.restore();
  }

  private static drawValueBreakdown(ctx: CanvasRenderingContext2D, ach: Achievement, x: number, y: number): void {
    ctx.font = '900 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    
    let currentX = x;
    const spacing = 4;

    // "VALUE: " label
    ctx.fillStyle = '#5d6d7e';
    ctx.fillText('VALUE: ', currentX, y);
    currentX += ctx.measureText('VALUE: ').width;

    // 1. GOLD +X (Banked sum of previous tiers)
    const bankedScore = (ach as any).bankedValue || 0;
    if (bankedScore > 0) {
      const bankedText = `+${bankedScore}`;
      ctx.fillStyle = '#f1c40f';
      ctx.fillText(bankedText, currentX, y);
      currentX += ctx.measureText(bankedText).width + spacing;
    }

    // 2. BLUE or GRAY +X (Current Tier)
    const currentWeight = `+${ach.weight}`;
    if (ach.isUnlocked) {
      ctx.fillStyle = '#f1c40f'; // If unlocked, it's part of the gold group
    } else if (ach.currentValue > 0) {
      ctx.fillStyle = '#3498db'; // Active progress
    } else {
      ctx.fillStyle = '#7f8c8d'; // Dormant/Next level
    }

    ctx.fillText(currentWeight, currentX, y);
  }
}