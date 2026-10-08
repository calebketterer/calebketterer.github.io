import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DiepPageComponent } from './pages/diep/diep-page.component';
import { SnakePageComponent } from './pages/snake/snake-page.component';
import { SudokuPageComponent } from './pages/sudoku/sudoku-page.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'diep', component: DiepPageComponent },
  { path: 'snake', component: SnakePageComponent },
  { path: 'sudoku', component: SudokuPageComponent },
  { path: '**', redirectTo: 'home' }
];