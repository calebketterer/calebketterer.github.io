import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type Cell = string | null;

const BOARD_WIDTH = 8;
const BOARD_HEIGHT = 16;
const COLORS = ['#f00', '#0c0', '#06f', '#fc0', '#0cf', '#c6f', '#888'];
const SHAPES: number[][][] = [
  [[1, 1, 1, 1]], // I
  [
    [1, 1],
    [1, 1],
  ], // O
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
  [
    [1, 0, 0],
    [1, 1, 1],
  ], // L
  [
    [0, 0, 1],
    [1, 1, 1],
  ], // J
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T
];

const SPAWN_X_TABLE = [
  2, // I (4-wide: col 2 → blocks [2,3,4,5])
  3, // O (2-wide: col 3 → blocks [3,4])
  3, // S
  3, // Z
  3, // L
  3, // J
  3, // T
];

interface Piece {
  type: number;
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

function randomPiece(): Piece {
  const type = Math.floor(Math.random() * SHAPES.length);
  return {
    type,
    shape: SHAPES[type].map((row: number[]) => [...row]),
    color: COLORS[type],
    x: SPAWN_X_TABLE[type],
    y: 0,
  };
}

function rotateMatrix(matrix: number[][], dir: number): number[][] {
  const N = matrix.length;
  const M = matrix[0].length;
  let rotated: number[][];
  if (dir === 1) {
    rotated = Array.from({ length: M }, (_, i) => matrix.map(row => row[i]).reverse());
  } else {
    rotated = Array.from({ length: M }, (_, i) => matrix.map(row => row[M - 1 - i]));
  }
  while (rotated.length && rotated[0].every(cell => cell === 0)) rotated.shift();
  while (rotated.length && rotated[rotated.length - 1].every(cell => cell === 0)) rotated.pop();
  while (rotated[0] && rotated.every(row => row[0] === 0)) rotated.forEach(row => row.shift());
  while (rotated[0] && rotated.every(row => row[row.length - 1] === 0)) rotated.forEach(row => row.pop());
  return rotated;
}

@Component({
  selector: 'app-tetris',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tetris.component.html',
  styleUrls: ['./tetris.component.css']
})
export class TetrisComponent implements OnInit, OnDestroy {
  board: Cell[][] = [];
  score = 0;
  gameOver = false;
  paused = false;
  interval: any;
  current: Piece | null = null;
  next: Piece | null = null;
  gameStarted = false;

  ngOnInit() {
    this.resetGame();
  }

  ngOnDestroy() {
    if (this.interval) clearInterval(this.interval);
  }

  resetGame() {
    this.board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.gameStarted = false;
    this.current = null;
    this.next = randomPiece();
    if (this.interval) clearInterval(this.interval);
  }

  startGame() {
    this.resetGame();
    this.gameStarted = true;
    this.spawn();
    this.interval = setInterval(() => this.tick(), 400);
  }

  tick() {
    if (this.gameOver || this.paused || !this.gameStarted) return;
    if (!this.move(0, 1)) {
      const pieceToMerge = this.current;
      this.current = null; // Prevent overlay draw after merging
      this.merge(pieceToMerge);
      this.clearLines();
      this.spawn();
    }
  }

  spawn() {
    if (!this.next) this.next = randomPiece();
    const nextPiece = this.next;
    this.current = {
      type: nextPiece.type,
      shape: nextPiece.shape.map((row: number[]) => [...row]),
      color: nextPiece.color,
      x: SPAWN_X_TABLE[nextPiece.type],
      y: 0,
    };
    this.next = randomPiece();
    if (!this.valid(this.current.shape, this.current.x, this.current.y)) {
      this.gameOver = true;
      this.gameStarted = false;
      clearInterval(this.interval);
    }
  }

  valid(shape: number[][], x: number, y: number): boolean {
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) {
          const nx = x + dx;
          const ny = y + dy;
          if (
            nx < 0 || nx >= BOARD_WIDTH ||
            ny < 0 || ny >= BOARD_HEIGHT ||
            (this.board[ny] && this.board[ny][nx])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  move(dx: number, dy: number): boolean {
    if (this.paused || this.gameOver || !this.gameStarted || !this.current) return false;
    const { shape, x, y } = this.current;
    if (this.valid(shape, x + dx, y + dy)) {
      this.current.x += dx;
      this.current.y += dy;
      return true;
    }
    return false;
  }

  rotate(dir: number = 1) {
    if (this.paused || this.gameOver || !this.gameStarted || !this.current) return;
    const { shape, x, y, type } = this.current;
    const rotated = rotateMatrix(shape, dir);

    let kicks = [0, -1, 1, -2, 2];
    for (let kick of kicks) {
      if (this.valid(rotated, x + kick, y)) {
        this.current.shape = rotated;
        this.current.x = x + kick;
        return;
      }
    }
  }

  merge(piece: Piece | null) {
    if (!piece) return;
    const { shape, x, y, color } = piece;
    for (let dy = 0; dy < shape.length; dy++) {
      for (let dx = 0; dx < shape[dy].length; dx++) {
        if (shape[dy][dx]) {
          const nx = x + dx;
          const ny = y + dy;
          if (ny >= 0 && ny < BOARD_HEIGHT && nx >= 0 && nx < BOARD_WIDTH) {
            this.board[ny][nx] = color;
          }
        }
      }
    }
  }

  clearLines() {
    let lines = 0;
    this.board = this.board.filter((row: Cell[]) => !row.every(cell => cell));
    lines = BOARD_HEIGHT - this.board.length;
    while (this.board.length < BOARD_HEIGHT) {
      this.board.unshift(Array(BOARD_WIDTH).fill(null));
    }
    this.score += lines * 100;
  }

  drop() {
    if (this.paused || this.gameOver || !this.gameStarted || !this.current) return;
    while (this.move(0, 1)) { }
    this.tick();
  }

  togglePause() {
    if (this.gameOver || !this.gameStarted) return;
    this.paused = !this.paused;
  }

  getCellColor(x: number, y: number): string {
    if (this.current && this.gameStarted && !this.gameOver) {
      const relX = x - this.current.x;
      const relY = y - this.current.y;
      if (
        relY >= 0 && relY < this.current.shape.length &&
        relX >= 0 && relX < this.current.shape[0].length &&
        this.current.shape[relY][relX]
      ) {
        // Only draw current piece if the cell is not already filled from the board
        if (!this.board[y][x]) {
          return this.current.color;
        }
      }
    }
    return this.board[y][x] ? this.board[y][x] as string : '#e8e8e8';
  }

  @HostListener('window:keydown', ['$event'])
  handleKey(event: KeyboardEvent) {
    if (!this.gameStarted || this.gameOver || !this.current) return;
    if (event.key.toLowerCase() === 'p') {
      this.togglePause();
      return;
    }
    if (this.paused) return;
    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.move(-1, 0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.move(1, 0);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.move(0, 1);
        break;
      case 'q':
      case 'Q':
        this.rotate(-1);
        break;
      case 'e':
      case 'E':
      case ' ':
        this.rotate(1);
        break;
      case 'Enter':
        this.drop();
        break;
    }
  }

  newGame() {
    this.resetGame();
  }
}