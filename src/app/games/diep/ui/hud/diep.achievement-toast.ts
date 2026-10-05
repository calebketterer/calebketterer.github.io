import { Achievement } from '../../core/diep.interfaces';

export interface AchievementToast {
  achievement: Achievement;
  startTime: number;
  duration: number;
}

export class DiepAchievementToastRenderer {
  private static queue: AchievementToast[] = [];
  private static readonly TOAST_DURATION = 5000;
  private static readonly SLIDE_TIME = 600;

  // Change this one number to resize the entire notification!
  private static readonly SCALE = 0.85;

  public static add(ach: Achievement): void {
    this.queue.push({
      achievement: ach,
      startTime: 0, 
      duration: this.TOAST_DURATION
    });
  }

  public static draw(ctx: CanvasRenderingContext2D, width: number): void {
    if (this.queue.length === 0) return;

    const now = Date.now();
    const current = this.queue[0];

    if (current.startTime === 0) {
      current.startTime = now;
    }

    const elapsed = now - current.startTime;

    if (elapsed > current.duration) {
      this.queue.shift();
      return;
    }

    // --- SCALED DIMENSIONS ---
    const s = this.SCALE;
    const toastW = 280 * s;
    const toastH = 80 * s;
    const padding = 20;
    const textLeft = 65 * s; // Distance from left edge to text start

    // --- ANIMATION LOGIC ---
    let offsetX = 300; 
    if (elapsed < this.SLIDE_TIME) {
      const t = elapsed / this.SLIDE_TIME;
      offsetX = 300 * (1 - this.easeOutBack(t));
    } else if (elapsed > current.duration - this.SLIDE_TIME) {
      const t = (elapsed - (current.duration - this.SLIDE_TIME)) / this.SLIDE_TIME;
      offsetX = 300 * t;
    } else {
      offsetX = 0; 
    }

    const x = width - toastW - padding + offsetX;
    const y = (80 * s) + 10; 

    ctx.save();
    
    // 1. Background Card
    ctx.fillStyle = 'rgba(12, 10, 5, 0.96)';
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.roundRect(x, y, toastW, toastH, 10 * s);
    ctx.fill();
    ctx.stroke();

    // 2. The Icon (Yellow Bubble)
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(x + (35 * s), y + (40 * s), 18 * s, 0, Math.PI * 2);
    ctx.fill();

    // 3. Header Text (ACHIEVEMENT UNLOCKED!)
    ctx.textAlign = 'left';
    ctx.font = `bold ${10 * s}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(241, 196, 15, 0.8)';
    ctx.fillText('ACHIEVEMENT UNLOCKED!', x + textLeft, y + (25 * s));

    // 4. Points (Top Right)
    ctx.textAlign = 'right';
    ctx.font = `900 ${10 * s}px Inter, sans-serif`;
    ctx.fillStyle = '#f1c40f';
    ctx.fillText(`+${current.achievement.weight} PTS`, x + toastW - (15 * s), y + (25 * s));

    // 5. Achievement Name
    ctx.textAlign = 'left';
    ctx.font = `bold ${14 * s}px Inter, sans-serif`;
    ctx.fillStyle = '#fff';
    const title = (current.achievement.name + (current.achievement.tier ? ` TIER ${current.achievement.tier}` : '')).toUpperCase();
    ctx.fillText(title, x + textLeft, y + (42 * s));

    // 6. Description
    ctx.font = `500 ${11 * s}px Inter, sans-serif`;
    ctx.fillStyle = '#bdc3c7';
    ctx.fillText(current.achievement.description, x + textLeft, y + (58 * s));

    ctx.restore();
  }

  private static easeOutBack(x: number): number {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }
}