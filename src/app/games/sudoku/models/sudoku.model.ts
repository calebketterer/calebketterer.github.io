export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Cell {
  row: number;
  col: number;
  value: number; // 0 for empty, 1-9 for filled
  solution: number;
  initial: boolean;
  selected: boolean;
  error: boolean;
  notes: Set<number>;
}

export type ThemeColorName = 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Indigo' | 'Violet';

export interface ThemeColors {
  name: ThemeColorName;
  primary: string;
  secondary: string;
  glow: string;
}