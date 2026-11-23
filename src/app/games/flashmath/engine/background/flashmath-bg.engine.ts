import { MathBgMode, BgParticle } from './flashmath-bg.interfaces';
import { FLASHMATH_CONFIG } from '../../core/flashmath.constants';

export class FlashmathBgEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private particles: BgParticle[] = [];
  private mode: MathBgMode = 'MATRIX_NUMBERS';
  private width: number = 0;
  private height: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    this.initParticles();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  setMode(mode: MathBgMode) {
    this.mode = mode;
    this.initParticles();
  }

  private initParticles() {
    this.particles = [];
    const count = this.mode === 'MATRIX_NUMBERS' ? 60 : 40;
    const colors = [
      FLASHMATH_CONFIG.COLORS.primary,
      FLASHMATH_CONFIG.COLORS.secondary,
      FLASHMATH_CONFIG.COLORS.accent,
      FLASHMATH_CONFIG.COLORS.warning
    ];

    for (let i = 0; i < count; i++) {
      const mathChars = ['+', '-', '×', '÷', '∑', '∫', 'π', '√', '0', '1', '9', 'Δ', 'θ'];
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: this.mode === 'MATRIX_NUMBERS' ? (Math.random() * 1.5 + 0.5) : (Math.random() - 0.5) * 0.8,
        size: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2,
        char: mathChars[Math.floor(Math.random() * mathChars.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02
      });
    }
  }

  start() {
    const render = () => {
      this.update();
      this.draw();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private update() {
    for (let p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot;
      }

      // Wrap around screen boundaries
      if (p.y > this.height + 20) p.y = -20;
      if (p.y < -20) p.y = this.height + 20;
      if (p.x > this.width + 20) p.x = -20;
      if (p.x < -20) p.x = this.width + 20;
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw grid lines for scifi atmosphere
    this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
    this.ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < this.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Render particles based on active animation mode
    if (this.mode === 'MATRIX_NUMBERS') {
      this.ctx.font = '14px monospace';
      for (let p of this.particles) {
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.fillText(p.char || '0', p.x, p.y);
      }
    } else if (this.mode === 'VECTOR_GRID') {
      for (let p of this.particles) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation || 0);
        this.ctx.strokeStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(-p.size/2, -p.size/2, p.size, p.size);
        this.ctx.restore();
      }
    } else if (this.mode === 'GEOMETRIC_NODES') {
      for (let i = 0; i < this.particles.length; i++) {
        let p = this.particles[i];
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.alpha;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size / 4, 0, Math.PI * 2);
        this.ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < this.particles.length; j++) {
          let p2 = this.particles[j];
          let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120) {
            this.ctx.strokeStyle = p.color;
            this.ctx.globalAlpha = (1 - dist / 120) * 0.2;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();
          }
        }
      }
    }
    this.ctx.globalAlpha = 1.0;
    this.ctx.shadowBlur = 0;
  }
}