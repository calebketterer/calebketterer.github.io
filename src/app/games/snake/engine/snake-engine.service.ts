import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Coord, DifficultyConfig, Direction, GameState } from '../models/snake.types';
import { SnakeAudioService } from './snake-audio.service';

@Injectable({
  providedIn: 'root'
})
export class SnakeEngineService {
  boardSize = 18;
  readonly availableBoardSizes = [14, 18, 22];

  readonly difficulties: DifficultyConfig[] = [
    { level: 1, label: 'EASY', interval: 150, multiplier: 1 },
    { level: 2, label: 'MEDIUM', interval: 100, multiplier: 1.5 },
    { level: 3, label: 'HARD', interval: 60, multiplier: 2 }
  ];

  selectedDifficulty: DifficultyConfig = this.difficulties[1];
  gameState$ = new BehaviorSubject<GameState>('TITLE');
  score$ = new BehaviorSubject<number>(0);
  highScores$ = new BehaviorSubject<Record<string, number>>({});
  countdown$ = new BehaviorSubject<number>(3);

  snake: Coord[] = [];
  food: Coord = { x: 0, y: 0 };
  direction: Direction = 'UP';
  private nextDirection: Direction = 'UP';
  private timer: ReturnType<typeof setInterval> | null = null;
  private countdownTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private audio: SnakeAudioService) {
    this.resetState();
  }

  setDifficultyLevel(level: number): void {
    const found = this.difficulties.find(d => d.level === level);
    if (found) {
      this.selectedDifficulty = found;
    }
  }

  setBoardSize(size: number): void {
    if (this.availableBoardSizes.includes(size)) {
      this.boardSize = size;
      this.resetState();
    }
  }

  setGameState(state: GameState): void {
    this.gameState$.next(state);
  }

  startNewGame(): void {
    this.stopLoop();
    this.resetState();
    this.gameState$.next('COUNTDOWN');
    this.countdown$.next(3);

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      const nextVal = this.countdown$.value - 1;
      if (nextVal > 0) {
        this.countdown$.next(nextVal);
        this.audio.playTurnSound();
      } else {
        if (this.countdownTimer) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
        this.gameState$.next('PLAYING');
        this.startLoop();
      }
    }, 1000);
  }

  pauseGame(): void {
    if (this.gameState$.value === 'PLAYING') {
      this.stopLoop();
      this.gameState$.next('PAUSED');
    } else if (this.gameState$.value === 'PAUSED') {
      this.gameState$.next('PLAYING');
      this.startLoop();
    }
  }

  setDirection(dir: Direction): void {
    const isOpposite =
      (dir === 'UP' && this.direction === 'DOWN') ||
      (dir === 'DOWN' && this.direction === 'UP') ||
      (dir === 'LEFT' && this.direction === 'RIGHT') ||
      (dir === 'RIGHT' && this.direction === 'LEFT');

    if (!isOpposite && dir !== this.direction) {
      this.nextDirection = dir;
      this.audio.playTurnSound();
    }
  }

  private startLoop(): void {
    this.stopLoop();
    this.timer = setInterval(() => this.tick(), this.selectedDifficulty.interval);
  }

  private stopLoop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }

  private tick(): void {
    if (this.gameState$.value !== 'PLAYING') return;

    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'UP': head.y--; break;
      case 'DOWN': head.y++; break;
      case 'LEFT': head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    if (this.checkCollision(head)) {
      this.handleGameOver();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      const points = Math.round(10 * this.selectedDifficulty.multiplier);
      this.score$.next(this.score$.value + points);
      this.audio.playEatSound();
      this.spawnFood();
    } else {
      this.snake.pop();
    }
  }

  private checkCollision(head: Coord): boolean {
    const wallHit = head.x < 0 || head.x >= this.boardSize || head.y < 0 || head.y >= this.boardSize;
    const selfHit = this.snake.some(s => s.x === head.x && s.y === head.y);
    return wallHit || selfHit;
  }

  private handleGameOver(): void {
    this.stopLoop();
    this.audio.playGameOverSound();
    this.updateHighScore();
    this.gameState$.next('GAMEOVER');
  }

  private updateHighScore(): void {
    const diffKey = `${this.selectedDifficulty.level}_${this.boardSize}`;
    const currentHighs = { ...this.highScores$.value };
    const prevBest = currentHighs[diffKey] || 0;
    if (this.score$.value > prevBest) {
      currentHighs[diffKey] = this.score$.value;
      this.highScores$.next(currentHighs);
    }
  }

  private spawnFood(): void {
    const freeCells: Coord[] = [];
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (!this.snake.some(s => s.x === x && s.y === y)) {
          freeCells.push({ x, y });
        }
      }
    }
    if (freeCells.length > 0) {
      this.food = freeCells[Math.floor(Math.random() * freeCells.length)];
    }
  }

  private resetState(): void {
    this.direction = 'UP';
    this.nextDirection = 'UP';
    const mid = Math.floor(this.boardSize / 2);
    this.snake = [
      { x: mid, y: mid },
      { x: mid, y: mid + 1 },
      { x: mid, y: mid + 2 }
    ];
    this.score$.next(0);
    this.spawnFood();
  }
}