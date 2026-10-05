import { Enemy, Player, Bullet } from '../../core/diep.interfaces';
import { DiepPhysics } from '../../core/diep.physics';
import { DiepTimeManager } from '../../core/diep.time-manager'; // Import the manager

export class BomberEnemy {
    public static metadata = {
        name: 'Bomber',
        faction: 'Orange',
        description: 'A heavy unit that launches bombs. Higher mass makes it resistant to knockback.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        const radius = 25;
        const maxHealth = 200;
        return {
            type: 'BOMBER',
            x, y, vx: 0, vy: 0,
            radius, color: '#e67e22',
            health: maxHealth, 
            maxHealth: maxHealth, 
            bodyDamage: 40,
            scoreValue: 200,
            rotationAngle: 0,
            targetX: x, 
            targetY: y,
            lastShotTime: 0,
            spawnTime: 0,
            mass: DiepPhysics.calculateMass(radius, maxHealth) * 2.5 
        };
    }

    public static update(
        enemy: Enemy, 
        player: Player, 
        deltaTime: number, 
        currentTime: number, 
        moveTowards: Function, 
        bullets: Bullet[]
    ): void {
        // Use the manager's pausable time
        const ms = DiepTimeManager.gameMs;
        if (ms <= 0 && !(enemy as any).isExploding) return; 

        // Increment accumulators
        enemy.lastShotTime = (enemy.lastShotTime || 0) + ms;
        enemy.spawnTime = (enemy.spawnTime || 0) + ms;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);
        enemy.rotationAngle = Math.atan2(dy, dx);

        enemy.vx *= 0.95;
        enemy.vy *= 0.95;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Targeting Logic - Using the accumulated timer instead of raw timestamps
        const distToTarget = Math.sqrt(Math.pow((enemy.targetX || 0) - enemy.x, 2) + Math.pow((enemy.targetY || 0) - enemy.y, 2));
        
        // Logic: Change target if reached, or if player is close and 1s passed, or if 8s passed total
        if (distToTarget < 30 || (distToPlayer < 200 && enemy.spawnTime > 1000) || enemy.spawnTime > 8000) {
            let tx = enemy.x, ty = enemy.y;
            if (distToPlayer < 200) {
                const angleAway = Math.atan2(enemy.y - player.y, enemy.x - player.x);
                tx = enemy.x + Math.cos(angleAway) * 500;
                ty = enemy.y + Math.sin(angleAway) * 500;
            } else {
                tx = Math.random() * 700 + 50; 
                ty = Math.random() * 500 + 50;
            }
            enemy.targetX = Math.max(40, Math.min(760, tx));
            enemy.targetY = Math.max(40, Math.min(560, ty));
            enemy.spawnTime = 0;
        }
        moveTowards(enemy, deltaTime, enemy.targetX, enemy.targetY, 0.8);

        const isOnScreen = enemy.x > 0 && enemy.x < 800 && enemy.y > 0 && enemy.y < 600;

        // Shooting logic using the accumulator
        if (isOnScreen && enemy.lastShotTime > 3500) {
            const bulletSpeed = distToPlayer * 0.026;
            
            const newBullet = DiepPhysics.createBullet({
                x: enemy.x, y: enemy.y,
                dx: Math.cos(enemy.rotationAngle!) * bulletSpeed, 
                dy: Math.sin(enemy.rotationAngle!) * bulletSpeed,
                radius: 20, color: '#d35400',
                ownerType: 'ENEMY',
                isBomb: true,
                timer: 4000, maxTimer: 4000,
                health: 250,
                maxHealth: 250,
                damage: 5
            });

            DiepPhysics.applyFiringRecoil(enemy, newBullet, bulletSpeed, enemy.rotationAngle!);
            bullets.push(newBullet);
            enemy.lastShotTime = 0; // Reset accumulator
        }

        // Bomb Explosion logic - also needs to use gameMs so bombs don't explode while paused
        bullets.forEach(b => {
            if (b.isBomb && b.timer !== undefined) {
                if (!b.isExploding) {
                    b.timer -= ms; // Countdown bomb fuse
                    const dP = Math.sqrt(Math.pow(player.x - b.x, 2) + Math.pow(player.y - b.y, 2));
                    const hitWall = b.x < 15 || b.x > 785 || b.y < 15 || b.y > 585;

                    if (dP < b.radius + player.radius || hitWall || b.timer <= 1000) {
                        if (dP < b.radius + player.radius) player.health -= 5;
                        if (dP < 135 + player.radius) player.health -= 35;
                        b.isExploding = true;
                        b.timer = 1000; 
                        b.dx = 0; b.dy = 0;
                    }
                } else {
                    b.timer -= ms; // Handle the "fade out" of the explosion
                }
            }
        });
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy, player: Player, bullets: Bullet[]): void {
        if (bullets) {
            bullets.forEach(b => {
                if (b.isBomb && b.timer !== undefined) {
                    if (b.isExploding) {
                        const opacity = b.timer / 1000;
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(b.x, b.y, 135, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(230, 126, 34, ${opacity * 0.5})`;
                        ctx.fill();
                        ctx.strokeStyle = `rgba(211, 84, 0, ${opacity})`;
                        ctx.lineWidth = 4;
                        ctx.stroke();
                        ctx.restore();
                    } else {
                        ctx.beginPath();
                        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
                        ctx.fillStyle = b.color;
                        ctx.fill();
                        ctx.strokeStyle = '#a84300';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            });
        }

        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotationAngle || 0);
        ctx.fillStyle = '#95a5a6';
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 2.5;
        ctx.fillRect(0, -18, 45, 36); 
        ctx.strokeRect(0, -18, 45, 36);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#a84300';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}