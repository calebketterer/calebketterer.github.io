import { Enemy, Player } from '../../core/diep.interfaces';

export class MinionEnemy {
    public static metadata = {
        name: 'Minion',
        faction: 'Purple',
        description: 'Small, fast units spawned from fallen Mothers that relentlessly chase the player.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        return {
            id: Math.random().toString(36).substr(2, 9),
            type: 'MINION',
            x, y, 
            radius: 10, 
            color: '#BE7FF5',
            health: 10, 
            maxHealth: 10, 
            scoreValue: 5,
            speedMultiplier: 1.2,
            onUpdate: (enemy: Enemy, player: Player, deltaTime: number) => {
                const moveTowards = (enemy as any).moveTowards;
                MinionEnemy.update(enemy, player, deltaTime, Date.now(), moveTowards);
            },
            onDraw: (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
                MinionEnemy.draw(ctx, enemy);
            }
        };
    }

    public static update(enemy: Enemy, player: Player, deltaTime: number, currentTime: number, moveTowards: Function): void {
        const multiplier = enemy.speedMultiplier || 1;
        if (moveTowards) {
            moveTowards(enemy, deltaTime, player.x, player.y, 3.5 * multiplier);
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}