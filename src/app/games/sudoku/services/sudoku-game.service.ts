import { Injectable } from '@angular/core';
import { Cell, Difficulty, ThemeColors, ThemeColorName } from '../models/sudoku.model';

@Injectable({
  providedIn: 'root'
})
export class SudokuGameService {
  public themes: Record<ThemeColorName, ThemeColors> = {
    Green: { name: 'Green', primary: '#00ff66', secondary: '#051a0b', glow: 'rgba(0, 255, 102, 0.25)' },
    Blue: { name: 'Blue', primary: '#00b4d8', secondary: '#03131a', glow: 'rgba(0, 180, 216, 0.25)' },
    Red: { name: 'Red', primary: '#ff334b', secondary: '#1a0508', glow: 'rgba(255, 51, 75, 0.25)' },
    Orange: { name: 'Orange', primary: '#ff8800', secondary: '#1a0a00', glow: 'rgba(255, 136, 0, 0.25)' },
    Yellow: { name: 'Yellow', primary: '#ffd000', secondary: '#1a1600', glow: 'rgba(255, 208, 0, 0.25)' },
    Indigo: { name: 'Indigo', primary: '#6366f1', secondary: '#0e0e1a', glow: 'rgba(99, 102, 241, 0.25)' },
    Violet: { name: 'Violet', primary: '#d946ef', secondary: '#1a051a', glow: 'rgba(217, 70, 239, 0.25)' }
  };

  constructor() {}

  generatePuzzle(difficulty: Difficulty): { board: Cell[][], solution: number[][] } {
    const solution = this.generateCompleteBoard();
    const puzzle = this.carveBoard(solution, difficulty);

    const board: Cell[][] = [];
    for (let r = 0; r < 9; r++) {
      board[r] = [];
      for (let c = 0; c < 9; c++) {
        const val = puzzle[r][c];
        board[r][c] = {
          row: r,
          col: c,
          value: val,
          solution: solution[r][c],
          initial: val !== 0,
          selected: false,
          error: false,
          notes: new Set<number>()
        };
      }
    }
    return { board, solution };
  }

  private generateCompleteBoard(): number[][] {
    const board: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
    this.fillBoard(board);
    return board;
  }

  private fillBoard(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (this.isValid(board, r, c, num)) {
              board[r][c] = num;
              if (this.fillBoard(board)) {
                return true;
              }
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num && i !== col) return false;
      if (board[i][col] === num && i !== row) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const currR = startRow + r;
        const currC = startCol + c;
        if (board[currR][currC] === num && (currR !== row || currC !== col)) return false;
      }
    }
    return true;
  }

  private shuffle(array: number[]): number[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private carveBoard(solution: number[][], difficulty: Difficulty): number[][] {
    const board = solution.map(row => [...row]);
    let removals = 32;
    if (difficulty === 'medium') removals = 42;
    if (difficulty === 'hard') removals = 52;
    if (difficulty === 'expert') removals = 58;

    let removed = 0;
    while (removed < removals) {
      const r = Math.floor(Math.random() * 9);
      const c = Math.floor(Math.random() * 9);
      if (board[r][c] !== 0) {
        board[r][c] = 0;
        removed++;
      }
    }
    return board;
  }

  getHighScores(): Record<Difficulty, number> {
    const saved = localStorage.getItem('sudoku_high_scores');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { easy: 0, medium: 0, hard: 0, expert: 0 };
  }

  saveHighScore(difficulty: Difficulty, timeSec: number): boolean {
    const scores = this.getHighScores();
    if (scores[difficulty] === 0 || timeSec < scores[difficulty]) {
      scores[difficulty] = timeSec;
      localStorage.setItem('sudoku_high_scores', JSON.stringify(scores));
      return true;
    }
    return false;
  }
}