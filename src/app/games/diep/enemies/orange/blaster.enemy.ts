import { Enemy, Player } from '../../core/diep.interfaces';

export class BlasterEnemy {

    public static metadata = {
        name: 'Blaster',
        faction: 'Orange',
        description: 'An explosive proximity-based enemy that primes and detonates when near the player.'
    };

    public static create(x: number, y: number): Partial<Enemy> {
        return {
            x, y,
            radius: 26,
            color: '#e67e22',
            health: 100,
            maxHealth: 100,
            scoreValue: 200,
            type: 'BLASTER',
            isInvulnerable: true,
            isGhost: false,

            // Physics & Rotation
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: 0.005,
            vx: 0,
            vy: 0,
            maxSpeed: 1.4,

            // Blaster mechanics
            isPriming: false,
            isDying: false,      // NEW: For the death animation
            deathTimer: 300,     // 300ms "flash" before gone
            blastTimer: 3000,
            maxBlastTimer: 3000,
            blastRadius: 230,
            
            targetX: x,
            targetY: y,

            onUpdate: (enemy: any, player: Player, deltaTime: number) => {
                const dx = player.x - enemy.x;
                const dy = player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const tick = deltaTime / 16.66;
                const timerRatio = 1 - (enemy.blastTimer / enemy.maxBlastTimer);

                // --- DEATH ANIMATION LOGIC ---
                if (enemy.isDying) {
                    enemy.deathTimer -= deltaTime;
                    enemy.radius += 2 * tick; // Expand rapidly
                    if (enemy.deathTimer <= 0) {
                        enemy.health = 0; // Final removal
                    }
                    return; // Skip normal logic
                }

                if (dist < enemy.blastRadius) {
                    // --- PRIMING STATE ---
                    enemy.isPriming = true;
                    enemy.isInvulnerable = false;
                    enemy.blastTimer = Math.max(0, enemy.blastTimer - deltaTime);
                    
                    enemy.vx *= 0.9; // Friction to stop
                    enemy.vy *= 0.9;
                    
                    // SPIN FASTER: Base speed + exponential increase as timer hits 0
                    enemy.rotationSpeed = 0.02 + (Math.pow(timerRatio, 2) * 0.25);
                } else {
                    // --- WANDERING / RECHARGING STATE ---
                    enemy.isPriming = false;
                    enemy.isInvulnerable = true;
                    enemy.rotationSpeed = 0.005;

                    if (enemy.blastTimer < enemy.maxBlastTimer) {
                        enemy.blastTimer = Math.min(enemy.maxBlastTimer, enemy.blastTimer + deltaTime * 0.5);
                    }

                    // Steering Logic
                    const distToTarget = Math.sqrt((enemy.x - enemy.targetX)**2 + (enemy.y - enemy.targetY)**2);
                    if (distToTarget < 40) {
                        enemy.targetX = 100 + Math.random() * 700;
                        enemy.targetY = 100 + Math.random() * 500;
                    }
                    const targetAngle = Math.atan2(enemy.targetY - enemy.y, enemy.targetX - enemy.x);
                    enemy.vx += Math.cos(targetAngle) * 0.03;
                    enemy.vy += Math.sin(targetAngle) * 0.03;

                    const currentSpeed = Math.sqrt(enemy.vx**2 + enemy.vy**2);
                    if (currentSpeed > enemy.maxSpeed) {
                        const ratio = enemy.maxSpeed / currentSpeed;
                        enemy.vx *= ratio;
                        enemy.vy *= ratio;
                    }

                    enemy.x += enemy.vx * tick;
                    enemy.y += enemy.vy * tick;
                }

                enemy.rotation += enemy.rotationSpeed * tick;

                // DETONATION TRIGGER
                if (enemy.blastTimer <= 0 && !enemy.isDying) {
                    if (dist < enemy.blastRadius) {
                        player.health -= (dist < enemy.blastRadius * 0.5) ? 60 : 30;
                    }
                    enemy.isDying = true; // Start animation instead of immediate delete
                    enemy.isGhost = true; // Can't shoot it while it's exploding
                }
            }
        } as any as Partial<Enemy>;
    }

    public static update(enemy: Enemy, player: Player, deltaTime: number, currentTime: number, moveTowards: Function): void {
        // Passive regeneration without check causes bug where blaster grows indefinitely at death and kills player.
        if (enemy.health > 10){enemy.health = Math.min(enemy.maxHealth, enemy.health + (5 * deltaTime / 1000));}
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: any): void {
        const timerRatio = 1 - (enemy.blastTimer / enemy.maxBlastTimer);

        ctx.save();
        
        // 1. Danger Zone
        if (!enemy.isDying && (enemy.isPriming || timerRatio > 0.05)) {
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.blastRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 140, 0, ${timerRatio * 0.35})`;
            ctx.fill();
            
            // Pulsing Ring
            const pulse = Math.sin(Date.now() * (0.01 + timerRatio * 0.05)) * 10;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.blastRadius + pulse, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 69, 0, ${0.1 + timerRatio * 0.7})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // 2. Body Drawing
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation || 0);
        
        const sides = 8;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const px = enemy.radius * Math.cos(angle);
            const py = enemy.radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();

        if (enemy.isDying) {
            // EXPLOSION FLASH: White-hot to Transparent
            const deathAlpha = enemy.deathTimer / 300;
            ctx.fillStyle = `rgba(255, 255, 255, ${deathAlpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 200, 0, ${deathAlpha})`;
        } else {
            // NORMAL COLORS
            ctx.fillStyle = enemy.isPriming ? '#d35400' : '#e67e22';
            ctx.fill();
            ctx.strokeStyle = enemy.isGhost ? '#a04000' : '#802000';
        }
        
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();
    }
}