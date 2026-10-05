import { Enemy, Player, Bullet } from '../../core/diep.interfaces';
import { DiepPhysics } from '../../core/diep.physics';

export class SniperEnemy {
    public static metadata = {
        name: 'Sniper', faction: 'Red',
        description: 'A long-range specialist that maintains distance and fires high-velocity rounds.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        const radius = 22;
        const maxHealth = 100;
        return {
            type: 'SNIPER', x, y, vx: 0, vy: 0,
            radius, color: '#e74c3c',
            health: maxHealth, maxHealth: maxHealth, bodyDamage: 30,
            scoreValue: 100, lastShotTime: 0, rotationAngle: 0,
            mass: DiepPhysics.calculateMass(radius, maxHealth),
            onUpdate: (enemy: Enemy, player: Player, deltaTime: number) => {
                const moveTowards = (enemy as any).moveTowards;
                const bullets = (enemy as any).bulletsArray; 
                if (Array.isArray(bullets)) {
                    SniperEnemy.update(enemy, player, deltaTime, Date.now(), moveTowards, bullets);
                }
            },
            onDraw: (ctx: CanvasRenderingContext2D, enemy: Enemy) => { SniperEnemy.draw(ctx, enemy); }
        };
    }

    public static update(enemy: Enemy, player: Player, deltaTime: number, currentTime: number, moveTowards: Function, bullets: Bullet[]): void {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemy.rotationAngle = Math.atan2(dy, dx);

        enemy.vx *= 0.92;
        enemy.vy *= 0.92;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        if (dist > 400) {
            if (moveTowards) moveTowards(enemy, deltaTime, player.x, player.y, 1.0);
        } else if (dist < 250) {
            const retreatX = enemy.x - Math.cos(enemy.rotationAngle!) * 100;
            const retreatY = enemy.y - Math.sin(enemy.rotationAngle!) * 100;
            if (moveTowards) moveTowards(enemy, deltaTime, retreatX, retreatY, 1.0);
        } else {
            if (currentTime - (enemy.lastShotTime || 0) > 3500) {
                const bulletSpeed = 12;
                
                const newBullet = DiepPhysics.createBullet({
                    x: enemy.x + Math.cos(enemy.rotationAngle!) * 40,
                    y: enemy.y + Math.sin(enemy.rotationAngle!) * 40,
                    dx: Math.cos(enemy.rotationAngle!) * bulletSpeed,
                    dy: Math.sin(enemy.rotationAngle!) * bulletSpeed,
                    radius: 7.5, color: enemy.color, ownerType: 'ENEMY',
                    health: 10, maxHealth: 10, damage: 10
                });

                DiepPhysics.applyFiringRecoil(enemy, newBullet, bulletSpeed, enemy.rotationAngle!);
                bullets.push(newBullet);
                enemy.lastShotTime = currentTime;
            }
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        const barrelWidth = 18; 
        const barrelLength = enemy.radius * 2; 
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotationAngle || 0);
        ctx.fillStyle = '#999999'; ctx.strokeStyle = '#727272'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.rect(0, -barrelWidth / 2, barrelLength, barrelWidth); ctx.fill(); ctx.stroke();
        ctx.restore();
        ctx.beginPath(); ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color; ctx.fill(); ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 2.5; ctx.stroke();
    }
}