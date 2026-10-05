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
  private clickRippleX = -9999;
  private clickRippleY = -9999;
  private clickRippleRadius = 0;
  private isRippling = false;

  private colorCycle = 0;
  private lastSpawnTime = 0;

  private readonly config: EngineConfig = {
    maxParticles: 200, // Hard cap enforced
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

    // Initial seed: ensure 3-5 particles exist immediately at launch
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

  public updateMousePosition(x: number, y: number, isActive = true): void {
    this.mouseX = x;
    this.mouseY = y;
    this.isMouseActive = isActive;
  }

  public clearMousePosition(): void {
    this.isMouseActive = false;
    this.mouseX = -9999;
    this.mouseY = -9999;
  }

  public triggerClickInteraction(x: number, y: number): void {
    this.clickRippleX = x;
    this.clickRippleY = y;
    this.clickRippleRadius = 10;
    this.isRippling = true;

    for (const p of this.particles) {
      const dx = p.x - x;
      const dy = p.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 250) {
        p.isBlinking = true;
        p.blinkDuration = 30;
        const force = (250 - dist) / 250;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * 5;
        p.vy += Math.sin(angle) * force * 5;
      }
    }
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

    // Guaranteed spawning rate: Spawns new particle every 100-300ms until population is established
    if (now - this.lastSpawnTime > 150 / this.speedMultiplier) {
      if (this.particles.length < this.config.maxParticles) {
        this.spawnParticle();
        this.lastSpawnTime = now;
      }
    }

    // Ripple expansion
    if (this.isRippling) {
      this.clickRippleRadius += 8 * this.speedMultiplier;
      if (this.clickRippleRadius > 350) {
        this.isRippling = false;
      }
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const age = now - p.createdAt;

      // Check Lifespan Expiration (5 to 60 seconds)
      if (age >= p.lifespan && p.fadeState !== 'out') {
        p.fadeState = 'out';
      }

      // Fade management
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

      // Orbital motion
      p.orbitalAngle += p.orbitalSpeed * 0.01 * this.speedMultiplier;
      const targetX = this.isMouseActive ? this.mouseX : centerX;
      const targetY = this.isMouseActive ? this.mouseY : centerY;

      const dxTarget = targetX - p.x;
      const dyTarget = targetY - p.y;
      const distTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);

      // Mouse gravity attraction
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

      // Pack / Cluster coherence
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

      // Velocity damping
      p.vx *= 0.98;
      p.vy *= 0.98;

      // Position update
      p.x += p.vx * this.speedMultiplier;
      p.y += p.vy * this.speedMultiplier;

      // Blink handling
      if (p.isBlinking) {
        p.blinkDuration--;
        if (p.blinkDuration <= 0) {
          p.isBlinking = false;
        }
      }

      // Offscreen despawn check
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
    // Enforce FIFO hard cap of 200 particles: oldest particle forced to fade out
    if (this.particles.length >= this.config.maxParticles) {
      const oldest = this.particles.find(p => p.fadeState !== 'out');
      if (oldest) {
        oldest.fadeState = 'out';
        oldest.fadeSpeed = 0.05; // Fast fade out to clear capacity
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

    // Random lifespan between 5,000ms (5s) and 60,000ms (60s)
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

// DEBUG OVERLAY: Visual sanity check
  this.ctx.fillStyle = '#00e5ff';
  this.ctx.font = '16px monospace';
  this.ctx.fillText(`Active Particles: ${this.particles.length}`, 20, 30);
  this.ctx.fillRect(20, 40, 20, 20); // Bright test square

    if (this.isRippling) {
      this.ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - this.clickRippleRadius / 350)})`;
      this.ctx.lineWidth = 1.5;
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