import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DifficultyConfig } from '../../models/snake.types';

@Component({
  selector: 'app-snake-menu-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-menu-screen.component.html',
  styleUrls: ['./snake-menu-screen.component.css']
})
export class SnakeMenuScreenComponent implements OnInit, OnDestroy, OnChanges {
  @Input() difficulties: DifficultyConfig[] = [];
  @Input() selectedDifficulty!: DifficultyConfig;
  @Input() availableBoardSizes: number[] = [];
  @Input() currentBoardSize = 18;
  @Input() highScores: Record<string, number> = {};

  @Output() selectDifficultyLevel = new EventEmitter<number>();
  @Output() selectBoardSize = new EventEmitter<number>();
  @Output() startGame = new EventEmitter<void>();

  @ViewChild('demoCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private animId: number | null = null;
  private snake = [
    { x: 100, y: 70 },
    { x: 85, y: 70 },
    { x: 70, y: 70 },
    { x: 55, y: 70 }
  ];
  private food = { x: 175, y: 70 };
  private dir = { x: 1, y: 0 };
  private stepInterval = 6;

  get currentHighScore(): number {
    const key = `${this.selectedDifficulty.level}_${this.currentBoardSize}`;
    return this.highScores[key] || 0;
  }

  ngOnInit(): void {
    this.updateSpeedByDifficulty();
    this.startDemoAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDifficulty']) {
      this.updateSpeedByDifficulty();
    }
  }

  ngOnDestroy(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectDifficultyLevel.emit(parseInt(target.value, 10));
  }

  private updateSpeedByDifficulty(): void {
    if (!this.selectedDifficulty) return;
    switch (this.selectedDifficulty.level) {
      case 1: this.stepInterval = 9; break;  // Easy
      case 2: this.stepInterval = 5; break;  // Medium
      case 3: this.stepInterval = 2; break;  // Hard
      default: this.stepInterval = 5;
    }
  }

  private startDemoAnimation(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stepCounter = 0;

    const render = () => {
      stepCounter++;
      if (stepCounter % this.stepInterval === 0) {
        this.updateDemoSnake(canvas.width, canvas.height);
      }

      ctx.fillStyle = '#040805';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background
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
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00ff80';
      ctx.fillStyle = '#00ff80';
      ctx.beginPath();
      ctx.arc(this.food.x, this.food.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Snake Body
      this.snake.forEach((seg, i) => {
        ctx.shadowBlur = i === 0 ? 8 : 3;
        ctx.shadowColor = '#00ff80';
        ctx.fillStyle = i === 0 ? '#00ff80' : 'rgba(0, 204, 102, 0.75)';
        ctx.fillRect(seg.x - 5.5, seg.y - 5.5, 11, 11);
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