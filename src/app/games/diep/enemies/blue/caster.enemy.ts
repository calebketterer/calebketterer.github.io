import { Enemy, Player, Bullet } from '../../core/diep.interfaces';

export class CasterEnemy {

    public static metadata = {
        name: 'Caster',
        faction: 'Blue',
        description: 'An elusive phantom that utilizes lightning-fast teleports and summoning rituals.'
    };

    // --- CONFIGURATION TUNING VARIANCE ---
    private static readonly BASE_RADIUS = 22;
    private static readonly RADIUS_VARIANCE = 4; 

    private static readonly BASE_HEALTH = 100;
    private static readonly HEALTH_VARIANCE = 30; 

    private static readonly BASE_MAX_SPEED = 1.2;
    private static readonly SPEED_VARIANCE = 0.4; 

    // --- ARENA CONSTANTS ---
    private static readonly MIN_X = 40;
    private static readonly MAX_X = 760;
    private static readonly MIN_Y = 40;
    private static readonly MAX_Y = 560;

    public static create(x: number, y: number): Partial<Enemy> {
        const randomizedInterval = 5500 + Math.random() * 3000;

        const radius = CasterEnemy.BASE_RADIUS + (Math.random() * 2 - 1) * CasterEnemy.RADIUS_VARIANCE;
        const health = Math.round(CasterEnemy.BASE_HEALTH + (Math.random() * 2 - 1) * CasterEnemy.HEALTH_VARIANCE);
        const maxSpeed = CasterEnemy.BASE_MAX_SPEED + (Math.random() * 2 - 1) * CasterEnemy.SPEED_VARIANCE;

        const safeX = Math.max(CasterEnemy.MIN_X, Math.min(CasterEnemy.MAX_X, x));
        const safeY = Math.max(CasterEnemy.MIN_Y, Math.min(CasterEnemy.MAX_Y, y));

        return {
            x: safeX, 
            y: safeY,
            radius,
            health,
            maxHealth: health,
            scoreValue: 200,
            type: 'CASTER',
            isGhost: true, 
            opacity: 1,
            angle: 0, 
            state: 'WANDERING',
            stateTimer: 0,
            teleportCount: 0,
            reflexCooldown: 0,
            pulseTimer: 0,
            pulseInterval: randomizedInterval, 
            targetX: safeX, targetY: safeY,
            vx: 0, vy: 0,
            maxSpeed,
            teleX: 0, teleY: 0,
            teleStartX: 0, teleStartY: 0,
            teleProgress: 0
        } as any;
    }

    public static update(
        enemy: any, 
        player: Player, 
        deltaTime: number, 
        currentTime: number, 
        moveTowards: any, 
        bullets: Bullet[]
    ): void {
        const tick = deltaTime / 16.66;
        enemy.stateTimer += deltaTime;
        enemy.pulseTimer += deltaTime;
        if (enemy.reflexCooldown > 0) enemy.reflexCooldown -= deltaTime;

        const distanceActual = Math.sqrt((player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2);
        
        // --- STATE: TELEPORTING (The lightning streak) ---
        if (enemy.state === 'TELEPORTING') {
            enemy.teleProgress += 0.08 * tick; 
            enemy.isGhost = true; 
            enemy.opacity = 0.8;

            enemy.x = enemy.teleStartX + (enemy.teleX - enemy.teleStartX) * enemy.teleProgress;
            enemy.y = enemy.teleStartY + (enemy.teleY - enemy.teleStartY) * enemy.teleProgress;

            enemy.x = Math.max(CasterEnemy.MIN_X, Math.min(CasterEnemy.MAX_X, enemy.x));
            enemy.y = Math.max(CasterEnemy.MIN_Y, Math.min(CasterEnemy.MAX_Y, enemy.y));

            if (enemy.teleProgress >= 1) {
                enemy.state = 'WANDERING';
                enemy.teleProgress = 0;
                enemy.reflexCooldown = 800; 
                enemy.vx = 0; enemy.vy = 0;
            }
            return; 
        }

        const isSummoning = enemy.state === 'PULSING';
        const isNearPlayer = distanceActual < 100;
        enemy.isGhost = !(isSummoning || isNearPlayer);

        // Rotation Logic
        if (Math.abs(enemy.vx) > 0.05 || Math.abs(enemy.vy) > 0.05) {
            const targetAngle = Math.atan2(enemy.vy, enemy.vx);
            let diff = targetAngle - enemy.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            enemy.angle += diff * 0.1 * tick;
        }

        // Teleport Reflex Trigger
        if (!isSummoning && enemy.reflexCooldown <= 0 && enemy.teleportCount < 3) {
            const playerLookAngle = (player as any).angle || 0;
            const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
            let aimDiff = Math.abs(playerLookAngle - angleToEnemy);
            if (aimDiff > Math.PI) aimDiff = Math.abs(aimDiff - Math.PI * 2);

            if (aimDiff < 0.25) {
                enemy.state = 'TELEPORTING';
                enemy.teleStartX = enemy.x;
                enemy.teleStartY = enemy.y;
                enemy.teleProgress = 0;

                const dist = 280;
                let escapeAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                escapeAngle += (Math.PI / 3) * (Math.random() > 0.5 ? 1 : -1);

                let targetX = enemy.x + Math.cos(escapeAngle) * dist;
                let targetY = enemy.y + Math.sin(escapeAngle) * dist;

                const outOfX = targetX < CasterEnemy.MIN_X || targetX > CasterEnemy.MAX_X;
                const outOfY = targetY < CasterEnemy.MIN_Y || targetY > CasterEnemy.MAX_Y;

                if (outOfX || outOfY) {
                    const reverseAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
                    targetX = player.x + Math.cos(reverseAngle) * (dist * 0.75);
                    targetY = player.y + Math.sin(reverseAngle) * (dist * 0.75);
                }

                enemy.teleX = Math.max(CasterEnemy.MIN_X, Math.min(CasterEnemy.MAX_X, targetX));
                enemy.teleY = Math.max(CasterEnemy.MIN_Y, Math.min(CasterEnemy.MAX_Y, targetY));
                
                enemy.teleportCount++;
            }
        }

        // Normal Wandering/Summoning Logic
        if (enemy.state === 'WANDERING') {
            if (distanceActual < 150) {
                const escapeAngle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                enemy.vx += Math.cos(escapeAngle) * 0.05;
                enemy.vy += Math.sin(escapeAngle) * 0.05;
            } else {
                const distToTarget = Math.sqrt((enemy.x - enemy.targetX)**2 + (enemy.y - enemy.targetY)**2);
                if (distToTarget < 50) {
                    enemy.targetX = CasterEnemy.MIN_X + Math.random() * (CasterEnemy.MAX_X - CasterEnemy.MIN_X);
                    enemy.targetY = CasterEnemy.MIN_Y + Math.random() * (CasterEnemy.MAX_Y - CasterEnemy.MIN_Y);
                }
                const angle = Math.atan2(enemy.targetY - enemy.y, enemy.targetX - enemy.x);
                enemy.vx += Math.cos(angle) * 0.03;
                enemy.vy += Math.sin(angle) * 0.03;
            }

            const speed = Math.sqrt(enemy.vx**2 + enemy.vy**2);
            if (speed > enemy.maxSpeed) {
                enemy.vx *= (enemy.maxSpeed / speed);
                enemy.vy *= (enemy.maxSpeed / speed);
            }

            enemy.x += enemy.vx * tick;
            enemy.y += enemy.vy * tick;

            enemy.x = Math.max(CasterEnemy.MIN_X, Math.min(CasterEnemy.MAX_X, enemy.x));
            enemy.y = Math.max(CasterEnemy.MIN_Y, Math.min(CasterEnemy.MAX_Y, enemy.y));

            enemy.opacity += ((isNearPlayer ? 0.6 : 0.1) - enemy.opacity) * 0.05 * tick;

            if (enemy.pulseTimer > enemy.pulseInterval) {
                enemy.state = 'PULSING';
                enemy.stateTimer = 0;
            }
        } else if (isSummoning) {
            enemy.opacity = 0.3 + Math.sin((enemy.stateTimer / 1500) * Math.PI) * 0.5;
            enemy.vx *= 0.92; enemy.vy *= 0.92;
            
            if (enemy.stateTimer > 750 && !enemy.hasSummoned) {
                enemy.needsSpawn = true; enemy.hasSummoned = true;
            }
            if (enemy.stateTimer > 1500) {
                enemy.state = 'WANDERING'; 
                enemy.pulseTimer = 0;
                enemy.hasSummoned = false; 
                enemy.teleportCount = 0; 
                enemy.pulseInterval = 5500 + Math.random() * 3000;
            }
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: any): void {
        ctx.save();

        if (enemy.state === 'TELEPORTING') {
            ctx.strokeStyle = '#81d4fa';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(enemy.teleStartX, enemy.teleStartY);
            
            const segments = 4;
            for (let i = 1; i <= segments; i++) {
                const px = enemy.teleStartX + (enemy.x - enemy.teleStartX) * (i / segments);
                const py = enemy.teleStartY + (enemy.y - enemy.teleStartY) * (i / segments);
                const offset = (Math.random() - 0.5) * 20;
                ctx.lineTo(px + offset, py + offset);
            }
            ctx.stroke();

            ctx.globalAlpha = 1 - enemy.teleProgress;
            ctx.beginPath();
            ctx.arc(enemy.teleStartX, enemy.teleStartY, enemy.radius * (1 + enemy.teleProgress), 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw actual body
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle + Math.PI / 2); 
        ctx.globalAlpha = Math.max(0.1, enemy.opacity || 0.1);
        ctx.shadowBlur = enemy.isGhost ? 5 : 15;
        ctx.shadowColor = '#b3e5fc';

        ctx.beginPath();
        const sides = 5;
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
            ctx.lineTo(enemy.radius * Math.cos(angle), enemy.radius * Math.sin(angle));
        }
        ctx.closePath();
        
        ctx.fillStyle = '#00B2E1'; 
        ctx.fill();
        ctx.strokeStyle = enemy.isGhost ? '#006c8a' : '#27627e3f'; 
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }
}