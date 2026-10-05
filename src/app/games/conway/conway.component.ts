import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conway',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conway.component.html',
  styleUrls: ['./conway.component.css']
})
export class ConwayComponent {
  rows = 16;
  cols = 16;
  board: boolean[][] = [];
  running = false;
  intervalId: any = null;
  speed = 200;
  mouseDown = false;
  paintValue = true;

  useCustomGradient = false;
  currentCustomGradient = '';

  constructor() {
    this.resetBoard();
  }

  resetBoard() {
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );
  }

  getCellGradient(): string {
    if (this.useCustomGradient) {
      return this.currentCustomGradient;
    } else {
      // Default gradient (original purple/pink)
      return 'linear-gradient(135deg, #7702ff 60%, #ff41f8 100%)';
    }
  }

  toggleCell(y: number, x: number) {
    this.board[y][x] = !this.board[y][x];
    this.paintValue = this.board[y][x];
    this.board = this.board.slice();
  }

  onCellMouseDown(y: number, x: number, event: MouseEvent) {
    event.preventDefault();
    this.mouseDown = true;
    this.paintValue = !this.board[y][x];
    this.board[y][x] = this.paintValue;
    this.board = this.board.slice();
  }

  onCellMouseEnter(y: number, x: number) {
    if (this.mouseDown) {
      this.board[y][x] = this.paintValue;
      this.board = this.board.slice();
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.mouseDown = false;
  }

  clear() {
    this.running = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.resetBoard();
  }

  step() {
    const next: boolean[][] = this.board.map(arr => arr.slice());
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const neighbors = this.countNeighbors(y, x);
        if (this.board[y][x]) {
          next[y][x] = neighbors === 2 || neighbors === 3;
        } else {
          next[y][x] = neighbors === 3;
        }
      }
    }
    this.board = next;
  }

  toggleRunning() {
    this.running = !this.running;
    if (this.running) {
      this.intervalId = setInterval(() => this.step(), this.speed);
    } else if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  changeSpeed(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    switch (val) {
      case 'slow': this.speed = 400; break;
      case 'medium': this.speed = 200; break;
      case 'fast': this.speed = 70; break;
      default: this.speed = 200;
    }
    if (this.running) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(() => this.step(), this.speed);
    }
  }

  recolor() {
    this.currentCustomGradient = this.randomGradient();
    this.useCustomGradient = true;
  }

  randomGradient(): string {
    const color1 = this.randomHsl();
    const color2 = this.randomHsl();
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  }

  randomHsl(): string {
    const h = Math.floor(Math.random() * 360);
    const s = 55 + Math.floor(Math.random() * 35); // 55-90%
    const l = 45 + Math.floor(Math.random() * 30); // 45-75%
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  countNeighbors(y: number, x: number): number {
    let cnt = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dy === 0 && dx === 0) continue;
        const ny = y + dy;
        const nx = x + dx;
        if (
          ny >= 0 &&
          ny < this.rows &&
          nx >= 0 &&
          nx < this.cols &&
          this.board[ny][nx]
        ) {
          cnt++;
        }
      }
    }
    return cnt;
  }
}