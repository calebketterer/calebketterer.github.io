// Core particle system manager coordinating animation loops, mouse interactions, physics, rendering, and independent speed-corrected ripple animations.
import { EngineConfig, Particle, Planet } from './particle.model';
import { ParticleSpawner } from './particle-spawner';
import { ParticlePhysics } from './particle-physics';
import { ParticleRenderer } from './particle-renderer';
import { ParticlePlanets } from './particle-planets';

export class ParticleSystem {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];
  private planets: Planet[] = [];

  private spawner = new ParticleSpawner();
  private physics = new ParticlePhysics();
  private renderer = new ParticleRenderer();
  private planetManager = new ParticlePlanets();

  private width = 0;
  private height = 0;
  private isPaused = false;
  private isWindowHidden = false;
  private speedMultiplier = 1.0;

  private mouseX = -9999;
  private mouseY = -9999;
  private isMouseActive = false;

  private isChargeHolding = false;
  private chargeStartTime = 0;
  private chargeX = -9999;
  private chargeY = -9999;

  private clickRippleX = -9999;
  private clickRippleY = -9999;
  private clickRippleRadius = 0;
  private isRippling = false;

  private colorCycle = 0;
  private lastSpawnTime = 0;

  private config: EngineConfig = {
    maxParticles: 200,
    spawnRateMs: 150,
    minLifespanMs: 5000,
    maxLifespanMs: 60000,
    baseSpeed: 0.6,
    gridSize: 60,
    mouseGravityRadius: 220,
    planetCount: 3
  };

  private handleVisibilityChange = (): void => {
    if (typeof document !== 'undefined') {
      this.isWindowHidden = document.hidden;
      if (this.isWindowHidden) {
        if (this.animationFrameId !== null) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = null;
        }
      } else if (!this.isPaused) {
        this.startLoop();
      }
    }
  };

  public init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;

    this.resize(true);

    const initialCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < initialCount; i++) {
      this.spawnParticle();
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    this.startLoop();
  }

  public resize(force = false): void {
    if (!this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const displayWidth = rect.width ? Math.round(rect.width) : window.innerWidth;
    const displayHeight = rect.height ? Math.round(rect.height) : window.innerHeight;

    const widthChanged = Math.abs(displayWidth - this.width) > 1;
    const heightChanged = Math.abs(displayHeight - this.height) > 1;

    if (!force && !widthChanged && !heightChanged && this.width > 0 && this.height > 0) {
      return;
    }

    this.width = displayWidth;
    this.height = displayHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.planets = this.planetManager.generatePlanets(this.config.planetCount, this.width, this.height);
  }

  public getActiveParticleCount(): number {
    return this.particles.filter(p => p.fadeState !== 'out').length;
  }

  public getMaxParticles(): number {
    return this.config.maxParticles;
  }

  public setMaxParticles(cap: number): void {
    this.config.maxParticles = Math.max(10, Math.min(1000, cap));

    while (this.getActiveParticleCount() > this.config.maxParticles) {
      const oldest = this.particles.find(p => p.fadeState !== 'out');
      if (oldest) {
        oldest.fadeState = 'out';
        oldest.fadeSpeed = 0.08;
      } else {
        break;
      }
    }
  }

  public getSpawnRateMs(): number {
    return this.config.spawnRateMs;
  }

  public setSpawnRateMs(ms: number): void {
    this.config.spawnRateMs = Math.max(10, Math.min(5000, ms));
  }

  public getMinLifespanMs(): number {
    return this.config.minLifespanMs;
  }

  public setMinLifespanMs(ms: number): void {
    const clampedMin = Math.max(0, Math.min(120000, ms));
    this.config.minLifespanMs = clampedMin;
    if (this.config.maxLifespanMs < clampedMin) {
      this.config.maxLifespanMs = clampedMin;
    }
  }

  public getMaxLifespanMs(): number {
    return this.config.maxLifespanMs;
  }

  public setMaxLifespanMs(ms: number): void {
    const clampedMax = Math.max(this.config.minLifespanMs, Math.min(120000, ms));
    this.config.maxLifespanMs = clampedMax;
  }

  public updateMousePosition(x: number, y: number, isActive = true): void {
    this.mouseX = x;
    this.mouseY = y;
    this.isMouseActive = isActive;

    if (this.isChargeHolding) {
      this.chargeX = x;
      this.chargeY = y;
    }
  }

  public clearMousePosition(): void {
    this.isMouseActive = false;
    this.mouseX = -9999;
    this.mouseY = -9999;
    this.releaseChargeExplosion();
  }

  public startCharge(x: number, y: number): void {
    this.isChargeHolding = true;
    this.chargeStartTime = Date.now();
    this.chargeX = x;
    this.chargeY = y;
  }

  public releaseChargeExplosion(): void {
    if (!this.isChargeHolding) return;

    const duration = Math.min(2500, Date.now() - this.chargeStartTime);
    const intensity = 1 + (duration / 2500) * 4;

    this.clickRippleX = this.chargeX;
    this.clickRippleY = this.chargeY;
    this.clickRippleRadius = 10;
    this.isRippling = true;

    this.physics.applyExplosion(this.particles, this.chargeX, this.chargeY, intensity, this.speedMultiplier);

    this.isChargeHolding = false;
  }

  public togglePlay(): boolean {
    this.isPaused = !this.isPaused;
    if (!this.isPaused && !this.isWindowHidden) {
      this.startLoop();
    } else if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    return !this.isPaused;
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  private startLoop = (): void => {
    if (this.isPaused || this.isWindowHidden) return;

    this.update();
    this.draw();
    this.animationFrameId = requestAnimationFrame(this.startLoop);
  };

  private update(): void {
    const now = Date.now();
    this.colorCycle += 0.001 * this.speedMultiplier;

    if (now - this.lastSpawnTime > this.config.spawnRateMs / this.speedMultiplier) {
      if (this.particles.length < this.config.maxParticles) {
        this.spawnParticle();
        this.lastSpawnTime = now;
      }
    }

    if (this.isRippling) {
      this.clickRippleRadius += (10 / Math.max(1, this.speedMultiplier)) * this.speedMultiplier;
      if (this.clickRippleRadius > 400) {
        this.isRippling = false;
      }
    }

    this.planetManager.updatePlanets(this.planets, this.width, this.height, this.speedMultiplier);
    this.spawner.updateLifecycle(this.particles, this.speedMultiplier, this.width, this.height, now);

    this.physics.updateParticles(
      this.particles,
      this.planets,
      this.config,
      this.speedMultiplier,
      this.width,
      this.height,
      this.isMouseActive,
      this.mouseX,
      this.mouseY
    );
  }

  private spawnParticle(): void {
    const particle = this.spawner.spawn(this.particles, this.config, this.width, this.height);
    this.particles.push(particle);
  }

  private draw(): void {
    this.renderer.drawBackground(this.ctx, this.width, this.height, this.colorCycle);
    this.renderer.drawGrid(this.ctx, this.width, this.height, this.config.gridSize);
    this.renderer.drawDebugOverlay(this.ctx);
    this.renderer.drawOrbitPaths(this.ctx, this.planets, this.width, this.height);

    this.renderer.drawBackgroundParticles(this.ctx, this.particles);
    this.renderer.drawPlanets(this.ctx, this.planets);
    this.renderer.drawForegroundParticles(this.ctx, this.particles);

    if (this.isChargeHolding) {
      this.renderer.drawChargeAura(this.ctx, this.chargeX, this.chargeY, this.chargeStartTime);
    }

    if (this.isRippling) {
      this.renderer.drawRipple(this.ctx, this.clickRippleX, this.clickRippleY, this.clickRippleRadius);
    }
  }

  public destroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}