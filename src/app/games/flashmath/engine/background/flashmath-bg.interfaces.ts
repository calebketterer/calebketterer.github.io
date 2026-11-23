export type MathBgMode = 'MATRIX_NUMBERS' | 'VECTOR_GRID' | 'GEOMETRIC_NODES';

export interface BgParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  char?: string;       // Used for matrix numbers mode
  rotation?: number;
  vRot?: number;
}