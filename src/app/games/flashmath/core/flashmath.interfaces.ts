export type FlashmathScreenState = 'INIT_FADE_IN' | 'TITLE_DISPLAY' | 'TITLE_FADE_OUT' | 'BLACK_TRANSITION' | 'MENU' | 'GAME';

export interface SubjectModule {
  id: string;
  name: string;
  description: string;
  xp: number;
  unlocked: boolean;
}

export interface MathProblem {
  question: string;
  answer: number;
  displayExpression: string;
}