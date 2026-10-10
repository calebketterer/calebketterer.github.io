import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snake-title-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-title-screen.component.html',
  styleUrls: ['./snake-title-screen.component.css']
})
export class SnakeTitleScreenComponent implements OnInit, OnDestroy {
  @Output() ready = new EventEmitter<void>();
  @ViewChild('previewCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private animId: number | null = null;
  private snake = [
    { x: 100, y: 100 },
    { x: 85, y: 100 },
    { x: 70, y: 100 },
    { x: 55, y: 100 }
  ];
  private food = { x: 180, y: 100 };
  private dir = { x: 1, y: 0 };

  ngOnInit(): void {
    this.startAnimation();
  }

  ngOnDestroy(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  private startAnimation(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stepCounter = 0;

    const render = () => {
      stepCounter++;
      if (stepCounter % 6 === 0) {
        this.updateDemoSnake(canvas.width, canvas.height);
      }

      ctx.fillStyle = '#040805';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = 'rgba(0, 255, 128, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Target Food Node
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00ff80';
      ctx.fillStyle = '#00ff80';
      ctx.beginPath();
      ctx.arc(this.food.x, this.food.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Snake
      this.snake.forEach((seg, i) => {
        ctx.shadowBlur = i === 0 ? 10 : 4;
        ctx.shadowColor = '#00ff80';
        ctx.fillStyle = i === 0 ? '#00ff80' : 'rgba(0, 204, 102, 0.7)';
        ctx.fillRect(seg.x - 6, seg.y - 6, 12, 12);
      });
      ctx.shadowBlur = 0;

      this.animId = requestAnimationFrame(render);
    };

    render();
  }

  private updateDemoSnake(w: number, h: number): void {
    const head = { ...this.snake[0] };
    const dx = this.food.x - head.x;
    const dy = this.food.y - head.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.dir = { x: Math.sign(dx), y: 0 };
    } else if (Math.abs(dy) > 0) {
      this.dir = { x: 0, y: Math.sign(dy) };
    }

    const newHead = { x: head.x + this.dir.x * 15, y: head.y + this.dir.y * 15 };

    if (Math.abs(newHead.x - this.food.x) < 10 && Math.abs(newHead.y - this.food.y) < 10) {
      this.food = {
        x: Math.floor(Math.random() * (w - 40) / 15) * 15 + 20,
        y: Math.floor(Math.random() * (h - 40) / 15) * 15 + 20
      };
    }

    this.snake.unshift(newHead);
    this.snake.pop();
  }
}