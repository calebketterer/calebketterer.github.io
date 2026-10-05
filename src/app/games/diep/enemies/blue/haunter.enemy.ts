import { Enemy, Player, TrailSegment } from '../../core/diep.interfaces';

export class HaunterEnemy {

    public static metadata = {
        name: 'Haunter',
        faction: 'Blue',
        description: 'A ghastly ambush predator that stalls when watched.'
    };

    private static readonly CONFIG = {
        baseRadius: 20,
        stalkSpeed: 1.5,
        chargeSpeed: 8.0,
        trailInterval: 80, 
        trailLifespan: 1400,
        chargeDuration: 750, 
        aggroRange: 380,
        ambushTriggerRange: 220
    };

    private static readonly MIN_X = 50;
    private static readonly MAX_X = 750;
    private static readonly MIN_Y = 50;
    private static readonly MAX_Y = 550;

    public static create(x: number, y: number): Partial<Enemy> {
        let spawnX = 0;
        let spawnY = 0;
        const margin = 80;
        const edgeChoice = Math.floor(Math.random() * 4);

        switch (edgeChoice) {
            case 0:
                spawnX = HaunterEnemy.MIN_X + Math.random() * (HaunterEnemy.MAX_X - HaunterEnemy.MIN_X);
                spawnY = HaunterEnemy.MIN_Y - margin;
                break;
            case 1:
                spawnX = HaunterEnemy.MIN_X + Math.random() * (HaunterEnemy.MAX_X - HaunterEnemy.MIN_X);
                spawnY = HaunterEnemy.MAX_Y + margin;
                break;
            case 2:
                spawnX = HaunterEnemy.MIN_X - margin;
                spawnY = HaunterEnemy.MIN_Y + Math.random() * (HaunterEnemy.MAX_Y - HaunterEnemy.MIN_Y);
                break;
            case 3:
                spawnX = HaunterEnemy.MAX_X + margin;
                spawnY = HaunterEnemy.MIN_Y + Math.random() * (HaunterEnemy.MAX_Y - HaunterEnemy.MIN_Y);
                break;
        }

        return {
            x: spawnX, 
            y: spawnY,
            vx: 0,
            vy: 0,
            radius: HaunterEnemy.CONFIG.baseRadius,
            currentRadius: HaunterEnemy.CONFIG.baseRadius,
            color: '#00B2E1',
            health: 100,
            maxHealth: 100,
            scoreValue: 100,
            type: 'HAUNTER',
            isGhost: true,
            opacity: 0.01,
            angle: 0,
            state: 'INITIAL_ENTRY', 
            stateTimer: 0,
            swayTimer: Math.random() * 100,
            reflexCooldown: 0,
            chargeCooldown: 3000, 
            stateData: {
                ['trails']: [] as TrailSegment[],
                ['trailTimer']: 0,
                ['dashAngle']: 0,
                ['entryTargetX']: Math.max(HaunterEnemy.MIN_X + 50, Math.min(HaunterEnemy.MAX_X - 50, x)),
                ['entryTargetY']: Math.max(HaunterEnemy.MIN_Y + 50, Math.min(HaunterEnemy.MAX_Y - 50, y))
            }
        } as any;
    }

    public static update(enemy: any, player: Player, deltaTime: number, currentTime: number, moveTowards: any): void {
        const tick = deltaTime / 16.66;
        const stateData = enemy.stateData;
        enemy.stateTimer += deltaTime;
        
        if (enemy.reflexCooldown > 0) enemy.reflexCooldown -= deltaTime;
        if (enemy.chargeCooldown > 0) enemy.chargeCooldown -= deltaTime;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        if (enemy.currentRadius === undefined) enemy.currentRadius = enemy.radius || HaunterEnemy.CONFIG.baseRadius;

        stateData['trailTimer'] += deltaTime;
        if (stateData['trailTimer'] > HaunterEnemy.CONFIG.trailInterval && enemy.opacity > 0.03 && enemy.currentRadius > 4) {
            (stateData['trails'] as TrailSegment[]).push({
                x: enemy.x, y: enemy.y, radius: enemy.currentRadius * 0.85, maxRadius: enemy.currentRadius * 0.1, 
                color: 'rgba(235, 250, 255, 0.15)', opacity: enemy.state === 'CHARGE' ? 0.35 : 0.18,
                creationTime: currentTime, lifespan: HaunterEnemy.CONFIG.trailLifespan
            });
            stateData['trailTimer'] = 0;
        }

        const trails = stateData['trails'] as TrailSegment[];
        for (let i = trails.length - 1; i >= 0; i--) {
            const t = trails[i];
            const age = currentTime - t.creationTime;
            if (age > t.lifespan || age < 0) { trails.splice(i, 1); continue; }
            const lifeRatio = age / t.lifespan;
            t.opacity = (enemy.state === 'CHARGE' ? 0.35 : 0.18) * (1 - lifeRatio);
            t.radius = t.radius + (t.maxRadius - t.radius) * 0.04 * tick;
        }

        const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const playerAngle = (player as any).angle || 0;
        let angleDiff = Math.abs(playerAngle - angleToEnemy);
        if (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);
        const isPlayerLookingAtMe = angleDiff < 0.35;

        if (enemy.state === 'INITIAL_ENTRY') {
            const tx = stateData['entryTargetX'];
            const ty = stateData['entryTargetY'];
            const entryAngle = Math.atan2(ty - enemy.y, tx - enemy.x);
            enemy.vx = Math.cos(entryAngle) * HaunterEnemy.CONFIG.stalkSpeed;
            enemy.vy = Math.sin(entryAngle) * HaunterEnemy.CONFIG.stalkSpeed;
            enemy.x += enemy.vx * tick;
            enemy.y += enemy.vy * tick;
            enemy.opacity += (0.25 - enemy.opacity) * 0.05 * tick;
            const distToTarget = Math.sqrt(Math.pow(tx - enemy.x, 2) + Math.pow(ty - enemy.y, 2));
            if (distToTarget < 20 || (enemy.x > HaunterEnemy.MIN_X && enemy.x < HaunterEnemy.MAX_X && enemy.y > HaunterEnemy.MIN_Y && enemy.y < HaunterEnemy.MAX_Y)) {
                enemy.state = 'STALK';
            }
        } else if (enemy.state === 'STALK') {
            enemy.swayTimer += deltaTime * 0.003;
            const angle = Math.atan2(dy, dx);
            let currentStalkSpeed = HaunterEnemy.CONFIG.stalkSpeed;
            if (isPlayerLookingAtMe && distToPlayer > 150) currentStalkSpeed *= 0.15; 
            const perpAngle = angle + Math.PI / 2;
            const sway = Math.sin(enemy.swayTimer) * 2.0;
            enemy.vx = Math.cos(angle) * currentStalkSpeed + Math.cos(perpAngle) * sway;
            enemy.vy = Math.sin(angle) * currentStalkSpeed + Math.sin(perpAngle) * sway;
            enemy.x += enemy.vx * tick;
            enemy.y += enemy.vy * tick;
            
            // Opacity scales up when player is in shooting range
            let targetOpacity = 0.02;
            if (distToPlayer <= HaunterEnemy.CONFIG.aggroRange) {
                const distanceFactor = 1 - (distToPlayer / HaunterEnemy.CONFIG.aggroRange);
                targetOpacity = 0.05 + (0.7 * distanceFactor);
            }
            if (isPlayerLookingAtMe) targetOpacity *= 0.6;
            
            enemy.opacity += (targetOpacity - enemy.opacity) * 0.08 * tick;
            enemy.currentRadius += (HaunterEnemy.CONFIG.baseRadius - enemy.currentRadius) * 0.1 * tick;
            enemy.isGhost = distToPlayer > 160;
            
            if (distToPlayer < 320 && enemy.reflexCooldown <= 0 && isPlayerLookingAtMe) {
                enemy.state = 'FADING_OUT';
                enemy.stateTimer = 0;
                enemy.reflexCooldown = 4000; 
            } else if ((distToPlayer < 180 || (angleDiff > 2.2 && distToPlayer < 280)) && enemy.chargeCooldown <= 0) {
                enemy.state = 'CHARGE';
                enemy.stateTimer = 0;
                stateData['dashAngle'] = angle; 
                enemy.chargeCooldown = 4000;
            }
        } else if (enemy.state === 'CHARGE') {
            enemy.vx = Math.cos(stateData['dashAngle']) * HaunterEnemy.CONFIG.chargeSpeed;
            enemy.vy = Math.sin(stateData['dashAngle']) * HaunterEnemy.CONFIG.chargeSpeed;
            enemy.x += enemy.vx * tick;
            enemy.y += enemy.vy * tick;
            enemy.opacity += (0.95 - enemy.opacity) * 0.2 * tick;
            enemy.currentRadius += (HaunterEnemy.CONFIG.baseRadius * 1.2 - enemy.currentRadius) * 0.12 * tick; 
            enemy.isGhost = false;
            if (enemy.stateTimer > HaunterEnemy.CONFIG.chargeDuration) { enemy.state = 'STALK'; enemy.stateTimer = 0; }
        } else if (enemy.state === 'FADING_OUT') {
            enemy.opacity -= 0.16 * tick;
            enemy.currentRadius += (0 - enemy.currentRadius) * 0.22 * tick;
            enemy.isGhost = true;
            if (enemy.opacity <= 0 || enemy.currentRadius <= 0.5) {
                enemy.opacity = 0;
                enemy.currentRadius = 0;
                const blindSpotAngle = playerAngle + Math.PI + (Math.random() * 0.6 - 0.3);
                enemy.x = Math.max(HaunterEnemy.MIN_X, Math.min(HaunterEnemy.MAX_X, player.x + Math.cos(blindSpotAngle) * 220));
                enemy.y = Math.max(HaunterEnemy.MIN_Y, Math.min(HaunterEnemy.MAX_Y, player.y + Math.sin(blindSpotAngle) * 220));
                enemy.state = 'FADING_IN';
                enemy.stateTimer = 0;
            }
        } else if (enemy.state === 'FADING_IN') {
            enemy.opacity += 0.08 * tick;
            enemy.currentRadius += (HaunterEnemy.CONFIG.baseRadius - enemy.currentRadius) * 0.12 * tick;
            enemy.isGhost = true;
            if (enemy.currentRadius >= HaunterEnemy.CONFIG.baseRadius * 0.95) { enemy.currentRadius = HaunterEnemy.CONFIG.baseRadius; enemy.state = 'STALK'; }
        }

        if (enemy.state !== 'INITIAL_ENTRY') {
            enemy.x = Math.max(HaunterEnemy.MIN_X, Math.min(HaunterEnemy.MAX_X, enemy.x));
            enemy.y = Math.max(HaunterEnemy.MIN_Y, Math.min(HaunterEnemy.MAX_Y, enemy.y));
        }

        if (Math.abs(enemy.vx) > 0.05 || Math.abs(enemy.vy) > 0.05) {
            const targetAngle = Math.atan2(enemy.vy, enemy.vx);
            let diff = targetAngle - enemy.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            enemy.angle += diff * 0.1 * tick;
        }
        enemy.radius = enemy.currentRadius;
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: any): void {
        if (!enemy.stateData) {
            ctx.save(); ctx.translate(enemy.x, enemy.y); ctx.beginPath();
            ctx.arc(0, 0, enemy.radius || 20, 0, Math.PI * 2);
            ctx.fillStyle = enemy.color || '#00B2E1'; ctx.fill();
            ctx.strokeStyle = '#54e5ff'; ctx.lineWidth = 2.5; ctx.stroke();
            ctx.restore();
            return;
        }

        const trails = enemy.stateData['trails'] as TrailSegment[];
        if (trails && trails.length > 0) {
            ctx.save();
            for (const t of trails) {
                if (t.radius <= 0 || t.opacity <= 0) continue;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                ctx.fillStyle = t.color; ctx.globalAlpha = t.opacity; ctx.fill();
            }
            ctx.restore();
        }

        if (enemy.currentRadius <= 0.5) return;

        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle || 0);
        ctx.globalAlpha = Math.max(0.1, enemy.opacity || 0.1);
        ctx.beginPath();
        ctx.arc(0, 0, enemy.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#3498db';
        ctx.fill();
        ctx.strokeStyle = enemy.isGhost ? '#006c8a' : '#35acc1';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    }
}