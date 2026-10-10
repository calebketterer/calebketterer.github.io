import { Coord } from '../models/snake.types';

export class SnakeRenderer {
  private ctx: CanvasRenderingContext2D;
  private boardSize: number;

  constructor(ctx: CanvasRenderingContext2D, boardSize: number) {
    this.ctx = ctx;
    this.boardSize = boardSize;
  }

  render(snake: Coord[], food: Coord, width: number, height: number): void {
    const cellSize = width / this.boardSize;

    this.ctx.fillStyle = '#040805';
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = 'rgba(0, 255, 128, 0.05)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.boardSize; i++) {
      const p = Math.floor(i * cellSize);

      this.ctx.beginPath();
      this.ctx.moveTo(p, 0);
      this.ctx.lineTo(p, height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, p);
      this.ctx.lineTo(width, p);
      this.ctx.stroke();
    }

    const fx = food.x * cellSize + cellSize / 2;
    const fy = food.y * cellSize + cellSize / 2;
    const foodRadius = (cellSize / 2) * 0.7;

    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = '#00ff80';
    this.ctx.fillStyle = '#00ff80';
    this.ctx.beginPath();
    this.ctx.arc(fx, fy, foodRadius, 0, Math.PI * 2);
    this.ctx.fill();

    snake.forEach((seg, index) => {
      const x = seg.x * cellSize;
      const y = seg.y * cellSize;
      const isHead = index === 0;

      if (isHead) {
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = '#00ff80';
        this.ctx.fillStyle = '#00ff80';
      } else {
        const alpha = Math.max(0.2, 1 - index / (snake.length + 4));
        this.ctx.shadowBlur = 3;
        this.ctx.shadowColor = 'rgba(0, 255, 128, 0.5)';
        this.ctx.fillStyle = `rgba(0, 204, 102, ${alpha})`;
      }

      const pad = 1;
      this.ctx.fillRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2);
    });

    this.ctx.shadowBlur = 0;
  }
}