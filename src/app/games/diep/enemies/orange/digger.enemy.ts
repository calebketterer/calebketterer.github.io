import { Enemy, Player, Bullet } from '../../core/diep.interfaces';

export interface DirtParticle {
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

export type DiggerPhase = 'BURROWED' | 'EMERGING' | 'DEPLOYING_CANNON' | 'STATIONARY_ATTACK' | 'RETRACTING_CANNON' | 'SUBMERGING';

export interface DiggerState {
  phase: DiggerPhase;
  phaseTimer: number;
  phaseDuration: number;
  
  // Shooting state
  shotsFired: number;
  targetShots: number;
  shotCooldownTimer: number;
  shotCooldown: number;
  
  // Dynamic scale per emergence
  baseRadius: number;
  targetRadius: number;
  currentRadius: number;
  
  // Animation factors (0 to 1)
  spinAngle: number;
  cannonProgress: number; // 0 = retracted, 1 = fully extended
  
  // Target position & visual effects
  targetX: number;
  targetY: number;
  dirtParticles: DirtParticle[];
  aimAngle: number;
}

export class DiggerEnemy {
  public static readonly metadata = {
    name: 'Digger',
    faction: 'Orange',
    description: 'An ambush predator with a quick, retractable cannon.'
  };

  private static readonly CONFIG = {
    // Base stats
    mass: 15,
    health: 120,
    maxHealth: 120,
    bodyDamage: 20,
    scoreValue: 50,
    color: '#f39c12',
    strokeColor: '#d35400',
    barrelColor: '#7f8c8d',
    
    // Configurable Size Range
    minRadius: 16,
    maxRadius: 28,
    burrowScaleFactor: 0.2, // Size scale at 0 opacity (20% of full size)

    // Spin animation speed (radians per frame-equivalent step at max spin)
    maxSpinSpeed: 0.35,

    // Firing stats (Faster Fire Rate)
    bulletSpeed: 12,
    bulletRadius: 7,
    bulletDamage: 18,
    bulletHealth: 12,
    fireInterval: 350, // Ms between shots in a volley (increased fire rate)
    
    // Timing durations (ms)
    emergeDuration: 600,      // Time spent emerging / spinning up
    cannonDeployDuration: 250, // Cannon extension time
    cannonRetractDuration: 250,// Cannon retraction time
    submergeDuration: 600,    // Time spent burrowing / spinning down
    
    // Screen bounds padding for random popups
    boundsPadding: 80
  };

  public static create(x: number, y: number): Partial<Enemy> {
    const initialUndergroundDuration = 3000 + Math.random() * 3000;
    const targetRadius = DiggerEnemy.CONFIG.minRadius + Math.random() * (DiggerEnemy.CONFIG.maxRadius - DiggerEnemy.CONFIG.minRadius);

    const initialState: DiggerState = {
      phase: 'BURROWED',
      phaseTimer: 0,
      phaseDuration: initialUndergroundDuration,
      shotsFired: 0,
      targetShots: Math.floor(Math.random() * 4) + 3,
      shotCooldownTimer: 0,
      shotCooldown: DiggerEnemy.CONFIG.fireInterval,
      baseRadius: targetRadius,
      targetRadius: targetRadius,
      currentRadius: targetRadius * DiggerEnemy.CONFIG.burrowScaleFactor,
      spinAngle: 0,
      cannonProgress: 0,
      targetX: x,
      targetY: y,
      dirtParticles: [],
      aimAngle: 0
    };

    return {
      type: 'DIGGER',
      x,
      y,
      radius: targetRadius,
      mass: DiggerEnemy.CONFIG.mass,
      color: DiggerEnemy.CONFIG.color,
      health: DiggerEnemy.CONFIG.health,
      maxHealth: DiggerEnemy.CONFIG.maxHealth,
      bodyDamage: DiggerEnemy.CONFIG.bodyDamage,
      scoreValue: DiggerEnemy.CONFIG.scoreValue,
      isInvulnerable: true,
      isGhost: true,
      opacity: 0,
      state: initialState
    };
  }

  public static update(
    enemy: Enemy,
    player: Player,
    deltaTime: number,
    currentTime: number,
    moveTowardsTarget: Function,
    bullets: Bullet[],
    allEnemies: Enemy[] = []
  ): void {
    if (!enemy.state) {
      const targetRadius = DiggerEnemy.CONFIG.minRadius + Math.random() * (DiggerEnemy.CONFIG.maxRadius - DiggerEnemy.CONFIG.minRadius);
      enemy.state = {
        phase: 'BURROWED',
        phaseTimer: 0,
        phaseDuration: 3000 + Math.random() * 3000,
        shotsFired: 0,
        targetShots: Math.floor(Math.random() * 4) + 3,
        shotCooldownTimer: 0,
        shotCooldown: DiggerEnemy.CONFIG.fireInterval,
        baseRadius: targetRadius,
        targetRadius: targetRadius,
        currentRadius: targetRadius * DiggerEnemy.CONFIG.burrowScaleFactor,
        spinAngle: 0,
        cannonProgress: 0,
        targetX: enemy.x,
        targetY: enemy.y,
        dirtParticles: [],
        aimAngle: 0
      } as DiggerState;
    }

    const state = enemy.state as DiggerState;
    state.phaseTimer += deltaTime;

    // 1. Update dirt particles
    if (state.dirtParticles && state.dirtParticles.length > 0) {
      for (let i = state.dirtParticles.length - 1; i >= 0; i--) {
        const p = state.dirtParticles[i];
        p.x += p.vx * (deltaTime * 0.06);
        p.y += p.vy * (deltaTime * 0.06);
        p.life -= deltaTime;
        p.alpha = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
          state.dirtParticles.splice(i, 1);
        }
      }
    }

    // Zero out movement velocity while stationary
    enemy.vx = 0;
    enemy.vy = 0;

    // Aim calculation towards player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    state.aimAngle = Math.atan2(dy, dx);

    // 2. State Machine Logic
    switch (state.phase) {
      case 'BURROWED': {
        enemy.isInvulnerable = true;
        enemy.isGhost = true;
        enemy.opacity = 0;
        state.cannonProgress = 0;

        if (state.phaseTimer >= state.phaseDuration) {
          const screenWidth = 800;
          const screenHeight = 600;

          const newX = DiggerEnemy.CONFIG.boundsPadding + Math.random() * (screenWidth - DiggerEnemy.CONFIG.boundsPadding * 2);
          const newY = DiggerEnemy.CONFIG.boundsPadding + Math.random() * (screenHeight - DiggerEnemy.CONFIG.boundsPadding * 2);

          enemy.x = newX;
          enemy.y = newY;

          // Pick a fresh random max radius for this spawn cycle
          state.targetRadius = DiggerEnemy.CONFIG.minRadius + Math.random() * (DiggerEnemy.CONFIG.maxRadius - DiggerEnemy.CONFIG.minRadius);
          enemy.radius = state.targetRadius;

          state.phase = 'EMERGING';
          state.phaseTimer = 0;
          state.phaseDuration = DiggerEnemy.CONFIG.emergeDuration;
          state.shotsFired = 0;
          state.targetShots = Math.floor(Math.random() * 4) + 3;
          state.shotCooldownTimer = 0;

          this.spawnDirtBurst(enemy, state, 15);
        }
        break;
      }

      case 'EMERGING': {
        enemy.isInvulnerable = true;
        enemy.isGhost = true;
        const progress = Math.min(1, state.phaseTimer / state.phaseDuration);
        enemy.opacity = progress;

        // Scale grows from burrowScaleFactor -> 1.0
        const scaleFactor = DiggerEnemy.CONFIG.burrowScaleFactor + progress * (1 - DiggerEnemy.CONFIG.burrowScaleFactor);
        state.currentRadius = state.targetRadius * scaleFactor;

        // Fast spinning at low opacity, decelerating to 0 spin at opacity 1
        const currentSpinSpeed = (1 - progress) * DiggerEnemy.CONFIG.maxSpinSpeed;
        state.spinAngle += currentSpinSpeed * (deltaTime * 0.06);

        state.cannonProgress = 0;

        if (state.phaseTimer >= state.phaseDuration) {
          state.phase = 'DEPLOYING_CANNON';
          state.phaseTimer = 0;
          state.phaseDuration = DiggerEnemy.CONFIG.cannonDeployDuration;
          enemy.opacity = 1;
          state.currentRadius = state.targetRadius;
          state.spinAngle = 0; // Lock orientation toward target
        }
        break;
      }

      case 'DEPLOYING_CANNON': {
        enemy.isInvulnerable = false;
        enemy.isGhost = false;
        enemy.opacity = 1;
        state.currentRadius = state.targetRadius;

        const progress = Math.min(1, state.phaseTimer / state.phaseDuration);
        state.cannonProgress = progress;

        if (state.phaseTimer >= state.phaseDuration) {
          state.phase = 'STATIONARY_ATTACK';
          state.phaseTimer = 0;
          state.cannonProgress = 1;
        }
        break;
      }

      case 'STATIONARY_ATTACK': {
        enemy.isInvulnerable = false;
        enemy.isGhost = false;
        enemy.opacity = 1;
        state.currentRadius = state.targetRadius;
        state.cannonProgress = 1;

        state.shotCooldownTimer += deltaTime;

        if (state.shotCooldownTimer >= state.shotCooldown) {
          state.shotCooldownTimer = 0;

          // Muzzle offset matching shortened barrel (1.3 * radius)
          const muzzleDistance = state.currentRadius * 1.3;
          const spawnX = enemy.x + Math.cos(state.aimAngle) * muzzleDistance;
          const spawnY = enemy.y + Math.sin(state.aimAngle) * muzzleDistance;

          bullets.push({
            id: `bullet_digger_${Date.now()}_${Math.random()}`,
            x: spawnX,
            y: spawnY,
            dx: Math.cos(state.aimAngle) * DiggerEnemy.CONFIG.bulletSpeed,
            dy: Math.sin(state.aimAngle) * DiggerEnemy.CONFIG.bulletSpeed,
            radius: DiggerEnemy.CONFIG.bulletRadius,
            mass: 2,
            color: DiggerEnemy.CONFIG.color,
            ownerType: 'ENEMY',
            health: DiggerEnemy.CONFIG.bulletHealth,
            maxHealth: DiggerEnemy.CONFIG.bulletHealth,
            damage: DiggerEnemy.CONFIG.bulletDamage
          });

          state.shotsFired++;

          if (state.shotsFired >= state.targetShots) {
            state.phase = 'RETRACTING_CANNON';
            state.phaseTimer = 0;
            state.phaseDuration = DiggerEnemy.CONFIG.cannonRetractDuration;
          }
        }
        break;
      }

      case 'RETRACTING_CANNON': {
        enemy.isInvulnerable = false;
        enemy.isGhost = false;
        enemy.opacity = 1;
        state.currentRadius = state.targetRadius;

        const progress = Math.min(1, state.phaseTimer / state.phaseDuration);
        state.cannonProgress = 1 - progress;

        if (state.phaseTimer >= state.phaseDuration) {
          state.phase = 'SUBMERGING';
          state.phaseTimer = 0;
          state.phaseDuration = DiggerEnemy.CONFIG.submergeDuration;
          state.cannonProgress = 0;

          this.spawnDirtBurst(enemy, state, 12);
        }
        break;
      }

      case 'SUBMERGING': {
        enemy.isInvulnerable = true;
        enemy.isGhost = true;
        const progress = Math.min(1, state.phaseTimer / state.phaseDuration);
        const opacityProgress = 1 - progress;
        enemy.opacity = opacityProgress;

        // Scale shrinks from 1.0 -> burrowScaleFactor
        const scaleFactor = DiggerEnemy.CONFIG.burrowScaleFactor + opacityProgress * (1 - DiggerEnemy.CONFIG.burrowScaleFactor);
        state.currentRadius = state.targetRadius * scaleFactor;

        // Acceleration from 0 spin at opacity 1 to fast spin at opacity 0
        const currentSpinSpeed = progress * DiggerEnemy.CONFIG.maxSpinSpeed;
        state.spinAngle += currentSpinSpeed * (deltaTime * 0.06);

        state.cannonProgress = 0;

        if (state.phaseTimer >= state.phaseDuration) {
          state.phase = 'BURROWED';
          state.phaseTimer = 0;
          state.phaseDuration = 3000 + Math.random() * 3000;
          enemy.opacity = 0;
        }
        break;
      }
    }

    enemy.rotationAngle = state.phase === 'EMERGING' || state.phase === 'SUBMERGING'
      ? state.spinAngle
      : state.aimAngle;
  }

  public static draw(
    ctx: CanvasRenderingContext2D,
    enemy: Enemy,
    player: Player,
    bullets: Bullet[]
  ): void {
    const state = (enemy.state || {}) as DiggerState;

    ctx.save();

    // 1. Draw Dirt Burst / Ground Particles
    if (state.dirtParticles && state.dirtParticles.length > 0) {
      for (const p of state.dirtParticles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Hide when completely underground
    if (state.phase === 'BURROWED' || (enemy.opacity !== undefined && enemy.opacity <= 0.01)) {
      ctx.restore();
      return;
    }

    const radius = state.currentRadius || enemy.radius || DiggerEnemy.CONFIG.minRadius;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.opacity !== undefined) {
      ctx.globalAlpha = enemy.opacity;
    }

    // Rotate chassis
    const activeAngle = (state.phase === 'EMERGING' || state.phase === 'SUBMERGING')
      ? state.spinAngle
      : state.aimAngle;

    ctx.rotate(activeAngle);

    // 2. Draw Shortened Extending / Retracting Cannon
    if (state.cannonProgress > 0) {
      const barrelWidth = Math.max(6, radius * 0.55);
      const maxBarrelLength = radius * 1.3; // Shortened barrel length
      const currentBarrelLength = maxBarrelLength * state.cannonProgress;

      ctx.save();
      ctx.fillStyle = DiggerEnemy.CONFIG.barrelColor;
      ctx.strokeStyle = '#5f6a6a';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.rect(0, -barrelWidth / 2, currentBarrelLength, barrelWidth);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Draw Equilateral Triangle Body
    // Side length s = R * sqrt(3), centroid to vertex = R, centroid to edge midpoint = R / 2
    const frontTipX = radius;
    const backX = -radius * 0.5;
    const halfWidth = (radius * Math.sqrt(3)) / 2;

    ctx.fillStyle = enemy.color;
    ctx.strokeStyle = DiggerEnemy.CONFIG.strokeColor;
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'miter';

    ctx.beginPath();
    ctx.moveTo(frontTipX, 0);                 // Vertex 1 (Front Nose)
    ctx.lineTo(backX, halfWidth);             // Vertex 2 (Back Left Wing)
    ctx.lineTo(backX, -halfWidth);            // Vertex 3 (Back Right Wing)
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    ctx.restore();
    ctx.restore();
  }

  private static spawnDirtBurst(enemy: Enemy, state: DiggerState, count: number): void {
    if (!state.dirtParticles) {
      state.dirtParticles = [];
    }

    const colors = ['#8B4513', '#A0522D', '#D2691E', '#CD853F'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.0;

      state.dirtParticles.push({
        x: enemy.x + (Math.random() - 0.5) * (enemy.radius || 20),
        y: enemy.y + (Math.random() - 0.5) * (enemy.radius || 20),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 25 + Math.random() * 25,
        maxLife: 50,
        alpha: 1.0
      });
    }
  }
}