export type FlashmathScreenState = 'INIT_FADE_IN' | 'TITLE_DISPLAY' | 'TITLE_FADE_OUT' | 'BLACK_TRANSITION' | 'MENU' | 'GAME';

export type AstOp = 'VAL' | 'VAR' | '+' | '-' | '*' | '/' | 'power' | 'root' | 'frac_exp';

export interface AstGeneratorConfig {
  ops: AstOp[];
  minSteps?: number;
  maxSteps: number;
  maxPowerValue?: number; // e.g., 225 (15^2) for Exponents & Roots drill, 144 (12^2) elsewhere
}

export interface SubjectModule {
  id: string;
  name: string;
  description: string;
  xp: number;
  unlocked: boolean;
  subtopics?: SubjectModule[];
  generatorConfig?: AstGeneratorConfig;
}

export interface MathProblem {
  question: string;
  answer: number;
  displayExpression: string;
}

export interface FlashmathThemeColors {
  primary: string;   // Hacker Neon Green
  secondary: string; // Tron Cyan
  accent: string;    // Cyberpunk Magenta
  warning: string;   // Amber / Gold
  [key: string]: string;
}