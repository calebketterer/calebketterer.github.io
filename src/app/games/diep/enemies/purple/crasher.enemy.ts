import { Enemy, Player } from '../../core/diep.interfaces';

export class CrasherEnemy {
    public static metadata = {
        name: 'Crasher',
        faction: 'Purple',
        description: 'A swift, triangular unit that relies on high-speed impacts to deal damage.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        const sizeVariation = (Math.random() * 6) - 3;
        const speedVariation = (Math.random() * 0.4) - 0.2;

        return {
            id: Math.random().toString(36).substr(2, 9),
            x, y, 
            radius: 10 + sizeVariation, 
            color: '#BE7FF5',
            health: 20, 
            maxHealth: 20, 
            scoreValue: 20,
            type: 'CRASHER',
            speedMultiplier: 1.8 + speedVariation,
            onUpdate: (enemy: Enemy, player: Player, deltaTime: number) => {
                const moveTowards = (enemy as any).moveTowards;
                CrasherEnemy.update(enemy, player, deltaTime, Date.now(), moveTowards);
            },
            onDraw: (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
                // We pass 'undefined' or a global player reference if engine provides one
                const player = (enemy as any).playerReference; 
                CrasherEnemy.draw(ctx, enemy, player);
            }
        };
    }

    public static update(enemy: Enemy, player: Player, deltaTime: number, currentTime: number, moveTowards: Function): void {
        if (moveTowards) {
            moveTowards(enemy, deltaTime, player.x, player.y, 2 * (enemy.speedMultiplier || 1));
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy, player?: Player): void {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        
        // Calculate rotation: Use player position if available, otherwise default to "up"
        let angle = 0;
        if (player) {
            angle = Math.atan2(player.y - enemy.y, player.x - enemy.x) + Math.PI / 2;
        }
        
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, -enemy.radius);
        ctx.lineTo(-enemy.radius * 0.8, enemy.radius * 0.6);
        ctx.lineTo(enemy.radius * 0.8, enemy.radius * 0.6);
        ctx.closePath();
        
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#8e44ad';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    }
}