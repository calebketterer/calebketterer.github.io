import { Enemy, Player, Bullet } from '../../core/diep.interfaces';

export class FloaterEnemy {

    public static metadata = {
        name: 'Floater',
        faction: 'Green',
        description: 'A volatile bio-hazard unit that emits a toxic aura and bursts into corrosive puddles upon death.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        const randomBodySize = Math.floor(Math.random() * (50 - 25 + 1)) + 25;
        const toxicRange = Math.floor(Math.random() * (50 - 25 + 1)) + 100;

        return {
            x, y, 
            radius: randomBodySize,
            color: '#00E673',
            health: (randomBodySize * 4),
            maxHealth: (randomBodySize * 4),
            scoreValue: (randomBodySize * 2),
            type: 'FLOATER',
            isPassive: true, 
            onSpawn: (enemy: any, canvasWidth: number, canvasHeight: number) => {
                const margin = randomBodySize + 100;
                const width = canvasWidth > 0 ? canvasWidth : 1600;
                const height = canvasHeight > 0 ? canvasHeight : 900;

                // Safely anchor initial targeting inside known parameters
                enemy.targetX = margin + Math.random() * (width - margin * 2);
                enemy.targetY = margin + Math.random() * (height - margin * 2);
                enemy.speedModifier = 0.5;
            },
            onUpdate: (enemy: any, player: Player, deltaTime: number) => {
                const tick = deltaTime / 16.66;
                
                // Toxic aura distance calculation
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) < enemy.radius + toxicRange) {
                    player.health -= 0.5 * tick;
                }
            },
            onHit: (enemies: Enemy[], _spawner: any, bullet: Bullet) => {
                FloaterEnemy.spawnPuddleLogic(enemies, bullet.x, bullet.y, randomBodySize);
            },
            onDeath: (enemies: Enemy[], spawner: any, deadEnemy: any) => {
                const puddleCount = Math.floor(Math.random() * 4) + 5;
                for (let i = 0; i < puddleCount; i++) {
                    FloaterEnemy.spawnPuddleLogic(
                        enemies, 
                        deadEnemy.x + (Math.random() - 0.5) * 160, 
                        deadEnemy.y + (Math.random() - 0.5) * 160, 
                        deadEnemy.radius
                    );
                }
            }
        };
    }

    private static spawnPuddleLogic(enemies: Enemy[], x: number, y: number, baseRadius: number): void {
        const puddle: Enemy = {
            id: Math.random().toString(36).substring(2, 9),
            x, y, vx: 0, vy: 0, mass: 0, bodyDamage: 0, scoreValue: 0,
            radius: Math.floor(Math.random() * (baseRadius * 0.8 - 10 + 1)) + 10,
            color: '#33cc3333',
            health: 1, maxHealth: 1,
            type: 'FLOATER', isGhost: true, isPassive: true, 
            spawnTime: Date.now(),
            lifespan: 12000 + (Math.random() * 5000),
            targetX: x, targetY: y,
            onUpdate: (p: any, player: Player, deltaTime: number) => {
                const dx = p.x - player.x;
                const dy = p.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) < p.radius) {
                    player.health -= 0.35 * (deltaTime / 16.66);
                }
                if (Date.now() - p.spawnTime > p.lifespan) p.health = 0; 
            }
        };
        enemies.push(puddle);
    }

    public static update(enemy: Enemy, player: Player, deltaTime: number, currentTime: number, moveTowards: Function): void {
        const e = enemy as any;
        const tx = e.targetX ?? enemy.x;
        const ty = e.targetY ?? enemy.y;

        const distDx = tx - enemy.x;
        const distDy = ty - enemy.y;
        const distanceToTarget = Math.sqrt(distDx * distDx + distDy * distDy);

        // Explicitly tie arena scale context to engine updates if possible, or fall back to predictable baseline bounds
        // Changed static window values to match baseline coordinates used by functional entities like Blaster Enemy
        const areaWidth = 800;  
        const areaHeight = 600; 
        const safePadding = enemy.radius + 40; 

        if (e.targetX === undefined || distanceToTarget < enemy.radius + 20) {
            e.targetX = safePadding + Math.random() * (areaWidth - safePadding * 2);
            e.targetY = safePadding + Math.random() * (areaHeight - safePadding * 2);
        }

        // Biological movement personality pulsing calculation
        const speedCycleTime = currentTime / 1200; 
        e.speedModifier = 0.2 + (Math.sin(speedCycleTime) * Math.cos(speedCycleTime * 0.5) + 1) * 0.45;

        const activeSpeed = (tx === enemy.x && ty === enemy.y) ? 0 : e.speedModifier;
        moveTowards(enemy, deltaTime, e.targetX, e.targetY, activeSpeed);
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        const timeFactor = Date.now();
        const isPuddle = (enemy.isGhost || enemy.isPassive) && (enemy as any).spawnTime !== undefined;

        if (isPuddle) {
            const age = timeFactor - (enemy as any).spawnTime;
            const rem = (enemy as any).lifespan - age;
            let r = enemy.radius + Math.sin(timeFactor / 400) * 2;
            if (rem < 1500) r *= Math.max(0, rem / 1500);

            if (r > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, r, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(enemy.x, enemy.y, r * 0.85, enemy.x, enemy.y, r);
                grad.addColorStop(0, 'rgba(46, 204, 113, 0.35)'); 
                grad.addColorStop(1, 'rgba(46, 204, 113, 0)');    
                ctx.fillStyle = grad;
                ctx.fill();
                ctx.restore();
            }
            return;
        }

        ctx.save();
        ctx.beginPath();
        
        const isMenuPreview = (enemy as any).targetX === undefined;
        const auraMaxPadding = isMenuPreview ? 16 : 130;
        const waveStrength = isMenuPreview ? 3 : 22;
        const rippleStrength = isMenuPreview ? 1 : 4;
        
        const auraR = enemy.radius + auraMaxPadding + Math.sin(timeFactor / 800) * waveStrength + Math.cos(timeFactor / 350) * rippleStrength;
        
        ctx.arc(enemy.x, enemy.y, auraR, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(enemy.x, enemy.y, enemy.radius * 0.3, enemy.x, enemy.y, auraR);
        gradient.addColorStop(0, 'rgba(0, 230, 115, 0.22)'); 
        gradient.addColorStop(0.5, 'rgba(51, 204, 51, 0.08)');
        gradient.addColorStop(1, 'rgba(51, 204, 51, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00E673'; 
        ctx.fill();
        ctx.strokeStyle = '#007e3f';
        ctx.lineWidth = isMenuPreview ? 2.5 : 5 + Math.sin(timeFactor / 800) * 1.5; 
        ctx.stroke();
        ctx.restore();
    }
}