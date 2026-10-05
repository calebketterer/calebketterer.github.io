import { Enemy, Player, Bullet } from '../../core/diep.interfaces';
import { DiepPhysics } from '../../core/diep.physics';

export class GunnerEnemy {
    public static metadata = {
        name: 'Gunner',
        faction: 'Green',
        description: 'An agile marksman that maintains distance while suppressing targets with heavy, high-impact projectiles.'
    };

    /**
     * Factory for creating the initial Gunner state.
     * Note: DiepEnemyService will merge these with global defaults.
     */
    public static create(x: number, y: number): Partial<Enemy> {
        const radius = 22;
        const maxHealth = 100;
        
        return {
            type: 'GUNNER',
            x, 
            y, 
            vx: 0, 
            vy: 0, 
            radius, 
            color: '#00E673',
            health: maxHealth, 
            maxHealth: maxHealth, 
            bodyDamage: 25,
            scoreValue: 100, 
            lastShotTime: 0, 
            rotationAngle: 0,
            mass: DiepPhysics.calculateMass(radius, maxHealth)
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
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemy.rotationAngle = Math.atan2(dy, dx);

        // Apply Friction and Velocity
        enemy.vx *= 0.9;
        enemy.vy *= 0.9;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        const bulletSpeed = 5;
        const bulletSize = 15;
        const fireRate = 750;
        const stopDistance = 200;
        const retreatDistance = 100;

        if (dist > stopDistance) {
            moveTowards(enemy, deltaTime, player.x, player.y, 2.0);
        } else if (dist < retreatDistance) {
            const retreatX = enemy.x - Math.cos(enemy.rotationAngle!) * 100;
            const retreatY = enemy.y - Math.sin(enemy.rotationAngle!) * 100;
            moveTowards(enemy, deltaTime, retreatX, retreatY, 2.0);
        } else {
            if (currentTime - (enemy.lastShotTime || 0) > fireRate) {
                
                // 1. Generate the bullet with automated mass calculation
                const newBullet = DiepPhysics.createBullet({
                    x: enemy.x + Math.cos(enemy.rotationAngle!) * 35, 
                    y: enemy.y + Math.sin(enemy.rotationAngle!) * 35,
                    dx: Math.cos(enemy.rotationAngle!) * bulletSpeed,
                    dy: Math.sin(enemy.rotationAngle!) * bulletSpeed,
                    radius: bulletSize, 
                    color: enemy.color, 
                    ownerType: 'ENEMY',
                    hasTrail: true,
                    health: 25,
                    maxHealth: 25,
                    damage: 10
                });

                // 2. Apply Recoil based on the Bullet's momentum vs Enemy's mass
                DiepPhysics.applyFiringRecoil(enemy, newBullet, bulletSpeed, enemy.rotationAngle!);

                bullets.push(newBullet);
                enemy.lastShotTime = currentTime;
            }
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        const barrelWidth = 25;
        const barrelLength = enemy.radius * 1.5;
        
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotationAngle || 0);
        
        // Barrel
        ctx.fillStyle = '#999999';
        ctx.strokeStyle = '#727272';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.rect(0, -barrelWidth / 2, barrelLength, barrelWidth);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Body
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#007e3f';
        ctx.lineWidth = 2.5;
        ctx.stroke();
    }
}