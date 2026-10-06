import { EngineConfig, Particle } from './particle.model';

export class ParticlePhysics {
  public updateParticles(
    particles: Particle[],
    config: EngineConfig,
    speedMultiplier: number,
    width: number,
    height: number,
    isMouseActive: boolean,
    mouseX: number,
    mouseY: number
  ): void {
    const centerX = width / 2;
    const centerY = height / 2;

    for (const p of particles) {
      p.orbitalAngle += p.orbitalSpeed * 0.01 * speedMultiplier;

      const targetX = isMouseActive ? mouseX : centerX;
      const targetY = isMouseActive ? mouseY : centerY;

      const dxTarget = targetX - p.x;
      const dyTarget = targetY - p.y;
      const distTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);

      if (isMouseActive && distTarget < config.mouseGravityRadius && distTarget > 10) {
        const pull = ((config.mouseGravityRadius - distTarget) / config.mouseGravityRadius) * 0.15;
        p.vx += (dxTarget / distTarget) * pull;
        p.vy += (dyTarget / distTarget) * pull;
      } else if (distTarget < 400) {
        const perpX = -dyTarget / distTarget;
        const perpY = dxTarget / distTarget;
        p.vx += perpX * 0.02 * p.orbitalSpeed;
        p.vy += perpY * 0.02 * p.orbitalSpeed;
      }

      if (p.clusterId !== undefined) {
        for (const other of particles) {
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

      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;

      if (p.isBlinking) {
        p.blinkDuration--;
        if (p.blinkDuration <= 0) {
          p.isBlinking = false;
        }
      }
    }
  }

  public applyExplosion(
    particles: Particle[],
    chargeX: number,
    chargeY: number,
    intensity: number
  ): void {
    const blastRadius = 200 * intensity;

    for (const p of particles) {
      const dx = p.x - chargeX;
      const dy = p.y - chargeY;
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
  }
}