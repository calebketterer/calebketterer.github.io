import { Enemy, Player } from '../../core/diep.interfaces';

export interface PolluterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  life: number;
  maxLife: number;
  alpha: number;
}

export type PolluterStatePhase = 'PURSUING' | 'RETREATING';

export interface PolluterState {
  phase: PolluterStatePhase;
  targetX: number;
  targetY: number;
  
  // Retreat behavior tracking
  retreatWaypoints: { x: number; y: number }[];
  currentWaypointIndex: number;
  retreatTriggerDistance: number;

  // Speeds and dynamics
  currentSpeed: number;
  baseSpeed: number;
  headingAngle: number;
  
  // Green toxic particles
  particles: PolluterParticle[];
  particleTimer: number;
}

export class PolluterEnemy {
  public static metadata = {
    name: 'Polluter',
    faction: 'Green',
    description: 'A triangle that pursues targets, spews lingering emissions, and retreats before making direct contact.'
  };

  // Easily adjustable parameters
  public static readonly CONFIG = {
    // Base stats
    mass: 12,
    bodyDamage: 15,
    scoreValue: 60,
    color: '#00E673',
    strokeColor: '#007e3f',

    // --- ENEMY BODY SIZES ---
    minRadius: 15,                    // Minimum body radius
    maxRadius: 35,                    // Maximum body radius

    // Distance threshold range for initiating retreat
    minRetreatDistance: 130,
    maxRetreatDistance: 220,

    // Speed variation bounds
    minSpeed: 1.8,
    maxSpeed: 3.8,

    // Arena bounds padding for retreat target generation
    boundsPadding: 60,
    defaultArenaWidth: 800,
    defaultArenaHeight: 600,

    // --- POLLUTION EMISSION & PARTICLE SIZES ---
    particleInterval: 55,             // Higher ms value = FEWER particles spawned (increased from 30)
    minParticleLifespan: 5000,        // Min particle lifespan (ms)
    maxParticleLifespan: 10000,       // Max particle lifespan (ms)
    particleRadiusScale: 0.4         // Smaller particle multiplier relative to body radius (decreased from 0.45)
  };

  public static create(x: number, y: number): Partial<Enemy> {
    const radius = Math.floor(
      Math.random() * (PolluterEnemy.CONFIG.maxRadius - PolluterEnemy.CONFIG.minRadius + 1)
    ) + PolluterEnemy.CONFIG.minRadius;

    const retreatTriggerDistance = Math.floor(
      Math.random() * (PolluterEnemy.CONFIG.maxRetreatDistance - PolluterEnemy.CONFIG.minRetreatDistance + 1)
    ) + PolluterEnemy.CONFIG.minRetreatDistance;

    const initialState: PolluterState = {
      phase: 'PURSUING',
      targetX: x,
      targetY: y,
      retreatWaypoints: [],
      currentWaypointIndex: 0,
      retreatTriggerDistance,
      currentSpeed: PolluterEnemy.CONFIG.minSpeed,
      baseSpeed: PolluterEnemy.CONFIG.minSpeed + Math.random() * (PolluterEnemy.CONFIG.maxSpeed - PolluterEnemy.CONFIG.minSpeed),
      headingAngle: 0,
      particles: [],
      particleTimer: 0
    };

    return {
      type: 'POLLUTER',
      x,
      y,
      radius,
      mass: PolluterEnemy.CONFIG.mass,
      color: PolluterEnemy.CONFIG.color,
      health: radius * 4,
      maxHealth: radius * 4,
      bodyDamage: PolluterEnemy.CONFIG.bodyDamage,
      scoreValue: PolluterEnemy.CONFIG.scoreValue,
      state: initialState,
      onDeath: (enemies: Enemy[], _spawner: any, deadEnemy: any) => {
        PolluterEnemy.detachParticlesOnDeath(enemies, deadEnemy);
      }
    };
  }

  public static update(
    enemy: Enemy,
    player: Player,
    deltaTime: number,
    currentTime: number,
    _moveTowardsTarget: Function
  ): void {
    // 1. Handle detached orphan particles (lingering pollution after enemy death)
    if (enemy.isGhost) {
      const state = enemy.state as PolluterState;
      if (state && state.particles) {
        PolluterEnemy.updateParticles(state, player, deltaTime);
        if (state.particles.length === 0) {
          enemy.health = 0; // Mark wrapper entity for cleanup when all particles fade
        }
      }
      return;
    }

    if (!enemy.state) {
      const radius = enemy.radius || PolluterEnemy.CONFIG.minRadius;
      enemy.state = {
        phase: 'PURSUING',
        targetX: enemy.x,
        targetY: enemy.y,
        retreatWaypoints: [],
        currentWaypointIndex: 0,
        retreatTriggerDistance: 160,
        currentSpeed: PolluterEnemy.CONFIG.minSpeed,
        baseSpeed: PolluterEnemy.CONFIG.minSpeed,
        headingAngle: 0,
        particles: [],
        particleTimer: 0
      } as PolluterState;
    }

    const state = enemy.state as PolluterState;
    const dt = deltaTime / 16.66; // Normalize frame time

    // 2. Update Exhaust Particles
    PolluterEnemy.updateParticles(state, player, deltaTime);

    // 3. Speed Pulse / Pulsing Movement Personality
    const speedCycle = currentTime / 800;
    const speedVariation = (Math.sin(speedCycle) + 1) * 0.5; // 0 to 1
    state.currentSpeed = state.baseSpeed * (0.6 + speedVariation * 0.8);

    // Distance to player check
    const dxPlayer = player.x - enemy.x;
    const dyPlayer = player.y - enemy.y;
    const distanceToPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);

    // 4. State Machine: Pursue vs Retreat
    switch (state.phase) {
      case 'PURSUING': {
        state.targetX = player.x;
        state.targetY = player.y;

        // Check if close enough to player to initiate retreat
        if (distanceToPlayer <= state.retreatTriggerDistance) {
          state.phase = 'RETREATING';
          state.currentWaypointIndex = 0;
          state.retreatWaypoints = PolluterEnemy.generateRetreatWaypoints(enemy, player);
          
          // Randomize next threshold distance
          state.retreatTriggerDistance = Math.floor(
            Math.random() * (PolluterEnemy.CONFIG.maxRetreatDistance - PolluterEnemy.CONFIG.minRetreatDistance + 1)
          ) + PolluterEnemy.CONFIG.minRetreatDistance;
        }
        break;
      }

      case 'RETREATING': {
        if (state.retreatWaypoints.length > 0 && state.currentWaypointIndex < state.retreatWaypoints.length) {
          const activeWaypoint = state.retreatWaypoints[state.currentWaypointIndex];
          state.targetX = activeWaypoint.x;
          state.targetY = activeWaypoint.y;

          const dxWp = activeWaypoint.x - enemy.x;
          const dyWp = activeWaypoint.y - enemy.y;
          const distToWp = Math.sqrt(dxWp * dxWp + dyWp * dyWp);

          // Waypoint reached
          if (distToWp < enemy.radius + 15) {
            state.currentWaypointIndex++;
            if (state.currentWaypointIndex >= state.retreatWaypoints.length) {
              state.phase = 'PURSUING';
              state.retreatWaypoints = [];
            }
          }
        } else {
          state.phase = 'PURSUING';
        }
        break;
      }
    }

    // 5. Calculate movement direction & heading angle
    const moveDx = state.targetX - enemy.x;
    const moveDy = state.targetY - enemy.y;
    const moveDist = Math.sqrt(moveDx * moveDx + moveDy * moveDy);

    if (moveDist > 0.001) {
      state.headingAngle = Math.atan2(moveDy, moveDx);
      const step = Math.min(moveDist, state.currentSpeed * dt);
      enemy.x += (moveDx / moveDist) * step;
      enemy.y += (moveDy / moveDist) * step;
    }

    enemy.rotationAngle = state.headingAngle;

    // 6. Emit Green Exhaust Particles from back side
    state.particleTimer += deltaTime;
    if (state.particleTimer >= PolluterEnemy.CONFIG.particleInterval) {
      state.particleTimer = 0;
      PolluterEnemy.emitExhaustParticle(enemy, state);
    }
  }

  public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
    const state = (enemy.state || {}) as PolluterState;

    // 1. Draw Toxic Exhaust Particles (underneath body or standalone ghost entity)
    if (state.particles && state.particles.length > 0) {
      for (const p of state.particles) {
        ctx.save();
        
        // Floater-like solid/semi-translucent rendering with minimal outer gradient
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        
        const grad = ctx.createRadialGradient(p.x, p.y, p.radius * 0.75, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(0, 230, 115, ${0.45 * p.alpha})`);
        grad.addColorStop(0.85, `rgba(51, 204, 51, ${0.3 * p.alpha})`);
        grad.addColorStop(1, 'rgba(51, 204, 51, 0)');

        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }
    }

    // Skip triangle render if this is a ghost container for orphan particles
    if (enemy.isGhost) {
      return;
    }

    // 2. Draw Equilateral Triangle Body
    const radius = enemy.radius || PolluterEnemy.CONFIG.minRadius;
    const heading = state.headingAngle !== undefined ? state.headingAngle : (enemy.rotationAngle || 0);

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.rotate(heading);

    // Centroid to tip = R, centroid to back flat edge = R/2
    const tipX = radius;
    const backX = -radius * 0.5;
    const halfWidth = (radius * Math.sqrt(3)) / 2;

    ctx.fillStyle = enemy.color || PolluterEnemy.CONFIG.color;
    ctx.strokeStyle = PolluterEnemy.CONFIG.strokeColor;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'miter';

    ctx.beginPath();
    ctx.moveTo(tipX, 0);          // Nose tip
    ctx.lineTo(backX, halfWidth);  // Rear left corner
    ctx.lineTo(backX, -halfWidth); // Rear right corner
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private static detachParticlesOnDeath(enemies: Enemy[], deadEnemy: any): void {
    const state = deadEnemy.state as PolluterState;
    if (!state || !state.particles || state.particles.length === 0) return;

    // Create a ghost entity to host the lingering particles so they continue updating and fading naturally
    const ghostWrapper: Enemy = {
      id: Math.random().toString(36).substring(2, 9),
      x: deadEnemy.x,
      y: deadEnemy.y,
      vx: 0,
      vy: 0,
      mass: 0,
      bodyDamage: 0,
      scoreValue: 0,
      radius: deadEnemy.radius,
      color: '#00E673',
      health: 1,
      maxHealth: 1,
      type: 'POLLUTER',
      isGhost: true,
      isPassive: true,
      state: {
        ...state,
        particles: [...state.particles]
      },
      onUpdate: (wrapper: any, player: Player, deltaTime: number) => {
        PolluterEnemy.update(wrapper, player, deltaTime, Date.now(), () => {});
      }
    };

    enemies.push(ghostWrapper);
  }

  private static generateRetreatWaypoints(enemy: Enemy, player: Player): { x: number; y: number }[] {
    const waypoints: { x: number; y: number }[] = [];
    const count = Math.random() < 0.5 ? 1 : 2;

    const arenaW = PolluterEnemy.CONFIG.defaultArenaWidth;
    const arenaH = PolluterEnemy.CONFIG.defaultArenaHeight;
    const padding = PolluterEnemy.CONFIG.boundsPadding;

    for (let i = 0; i < count; i++) {
      let candidateX = 0;
      let candidateY = 0;
      let valid = false;

      for (let attempt = 0; attempt < 10; attempt++) {
        candidateX = padding + Math.random() * (arenaW - padding * 2);
        candidateY = padding + Math.random() * (arenaH - padding * 2);

        const dxCurrent = enemy.x - player.x;
        const dyCurrent = enemy.y - player.y;
        const dxCand = candidateX - player.x;
        const dyCand = candidateY - player.y;

        const distCurrent = Math.sqrt(dxCurrent * dxCurrent + dyCurrent * dyCurrent);
        const distCand = Math.sqrt(dxCand * dxCand + dyCand * dyCand);

        if (distCand > distCurrent * 0.8) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        candidateX = padding + Math.random() * (arenaW - padding * 2);
        candidateY = padding + Math.random() * (arenaH - padding * 2);
      }

      waypoints.push({ x: candidateX, y: candidateY });
    }

    return waypoints;
  }

  private static emitExhaustParticle(enemy: Enemy, state: PolluterState): void {
    if (!state.particles) {
      state.particles = [];
    }

    const radius = enemy.radius || PolluterEnemy.CONFIG.minRadius;
    const heading = state.headingAngle;

    // Rear exhaust spawn position
    const backOffsetX = -radius * 0.6;
    const backOffsetY = (Math.random() - 0.5) * (radius * 0.8);

    const worldX = enemy.x + Math.cos(heading) * backOffsetX - Math.sin(heading) * backOffsetY;
    const worldY = enemy.y + Math.sin(heading) * backOffsetX + Math.cos(heading) * backOffsetY;

    // Eject backwards with spread
    const spreadAngle = heading + Math.PI + (Math.random() - 0.5) * 0.6;
    const ejectSpeed = 0.6 + Math.random() * 1.2;

    // Dynamic particle lifespan & scaled radius based on enemy size
    const lifespan = Math.floor(
      Math.random() * (PolluterEnemy.CONFIG.maxParticleLifespan - PolluterEnemy.CONFIG.minParticleLifespan + 1)
    ) + PolluterEnemy.CONFIG.minParticleLifespan;

    const pRadius = radius * PolluterEnemy.CONFIG.particleRadiusScale + (Math.random() * 3);

    state.particles.push({
      x: worldX,
      y: worldY,
      vx: Math.cos(spreadAngle) * ejectSpeed,
      vy: Math.sin(spreadAngle) * ejectSpeed,
      radius: pRadius,
      color: '#00E673',
      life: lifespan,
      maxLife: lifespan,
      alpha: 1.0
    });
  }

  private static updateParticles(state: PolluterState, player: Player, deltaTime: number): void {
    if (!state.particles || state.particles.length === 0) return;

    const dt = deltaTime / 16.66;

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      
      // Slight friction/drag to make particle exhaust hover in place over time
      p.vx *= 0.985;
      p.vy *= 0.985;

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= deltaTime;
      p.alpha = Math.max(0, p.life / p.maxLife);

      // Damage player if inside the toxic particle area
      const dxP = p.x - player.x;
      const dyP = p.y - player.y;
      if (Math.sqrt(dxP * dxP + dyP * dyP) < p.radius) {
        player.health -= 0.2 * dt;
      }

      if (p.life <= 0) {
        state.particles.splice(i, 1);
      }
    }
  }
}