import { Enemy, Player } from '../../core/diep.interfaces';

export type SmasherState = 'APPROACH' | 'FLANK' | 'ATTACK' | 'DODGE';

export class SmasherEnemy {
    // Metadata for Quadrivium compatibility
    public static metadata = {
        name: 'Smasher',
        faction: 'Red',
        description: 'A relentless crimson unit that maintains high momentum to crush targets.'
    };

    private static readonly BASE_RADIUS = 25;
    private static readonly BASE_HEALTH = 250;
    private static readonly ATTACK_SPEED = 4;
    private static readonly FLANK_SPEED = 2;

    public static create(x: number, y: number): Partial<Enemy> {
        const scale = 0.8 + Math.random() * 1.2;
        return {
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            radius: this.BASE_RADIUS * scale,
            health: this.BASE_HEALTH * Math.pow(scale, 1.4),
            maxHealth: this.BASE_HEALTH * Math.pow(scale, 1.4),
            scoreValue: Math.floor(300 * scale),
            color: '#000000',
            type: 'SMASHER',
            rotationAngle: Math.random() * 2 * Math.PI,
            speedMultiplier: 1.1 / scale,
            state: {
                'phase': 'APPROACH' as SmasherState,
                'orbitDir': Math.random() < 0.5 ? 1 : -1,
                'attackRange': 160 * scale,
                'dodgeEndTime': 0
            },
            onUpdate: (enemy: Enemy, player: Player, deltaTime: number) => {
                const moveTowards = (enemy as any).moveTowards; // Engine-specific move function
                if (moveTowards) {
                    SmasherEnemy.update(enemy, player, deltaTime, Date.now(), moveTowards);
                }
            },
            onDraw: (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
                SmasherEnemy.draw(ctx, enemy);
            }
        };
    }

    public static update(
        enemy: Enemy, 
        player: Player, 
        deltaTime: number, 
        currentTime: number, 
        moveTowards: Function
    ): void {
        if (!enemy.state) return;
        const speedMod = enemy.speedMultiplier || 1;
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        enemy.rotationAngle = (enemy.rotationAngle || 0) + 0.028;

        switch (enemy.state['phase'] as SmasherState) {
            case 'ATTACK':
                moveTowards(enemy, deltaTime, player.x, player.y, this.ATTACK_SPEED * speedMod);
                if (dist > 500) enemy.state['phase'] = 'FLANK';
                break;
            case 'DODGE':
                moveTowards(enemy, deltaTime, enemy.x + dy, enemy.y - dx, this.FLANK_SPEED * 1.5 * speedMod);
                if (currentTime > (enemy.state['dodgeEndTime'] || 0)) enemy.state['phase'] = 'APPROACH';
                break;
            case 'FLANK':
            case 'APPROACH':
            default:
                const orbitDir = (enemy.state['orbitDir'] as number) || 1;
                const targetX = player.x + Math.cos(currentTime / 1200) * 400 * orbitDir;
                const targetY = player.y + Math.sin(currentTime / 1200) * 400;
                moveTowards(enemy, deltaTime, targetX, targetY, this.FLANK_SPEED * speedMod);
                if (dist < (enemy.state['attackRange'] || 160)) enemy.state['phase'] = 'ATTACK';
                break;
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        const phase = enemy.state ? enemy.state['phase'] : 'APPROACH';
        const isAttacking = phase === 'ATTACK';
        
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotationAngle || 0);

        const pulse = isAttacking ? 2 + Math.sin(Date.now() / 159.15) * 2 : 2.5;

        // Hexagon
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3 + Math.PI / 6;
            ctx.lineTo(enemy.radius * Math.cos(angle), enemy.radius * Math.sin(angle));
        }
        ctx.closePath();
        
        ctx.fillStyle = '#000000';
        ctx.fill();
        ctx.strokeStyle = isAttacking ? '#d61525' : '#34495e';
        ctx.lineWidth = pulse;
        ctx.stroke();

        // Core
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        if (isAttacking) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff4757';
        }
        ctx.fill();
        ctx.restore();
    }
}