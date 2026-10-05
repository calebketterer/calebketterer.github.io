import { EngineConfig, Particle } from './particle.model';

export class ParticleSystem {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private particles: Particle[] = [];

  private width = 0;
  private height = 0;
  private isPaused = false;
  private speedMultiplier = 1.0;
  private nextParticleId = 0;

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
    baseSpeed: 0.6,
    gridSize: 60,
    mouseGravityRadius: 220
  };

  private readonly colorPalette = [
    '0, 229, 255',   // Glowing Cyan
    '143, 174, 197', // Slate Blue
    '160, 180, 200', // Cool Gray
    '40, 60, 85',    // Dark Navy
    '20, 30, 45'     // Deep Charcoal / Black
  ];

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
    // Clamp cap strictly between 10 and 1000
    this.config.maxParticles = Math.max(10, Math.min(1000, cap));

    // Despawn excess particles if cap was lowered below active count
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
    const intensity = 1 + (duration / 2500) * 4; // Force multiplier scaling up to 5x

    this.clickRippleX = this.chargeX;
    this.clickRippleY = this.chargeY;
    this.clickRippleRadius = 10;
    this.isRippling = true;

    const blastRadius = 200 * intensity;

    for (const p of this.particles) {
      const dx = p.x - this.chargeX;
      const dy = p.y - this.chargeY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < blastRadius) {
        p.isBlinking = true;
        p.blinkDuration = Math.floor(20 * intensity);
        const force = ((blastRadius - dist) / blastRadius) * 6 * intensity;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
      }
    }

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

    if (now - this.lastSpawnTime > 150 / this.speedMultiplier) {
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

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const age = now - p.createdAt;

      if (age >= p.lifespan && p.fadeState !== 'out') {
        p.fadeState = 'out';
      }

      if (p.fadeState === 'in') {
        p.alpha += p.fadeSpeed * this.speedMultiplier;
        if (p.alpha >= p.baseAlpha) {
          p.alpha = p.baseAlpha;
          p.fadeState = 'active';
        }
      } else if (p.fadeState === 'out') {
        p.alpha -= p.fadeSpeed * this.speedMultiplier;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }
      }

      p.orbitalAngle += p.orbitalSpeed * 0.01 * this.speedMultiplier;
      const targetX = this.isMouseActive ? this.mouseX : centerX;
      const targetY = this.isMouseActive ? this.mouseY : centerY;

      const dxTarget = targetX - p.x;
      const dyTarget = targetY - p.y;
      const distTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);

      if (this.isMouseActive && distTarget < this.config.mouseGravityRadius && distTarget > 10) {
        const pull = ((this.config.mouseGravityRadius - distTarget) / this.config.mouseGravityRadius) * 0.15;
        p.vx += (dxTarget / distTarget) * pull;
        p.vy += (dyTarget / distTarget) * pull;
      } else if (distTarget < 400) {
        const perpX = -dyTarget / distTarget;
        const perpY = dxTarget / distTarget;
        p.vx += perpX * 0.02 * p.orbitalSpeed;
        p.vy += perpY * 0.02 * p.orbitalSpeed;
      }

      if (p.clusterId !== undefined) {
        for (const other of this.particles) {
          if (other.clusterId === p.clusterId && other.id !== p.id) {
            const cdx = other.x - p.x;
            const cdy = other.y - p.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < 150 && cdist > 20) {
              p.vx += (cdx / cdist) * 0.01;
              p.vy += (cdy / cdist) * 0.01;
            }
          }
        }
      }

      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx * this.speedMultiplier;
      p.y += p.vy * this.speedMultiplier;

      if (p.isBlinking) {
        p.blinkDuration--;
        if (p.blinkDuration <= 0) {
          p.isBlinking = false;
        }
      }

      const buffer = 100;
      if (
        p.x < -buffer ||
        p.x > this.width + buffer ||
        p.y < -buffer ||
        p.y > this.height + buffer
      ) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnParticle(): void {
    if (this.particles.length >= this.config.maxParticles) {
      const oldest = this.particles.find(p => p.fadeState !== 'out');
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
      x = this.width / 2 + (Math.random() - 0.5) * 150;
      y = this.height / 2 + (Math.random() - 0.5) * 150;
    } else {
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * this.width; y = -40; }
      else if (edge === 1) { x = this.width + 40; y = Math.random() * this.height; }
      else if (edge === 2) { x = Math.random() * this.width; y = this.height + 40; }
      else { x = -40; y = Math.random() * this.height; }
    }

    const angle = Math.random() * Math.PI * 2;
    const speed = (0.3 + Math.random() * 0.7) * z * this.config.baseSpeed;
    const lifespan = 5000 + Math.random() * 55000;

    this.particles.push({
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
    });
  }

  private draw(): void {
    const bgBlue = Math.floor(18 + Math.sin(this.colorCycle) * 6);
    const bgDark = Math.floor(10 + Math.cos(this.colorCycle) * 4);
    this.ctx.fillStyle = `rgb(${bgDark}, ${bgBlue}, ${bgBlue + 12})`;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.drawGrid();

    // Nostalgic Blue Debug Square
    this.ctx.fillStyle = '#00e5ff';
    this.ctx.fillRect(20, 40, 16, 16);

    // Charge explosion aura preview
    if (this.isChargeHolding) {
      const duration = Math.min(2500, Date.now() - this.chargeStartTime);
      const radius = 15 + (duration / 2500) * 45;
      const grad = this.ctx.createRadialGradient(this.chargeX, this.chargeY, 0, this.chargeX, this.chargeY, radius);
      grad.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
      grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(this.chargeX, this.chargeY, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (this.isRippling) {
      this.ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - this.clickRippleRadius / 400)})`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.clickRippleX, this.clickRippleY, this.clickRippleRadius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    for (const p of this.particles) {
      const renderAlpha = p.isBlinking
        ? Math.min(1, p.alpha * 2.5)
        : Math.max(0, p.alpha);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (p.z === 3) {
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        grad.addColorStop(0, `rgba(${p.color}, ${renderAlpha})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        this.ctx.fillStyle = grad;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      } else {
        this.ctx.fillStyle = `rgba(${p.color}, ${renderAlpha})`;
        this.ctx.shadowBlur = 0;
      }

      this.ctx.fill();
    }
    this.ctx.shadowBlur = 0;
  }

  private drawGrid(): void {
    const size = this.config.gridSize;
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.width; x += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.height; y += size) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}