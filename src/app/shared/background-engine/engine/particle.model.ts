// TypeScript interfaces defining individual particle properties, planet structures, moons, and engine configurations.
export interface Particle {
  id: number;
  x: number;
  y: number;
  z: number; // 1 = background, 2 = midground, 3 = foreground/glowing
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
  lifespan: number;
  stuckStartTime?: number;
  interactionCooldown?: number;
  activePlanetInteraction?: {
    planetId: number;
    behavior: 'bounce' | 'behind' | 'over' | 'tangential';
  };
}

export interface Moon {
  id: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitRotation: number;
  angle: number;
  speed: number;
  radius: number;
  x: number;
  y: number;
}

export interface Planet {
  id: number;
  orbitRadiusX: number;
  orbitRadiusY: number;
  orbitRotation: number;
  angle: number;
  speed: number;
  radius: number;
  mass: number;
  color: string;
  moons: Moon[];
  x: number;
  y: number;
  lastExplosionTime: number;
  cooldownMs: number;
  particleThreshold: number;
  isExplosionDelayed: boolean;
  explosionDelayTimer: number;
}

export interface EngineConfig {
  maxParticles: number;
  spawnRateMs: number;
  minLifespanMs: number;
  maxLifespanMs: number;
  baseSpeed: number;
  gridSize: number;
  mouseGravityRadius: number;
  planetCount: number;
}