// src/app/diep/ui/main-menu/quadrivium/diep.records-renderer.ts
import { HighScore } from '../../../core/diep.interfaces';

export class DiepRecordsRenderer {
  
  public static getHeight(g: any): number {
    const allTimeCount = g.highScoresService?.getHighScores().length || 0;
    const weeklyCount = g.highScoresService?.getWeeklyScores().length || 0;
    
    const maxCount = Math.max(allTimeCount, weeklyCount);
    return Math.max(150, Math.min(10, maxCount) * 30 + 130);
  }

  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, currentScrollOffset: number, startY: number, height: number): void {
    const paneY = 100 + currentScrollOffset;
    if (paneY <= startY - 500 || paneY >= height + 500) return;

    // Pull from the two separate, dedicated persistence tracks directly
    const allTimeScores: HighScore[] = g.highScoresService?.getHighScores() || [];
    const weeklyScores: HighScore[] = g.highScoresService?.getWeeklyScores() || [];

    const totalContainerW = Math.min(940, width - 40);
    const startX = (width - totalContainerW) / 2;
    const columnW = (totalContainerW - 30) / 2;

    this.drawScoreTable(ctx, allTimeScores, startX, paneY, columnW, 'ALL-TIME RECORDS');
    this.drawScoreTable(ctx, weeklyScores, startX + columnW + 30, paneY, columnW, 'WEEKLY TOP SCORES');
  }

  private static drawScoreTable(ctx: CanvasRenderingContext2D, scoresList: HighScore[], x: number, y: number, w: number, title: string): void {
    this.drawCardBackground(ctx, x, y, w, 400);

    ctx.textAlign = 'left';
    ctx.font = '900 14px Inter, sans-serif';
    ctx.fillStyle = '#9b59b6';
    ctx.fillText(title, x + 25, y + 40);

    ctx.font = '900 10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
    ctx.fillText('RANK', x + 25, y + 75);
    ctx.fillText('ARCHIVE STAMP', x + 85, y + 75);
    ctx.textAlign = 'right';
    ctx.fillText('FINAL SCORE', x + w - 25, y + 75);

    ctx.strokeStyle = 'rgba(155, 89, 182, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 85);
    ctx.lineTo(x + w - 20, y + 85);
    ctx.stroke();

    if (scoresList.length === 0) {
      ctx.textAlign = 'center';
      ctx.font = 'italic 12px Inter, sans-serif';
      ctx.fillStyle = '#7f8c8d';
      ctx.fillText('No history files found in this frame.', x + w / 2, y + 200);
      return;
    }

    const rowHeight = 30;
    scoresList.slice(0, 10).forEach((row: HighScore, i: number) => {
      const rY = y + 112 + i * rowHeight;
      const isTop = i === 0;

      ctx.textAlign = 'left';
      ctx.font = isTop ? '900 12px Inter, sans-serif' : 'bold 12px Inter, sans-serif';
      ctx.fillStyle = isTop ? '#f1c40f' : '#ecf0f1';
      ctx.fillText(`#${i + 1}`, x + 25, rY);
      
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(this.formatDate(row.date), x + 85, rY);

      ctx.textAlign = 'right';
      ctx.font = isTop ? '900 12px Inter, sans-serif' : 'bold 12px Inter, sans-serif';
      ctx.fillStyle = isTop ? '#f1c40f' : '#ecf0f1';
      ctx.fillText((row.score || 0).toLocaleString(), x + w - 25, rY);
    });
  }

  private static drawCardBackground(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = 'rgba(20, 15, 30, 0.5)';
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
  }

  private static formatDate(isoString: string): string {
    if (!isoString) return 'UNKNOWN';
    try {
      const d = new Date(isoString);
      const dateString = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      return `${dateString} • ${timeString}`;
    } catch (e) {
      return 'INVALID DATE';
    }
  }
}