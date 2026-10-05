import { Enemy, Player } from '../../core/diep.interfaces';

export class RollerEnemy {

    public static metadata = {
        name: 'Roller',
        faction: 'Red',
        description: 'A slow, standard enemy.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        // Randomize size and scale stats accordingly
        const radius = 10 + Math.random() * 20;
        const normalizedRadius = (radius - 10) / 20;
        const health = Math.floor(radius * 4.5 + 10);
        
        return {
            x, y, radius, 
            color: '#e74c3c',
            health: health, 
            maxHealth: health,
            scoreValue: health,
            speedMultiplier: 8.0 - normalizedRadius * 2.0
        };
    }

    public static update(
        enemy: Enemy, 
        player: Player, 
        deltaTime: number, 
        currentTime: number, 
        moveTowards: Function
    ): void {
        const baseSpeed = 0.3;
        const speed = baseSpeed * (enemy.speedMultiplier || 1);
        moveTowards(enemy, deltaTime, player.x, player.y, speed);
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.strokeStyle = '#aa281a';
        ctx.lineWidth = 2.5;
        ctx.stroke();
    }
}