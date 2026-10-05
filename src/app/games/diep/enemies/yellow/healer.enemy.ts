import { Enemy, Player } from '../../core/diep.interfaces';

export class HealerEnemy {

    public static metadata = {
        name: 'Healer',
        faction: 'Yellow',
        description: 'A passive unit that wanders the battlefield provides a health boost on death.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        return {
            x, y, radius: 15, color: '#f1c40f',
            health: 25, maxHealth: 25, scoreValue: 100,
            type: 'HEALER',
            isPassive: true,
            canDespawn: true, 
            
            // Original Movement state
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            speedPhase: Math.random() * Math.PI * 2,
            
            // Lifespan state
            spawnTime: Date.now(),
            isLeaving: false,

            onDeath: (enemies: Enemy[], spawner: any, deadEnemy: Enemy, player: Player) => {
                player.health = Math.min(player.maxHealth, player.health + 25);
            }
        } as any;
    }

    public static update(enemy: any, player: Player, deltaTime: number): void {
        const tick = deltaTime / 10;
        enemy.rotation += enemy.rotationSpeed * tick;
        enemy.speedPhase += 0.02;
        const speedVar = Math.sin(enemy.speedPhase) * 0.5 + 1;

        // Check lifespan
        if (!enemy.isLeaving && Date.now() - enemy.spawnTime > 10000) {
            enemy.isLeaving = true;
        }

        // Apply movement
        enemy.x += enemy.vx * speedVar * tick;
        enemy.y += enemy.vy * speedVar * tick;

        // --- BOUNDARY LOGIC ---
        const margin = enemy.radius + 5;
        const width = 2000; 
        const height = 2000; 

        if (!enemy.isLeaving) {
            // Bounce off walls to stay fully on screen
            if (enemy.x < margin) { enemy.x = margin; enemy.vx *= -1; }
            if (enemy.x > width - margin) { enemy.x = width - margin; enemy.vx *= -1; }
            if (enemy.y < margin) { enemy.y = margin; enemy.vy *= -1; }
            if (enemy.y > height - margin) { enemy.y = height - margin; enemy.vy *= -1; }

            // Occasional direction shifts
            if (Math.random() < 0.005) {
                enemy.vx = (Math.random() - 0.5) * 2;
                enemy.vy = (Math.random() - 0.5) * 2;
            }
        } else {
            // If leaving and far off screen, kill it silently
            if (enemy.x < -100 || enemy.x > width + 100 || enemy.y < -100 || enemy.y > height + 100) {
                enemy.health = 0;
            }
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: any): void {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation);
        ctx.fillStyle = enemy.color;
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        const size = enemy.radius * 2;
        ctx.fillRect(-enemy.radius, -enemy.radius, size, size);
        ctx.strokeRect(-enemy.radius, -enemy.radius, size, size);
        ctx.restore();
    }
}