// Physics engine class optimized for 1000+ particles with squared math, multi-planet competition, and reverted original click explosion pacing.
import { EngineConfig, Particle, Planet } from './particle.model';

export class ParticlePhysics {
  // ==========================================
  // MANUAL EXPLOSION STRENGTH ADJUSTMENT AREA
  // ==========================================
  private readonly clickExplosionPower = 6.0;

  public updateParticles(
    particles: Particle[],
    planets: Planet[],
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
    const now = Date.now();
    const effectiveSpeedDiv = Math.max(1, speedMultiplier);

    for (let i = 0, len = particles.length; i < len; i++) {
      const p = particles[i];

      p.orbitalAngle += p.orbitalSpeed * 0.01 * speedMultiplier;

      if (p.interactionCooldown && p.interactionCooldown > 0) {
        p.interactionCooldown -= speedMultiplier;
      }

      const targetX = isMouseActive ? mouseX : centerX;
      const targetY = isMouseActive ? mouseY : centerY;

      const dxTarget = targetX - p.x;
      const dyTarget = targetY - p.y;
      const distTargetSq = dxTarget * dxTarget + dyTarget * dyTarget;

      if (isMouseActive && distTargetSq < config.mouseGravityRadius * config.mouseGravityRadius && distTargetSq > 100) {
        const distTarget = Math.sqrt(distTargetSq);
        const pull = ((config.mouseGravityRadius - distTarget) / config.mouseGravityRadius) * 0.15;
        p.vx += (dxTarget / distTarget) * pull;
        p.vy += (dyTarget / distTarget) * pull;
      } else if (distTargetSq < 160000) {
        const distTarget = Math.sqrt(distTargetSq);
        const perpX = -dyTarget / distTarget;
        const perpY = dxTarget / distTarget;
        p.vx += perpX * 0.01 * p.orbitalSpeed;
        p.vy += perpY * 0.01 * p.orbitalSpeed;
      }

      let closestPlanet: Planet | null = null;
      let minPlanetDistSq = Infinity;

      for (let j = 0, pLen = planets.length; j < pLen; j++) {
        const planet = planets[j];
        const dx = planet.x - p.x;
        const dy = planet.y - p.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < minPlanetDistSq) {
          minPlanetDistSq = distSq;
          closestPlanet = planet;
        }
      }

      let inAnyPlanetZone = false;

      if (closestPlanet && (!p.interactionCooldown || p.interactionCooldown <= 0)) {
        const dxPlanet = closestPlanet.x - p.x;
        const dyPlanet = closestPlanet.y - p.y;
        const distPlanetSq = minPlanetDistSq;
        
        const enterRadius = closestPlanet.radius * 4.5;
        const exitRadius = closestPlanet.radius * 5.8;

        const isCurrentlyInside = p.activePlanetInteraction && p.activePlanetInteraction.planetId === closestPlanet.id;
        const thresholdSq = isCurrentlyInside ? exitRadius * exitRadius : enterRadius * enterRadius;

        if (distPlanetSq < thresholdSq) {
          inAnyPlanetZone = true;
          const distPlanet = Math.sqrt(distPlanetSq) || 1;

          if (!isCurrentlyInside) {
            const rand = Math.random();
            const behavior: 'bounce' | 'behind' | 'over' | 'tangential' =
              rand < 0.25 ? 'bounce' : rand < 0.50 ? 'behind' : rand < 0.75 ? 'over' : 'tangential';
            p.activePlanetInteraction = { planetId: closestPlanet.id, behavior };
          }

          const behavior = p.activePlanetInteraction!.behavior;
          const pullFactor = (enterRadius - distPlanet) / enterRadius;
          const perpX = -dyPlanet / distPlanet;
          const perpY = dxPlanet / distPlanet;

          if (behavior === 'bounce') {
            if (distPlanet < closestPlanet.radius + 6) {
              const nx = dxPlanet / distPlanet;
              const ny = dyPlanet / distPlanet;
              p.vx = -nx * (4.0 + Math.random() * 2.0) / effectiveSpeedDiv;
              p.vy = -ny * (4.0 + Math.random() * 2.0) / effectiveSpeedDiv;
              p.activePlanetInteraction = undefined;
              p.interactionCooldown = 40;
            } else {
              p.vx += ((dxPlanet / distPlanet) * 0.08) / effectiveSpeedDiv;
              p.vy += ((dyPlanet / distPlanet) * 0.08) / effectiveSpeedDiv;
            }
          } else if (behavior === 'behind' || behavior === 'over') {
            p.vx += ((dxPlanet / distPlanet) * 0.12) / effectiveSpeedDiv;
            p.vy += ((dyPlanet / distPlanet) * 0.12) / effectiveSpeedDiv;
          } else {
            p.vx += (((dxPlanet / distPlanet) * 0.06) + (perpX * 0.05)) / effectiveSpeedDiv;
            p.vy += (((dyPlanet / distPlanet) * 0.06) + (perpY * 0.05)) / effectiveSpeedDiv;
          }
        }
      }

      // Moons gravity check
      for (let j = 0, pLen = planets.length; j < pLen; j++) {
        const planet = planets[j];
        for (let m = 0, mLen = planet.moons.length; m < mLen; m++) {
          const moon = planet.moons[m];
          const dxMoon = moon.x - p.x;
          const dyMoon = moon.y - p.y;
          const distMoonSq = dxMoon * dxMoon + dyMoon * dyMoon;
          const moonGravityRadius = moon.radius * 4;

          if (distMoonSq < moonGravityRadius * moonGravityRadius && distMoonSq > moon.radius * moon.radius) {
            const distMoon = Math.sqrt(distMoonSq) || 1;
            const moonPull = ((moonGravityRadius - distMoon) / moonGravityRadius) * 0.03;
            p.vx += ((dxMoon / distMoon) * moonPull) / effectiveSpeedDiv;
            p.vy += ((dyMoon / distMoon) * moonPull) / effectiveSpeedDiv;
          }
        }
      }

      // Zero-allocation explosion checks
      for (let j = 0, pLen = planets.length; j < pLen; j++) {
        const planet = planets[j];
        const realTimeElapsed = (now - planet.lastExplosionTime) * speedMultiplier;
        
        if (realTimeElapsed >= planet.cooldownMs) {
          let insideCount = 0;
          const coreRadiusSq = (planet.radius * 0.95) ** 2;

          for (let k = 0; k < len; k++) {
            const targetP = particles[k];
            if (targetP.activePlanetInteraction?.planetId === planet.id) {
              const dSq = (targetP.x - planet.x) ** 2 + (targetP.y - planet.y) ** 2;
              if (dSq < coreRadiusSq) {
                insideCount++;
              }
            }
          }

          if (insideCount >= planet.particleThreshold) {
            if (!planet.isExplosionDelayed) {
              planet.isExplosionDelayed = true;
              planet.explosionDelayTimer = now + (400 + Math.random() * 800);
            } else if (now >= planet.explosionDelayTimer) {
              planet.lastExplosionTime = now;
              planet.cooldownMs = 5000 + Math.random() * 2500;
              planet.particleThreshold = Math.floor(10 + Math.random() * 6);
              planet.isExplosionDelayed = false;

              for (let k = 0; k < len; k++) {
                const targetP = particles[k];
                if (targetP.activePlanetInteraction?.planetId === planet.id) {
                  const dSq = (targetP.x - planet.x) ** 2 + (targetP.y - planet.y) ** 2;
                  if (dSq < coreRadiusSq) {
                    targetP.isBlinking = true;
                    targetP.blinkDuration = 30;
                    const pDx = targetP.x - planet.x;
                    const pDy = targetP.y - planet.y;
                    const pDist = Math.sqrt(pDx * pDx + pDy * pDy) || 1;
                    const blastForce = (6.0 + Math.random() * 4.0) / effectiveSpeedDiv;
                    targetP.vx += (pDx / pDist) * blastForce;
                    targetP.vy += (pDy / pDist) * blastForce;
                    targetP.activePlanetInteraction = undefined;
                    targetP.interactionCooldown = 60;
                  }
                }
              }
            }
          }
        }
      }

      if (!inAnyPlanetZone && p.activePlanetInteraction) {
        const activePlanet = planets.find(pl => pl.id === p.activePlanetInteraction?.planetId);
        if (activePlanet) {
          const dx = activePlanet.x - p.x;
          const dy = activePlanet.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > (activePlanet.radius * 5.8) ** 2) {
            p.activePlanetInteraction = undefined;
          }
        } else {
          p.activePlanetInteraction = undefined;
        }
      }

      if (p.clusterId !== undefined) {
        for (let k = 0; k < len; k++) {
          const other = particles[k];
          if (other.clusterId === p.clusterId && other.id !== p.id) {
            const cdx = other.x - p.x;
            const cdy = other.y - p.y;
            const cdistSq = cdx * cdx + cdy * cdy;
            if (cdistSq < 22500 && cdistSq > 400) {
              const cdist = Math.sqrt(cdistSq);
              p.vx += (cdx / cdist) * 0.01 / effectiveSpeedDiv;
              p.vy += (cdy / cdist) * 0.01 / effectiveSpeedDiv;
            }
          }
        }
      }

      p.vx *= 0.98;
      p.vy *= 0.98;

      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;

      if (p.isBlinking) {
        p.blinkDuration -= speedMultiplier;
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
    intensity: number,
    speedMultiplier: number = 1.0
  ): void {
    const blastRadius = 200 * intensity;
    const blastRadiusSq = blastRadius * blastRadius;
    const effectiveSpeedDiv = Math.max(1, speedMultiplier);

    for (let i = 0, len = particles.length; i < len; i++) {
      const p = particles[i];
      const dx = p.x - chargeX;
      const dy = p.y - chargeY;
      const distSq = dx * dx + dy * dy;

      if (distSq < blastRadiusSq || p.activePlanetInteraction) {
        p.isBlinking = true;
        p.blinkDuration = Math.floor(20 * intensity);
        
        const dist = Math.sqrt(distSq);
        const effectiveDist = distSq < blastRadiusSq ? dist : blastRadius * 0.5;
        // Reverted to original smooth, powerful ripple pacing
        const force = ((blastRadius - effectiveDist) / blastRadius) * this.clickExplosionPower * intensity / effectiveSpeedDiv;
        
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force;
        p.vy += Math.sin(angle) * force;
        p.activePlanetInteraction = undefined;
        p.interactionCooldown = 40;
      }
    }
  }
}