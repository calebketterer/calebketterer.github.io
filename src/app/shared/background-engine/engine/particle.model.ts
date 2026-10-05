export interface Particle {
  id: number;
  x: number;
  y: number;
  z: number; // 1 = background/small, 2 = midground, 3 = foreground/glowing
  vx: number;
  vy: number;
  radius: number;
  color: string;
  baseAlpha: number;
  alpha: number;
  fadeState: 'in' | 'active' | 'out';
  fadeSpeed: number;
  clusterId?: number;
  isBlinking: boolean;
  blinkDuration: number;
  orbitalAngle: number;
  orbitalSpeed: number;
  createdAt: number;
  lifespan: number; // Lifespan in milliseconds (5,000 - 60,000 ms)
}

export interface EngineConfig {
  maxParticles: number;
  baseSpeed: number;
  gridSize: number;
  mouseGravityRadius: number;
}