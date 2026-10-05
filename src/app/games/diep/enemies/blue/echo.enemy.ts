import { Enemy, Player } from '../../core/diep.interfaces';

export class EchoEnemy {

    public static metadata = {
        name: 'Echo',
        faction: 'Blue',
        description: 'A weak, nearly invisible shard summoned by Casters.'
    };

    // --- CONFIGURATION TUNING VARIANCE ---
    private static readonly BASE_RADIUS = 26; // Length from nose to tail
    private static readonly RADIUS_VARIANCE = 5; 

    private static readonly BASE_SPEED = 2.2;
    private static readonly SPEED_VARIANCE = 0.5; 

    private static readonly BASE_LIFESPAN = 8000; 
    private static readonly LIFESPAN_VARIANCE = 1500; 
    private static readonly FADE_DURATION = 1200; 

    private static readonly BASE_DETECT_RANGE = 250;
    private static readonly DETECT_RANGE_VARIANCE = 70; 

    public static create(x: number, y: number): Partial<Enemy> {
        const radius = EchoEnemy.BASE_RADIUS + (Math.random() * 2 - 1) * EchoEnemy.RADIUS_VARIANCE;
        const speed = EchoEnemy.BASE_SPEED + (Math.random() * 2 - 1) * EchoEnemy.SPEED_VARIANCE;
        const lifespan = EchoEnemy.BASE_LIFESPAN + (Math.random() * 2 - 1) * EchoEnemy.LIFESPAN_VARIANCE;
        const detectRange = EchoEnemy.BASE_DETECT_RANGE + (Math.random() * 2 - 1) * EchoEnemy.DETECT_RANGE_VARIANCE;

        const flipSide = Math.random() > 0.5;
        const skewFactor = 0.4 + Math.random() * 0.5; 

        return {
            x, y,
            radius,
            health: 10,
            maxHealth: 10,
            scoreValue: 10,
            type: 'ECHO',
            isGhost: true,
            isPassive: true, 
            opacity: 0.02,
            vx: 0, vy: 0,
            speed,
            lifespan, 
            age: 0,
            swayTimer: Math.random() * 100,
            detectRange,
            flipSide,
            skewFactor
        } as any;
    }

    public static update(enemy: any, player: Player, deltaTime: number): void {
        const tick = deltaTime / 16.66;
        enemy.age += deltaTime;
        enemy.swayTimer += deltaTime * 0.004;

        if (enemy.age > enemy.lifespan) {
            enemy.health = 0;
            return;
        }

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetOpacity = 0.02;
        if (dist <= enemy.detectRange) {
            const insideRatio = 1 - (dist / enemy.detectRange);
            targetOpacity = 0.1 + (0.8 * (insideRatio * insideRatio)); 
            enemy.isGhost = false;
        } else {
            enemy.isGhost = true;
        }

        const timeRemaining = enemy.lifespan - enemy.age;
        if (timeRemaining < EchoEnemy.FADE_DURATION) {
            const fadeRatio = Math.max(0, timeRemaining / EchoEnemy.FADE_DURATION);
            targetOpacity *= fadeRatio;
        }

        enemy.opacity += (targetOpacity - enemy.opacity) * 0.1 * tick;

        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;
        const sway = Math.sin(enemy.swayTimer) * 1.5;

        enemy.vx = Math.cos(angle) * enemy.speed + Math.cos(perpAngle) * sway;
        enemy.vy = Math.sin(angle) * enemy.speed + Math.sin(perpAngle) * sway;

        enemy.x += enemy.vx * tick;
        enemy.y += enemy.vy * tick;
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: any): void {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        
        ctx.rotate(Math.atan2(enemy.vy, enemy.vx) + Math.PI / 2);
        ctx.globalAlpha = Math.max(0, enemy.opacity);
        
        // --- DEFINE GEOMETRY VERTICES ---
        const length = enemy.radius;
        const baseWidth = length * 0.7 * (enemy.skewFactor || 0.6);
        const backOffset = length * 0.3 * (enemy.flipSide ? 1 : -1);

        // Define the 3 coordinate points of our right-triangle shard
        const p0 = { x: 0, y: 0 }; // Nose
        const p1 = { x: 0, y: length }; // Tail Midpoint
        const p2 = enemy.flipSide 
            ? { x: baseWidth, y: length - backOffset }   // Right corner
            : { x: -baseWidth, y: length + backOffset }; // Left corner

        // --- RE-CENTER THE PIVOT AXIS (CENTROID) ---
        // A triangle's center of mass is simply the average of its 3 points
        const centerX = (p0.x + p1.x + p2.x) / 3;
        const centerY = (p0.y + p1.y + p2.y) / 3;

        ctx.beginPath();
        
        // Shift every coordinate point back by the center offset so the shard rotates around its center mass
        ctx.moveTo(p0.x - centerX, p0.y - centerY);
        ctx.lineTo(p1.x - centerX, p1.y - centerY);
        ctx.lineTo(p2.x - centerX, p2.y - centerY);
        
        ctx.closePath();
        
        ctx.fillStyle = '#00B2E1';
        ctx.fill();
        ctx.strokeStyle = '#006c8a';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }
}