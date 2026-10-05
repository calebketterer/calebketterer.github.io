import { Enemy, Player, Bullet, TrailSegment } from '../../core/diep.interfaces';

export class BloaterEnemy {
    public static metadata = {
        name: 'Bloater',
        faction: 'Green',
        description: 'Consumes other enemies to grow, leaving toxic trail as it moves.'
    };

    private static readonly CONFIG = {
        minSize: 15,
        maxSize: 120, 
        baseSpeed: 2.0,
        growthRate: 1.5, 
        trailInterval: 10, 
        baseTrailLifespan: 3000,
        trailDamage: 0.1,
        healDuration: 2000,
        sizeLerpSpeed: 0.05 
    };

    public static create(x: number, y: number): Partial<Enemy> {
        const size = Math.floor(Math.random() * (30 - this.CONFIG.minSize) + this.CONFIG.minSize);

        return {
            x, y,
            radius: size,
            color: '#CCFF66',
            health: size * 5,
            maxHealth: size * 5,
            scoreValue: size,
            type: 'BLOATER',
            speedMultiplier: this.CONFIG.baseSpeed,
            state: {
                ['trails']: [] as TrailSegment[],
                ['trailTimer']: 0,
                ['healEndTime']: 0,
                ['healStartHealth']: 0,
                ['targetRadius']: size 
            },
            onUpdate: (enemy: any, player: Player, deltaTime: number) => {
                // Instanced hook tracking via DiepEnemyService execution layer
            }
        };
    }

    public static update(
        enemy: Enemy,
        player: Player,
        deltaTime: number,
        currentTime: number,
        moveTowards: Function,
        bullets: Bullet[],
        allEnemies: Enemy[]
    ): void {
        const state = enemy.state!;
        const tick = deltaTime / 16.66;

        if (state['targetRadius'] === undefined) {
            state['targetRadius'] = enemy.radius;
        }

        // 1. SMOOTH GRADUAL GROWTH INTERPOLATION (LERP)
        if (enemy.radius !== state['targetRadius']) {
            const diff = state['targetRadius'] - enemy.radius;
            enemy.radius += diff * this.CONFIG.sizeLerpSpeed * tick;
            
            if (Math.abs(state['targetRadius'] - enemy.radius) < 0.1) {
                enemy.radius = state['targetRadius'];
            }
            
            enemy.scoreValue = Math.floor(enemy.radius);
        }

        // 2. ENCAPSULATED PRE-EMPTIVE COLLISION CHECK
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < (enemy.radius + player.radius + 8) && enemy.health > 0) {
            this.executeSuicideRam(player, allEnemies, enemy);
            return;
        }

        let activeEnemies = allEnemies;
        if (!activeEnemies || activeEnemies.length <= 1) {
            if ((enemy as any).allEnemies) {
                activeEnemies = (enemy as any).allEnemies;
            }
        }

        // 3. GRADUAL HEALING SYSTEM OVER TIME
        if (currentTime < state['healEndTime']) {
            const totalHealTime = this.CONFIG.healDuration;
            const remainingTime = state['healEndTime'] - currentTime;
            const progress = Math.min(1, Math.max(0, 1 - (remainingTime / totalHealTime)));
            
            const startHealth = state['healStartHealth'];
            const targetHealth = enemy.maxHealth;
            
            enemy.health = startHealth + (targetHealth - startHealth) * progress;
        }

        // 4. TARGETING ENGINE WITH PROXIMITY AGGRO
        let nearest: { x: number, y: number } = player;
        let minDist = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2) + 800; 

        if (activeEnemies && activeEnemies.length > 0) {
            for (const other of activeEnemies) {
                if (other === enemy || other.health <= 0 || other.isGhost) continue;
                
                const d = Math.sqrt((enemy.x - other.x) ** 2 + (enemy.y - other.y) ** 2);
                
                if (d < enemy.radius + other.radius) {
                    if (other.type === 'BLOATER') {
                        if (enemy.health < other.health) {
                            continue;
                        } else if (enemy.health === other.health) {
                            if (enemy.radius < other.radius) continue;
                            if (enemy.radius === other.radius && (enemy.id || '') < (other.id || '')) continue;
                        }
                    }

                    this.consume(enemy, other, currentTime, activeEnemies, player);
                    continue; 
                }

                if (d < minDist) {
                    minDist = d;
                    nearest = other;
                }
            }
        }

        // 5. MOVEMENT INTERPOLATION
        const adaptiveSpeed = (enemy.speedMultiplier || this.CONFIG.baseSpeed) * (20 / enemy.radius);
        if (moveTowards) {
            moveTowards(enemy, deltaTime, nearest.x, nearest.y, adaptiveSpeed);
        }

        // 6. TRAIL EMISSION AND DECAY TIMING
        state['trailTimer'] += deltaTime;
        if (state['trailTimer'] > this.CONFIG.trailInterval) {
            const customLifespan = this.CONFIG.baseTrailLifespan * (enemy.radius / this.CONFIG.minSize);

            (state['trails'] as TrailSegment[]).push({
                x: enemy.x,
                y: enemy.y,
                radius: enemy.radius * 0.8,
                maxRadius: enemy.radius * 0.8,
                color: '#CCFF66',
                opacity: 0.4,
                creationTime: currentTime,
                lifespan: customLifespan
            });
            state['trailTimer'] = 0;
        }

        const trails = state['trails'] as TrailSegment[];
        for (let i = trails.length - 1; i >= 0; i--) {
            const t = trails[i];
            const age = currentTime - t.creationTime;
            
            if (age > t.lifespan || age < 0) {
                trails.splice(i, 1);
                continue;
            }

            const lifeRatio = age / t.lifespan;
            t.opacity = 0.4 * (1 - lifeRatio);
            t.radius = t.maxRadius * (1 - lifeRatio);

            if (t.radius <= 0 || t.opacity <= 0) {
                trails.splice(i, 1);
                continue;
            }

            const dxp = player.x - t.x;
            const dyp = player.y - t.y;
            const distSq = dxp * dxp + dyp * dyp;
            const contactRadius = t.radius + player.radius;

            if (distSq < contactRadius * contactRadius) {
                player.health -= this.CONFIG.trailDamage * tick;
            }
        }
    }

    private static consume(predator: Enemy, prey: Enemy, currentTime: number, allEnemies: Enemy[], player: Player): void {
        const state = predator.state!;
        
        if (state['targetRadius'] === undefined) {
            state['targetRadius'] = predator.radius;
        }

        const structuralGrowth = Math.floor(Math.log10(prey.maxHealth + 1) * 3);
        
        state['targetRadius'] = Math.min(this.CONFIG.maxSize, state['targetRadius'] + structuralGrowth);
        predator.maxHealth += prey.maxHealth * this.CONFIG.growthRate;
        
        state['healStartHealth'] = predator.health;
        state['healEndTime'] = currentTime + this.CONFIG.healDuration;

        prey.health = 0;
        const index = allEnemies.indexOf(prey);
        if (index > -1) {
            allEnemies.splice(index, 1);
        }

        if (prey.onDeath) {
            try {
                prey.onDeath(allEnemies, null, prey, player);
            } catch (e) {
                console.warn('Could not cleanly resolve consumed enemy onDeath handler:', e);
            }
        }
    }

    private static executeSuicideRam(player: Player, allEnemies: Enemy[], enemy: Enemy): void {
        const ramDamage = enemy.radius * 2.5; 
        player.health -= ramDamage;

        enemy.health = 0;

        const index = allEnemies.indexOf(enemy);
        if (index > -1) {
            allEnemies.splice(index, 1);
        }

        if (enemy.onDeath) {
            try {
                enemy.onDeath(allEnemies, null, enemy, player);
            } catch (e) {}
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        const state = enemy.state;
        const trails = state ? (state['trails'] as TrailSegment[]) : null;

        // 1. DRAW TRAILS (Standard smooth circles trailing behind)
        if (trails) {
            ctx.save();
            for (const t of trails) {
                if (t.radius <= 0 || isNaN(t.radius) || t.opacity <= 0) continue;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(204, 255, 102, ${t.opacity})`;
                ctx.fill();
            }
            ctx.restore();
        }

        // 2. DRAW BIO-MEMBRANE WOBBLE BODY EFFECT
        ctx.save();
        ctx.beginPath();

        const timestamp = Date.now();
        // Control frequency and intensity of the outer flesh shifting
        const wobbleSpeed = timestamp * 0.004; 
        const waveCount = 8; // Number of ripples around the body
        const maxWobbleAmplitude = Math.max(2, enemy.radius * 0.08); // Wobble scales up with body size

        // Trace a distorted path utilizing micro-offsets at 60 points around the circle
        for (let i = 0; i <= 60; i++) {
            const angle = (Math.PI * 2 * i) / 60;
            
            // Layer a fast wave onto a slow wave to simulate a fluid, uneven shifting texture
            const waveOffset = Math.sin(angle * waveCount + wobbleSpeed) * Math.cos(angle * 3 - wobbleSpeed * 0.5);
            const dynamicRadius = enemy.radius + waveOffset * maxWobbleAmplitude;

            const wx = enemy.x + dynamicRadius * Math.cos(angle);
            const wy = enemy.y + dynamicRadius * Math.sin(angle);

            if (i === 0) {
                ctx.moveTo(wx, wy);
            } else {
                ctx.lineTo(wx, wy);
            }
        }

        ctx.closePath();
        ctx.fillStyle = enemy.color;
        ctx.fill();

        ctx.strokeStyle = '#88B344';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    }
}