import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SudokuGameService } from './services/sudoku-game.service';
import { Cell, Difficulty, ThemeColorName, ThemeColors } from './models/sudoku.model';
import { SUDOKU_FLAVOR_TEXTS } from './data/flavor-text.data';
import { DistortionOverlayComponent } from './components/distortion/distortion-overlay.component';

@Component({
  selector: 'app-sudoku',
  standalone: true,
  imports: [CommonModule, DistortionOverlayComponent],
  templateUrl: './sudoku.component.html',
  styleUrls: ['./sudoku.component.css']
})
export class SudokuComponent implements OnInit, OnDestroy {
  viewState: 'menu' | 'game' = 'menu';
  isGenerating = false;
  generationProgress = 0;
  overlayText = 'GENERATING MATRIX...';

  difficulty: Difficulty = 'medium';
  difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  
  primaryTheme: ThemeColorName = 'Green';
  secondaryTheme: ThemeColorName | null = 'Blue';
  currentPrimary: ThemeColors;
  currentSecondary: ThemeColors;

  highScores: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0, expert: 0 };
  newHighScoreAchieved = false;

  flavorTexts = SUDOKU_FLAVOR_TEXTS;
  currentFlavorIndex = 0;
  flavorInterval: any;

  board: Cell[][] = [];
  solution: number[][] = [];
  selectedCell: Cell | null = null;
  timerSeconds = 0;
  timerInterval: any;
  gameCompleted = false;
  mistakesCount = 0;
  errorMessage: string | null = null;
  errorTimeout: any;

  themes: ThemeColorName[] = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];

  constructor(
    public sudokuService: SudokuGameService, 
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    this.currentPrimary = this.sudokuService.themes[this.primaryTheme];
    this.currentSecondary = this.secondaryTheme ? this.sudokuService.themes[this.secondaryTheme] : this.currentPrimary;
  }

  ngOnInit(): void {
    this.highScores = this.sudokuService.getHighScores();
    this.startFlavorTimer();
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }

  clearTimers(): void {
    if (this.flavorInterval) clearInterval(this.flavorInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
  }

  startFlavorTimer(): void {
    this.flavorInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.nextFlavorText();
        this.cdr.detectChanges();
      });
    }, 20000);
  }

  nextFlavorText(): void {
    this.currentFlavorIndex = (this.currentFlavorIndex + 1) % this.flavorTexts.length;
  }

  selectTheme(t: ThemeColorName): void {
    if (this.primaryTheme === t) {
      if (this.secondaryTheme) {
        this.primaryTheme = this.secondaryTheme;
        this.secondaryTheme = null;
      }
    } else if (this.secondaryTheme === t) {
      this.secondaryTheme = null;
    } else {
      if (!this.secondaryTheme) {
        this.secondaryTheme = t;
      } else {
        this.secondaryTheme = this.primaryTheme;
        this.primaryTheme = t;
      }
    }
    this.currentPrimary = this.sudokuService.themes[this.primaryTheme];
    this.currentSecondary = this.secondaryTheme ? this.sudokuService.themes[this.secondaryTheme] : this.currentPrimary;
    this.cdr.detectChanges();
  }

  setDifficulty(diff: Difficulty): void {
    this.difficulty = diff;
    this.cdr.detectChanges();
  }

  initializeGame(): void {
    if (this.isGenerating) return;
    this.overlayText = 'GENERATING MATRIX...';
    this.isGenerating = true;
    this.generationProgress = 0;
    this.cdr.detectChanges();

    const duration = 3000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      this.ngZone.run(() => {
        this.generationProgress += step;
        if (this.generationProgress >= 100) {
          this.generationProgress = 100;
          clearInterval(progressTimer);
          
          const gameData = this.sudokuService.generatePuzzle(this.difficulty);
          this.board = gameData.board;
          this.solution = gameData.solution;
          this.selectedCell = null;
          this.timerSeconds = 0;
          this.gameCompleted = false;
          this.newHighScoreAchieved = false;
          this.mistakesCount = 0;
          this.errorMessage = null;
          this.viewState = 'game';
          this.isGenerating = false;
          this.startTimer();
          this.cdr.detectChanges();
        } else {
          this.cdr.detectChanges();
        }
      });
    }, intervalTime);
  }

  returnToMenu(): void {
    if (this.isGenerating) return;
    this.overlayText = 'GENERATING MENU...';
    this.isGenerating = true;
    this.generationProgress = 0;
    this.cdr.detectChanges();

    const duration = 3000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const progressTimer = setInterval(() => {
      this.ngZone.run(() => {
        this.generationProgress += step;
        if (this.generationProgress >= 100) {
          this.generationProgress = 100;
          clearInterval(progressTimer);
          
          this.clearTimers();
          this.highScores = this.sudokuService.getHighScores();
          this.viewState = 'menu';
          this.isGenerating = false;
          this.startFlavorTimer();
          this.cdr.detectChanges();
        } else {
          this.cdr.detectChanges();
        }
      });
    }, intervalTime);
  }

  startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.ngZone.run(() => {
        if (!this.gameCompleted) {
          this.timerSeconds++;
          this.cdr.detectChanges();
        }
      });
    }, 1000);
  }

  formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  selectCell(cell: Cell): void {
    if (cell.initial || this.gameCompleted) return;
    if (cell.selected) {
      cell.selected = false;
      this.selectedCell = null;
      this.cdr.detectChanges();
      return;
    }
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.board[r][c].selected = false;
      }
    }
    cell.selected = true;
    this.selectedCell = cell;
    this.cdr.detectChanges();
  }

  inputNumber(num: number): void {
    if (!this.selectedCell || this.selectedCell.initial || this.gameCompleted) return;
    this.selectedCell.value = num;
    this.selectedCell.error = false;
    this.checkCompletionState();
    this.cdr.detectChanges();
  }

  clearCell(): void {
    if (!this.selectedCell || this.selectedCell.initial || this.gameCompleted) return;
    this.selectedCell.value = 0;
    this.selectedCell.error = false;
    this.cdr.detectChanges();
  }

  checkAnswers(): void {
    if (this.gameCompleted) return;

    // Check if any empty cells remain
    let emptyCount = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c].value === 0) {
          emptyCount++;
        }
      }
    }

    if (emptyCount > 0) {
      this.showErrorMessage(`ERROR: GRID INCOMPLETE (${emptyCount} NODES REMAINING).`);
      return;
    }

    let errors = 0;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.board[r][c];
        if (cell.value !== 0 && cell.value !== cell.solution) {
          cell.error = true;
          errors++;
        } else {
          cell.error = false;
        }
      }
    }
    this.mistakesCount += errors;
    if (errors > 0) {
      this.showErrorMessage(`VERIFICATION FAILED: ${errors} INCORRECT NODES DETECTED.`);
    }
    this.checkCompletionState();
    this.cdr.detectChanges();
  }

  showErrorMessage(msg: string): void {
    this.errorMessage = msg;
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.ngZone.run(() => {
        this.errorMessage = null;
        this.cdr.detectChanges();
      });
    }, 3500);
    this.cdr.detectChanges();
  }

  checkCompletionState(): void {
    let isFull = true;
    let isCorrect = true;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.board[r][c];
        if (cell.value === 0) {
          isFull = false;
        }
        if (cell.value !== cell.solution) {
          isCorrect = false;
        }
      }
    }

    if (isFull && isCorrect) {
      this.gameCompleted = true;
      clearInterval(this.timerInterval);
      this.newHighScoreAchieved = this.sudokuService.saveHighScore(this.difficulty, this.timerSeconds);
    }
  }
}