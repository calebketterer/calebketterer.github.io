export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type GameState = 'TITLE' | 'MENU' | 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Coord {
  x: number;
  y: number;
}

export interface DifficultyConfig {
  level: number;
  label: string;
  interval: number;
  multiplier: number;
}