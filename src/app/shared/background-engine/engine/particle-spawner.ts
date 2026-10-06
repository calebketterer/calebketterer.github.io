import { EngineConfig, Particle } from './particle.model';

export class ParticleSpawner {
  private nextParticleId = 0;

  private readonly colorPalette = [
    '0, 229, 255',   // Glowing Cyan
    '143, 174, 197', // Slate Blue
    '160, 180, 200', // Cool Gray
    '40, 60, 85',    // Dark Navy
    '20, 30, 45'     // Deep Charcoal / Black
  ];

  public spawn(
    particles: Particle[],
    config: EngineConfig,
    width: number,
    height: number
  ): Particle {
    if (particles.length >= config.maxParticles) {
      const oldest = particles.find(p => p.fadeState !== 'out');
      if (oldest) {
        oldest.fadeState = 'out';
        oldest.fadeSpeed = 0.05;
      }
    }

    const id = ++this.nextParticleId;
    const z = Math.floor(Math.random() * 3) + 1;
    const colorRGB = this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)];
    const baseAlpha = 0.25 + (z / 3) * 0.55;

    const spawnFromCenter = Math.random() < 0.5;
    let x = 0;
    let y = 0;

    if (spawnFromCenter) {
      x = width / 2 + (Math.random() - 0.5) * 150;
      y = height / 2 + (Math.random() - 0.5) * 150;
    } else {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * width; y = -40; }
      else if (edge === 1) { x = width + 40; y = Math.random() * height; }
      else if (edge === 2) { x = Math.random() * width; y = height + 40; }
      else { x = -40; y = Math.random() * height; }
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.3 + Math.random() * 0.7) * z * config.baseSpeed;
    const lifespanRange = Math.max(0, config.maxLifespanMs - config.minLifespanMs);
    const lifespan = config.minLifespanMs + Math.random() * lifespanRange;

    return {
      id,
      x,
      y,
      z,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: z * (1.3 + Math.random() * 1.7),
      color: colorRGB,
      baseAlpha,
      alpha: 0,
      fadeState: 'in',
      fadeSpeed: 0.015 + Math.random() * 0.02,
      clusterId: Math.random() < 0.35 ? Math.floor(Math.random() * 4) : undefined,
      isBlinking: false,
      blinkDuration: 0,
      orbitalAngle: Math.random() * Math.PI * 2,
      orbitalSpeed: (Math.random() - 0.5) * 2,
      createdAt: Date.now(),
      lifespan
    };
  }

  public updateLifecycle(
    particles: Particle[],
    speedMultiplier: number,
    width: number,
    height: number,
    now: number
  ): void {
    const buffer = 100;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.createdAt;

      if (age >= p.lifespan && p.fadeState !== 'out') {
        p.fadeState = 'out';
      }

      if (p.fadeState === 'in') {
        p.alpha += p.fadeSpeed * speedMultiplier;
        if (p.alpha >= p.baseAlpha) {
          p.alpha = p.baseAlpha;
          p.fadeState = 'active';
        }
      } else if (p.fadeState === 'out') {
        p.alpha -= p.fadeSpeed * speedMultiplier;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
      }

      if (
        p.x < -buffer ||
        p.x > width + buffer ||
        p.y < -buffer ||
        p.y > height + buffer
      ) {
        particles.splice(i, 1);
      }
    }
  }
}