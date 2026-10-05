import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

type Difficulty = 'easy' | 'medium' | 'hard';

@Component({
  selector: 'app-sudoku',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.css'],
})
export class SudokuComponent implements OnDestroy {
  readonly difficulties = [
    { label: 'Easy', value: 'easy', blanks: 34 },
    { label: 'Medium', value: 'medium', blanks: 44 },
    { label: 'Hard', value: 'hard', blanks: 54 }
  ];
  selectedDifficulty: Difficulty = 'easy';

  START_PUZZLE: number[][] = [[]];
  SOLUTION: number[][] = [[]];

  puzzle: number[][] = [];
  initial: number[][] = [];
  selectedCell: { row: number; col: number } | null = null;
  errorCells = new Set<string>();
  correctCells = new Set<string>();
  checkMode = false;
  showResult = false;
  resultMessage = '';
  revealMode = false;
  userInputsBackup: number[][] = [];
  checkCount = 0;

  // Timer-related fields
  timerValue = 0; // seconds
  timerInterval: ReturnType<typeof setInterval> | null = null;
  timerRunning = false;

  // Reveal-used indicator
  revealUsed = false;

  ngOnInit() {
    this.newGame();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  startTimer() {
    if (this.timerInterval) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerValue++;
    }, 1000);
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerRunning = false;
  }

  resetTimer() {
    this.clearTimer();
    this.timerValue = 0;
    this.startTimer();
  }

  formatTimer(): string {
    const min = Math.floor(this.timerValue / 60);
    const sec = this.timerValue % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }

  newGame() {
    // Generate a new valid board and puzzle for selected difficulty
    const filled = this.generateFullSolution();
    this.SOLUTION = filled.map(row => [...row]);
    const blanks = this.difficulties.find(d => d.value === this.selectedDifficulty)!.blanks;
    this.START_PUZZLE = this.removeCells(filled, blanks);
    this.puzzle = this.START_PUZZLE.map(row => [...row]);
    this.initial = this.START_PUZZLE.map(row => [...row]);
    this.selectedCell = null;
    this.errorCells.clear();
    this.correctCells.clear();
    this.checkMode = false;
    this.showResult = false;
    this.resultMessage = '';
    this.revealMode = false;
    this.userInputsBackup = [];
    this.checkCount = 0;
    this.revealUsed = false;
    this.resetTimer();
  }

  selectCell(row: number, col: number) {
    if (!this.revealMode && this.initial[row][col] === 0) {
      this.selectedCell = { row, col };
      this.startTimer();
    }
  }

  handleKey(event: KeyboardEvent) {
    if (this.revealMode) return;
    if (!this.selectedCell) return;
    const { row, col } = this.selectedCell;
    this.startTimer();
    if (event.key >= '1' && event.key <= '9') {
      this.puzzle[row][col] = Number(event.key);
    } else if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === '0'
    ) {
      this.puzzle[row][col] = 0;
    }
    if (this.checkMode) {
      this.checkMode = false;
      this.errorCells.clear();
      this.correctCells.clear();
      this.showResult = false;
    }
  }

  onDifficultyChange(event: Event) {
    this.selectedDifficulty = (event.target as HTMLSelectElement).value as Difficulty;
    this.newGame();
  }

  isInitial(row: number, col: number) {
    return this.initial[row][col] !== 0;
  }

  isErrorCell(row: number, col: number) {
    return this.errorCells.has(`${row},${col}`);
  }

  isCorrectCell(row: number, col: number) {
    return this.correctCells.has(`${row},${col}`);
  }

  reset() {
    this.puzzle = this.START_PUZZLE.map(row => [...row]);
    this.selectedCell = null;
    this.errorCells.clear();
    this.correctCells.clear();
    this.checkMode = false;
    this.showResult = false;
    this.resultMessage = '';
    this.revealMode = false;
    this.userInputsBackup = [];
    this.checkCount = 0;
    this.revealUsed = false;
    this.resetTimer();
  }

  checkAnswers() {
    if (this.revealMode) return;
    this.errorCells.clear();
    this.correctCells.clear();
    let allFilled = true;
    let allCorrect = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.initial[i][j] !== 0) continue;
        if (this.puzzle[i][j] === 0) {
          allFilled = false;
        }
        if (this.puzzle[i][j] !== 0 && this.puzzle[i][j] !== this.SOLUTION[i][j]) {
          this.errorCells.add(`${i},${j}`);
          allCorrect = false;
        } else if (this.puzzle[i][j] === this.SOLUTION[i][j]) {
          this.correctCells.add(`${i},${j}`);
        }
      }
    }
    this.checkMode = true;
    this.showResult = true;
    this.checkCount++;
    if (!allFilled) {
      this.resultMessage = 'Keep going! Some cells are still empty.';
    } else if (allCorrect) {
      this.resultMessage = '🎉 Congratulations! You solved it!';
      this.clearTimer();
    } else {
      this.resultMessage = 'Some answers are incorrect. Try again!';
    }
  }

  toggleRevealSolution() {
    if (!this.revealMode) {
      this.userInputsBackup = this.puzzle.map((row: number[]) => row.slice());
      this.puzzle = this.SOLUTION.map((row: number[]) => row.slice());
      this.revealMode = true;
      this.selectedCell = null;
      this.revealUsed = true;
    } else {
      if (this.userInputsBackup.length === 9) {
        this.puzzle = this.userInputsBackup.map((row: number[]) => row.slice());
      }
      this.revealMode = false;
    }
    this.errorCells.clear();
    this.correctCells.clear();
    this.checkMode = false;
    this.showResult = false;
    this.resultMessage = '';
  }

  // -- SUDOKU GENERATION LOGIC --

  generateFullSolution(): number[][] {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    this.solveSudoku(grid, true);
    return grid;
  }

  removeCells(solved: number[][], blanks: number): number[][] {
    const puzzle = solved.map(row => [...row]);
    let count = 0;
    while (count < blanks) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        count++;
      }
    }
    return puzzle;
  }

  solveSudoku(grid: number[][], randomize: boolean = false): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          let numbers = [1,2,3,4,5,6,7,8,9];
          if (randomize) {
            // Shuffle numbers for more random boards
            for (let i = numbers.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
            }
          }
          for (let num of numbers) {
            if (this.isSafe(grid, row, col, num)) {
              grid[row][col] = num;
              if (this.solveSudoku(grid, randomize)) {
                return true;
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  isSafe(grid: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) {
        return false;
      }
    }
    const boxRow = row - row % 3;
    const boxCol = col - col % 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (grid[boxRow + r][boxCol + c] === num) {
          return false;
        }
      }
    }
    return true;
  }
}