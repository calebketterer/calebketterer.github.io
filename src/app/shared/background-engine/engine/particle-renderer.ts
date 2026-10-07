import { EngineConfig, Particle } from './particle.model';

export class ParticleRenderer {
  public drawBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colorCycle: number
  ): void {
    const bgBlue = Math.floor(18 + Math.sin(colorCycle) * 6);
    const bgDark = Math.floor(10 + Math.cos(colorCycle) * 4);
    ctx.fillStyle = `rgb(${bgDark}, ${bgBlue}, ${bgBlue + 12})`;
    ctx.fillRect(0, 0, width, height);
  }

  public drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    gridSize: number
  ): void {
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  public drawDebugOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.font = '10px "Courier New", Courier, monospace';
    ctx.fillStyle = '#8faec5';
    ctx.fillText('Simulation version no: 2026.10.07', 20, 32);

    ctx.fillStyle = '#00e5ff';
    ctx.fillRect(20, 40, 16, 16);
  }

  public drawChargeAura(
    ctx: CanvasRenderingContext2D,
    chargeX: number,
    chargeY: number,
    chargeStartTime: number
  ): void {
    const duration = Math.min(2500, Date.now() - chargeStartTime);
    const radius = 15 + (duration / 2500) * 45;
    const grad = ctx.createRadialGradient(chargeX, chargeY, 0, chargeX, chargeY, radius);
    grad.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
    grad.addColorStop(1, 'rgba(0, 229, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(chargeX, chargeY, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  public drawRipple(
    ctx: CanvasRenderingContext2D,
    rippleX: number,
    rippleY: number,
    rippleRadius: number
  ): void {
    ctx.strokeStyle = `rgba(0, 229, 255, ${Math.max(0, 1 - rippleRadius / 400)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rippleX, rippleY, rippleRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  public drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    for (const p of particles) {
      const renderAlpha = p.isBlinking
        ? Math.min(1, p.alpha * 2.5)
        : Math.max(0, p.alpha);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

      if (p.z === 3) {
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        grad.addColorStop(0, `rgba(${p.color}, ${renderAlpha})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      } else {
        ctx.fillStyle = `rgba(${p.color}, ${renderAlpha})`;
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}