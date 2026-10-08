import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiepPageComponent } from './pages/diep/diep-page.component';
import { SnakeComponent } from './games/snake/snake.component';
import { SudokuComponent } from './games/sudoku/sudoku.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'diep', component: DiepPageComponent },
  { path: 'snake', component: SnakeComponent },
  { path: 'sudoku', component: SudokuComponent },
  { path: '**', redirectTo: 'home' }
];