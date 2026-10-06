import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiepComponent } from './games/diep/diep.component';
import { SnakeComponent } from './games/snake/snake.component';
import { SudokuComponent } from './games/sudoku/sudoku.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'diep', component: DiepComponent },
  { path: 'snake', component: SnakeComponent },
  { path: 'sudoku', component: SudokuComponent },
  { path: '**', redirectTo: 'home' }
];