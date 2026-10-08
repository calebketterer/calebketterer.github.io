import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameViewportComponent } from '../../shared/components/game-viewport/game-viewport.component';
import { GameLogsComponent, LogMetaItem, LogSection } from '../../shared/components/game-logs/game-logs.component';
import { SudokuComponent } from '../../games/sudoku/sudoku.component';

@Component({
  selector: 'app-sudoku-page',
  standalone: true,
  imports: [CommonModule, GameViewportComponent, GameLogsComponent, SudokuComponent],
  templateUrl: './sudoku-page.component.html',
  styleUrls: ['./sudoku-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SudokuPageComponent {
  public breadcrumbs: string[] = ['COMPENDIUM', 'PUZZLES', 'LATIN_SQUARE_SOLVER.LOG'];
  public title: string = 'SUDOKU ENGINE // NUMERICAL DEDUCTION';

  public metaItems: LogMetaItem[] = [
    { label: 'PROJECT INITIATION', value: 'JANUARY 20, 2026' },
    { label: 'MATRIX STRUCTURE', value: '9x9 NONET GRID' },
    { label: 'VALIDATION ENGINE', value: 'BACKTRACKING SOLVER' },
    { label: 'RECOMMENDED PLATFORM', value: 'DESKTOP BROWSER', statusClass: 'status-blue' },
    { label: 'INTEGRITY STATE', value: 'READY', statusClass: 'status-green' }
  ];

  public sections: LogSection[] = [
    {
      heading: 'EXECUTIVE SUMMARY',
      content: 'A numerical constraint-satisfaction puzzle interface. Operators must populate a 9x9 grid with digits 1 through 9 such that every individual row, column, and 3x3 nonet sub-grid contains all numerical values without duplicate entries.'
    },
    {
      heading: 'ALGORITHMIC FOUNDATIONS & GENERATION',
      content: 'Puzzles are generated via deterministic seed algorithms combined with recursive depth-first backtracking solvers. The engine ensures every presented board possesses exactly one unique mathematical solution, providing real-time constraint validation during user input.'
    }
  ];
}