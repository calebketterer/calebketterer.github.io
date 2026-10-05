import { Enemy, Player } from '../../core/diep.interfaces';

export class DetonatorEnemy {
    public static metadata = {
        name: 'Detonator',
        faction: 'Purple',
        description: 'A volatile entity that wanders endlessly and damages the player upon death.'
    };

    // --- CONFIGURATION TUNING TUNERS (Adjust to change variance behaviors) ---
    private static readonly BASE_RADIUS = 25;
    private static readonly RADIUS_VARIANCE = 5; // Sizing ranges from 20 to 25

    private static readonly BASE_HEALTH = 25;
    private static readonly HEALTH_VARIANCE = 10;

    // --- POINT-LINKED SCALAR BALANCING ---
    private static readonly BASE_SCORE_VALUE = 50;     // Total Score = BASE * pointCount
    private static readonly BASE_DEATH_DAMAGE = 5;     // Total Damage = BASE * pointCount

    // --- LIFESPAN TUNER (In Milliseconds) ---
    private static readonly BASE_LIFESPAN = 7500;
    private static readonly LIFESPAN_VARIANCE = 2500; // Lifespans range from 5s to 10s

    public static create(x: number, y: number): Enemy {
        // Roll a random number of star spikes/points between 2 and 6 first to scale other metrics
        const points = Math.floor(Math.random() * (6 - 2 + 1)) + 2;

        const radius = DetonatorEnemy.BASE_RADIUS + (Math.random() * 2 - 1) * DetonatorEnemy.RADIUS_VARIANCE;
        const health = Math.round(DetonatorEnemy.BASE_HEALTH + (Math.random() * 2 - 1) * DetonatorEnemy.HEALTH_VARIANCE);
        const lifespan = DetonatorEnemy.BASE_LIFESPAN + Math.random() * DetonatorEnemy.LIFESPAN_VARIANCE;

        // Scale reward metrics and death feedback penalties dynamically based on spike quantity
        const scoreValue = DetonatorEnemy.BASE_SCORE_VALUE * points;
        const calculatedDeathDamage = DetonatorEnemy.BASE_DEATH_DAMAGE * points;

        // Determine breathing profile behaviors: Uniform (true) or Independent (false)
        const uniformBreathing = Math.random() > 0.5;

        // Base geometric scale factors
        const baseOuterScale = 1.5;
        const baseInnerScale = 0.5;

        // Unique breathing speeds to give each entity distinct life
        const lengthBreatheSpeed = 0.01 + Math.random() * 0.005;
        const widthBreatheSpeed = uniformBreathing ? lengthBreatheSpeed : 0.01 + Math.random() * 0.005;

        // Individual starting phase anchors
        const lengthPhase = Math.random() * Math.PI * 2;
        const widthPhase = uniformBreathing ? lengthPhase : Math.random() * Math.PI * 2;

        return {
            x,
            y,
            radius,
            color: '#BE7FF5', // Purple Faction Color matching Mother
            health,
            maxHealth: health,
            scoreValue,
            type: 'DETONATOR' as any,
            isPassive: true,
            canDespawn: true,

            // Custom dynamic star spikes and geometric tracking parameters
            points,
            baseOuterScale,
            baseInnerScale,
            currentOuterScale: baseOuterScale,
            currentInnerScale: baseInnerScale,
            currentCoreScale: 0.25,
            
            // Unstable Breathing State
            uniformBreathing,
            lengthPhase,
            widthPhase,
            lengthBreatheSpeed,
            widthBreatheSpeed,
            calculatedDeathDamage,

            // Floating movement vector dynamics
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05,
            speedPhase: Math.random() * Math.PI * 2,

            // Lifespan metrics
            spawnTime: Date.now(),
            lifespan,
            isLeaving: false,

            onDeath: (enemies: Enemy[], spawner: any, deadEnemy: Enemy, player: Player) => {
                // Read the dynamic scale damage rolled on creation
                const damageDealt = (deadEnemy as any).calculatedDeathDamage || DetonatorEnemy.BASE_DEATH_DAMAGE * 4;
                player.health = Math.max(0, player.health - damageDealt);
            },

            onUpdate: (enemy: Enemy, player: Player, deltaTime: number) => {
                DetonatorEnemy.update(enemy, player, deltaTime);
            },

            onDraw: (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
                DetonatorEnemy.draw(ctx, enemy);
            }
        } as any as Enemy;
    }

    public static update(enemy: any, player: Player, deltaTime: number): void {
        const tick = deltaTime / 10;

        // --- PROCESSING ORGANIC SHAPE BREATHING MOTIONS ---
        enemy.lengthPhase += enemy.lengthBreatheSpeed * tick;
        enemy.widthPhase += enemy.widthBreatheSpeed * tick;

        // Length maps to the length/extension of the outer spikes (breathes between 1.2x and 1.8x radius)
        enemy.currentOuterScale = enemy.baseOuterScale + Math.sin(enemy.lengthPhase) * 0.3;
        
        // Width maps to the inner valley radius depth (breathes between 0.35x and 0.65x radius)
        enemy.currentInnerScale = Math.max(0.35, enemy.baseInnerScale + Math.cos(enemy.widthPhase) * 0.15);

        // Core dot expands to tightly match the current inner valleys size, backed off by a tiny safety gap (0.1) 
        // This ensures the purple center swells to fill the core completely, nearly touching the valleys.
        enemy.currentCoreScale = Math.max(0.15, enemy.currentInnerScale - 0.1);

        // Apply smooth rotation and tracking standard movement sin waves
        enemy.rotation += enemy.rotationSpeed * tick;
        enemy.speedPhase += 0.015;
        const speedVar = Math.sin(enemy.speedPhase) * 0.4 + 1;

        // Life cycle expiration monitor
        if (!enemy.isLeaving && Date.now() - enemy.spawnTime > enemy.lifespan) {
            enemy.isLeaving = true;
        }

        // Apply movement vector calculations
        enemy.x += enemy.vx * speedVar * tick;
        enemy.y += enemy.vy * speedVar * tick;

        // Map arena bounds boundaries
        const margin = enemy.radius + 5;
        const arenaWidth = 2000;
        const arenaHeight = 2000;

        if (!enemy.isLeaving) {
            // Smoothly reverse velocities when striking the boundaries
            if (enemy.x < margin) { enemy.x = margin; enemy.vx *= -1; }
            if (enemy.x > arenaWidth - margin) { enemy.x = arenaWidth - margin; enemy.vx *= -1; }
            if (enemy.y < margin) { enemy.y = margin; enemy.vy *= -1; }
            if (enemy.y > arenaHeight - margin) { enemy.y = arenaHeight - margin; enemy.vy *= -1; }

            // Occasional direction adjustments to simulate passive hunting/wandering
            if (Math.random() < 0.006) {
                enemy.vx = (Math.random() - 0.5) * 1.5;
                enemy.vy = (Math.random() - 0.5) * 1.5;
            }
        } else {
            // Safely clean out memory records once the entity moves completely out of bounds limits
            if (enemy.x < -120 || enemy.x > arenaWidth + 120 || enemy.y < -120 || enemy.y > arenaHeight + 120) {
                enemy.health = 0;
            }
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: any): void {
        ctx.save();

        // Main Alive Rendering Sequence
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation);
        ctx.fillStyle = enemy.color || '#BE7FF5';
        ctx.strokeStyle = '#4b0082'; // Indigo border to match mother's outline accents
        
        // Quadrivium Menu Fallback Protection: Provide structured defaults if tracking states are undefined
        const spikes = enemy.points !== undefined ? enemy.points : 4;
        const baseOuterScale = enemy.baseOuterScale !== undefined ? enemy.baseOuterScale : 1.5;
        const baseInnerScale = enemy.baseInnerScale !== undefined ? enemy.baseInnerScale : 0.5;

        const currentOuter = enemy.currentOuterScale !== undefined ? enemy.currentOuterScale : baseOuterScale;
        const currentInner = enemy.currentInnerScale !== undefined ? enemy.currentInnerScale : baseInnerScale;
        const currentCore = enemy.currentCoreScale !== undefined ? enemy.currentCoreScale : (currentInner - 0.1);

        // Dynamically scale stroke width along with outer sizing footprint expansion ratios
        ctx.lineWidth = 1.5 * currentOuter;

        // Apply Mother's custom signature glow effect styles dynamically
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#be7ff5';
        
        // Read current computed fluid frame scales 
        const outerRadius = enemy.radius * currentOuter;
        const innerRadius = enemy.radius * currentInner;

        ctx.beginPath();
        
        if (spikes === 2) {
            // 2 points handles a sharp dagger capsule variant using live dynamic width/length breathing
            ctx.moveTo(0, -outerRadius);
            ctx.lineTo(innerRadius, 0);
            ctx.lineTo(0, outerRadius);
            ctx.lineTo(-innerRadius, 0);
            ctx.closePath();
        } else {
            // Alternate between breathing outer spike points and breathing inner valley widths
            let rot = (Math.PI / 2) * 3;
            const step = Math.PI / spikes;

            ctx.moveTo(0, -outerRadius);
            for (let i = 0; i < spikes; i++) {
                // Outer spike tip
                let xPos = Math.cos(rot) * outerRadius;
                let yPos = Math.sin(rot) * outerRadius;
                ctx.lineTo(xPos, yPos);
                rot += step;

                // Inner valley dip 
                xPos = Math.cos(rot) * innerRadius;
                let yPosInner = Math.sin(rot) * innerRadius;
                ctx.lineTo(xPos, yPosInner);
                rot += step;
            }
            ctx.closePath();
        }

        ctx.fill();
        
        // Remove glow effect before drawing outer outline so stroke lines stay sharp
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Internal volatile structural core circle indicator layout using dynamic breathing metrics
        const dynamicCoreRadius = enemy.radius * currentCore;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(2, dynamicCoreRadius), 0, Math.PI * 2);
        ctx.fillStyle = '#9b59b6'; // Darker core purple
        ctx.fill();

        ctx.restore();
    }
}