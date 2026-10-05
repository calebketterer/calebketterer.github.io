export type FeatureCategory = 'font' | 'color' | 'motion' | 'misc' | 'stroke';

export interface LetterState {
  char: string;
  index: number;
  totalLetters: number;
  x: number;
  y: number;
  width: number;
  fontSize: number;
  opacity: number;
  strokeWidth: number;
  strokeColor?: string;
  strokeOffsetX?: number;
  strokeOffsetY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  offsetY: number;
  scaleX: number;
  scaleY: number;
  colorGradient: 'angular' | 'verticalOcean' | 'goldMonochrome';
}

export interface TitleFeatureContext {
  ctx: CanvasRenderingContext2D;
  letter: LetterState;
  frame: number;
  intensity: number;
  canvasWidth: number;
  canvasHeight: number;
}

export type TitleFeatureHandler = (context: TitleFeatureContext) => void;

export interface TitleFeatureConfig {
  id: string;
  name: string;
  handler: TitleFeatureHandler;
}

export interface CategorizedFeatureConfig extends TitleFeatureConfig {
  category: FeatureCategory;
}