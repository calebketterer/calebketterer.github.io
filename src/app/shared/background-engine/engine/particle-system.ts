import { EngineConfig, Particle } from './particle.model';
import { ParticleSpawner } from './particle-spawner';
import { ParticlePhysics } from './particle-physics';
import { ParticleRenderer } from './particle-renderer';

export class ParticleSystem {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];

  private spawner = new ParticleSpawner();
  private physics = new ParticlePhysics();
  private renderer = new ParticleRenderer();

  private width = 0;
  private height = 0;
  private isPaused = false;
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
    mouseGravityRadius: 220
  };

  public init(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) return;
    this.ctx = context;

    this.resize();

    const initialCount = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < initialCount; i++) {
      this.spawnParticle();
    }

    this.startLoop();
  }

  public resize(): void {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
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

    this.physics.applyExplosion(this.particles, this.chargeX, this.chargeY, intensity);

    this.isChargeHolding = false;
  }

  public togglePlay(): boolean {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
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
    if (this.isPaused) return;

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
      this.clickRippleRadius += 10 * this.speedMultiplier;
      if (this.clickRippleRadius > 400) {
        this.isRippling = false;
      }
    }

    this.spawner.updateLifecycle(this.particles, this.speedMultiplier, this.width, this.height, now);

    this.physics.updateParticles(
      this.particles,
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

    if (this.isChargeHolding) {
      this.renderer.drawChargeAura(this.ctx, this.chargeX, this.chargeY, this.chargeStartTime);
    }

    if (this.isRippling) {
      this.renderer.drawRipple(this.ctx, this.clickRippleX, this.clickRippleY, this.clickRippleRadius);
    }

    this.renderer.drawParticles(this.ctx, this.particles);
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}