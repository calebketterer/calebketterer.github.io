import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnakeEngineService } from './engine/snake-engine.service';
import { SnakeRenderer } from './engine/snake-renderer';
import { Direction, GameState } from './models/snake.types';
import { SnakeMenuScreenComponent } from './components/snake-menu-screen/snake-menu-screen.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [
    CommonModule,
    SnakeMenuScreenComponent
  ],
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  gameState: GameState = 'MENU';
  score = 0;
  highScores: Record<string, number> = {};
  countdown = 3;

  private renderer!: SnakeRenderer;
  private touchStartPos = { x: 0, y: 0 };
  private subs: Subscription[] = [];
  private animFrameId: number | null = null;

  constructor(
    public engine: SnakeEngineService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.engine.setGameState('MENU');

    this.subs.push(
      this.engine.gameState$.subscribe(state => {
        this.gameState = state;
        this.cdr.detectChanges();
        if (state === 'PLAYING' || state === 'COUNTDOWN') {
          setTimeout(() => this.initCanvas(), 0);
        }
      }),
      this.engine.score$.subscribe(s => {
        this.score = s;
        this.cdr.detectChanges();
      }),
      this.engine.highScores$.subscribe(hs => {
        this.highScores = hs;
        this.cdr.detectChanges();
      }),
      this.engine.countdown$.subscribe(c => {
        this.countdown = c;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  onSelectDifficultyLevel(level: number): void {
    this.engine.setDifficultyLevel(level);
  }

  onSelectBoardSize(size: number): void {
    this.engine.setBoardSize(size);
  }

  onStartGame(): void {
    this.engine.startNewGame();
  }

  onMove(dir: Direction): void {
    this.engine.setDirection(dir);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.gameState !== 'PLAYING') return;

    switch (event.key) {
      case 'ArrowUp': case 'w': case 'W': this.engine.setDirection('UP'); break;
      case 'ArrowDown': case 's': case 'S': this.engine.setDirection('DOWN'); break;
      case 'ArrowLeft': case 'a': case 'A': this.engine.setDirection('LEFT'); break;
      case 'ArrowRight': case 'd': case 'D': this.engine.setDirection('RIGHT'); break;
      case 'p': case 'P': case 'Escape': this.engine.pauseGame(); break;
    }
  }

  onTouchStart(e: TouchEvent): void {
    if (e.touches.length > 0) {
      this.touchStartPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  onTouchEnd(e: TouchEvent): void {
    if (this.gameState !== 'PLAYING' || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - this.touchStartPos.x;
    const dy = e.changedTouches[0].clientY - this.touchStartPos.y;

    if (Math.max(Math.abs(dx), Math.abs(dy)) > 25) {
      if (Math.abs(dx) > Math.abs(dy)) {
        this.engine.setDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        this.engine.setDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
  }

  private initCanvas(): void {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.renderer = new SnakeRenderer(ctx, this.engine.boardSize);
    this.startRenderLoop();
  }

  private startRenderLoop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    const render = () => {
      if (this.canvasRef?.nativeElement) {
        this.renderer.render(
          this.engine.snake,
          this.engine.food,
          this.canvasRef.nativeElement.width,
          this.canvasRef.nativeElement.height
        );
      }
      if (this.gameState === 'PLAYING' || this.gameState === 'COUNTDOWN' || this.gameState === 'PAUSED') {
        this.animFrameId = requestAnimationFrame(render);
      }
    };
    render();
  }
}