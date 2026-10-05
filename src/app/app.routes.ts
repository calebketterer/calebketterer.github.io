import { Routes } from '@angular/router';
import { DiepComponent } from './games/diep/diep.component';
import { SnakeComponent } from './games/snake/snake.component';
import { SudokuComponent } from './games/sudoku/sudoku.component';

export const routes: Routes = [
  { path: '', redirectTo: 'diep', pathMatch: 'full' },
  { path: 'diep', component: DiepComponent },
  { path: 'snake', component: SnakeComponent },
  { path: 'sudoku', component: SudokuComponent },
  { path: '**', redirectTo: '' }
];