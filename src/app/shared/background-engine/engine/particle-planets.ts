// Planet manager handling semi-random elliptical orbits and semi-random elliptical moon paths.
import { Planet, Moon } from './particle.model';

export class ParticlePlanets {
  private readonly configParams = {
    minRadius: 10,
    maxRadius: 50,
    minOrbitBand: 0.18,
    maxOrbitBand: 0.45,
    minMoonCount: 0,
    maxMoonCount: 3,
    minCooldownMs: 5000,
    maxCooldownMs: 7500,
    minParticleThreshold: 10,
    maxParticleThreshold: 25
  };

  private readonly colorPalette = [
    '0, 229, 255',   // Glowing Cyan
    '143, 174, 197', // Slate Blue
    '160, 180, 200', // Cool Gray
    '40, 60, 85',    // Dark Navy
    '20, 30, 45'     // Deep Charcoal / Black
  ];

  public generatePlanets(count: number, width: number, height: number): Planet[] {
    const planets: Planet[] = [];
    const minDimension = Math.min(width, height);
    const minOrbit = minDimension * this.configParams.minOrbitBand;
    const maxOrbit = minDimension * this.configParams.maxOrbitBand;
    const bandStep = (maxOrbit - minOrbit) / Math.max(1, count);
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const baseDistance = minOrbit + i * bandStep + bandStep * 0.5;
      const orbitRadiusX = baseDistance + (Math.random() - 0.5) * (bandStep * 0.3);
      const orbitRadiusY = orbitRadiusX * (0.4 + Math.random() * 0.3);
      const orbitRotation = Math.random() * Math.PI * 2;

      const radius = this.configParams.minRadius + Math.random() * (this.configParams.maxRadius - this.configParams.minRadius);
      const mass = radius * 1.8;

      const moonCount = Math.floor(this.configParams.minMoonCount + Math.random() * (this.configParams.maxMoonCount - this.configParams.minMoonCount + 1));
      const moons: Moon[] = [];
      let lastMoonDist = radius * 1.8;

      for (let m = 0; m < moonCount; m++) {
        const moonOrbitX = lastMoonDist + 12 + Math.random() * 16;
        const moonOrbitY = moonOrbitX * (0.5 + Math.random() * 0.4); // Semi-random elliptical aspect ratio
        lastMoonDist = moonOrbitX + moonOrbitX * 0.3;

        moons.push({
          id: m + 1,
          orbitRadiusX: moonOrbitX,
          orbitRadiusY: moonOrbitY,
          orbitRotation: Math.random() * Math.PI * 2,
          angle: Math.random() * Math.PI * 2,
          speed: (0.005 + Math.random() * 0.01) * (Math.random() < 0.5 ? 1 : -1),
          radius: 4.5 + Math.random() * 2.5,
          x: 0,
          y: 0
        });
      }

      const thresholdRange = this.configParams.maxParticleThreshold - this.configParams.minParticleThreshold;
      const cooldownRange = this.configParams.maxCooldownMs - this.configParams.minCooldownMs;

      planets.push({
        id: i + 1,
        orbitRadiusX,
        orbitRadiusY,
        orbitRotation,
        angle: Math.random() * Math.PI * 2,
        speed: (0.001 + Math.random() * 0.002) * (Math.random() < 0.5 ? 1 : -1),
        radius,
        mass,
        color: this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)],
        moons,
        x: 0,
        y: 0,
        lastExplosionTime: now,
        cooldownMs: this.configParams.minCooldownMs + Math.random() * cooldownRange,
        particleThreshold: Math.floor(this.configParams.minParticleThreshold + Math.random() * (thresholdRange + 1)),
        isExplosionDelayed: false,
        explosionDelayTimer: 0
      });
    }

    return planets;
  }

  public updatePlanets(planets: Planet[], width: number, height: number, speedMultiplier: number): void {
    const centerX = width / 2;
    const centerY = height / 2;

    for (const planet of planets) {
      planet.angle += planet.speed * speedMultiplier;

      const cosRot = Math.cos(planet.orbitRotation);
      const sinRot = Math.sin(planet.orbitRotation);
      const cx = Math.cos(planet.angle) * planet.orbitRadiusX;
      const cy = Math.sin(planet.angle) * planet.orbitRadiusY;

      planet.x = centerX + (cx * cosRot - cy * sinRot);
      planet.y = centerY + (cx * sinRot + cy * cosRot);

      for (const moon of planet.moons) {
        moon.angle += moon.speed * speedMultiplier;
        const moonCosRot = Math.cos(moon.orbitRotation);
        const moonSinRot = Math.sin(moon.orbitRotation);
        const mcx = Math.cos(moon.angle) * moon.orbitRadiusX;
        const mcy = Math.sin(moon.angle) * moon.orbitRadiusY;

        moon.x = planet.x + (mcx * moonCosRot - mcy * moonSinRot);
        moon.y = planet.y + (mcx * moonSinRot + mcy * moonCosRot);
      }
    }
  }
}