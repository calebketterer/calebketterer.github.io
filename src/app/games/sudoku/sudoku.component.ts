import { Component, OnInit, OnDestroy } from '@angular/core';
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

  difficulty: Difficulty = 'medium';
  difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
  
  selectedPrimaryTheme: ThemeColorName = 'Green';
  selectedSecondaryTheme: ThemeColorName = 'Blue';
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

  themes: ThemeColorName[] = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];

  constructor(public sudokuService: SudokuGameService) {
    this.currentPrimary = this.sudokuService.themes[this.selectedPrimaryTheme];
    this.currentSecondary = this.sudokuService.themes[this.selectedSecondaryTheme];
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
  }

  startFlavorTimer(): void {
    this.flavorInterval = setInterval(() => {
      this.nextFlavorText();
    }, 20000);
  }

  nextFlavorText(): void {
    this.currentFlavorIndex = (this.currentFlavorIndex + 1) % this.flavorTexts.length;
  }

  setPrimaryTheme(themeName: ThemeColorName): void {
    this.selectedPrimaryTheme = themeName;
    this.currentPrimary = this.sudokuService.themes[themeName];
  }

  setSecondaryTheme(themeName: ThemeColorName): void {
    this.selectedSecondaryTheme = themeName;
    this.currentSecondary = this.sudokuService.themes[themeName];
  }

  setDifficulty(diff: Difficulty): void {
    this.difficulty = diff;
  }

  initializeGame(): void {
    this.isGenerating = true;
    this.generationProgress = 0;

    const totalDuration = 3500; // 3.5 seconds
    const intervalTime = 35;
    const increment = 100 / (totalDuration / intervalTime);

    const progressInterval = setInterval(() => {
      this.generationProgress += increment;
      if (this.generationProgress >= 100) {
        this.generationProgress = 100;
        clearInterval(progressInterval);
        
        const gameData = this.sudokuService.generatePuzzle(this.difficulty);
        this.board = gameData.board;
        this.solution = gameData.solution;
        this.selectedCell = null;
        this.timerSeconds = 0;
        this.gameCompleted = false;
        this.newHighScoreAchieved = false;
        this.mistakesCount = 0;
        this.viewState = 'game';
        
        setTimeout(() => {
          this.isGenerating = false;
          this.startTimer();
        }, 250);
      }
    }, intervalTime);
  }

  returnToMenu(): void {
    this.clearTimers();
    this.highScores = this.sudokuService.getHighScores();
    this.viewState = 'menu';
    this.startFlavorTimer();
  }

  startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (!this.gameCompleted) {
        this.timerSeconds++;
      }
    }, 1000);
  }

  formatTime(totalSec: number): string {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  selectCell(cell: Cell): void {
    if (cell.initial || this.gameCompleted) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.board[r][c].selected = false;
      }
    }
    cell.selected = true;
    this.selectedCell = cell;
  }

  inputNumber(num: number): void {
    if (!this.selectedCell || this.selectedCell.initial || this.gameCompleted) return;
    this.selectedCell.value = num;
    this.selectedCell.error = false;
    this.checkCompletionState();
  }

  clearCell(): void {
    if (!this.selectedCell || this.selectedCell.initial || this.gameCompleted) return;
    this.selectedCell.value = 0;
    this.selectedCell.error = false;
  }

  checkAnswers(): void {
    if (this.gameCompleted) return;
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
    this.checkCompletionState();
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