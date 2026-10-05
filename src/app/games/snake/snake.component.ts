import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
interface Coord { x: number; y: number; }
interface Difficulty { label: string; interval: number; }

@Component({
  selector: 'app-snake',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent implements OnInit, OnDestroy {
  boardSize = 16;
  board: string[][] = [];
  snake: Coord[] = [];
  direction: Direction = 'UP';
  nextDirection: Direction = 'UP';
  food: Coord = { x: 8, y: 8 };
  gameOver = false;
  score = 0;
  moveInterval: any;
  moveIntervalTime = 160;
  difficulties: Difficulty[] = [
    { label: 'Easy', interval: 200 },
    { label: 'Medium', interval: 130 },
    { label: 'Hard', interval: 75 },
    { label: 'Extreme', interval: 40 }
  ];
  selectedDifficultyIdx = 1;
  gameStarted = false;

  // --- Advanced gradient & stretch ---
  private snakeTitleEl: HTMLElement | null = null;
  private snakeTitleListenerAttached = false;

  private gradientTargetX = 0.5;
  private gradientCurrentX = 0.5;
  private gradientRaf: number | null = null;
  private gradientAnimating = false;

  private stretchActive = false;
  private stretchStart = 0;
  private stretchDuration = 670; // Slower
  private stretchRaf: number | null = null;
  private stretchAmount = 0.55;  // Wider

  ngOnInit(): void {
    this.resetGame(false);
    setTimeout(() => this.attachSnakeTitleGradientHandler(), 0);
  }

  ngOnDestroy(): void {
    this.detachSnakeTitleGradientHandler();
    if (this.moveInterval) clearInterval(this.moveInterval);
    if (this.gradientRaf !== null) cancelAnimationFrame(this.gradientRaf);
    if (this.stretchRaf !== null) cancelAnimationFrame(this.stretchRaf);
  }

  startGame(): void {
    if (this.gameStarted || this.gameOver) return;
    this.gameStarted = true;
    this.moveIntervalTime = this.difficulties[this.selectedDifficultyIdx].interval;
    this.moveInterval = setInterval(() => this.moveSnake(), this.moveIntervalTime);
  }

  onStartButton(): void {
    this.startGame();
  }

  resetGame(startNew: boolean): void {
    if (this.moveInterval) clearInterval(this.moveInterval);
    this.direction = 'UP';
    this.nextDirection = 'UP';
    this.snake = [
      { x: 8, y: 7 },
      { x: 8, y: 8 },
      { x: 8, y: 9 }
    ];
    this.placeFood();
    this.score = 0;
    this.gameOver = false;
    this.gameStarted = false;
    this.buildBoard();
  }

  buildBoard(): void {
    this.board = [];
    for (let y = 0; y < this.boardSize; y++) {
      const row: string[] = [];
      for (let x = 0; x < this.boardSize; x++) {
        row.push('empty');
      }
      this.board.push(row);
    }
    for (const segment of this.snake) {
      if (this.inBounds(segment)) {
        this.board[segment.y][segment.x] = 'snake';
      }
    }
    if (this.inBounds(this.food)) {
      this.board[this.food.y][this.food.x] = 'food';
    }
  }

  inBounds(coord: Coord): boolean {
    return (
      coord.x >= 0 && coord.x < this.boardSize &&
      coord.y >= 0 && coord.y < this.boardSize
    );
  }

  moveSnake(): void {
    if (this.gameOver || !this.gameStarted) return;

    this.direction = this.nextDirection;
    const head = { ...this.snake[0] };
    switch (this.direction) {
      case 'UP':    head.y--; break;
      case 'DOWN':  head.y++; break;
      case 'LEFT':  head.x--; break;
      case 'RIGHT': head.x++; break;
    }

    if (!this.inBounds(head)) {
      this.endGame();
      return;
    }

    if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
      this.endGame();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.buildBoard();
  }

  placeFood(): void {
    let emptyCells: Coord[] = [];
    for (let y = 0; y < this.boardSize; y++) {
      for (let x = 0; x < this.boardSize; x++) {
        if (!this.snake.some(seg => seg.x === x && seg.y === y)) {
          emptyCells.push({ x, y });
        }
      }
    }
    if (emptyCells.length === 0) {
      this.endGame();
      return;
    }
    this.food = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  endGame(): void {
    this.gameOver = true;
    this.gameStarted = false;
    if (this.moveInterval) clearInterval(this.moveInterval);
  }

  getCellClass(cell: string): string {
    switch (cell) {
      case 'snake': return 'snake-cell';
      case 'food': return 'food-cell';
      default: return 'empty-cell';
    }
  }

  moveUp(): void {
    if (!this.gameStarted || this.direction === 'DOWN') return;
    this.nextDirection = 'UP';
  }
  moveDown(): void {
    if (!this.gameStarted || this.direction === 'UP') return;
    this.nextDirection = 'DOWN';
  }
  moveLeft(): void {
    if (!this.gameStarted || this.direction === 'RIGHT') return;
    this.nextDirection = 'LEFT';
  }
  moveRight(): void {
    if (!this.gameStarted || this.direction === 'LEFT') return;
    this.nextDirection = 'RIGHT';
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent): void {
    if (this.gameOver) return;
    if (!this.gameStarted) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.moveUp();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.moveDown();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.moveLeft();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.moveRight();
        break;
    }
  }

  onDifficultyChange(event: any): void {
    this.selectedDifficultyIdx = Number(event.target.value);
    this.resetGame(true);
  }

  // --- Advanced, smooth green gradient with slightly more contrast ---
  private attachSnakeTitleGradientHandler() {
    this.snakeTitleEl = document.getElementById('snakeTitle');
    if (!this.snakeTitleEl || this.snakeTitleListenerAttached) return;

    // Listen globally for mouse/touch anywhere on the page
    window.addEventListener('mousemove', this.handleGlobalMouseMove);
    window.addEventListener('touchmove', this.handleGlobalMouseMove, { passive: false });
    window.addEventListener('mouseleave', this.resetSnakeTitleGradient);
    window.addEventListener('touchend', this.resetSnakeTitleGradient as any);
    window.addEventListener('touchcancel', this.resetSnakeTitleGradient as any);
    this.snakeTitleEl.addEventListener('click', this.handleSnakeTitleClick);

    this.snakeTitleListenerAttached = true;
  }

  private detachSnakeTitleGradientHandler() {
    if (!this.snakeTitleListenerAttached) return;
    window.removeEventListener('mousemove', this.handleGlobalMouseMove);
    window.removeEventListener('touchmove', this.handleGlobalMouseMove);
    window.removeEventListener('mouseleave', this.resetSnakeTitleGradient);
    window.removeEventListener('touchend', this.resetSnakeTitleGradient as any);
    window.removeEventListener('touchcancel', this.resetSnakeTitleGradient as any);
    if (this.snakeTitleEl) {
      this.snakeTitleEl.removeEventListener('click', this.handleSnakeTitleClick);
    }
    this.snakeTitleListenerAttached = false;
  }

  private handleGlobalMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!this.snakeTitleEl) return;
    // Get the mouse/touch position relative to the center of the title element
    const rect = this.snakeTitleEl.getBoundingClientRect();
    let x = 0.5;
    if (e instanceof TouchEvent && e.touches.length) {
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) / rect.width;
    } else if (e instanceof MouseEvent) {
      x = (e.clientX - rect.left) / rect.width;
    }
    x = Math.max(0, Math.min(1, x));
    this.gradientTargetX = x;
    if (!this.gradientAnimating) {
      this.gradientAnimating = true;
      this.animateGradient();
    }
  };

    private animateGradient = () => {
    this.gradientCurrentX += (this.gradientTargetX - this.gradientCurrentX) * 0.18;
    // Main site's header style: mostly solid themetic green, with a little motion of a lighter green highlight
    // - The original dark green is oklch(55.34% 0.1608 140.47)
    // - The lighter highlight is oklch(75% 0.13 140.47)
    // The highlight moves, but the dominant color remains the dark green.

    // The highlight will be a small band moving across the gradient according to gradientCurrentX
    const angle = Math.round(90 + (this.gradientCurrentX - 0.5) * 100); // match site style: not too wide
    const highlightPos = Math.round(40 + this.gradientCurrentX * 40);   // highlight between 40% and 80%

     if (this.snakeTitleEl) {
      this.snakeTitleEl.style.background = `oklch(55.34% 0.1608 140.47)`;
      this.snakeTitleEl.style.webkitBackgroundClip = 'text';
      this.snakeTitleEl.style.backgroundClip = 'text';
      this.snakeTitleEl.style.webkitTextFillColor = 'transparent';
    }
    // No animation needed, so stop the loop if running
    this.gradientAnimating = false;
    if (this.gradientRaf) {
      cancelAnimationFrame(this.gradientRaf);
      this.gradientRaf = 0;
    }
  };

  private resetSnakeTitleGradient = () => {
    this.gradientTargetX = 0.5;
    if (!this.gradientAnimating) {
      this.gradientAnimating = true;
      this.animateGradient();
    }
  };

  // --- Stretch-on-click animation ---
  private handleSnakeTitleClick = () => {
    if (this.stretchActive) return;
    this.stretchActive = true;
    this.stretchStart = performance.now();
    this.animateStretch(performance.now());
  };

  private animateStretch = (now: number) => {
    if (!this.snakeTitleEl) return;
    const elapsed = now - this.stretchStart;
    const t = Math.min(elapsed / this.stretchDuration, 1);
    // Ease out
    const scale = 1.0 + this.stretchAmount * Math.sin(Math.PI * t);
    this.snakeTitleEl.style.transform = `scaleX(${scale})`;
    if (t < 1) {
      this.stretchRaf = requestAnimationFrame(this.animateStretch);
    } else {
      this.snakeTitleEl.style.transform = '';
      this.stretchActive = false;
    }
  };
}