import { Enemy, Player, Bullet } from '../../core/diep.interfaces';

export class MedicEnemy {

    public static metadata = {
        name: 'Medic',
        faction: 'Yellow',
        description: 'A passive support unit that projects a dynamic healing aura and retires when its work is completed.'
    };

    // Easy access tuning adjustments for health, radius sizes, and drain parameters
    private static readonly CONFIG = {
        baseSpeed: 1.2,
        retreatSpeedMultiplier: 1.5,     // Speed boost when escaping off-screen
        yellowColor: '#f1c40f',
        strokeColor: '#f39c12',
        
        // --- BALANCE SETTINGS ---
        baseRadius: 22,                  // Core scale size of the body shape
        baseMaxHealth: 200,              // Updated base survivability points per testing
        baseAuraRadius: 180,             // Max potential healing aura range limit
        
        auraDrainRateMultiplier: 1.0,    // Updated expenditure rate per testing (1.0 = normal match)
        auraRechargeRate: 0.2,           // Complete idle recovery pool capacity per second (~4s)
        selfHealRate: 10,                // Amount of health the medic restores to itself per second when damaged

        // --- LIFESPAN SETTINGS ---
        baseLifesPAN: 30000,             // Base time (30 seconds) before natural retreat triggers
        lifespanVariance: 15000,         // Random variance up to ±15 seconds

        // --- GLOBAL COMFORT BOUNDS (USED AS REFERENCE FOR VARIANCE) ---
        minFollowDistanceBase: 50,       // Baseline closest approach
        maxFollowDistanceBase: 150,      // Baseline furthest approach boundary

        // --- POPULATION MANAGEMENT ---
        maxAllowedMedics: 3,             // Max total medics allowed on board before oldest units cede territory

        // --- TARGET PRIORITIZATION & STICKINESS ---
        targetStickyThreshold: 150       // Distance advantage (in pixels) a new target needs to break current lock
    };

    public static create(x: number, y: number): Partial<Enemy> {
        const scaleMultiplier = 0.8 + Math.random() * 0.5; // Scaler between 0.8x and 1.3x
        const baseRadius = this.CONFIG.baseRadius * scaleMultiplier;
        const baseMaxHealth = Math.round(this.CONFIG.baseMaxHealth * scaleMultiplier);
        const dynamicAuraRadius = Math.round(this.CONFIG.baseAuraRadius * scaleMultiplier);

        // Calculate custom instance-level follow distance comfort ranges to prevent lining up
        const instanceMinFollow = this.CONFIG.minFollowDistanceBase + (Math.random() - 0.5) * 35; // e.g., 72.5 to 107.5
        const instanceMaxFollow = this.CONFIG.maxFollowDistanceBase + (Math.random() - 0.5) * 50; // e.g., 125 to 175

        // Add variance to targeting priorities so multiple medics don't hivemind onto the exact same target
        const playerWeightVariance = 0.30 + Math.random() * 0.10; // ~0.35 baseline
        const allyWeightVariance = 0.42 + Math.random() * 0.16;   // ~0.50 baseline

        // Calculate a unique lifespan for this instance (e.g., between 30 and 60 seconds)
        const randomizedLifespan = this.CONFIG.baseLifesPAN + (Math.random() - 0.5) * 2 * this.CONFIG.lifespanVariance;

        return {
            x,
            y,
            radius: baseRadius,
            color: this.CONFIG.yellowColor,
            health: baseMaxHealth,
            maxHealth: baseMaxHealth,
            scoreValue: Math.round(150 * scaleMultiplier),
            type: 'MEDIC',
            isPassive: true,
            canDespawn: true,
            isInvulnerable: false,

            // Physics & Rotation
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.04,
            speedPhase: Math.random() * Math.PI * 2,

            // State management
            spawnTime: Date.now(),
            state: {
                ['enemyClass']: 'MedicEnemy', // Safely passed inside the open state block for Quadrivium matching
                ['targetX']: x,
                ['targetY']: y,
                ['searchTimer']: 0,
                ['dynamicAuraRadius']: dynamicAuraRadius,
                ['auraCharge']: 1.0,       // Energy pool ratio: 0.0 to 1.0
                ['isRetreating']: false,   // Escapes screen and despawns when true
                ['lifespanDuration']: randomizedLifespan,
                ['isTargetInComfortZone']: false,
                ['retreatPhase']: 0.0,     // Interpolation scaler tracking visual fade progression (0.0 to 1.0)
                ['lockedTargetId']: null,  // Persisted string tracker token to ensure focus commitment
                
                // Uniquely assigned instance properties to defeat clumping
                ['minFollowDistance']: instanceMinFollow,
                ['maxFollowDistance']: instanceMaxFollow,
                ['playerWeightScale']: playerWeightVariance,
                ['allyWeightScale']: allyWeightVariance,
                ['orbitOffset']: Math.random() * Math.PI * 2 // Unique phase offset for circling/loitering drift
            },

            onUpdate: (enemy: any, player: Player, deltaTime: number) => {
                // Instanced hook backup tracking
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
        
        // Ensure state safety & backfill fallbacks for menu previews/older instances safely
        if (state['enemyClass'] === undefined) state['enemyClass'] = 'MedicEnemy';
        if (state['auraCharge'] === undefined) state['auraCharge'] = 1.0;
        if (state['isRetreating'] === undefined) state['isRetreating'] = false;
        if (state['lifespanDuration'] === undefined) state['lifespanDuration'] = this.CONFIG.baseLifesPAN;
        if (state['isTargetInComfortZone'] === undefined) state['isTargetInComfortZone'] = false;
        if (state['retreatPhase'] === undefined) state['retreatPhase'] = 0.0;
        if (state['lockedTargetId'] === undefined) state['lockedTargetId'] = null;
        
        if (state['minFollowDistance'] === undefined) state['minFollowDistance'] = this.CONFIG.minFollowDistanceBase;
        if (state['maxFollowDistance'] === undefined) state['maxFollowDistance'] = this.CONFIG.maxFollowDistanceBase;
        if (state['playerWeightScale'] === undefined) state['playerWeightScale'] = 0.35;
        if (state['allyWeightScale'] === undefined) state['allyWeightScale'] = 0.5;
        if (state['orbitOffset'] === undefined) state['orbitOffset'] = 0.0;
        
        const maxAuraRadius = state['dynamicAuraRadius'] || this.CONFIG.baseAuraRadius;

        // Smoothly collapse aura size multiplier based on the progression of the visual fade out
        const auraFadeMultiplier = 1.0 - state['retreatPhase'];
        const currentAuraRadius = maxAuraRadius * state['auraCharge'] * auraFadeMultiplier;

        const activeEnemies = (enemy as any).allEnemies || allEnemies || [];

        // 1. ROTATION AND OSCILLATION
        enemy.rotation = (enemy.rotation || 0) + (enemy.rotationSpeed || 0.01) * tick;
        enemy.speedPhase = (enemy.speedPhase || 0) + 0.015 * tick;
        const speedVar = Math.sin(enemy.speedPhase) * 0.3 + 1;

        let activelyHealingAnyUnit = false;
        const healTick = (15 * deltaTime) / 1000;

        // 2. SELF HEALING SYSTEM (DISABLED DURING RETREAT VISUAL FADE)
        if (!state['isRetreating'] && state['auraCharge'] > 0.01 && enemy.health > 0 && enemy.health < enemy.maxHealth) {
            const selfHealTick = (this.CONFIG.selfHealRate * deltaTime) / 1000;
            const prevHealth = enemy.health;
            enemy.health = Math.min(enemy.maxHealth, enemy.health + selfHealTick);
            const amountHealed = enemy.health - prevHealth;

            if (amountHealed > 0) {
                activelyHealingAnyUnit = true;
                const pctHealed = amountHealed / enemy.maxHealth;
                state['auraCharge'] = Math.max(0.0, state['auraCharge'] - (pctHealed * this.CONFIG.auraDrainRateMultiplier));
            }
        }

        // 3. EXTERNAL HEALING APPLICATION (ALLY ENEMIES & THE PLAYER)
        if (!activelyHealingAnyUnit && !state['isRetreating'] && state['auraCharge'] > 0.01) {
            
            // --- Check Player Target ---
            if (player && typeof player.x === 'number' && typeof player.y === 'number' && !isNaN(player.x) && !isNaN(player.y) && player.health > 0 && player.health < player.maxHealth) {
                const pDx = player.x - enemy.x;
                const pDy = player.y - enemy.y;
                const pDistSq = pDx * pDx + pDy * pDy;
                const pRangeLimit = currentAuraRadius + (player.radius || 20);

                if (pDistSq < pRangeLimit * pRangeLimit) {
                    const prevHealth = player.health;
                    player.health = Math.min(player.maxHealth, player.health + healTick);
                    const amountHealed = player.health - prevHealth;

                    if (amountHealed > 0) {
                        activelyHealingAnyUnit = true;
                        const pctHealed = amountHealed / player.maxHealth;
                        state['auraCharge'] = Math.max(0.0, state['auraCharge'] - (pctHealed * this.CONFIG.auraDrainRateMultiplier));
                    }
                }
            }

            // --- Check AI Ally Shapes ---
            if (!activelyHealingAnyUnit && activeEnemies && activeEnemies.length > 0) {
                for (const other of activeEnemies) {
                    if (other === enemy || other.type === 'MEDIC' || other.health <= 0 || other.isGhost) continue;
                    if (typeof other.x !== 'number' || typeof other.y !== 'number' || isNaN(other.x) || isNaN(other.y)) continue;

                    const dx = other.x - enemy.x;
                    const dy = other.y - enemy.y;
                    const distSq = dx * dx + dy * dy;
                    const rangeLimit = currentAuraRadius + other.radius;

                    if (distSq < rangeLimit * rangeLimit && other.health < other.maxHealth) {
                        const prevHealth = other.health;
                        other.health = Math.min(other.maxHealth, other.health + healTick);
                        const amountHealed = other.health - prevHealth;

                        if (amountHealed > 0) {
                            activelyHealingAnyUnit = true;
                            const pctHealed = amountHealed / other.maxHealth;
                            state['auraCharge'] = Math.max(0.0, state['auraCharge'] - (pctHealed * this.CONFIG.auraDrainRateMultiplier));
                            break; 
                        }
                    }
                }
            }
        }

        // --- CROWD CONTROL: SCREEN OVERCROWDING DETECTION ---
        let crowdRetreatTriggered = false;
        if (!state['isRetreating'] && activeEnemies && activeEnemies.length > 0) {
            const activeMedics = activeEnemies.filter((e: any) => 
                e.type === 'MEDIC' && 
                e.health > 0 && 
                !e.isGhost && 
                e.state && 
                !e.state['isRetreating']
            );

            if (activeMedics.length > this.CONFIG.maxAllowedMedics) {
                activeMedics.sort((a: any, b: any) => (a.spawnTime || 0) - (b.spawnTime || 0));
                const dropCutoffIndex = activeMedics.length - this.CONFIG.maxAllowedMedics;
                for (let i = 0; i < dropCutoffIndex; i++) {
                    if (activeMedics[i] === enemy) {
                        crowdRetreatTriggered = true;
                        break;
                    }
                }
            }
        }

        // --- RETREAT AND LIFESPAN CHECKS ---
        const age = Date.now() - (enemy.spawnTime || Date.now());
        const lifespanExpired = age >= state['lifespanDuration'];

        if (!state['isRetreating'] && (state['auraCharge'] <= 0.01 || lifespanExpired || crowdRetreatTriggered)) {
            state['isRetreating'] = true;
            state['isTargetInComfortZone'] = false;
            state['lockedTargetId'] = null;
        }

        // 4. TRANSITION FADE INTERPOLATOR ENGINE
        if (state['isRetreating'] && state['retreatPhase'] < 1.0) {
            state['retreatPhase'] = Math.min(1.0, state['retreatPhase'] + 0.028 * tick);
            state['auraCharge'] = Math.max(0.0, 1.0 - state['retreatPhase']);

            if (state['retreatPhase'] >= 1.0) {
                const angle = Math.random() * Math.PI * 2;
                state['targetX'] = enemy.x + Math.cos(angle) * 1200;
                state['targetY'] = enemy.y + Math.sin(angle) * 1200;
            }
        }

        if (!activelyHealingAnyUnit && !state['isRetreating']) {
            state['auraCharge'] = Math.min(1.0, state['auraCharge'] + (this.CONFIG.auraRechargeRate * deltaTime) / 1000);
        }

        enemy.isInvulnerable = false;

        // 5. TARGET SCANNING ENGINE WITH TARGET STICKINESS (HYSTERESIS) & UNIQUE WEIGHTS
        state['searchTimer'] += deltaTime;
        if (state['searchTimer'] > 400 || !state['targetX'] || isNaN(state['targetX'])) {
            state['searchTimer'] = 0;
            
            if (!state['isRetreating'] || state['retreatPhase'] < 1.0) {
                let bestTargetX = null;
                let bestTargetY = null;
                let bestTargetId: string | null = null;
                let closeDistSq = Infinity;
                
                let currentLockedTargetDistSq = Infinity;

                // Track current position of locked entity using unique instance modifiers
                if (state['lockedTargetId']) {
                    if (state['lockedTargetId'] === 'PLAYER') {
                        if (player && player.health > 0 && player.health < player.maxHealth) {
                            const dx = player.x - enemy.x;
                            const dy = player.y - enemy.y;
                            currentLockedTargetDistSq = (dx * dx + dy * dy) * state['playerWeightScale'];
                        }
                    } else {
                        const existingTarget = activeEnemies.find((e: any) => e.id === state['lockedTargetId'] || `${e.type}_${e.x}_${e.y}` === state['lockedTargetId']);
                        if (existingTarget && existingTarget.health > 0 && existingTarget.health < existingTarget.maxHealth && !existingTarget.isGhost) {
                            const dx = existingTarget.x - enemy.x;
                            const dy = existingTarget.y - enemy.y;
                            currentLockedTargetDistSq = (dx * dx + dy * dy) * state['allyWeightScale'];
                        }
                    }
                }

                // Evaluate Player priority with unique weights
                if (player && typeof player.x === 'number' && typeof player.y === 'number' && !isNaN(player.x) && !isNaN(player.y) && player.health > 0 && player.health < player.maxHealth) {
                    const pDx = player.x - enemy.x;
                    const pDy = player.y - enemy.y;
                    let pDistSq = pDx * pDx + pDy * pDy;
                    pDistSq *= state['playerWeightScale'];

                    if (pDistSq < closeDistSq) {
                        closeDistSq = pDistSq;
                        bestTargetX = player.x;
                        bestTargetY = player.y;
                        bestTargetId = 'PLAYER';
                    }
                }

                // Evaluate AI shapes with unique weights
                if (activeEnemies && activeEnemies.length > 0) {
                    for (const other of activeEnemies) {
                        if (other === enemy || other.type === 'MEDIC' || other.health <= 0 || other.isGhost) continue;
                        if (typeof other.x !== 'number' || typeof other.y !== 'number' || isNaN(other.x) || isNaN(other.y)) continue;
                        if (other.health >= other.maxHealth) continue;

                        const dx = other.x - enemy.x;
                        const dy = other.y - enemy.y;
                        let dSq = dx * dx + dy * dy;
                        dSq *= state['allyWeightScale'];

                        if (dSq < closeDistSq) {
                            closeDistSq = dSq;
                            bestTargetX = other.x;
                            bestTargetY = other.y;
                            bestTargetId = other.id || `${other.type}_${other.x}_${other.y}`;
                        }
                    }
                }

                // Apply target stickiness hysteresis calculation cleanly
                if (bestTargetX !== null && bestTargetY !== null && bestTargetId !== null) {
                    const stickyThresholdSq = this.CONFIG.targetStickyThreshold * this.CONFIG.targetStickyThreshold;
                    
                    if (!state['lockedTargetId'] || currentLockedTargetDistSq === Infinity || closeDistSq < currentLockedTargetDistSq - stickyThresholdSq) {
                        state['targetX'] = bestTargetX;
                        state['targetY'] = bestTargetY;
                        state['lockedTargetId'] = bestTargetId;
                    } else {
                        const currentLock = state['lockedTargetId'];
                        if (currentLock === 'PLAYER') {
                            state['targetX'] = player.x;
                            state['targetY'] = player.y;
                        } else {
                            const lockedEnemy = activeEnemies.find((e: any) => e.id === currentLock || `${e.type}_${e.x}_${e.y}` === currentLock);
                            if (lockedEnemy) {
                                state['targetX'] = lockedEnemy.x;
                                state['targetY'] = lockedEnemy.y;
                            }
                        }
                    }
                } else {
                    state['isTargetInComfortZone'] = false;
                    state['lockedTargetId'] = null;
                    if (!state['isRetreating'] && Math.random() < 0.04) {
                        state['targetX'] = enemy.x + (Math.random() - 0.5) * 500;
                        state['targetY'] = enemy.y + (Math.random() - 0.5) * 500;
                    }
                }
            }
        }

        // 6. MOTION ROUTING SYSTEM WITH ANTI-CLUMPING & ORBIT DRIFT
        if (typeof state['targetX'] === 'number' && typeof state['targetY'] === 'number' && !isNaN(state['targetX']) && !isNaN(state['targetY'])) {
            
            if (state['retreatPhase'] < 1.0) {
                // Keep target positions locked smoothly in real-time between scanning steps
                if (state['lockedTargetId']) {
                    if (state['lockedTargetId'] === 'PLAYER') {
                        state['targetX'] = player.x;
                        state['targetY'] = player.y;
                    } else {
                        const currentLock = state['lockedTargetId'];
                        const lockedEnemy = activeEnemies.find((e: any) => e.id === currentLock || `${e.type}_${e.x}_${e.y}` === currentLock);
                        if (lockedEnemy) {
                            state['targetX'] = lockedEnemy.x;
                            state['targetY'] = lockedEnemy.y;
                        }
                    }
                }

                let finalAdjustedTargetX = state['targetX'];
                let finalAdjustedTargetY = state['targetY'];

                // --- FEATURE: ORBITAL LOITERING DRIFT ---
                // Add a small rolling offset along the baseline follow distance based on speedPhase and instance orbitOffset
                if (state['lockedTargetId']) {
                    const orbitAngle = enemy.speedPhase * 0.4 + state['orbitOffset'];
                    // Applies a subtle 15px circular wander behavior around their focus anchor
                    finalAdjustedTargetX += Math.cos(orbitAngle) * 15;
                    finalAdjustedTargetY += Math.sin(orbitAngle) * 15;
                }

                const liveDx = finalAdjustedTargetX - enemy.x;
                const liveDy = finalAdjustedTargetY - enemy.y;
                const liveDistance = Math.sqrt(liveDx * liveDx + liveDy * liveDy);

                const minFollow = state['minFollowDistance'];
                const maxFollow = state['maxFollowDistance'];

                // Check and update unique instance comfort zone states cleanly
                if (state['isTargetInComfortZone']) {
                    if (liveDistance > maxFollow || liveDistance < minFollow - 15) {
                        state['isTargetInComfortZone'] = false;
                    }
                } else {
                    if (liveDistance >= minFollow && liveDistance <= maxFollow) {
                        state['isTargetInComfortZone'] = true;
                    }
                }

                // Calculate base movement vectors
                if (state['isTargetInComfortZone']) {
                    // Smoothly dampen internal momentum when comfortably hovering
                    enemy.vx *= Math.pow(0.85, tick);
                    enemy.vy *= Math.pow(0.85, tick);
                } else {
                    if (liveDistance < minFollow && liveDistance > 5) {
                        // Back away steadily if target crowds the unique comfort zone boundary
                        const angle = Math.atan2(liveDy, liveDx);
                        const backSpeed = this.CONFIG.baseSpeed * 0.8 * speedVar;
                        enemy.vx = -Math.cos(angle) * backSpeed;
                        enemy.vy = -Math.sin(angle) * backSpeed;
                    } else if (moveTowards) {
                        enemy.vx = 0;
                        enemy.vy = 0;
                        const calculatedSpeed = this.CONFIG.baseSpeed * speedVar;
                        moveTowards(enemy, deltaTime, finalAdjustedTargetX, finalAdjustedTargetY, calculatedSpeed);
                    }
                }

                // --- FEATURE: ANTI-CLUMPING MEDIC SEPARATION FORCES ---
                // Check if we are packing too tightly next to another Medic unit
                if (activeEnemies && activeEnemies.length > 0) {
                    for (const other of activeEnemies) {
                        if (other === enemy || other.type !== 'MEDIC' || other.health <= 0 || other.isGhost) continue;
                        
                        const mDx = enemy.x - other.x;
                        const mDy = enemy.y - other.y;
                        const mDistSq = mDx * mDx + mDy * mDy;
                        
                        // Interaction distance (if they get within twice their combined body diameters)
                        const separationDistance = (enemy.radius + other.radius) * 2.2;
                        
                        if (mDistSq < separationDistance * separationDistance && mDistSq > 0.01) {
                            const mDist = Math.sqrt(mDistSq);
                            // Stronger push the closer they get
                            const forceScale = (1.0 - (mDist / separationDistance)) * 0.45;
                            
                            enemy.vx += (mDx / mDist) * forceScale * tick;
                            enemy.vy += (mDy / mDist) * forceScale * tick;
                        }
                    }
                }

                // Commit positional translations step cleanly
                enemy.x += enemy.vx * tick;
                enemy.y += enemy.vy * tick;

            } else {
                // Off-screen retreat trajectory mapping
                if (moveTowards) {
                    enemy.vx = 0;
                    enemy.vy = 0;
                    const calculatedSpeed = this.CONFIG.baseSpeed * speedVar * this.CONFIG.retreatSpeedMultiplier;
                    moveTowards(enemy, deltaTime, state['targetX'], state['targetY'], calculatedSpeed);
                } else {
                    const targetAngle = Math.atan2(state['targetY'] - enemy.y, state['targetX'] - enemy.x);
                    if (!isNaN(targetAngle)) {
                        enemy.vx += Math.cos(targetAngle) * 0.05 * tick;
                        enemy.vy += Math.sin(targetAngle) * 0.05 * tick;
                    }
                    enemy.vx *= Math.pow(0.98, tick);
                    enemy.vy *= Math.pow(0.98, tick);
                    enemy.x += enemy.vx * tick;
                    enemy.y += enemy.vy * tick;
                }
            }
        }

        // 7. ENCAPSULATED MAP COUPLING BOUNDS & CLEANUP
        const margin = enemy.radius + 10;
        const finishedRetreatFlight = state['retreatPhase'] >= 1.0;
        
        if (finishedRetreatFlight || enemy.health <= 0) {
            if (enemy.x < -100 || enemy.x > 4000 || enemy.y < -100 || enemy.y > 4000 || enemy.health <= 0) {
                enemy.health = 0; 
                enemy.isGhost = true;
            }
        } else {
            if (enemy.x < margin) { enemy.x = margin; enemy.vx *= -0.5; }
            if (enemy.y < margin) { enemy.y = margin; enemy.vy *= -0.5; }
        }
    }

    public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy): void {
        const state = enemy.state;
        const isMenuPreview = !state;

        const baseAuraRadius = isMenuPreview ? 14 : (state['dynamicAuraRadius'] || this.CONFIG.baseAuraRadius);
        const charge = isMenuPreview ? 1.0 : (state['auraCharge'] !== undefined ? state['auraCharge'] : 1.0);
        const retreatPhase = isMenuPreview ? 0.0 : (state['retreatPhase'] !== undefined ? state['retreatPhase'] : 0.0);
        
        const currentAuraRadius = baseAuraRadius * charge;

        const timestamp = Date.now();
        const pulse = isMenuPreview ? Math.sin(timestamp * 0.003) * 1.5 : Math.sin(timestamp * 0.003) * 6 * (1.0 - retreatPhase);
        const radiusWithPulse = Math.max(0, currentAuraRadius + pulse);

        // 1. DRAW TRANSLUCENT HEXAGONAL AURA FIELD
        if (radiusWithPulse > 0.5) {
            ctx.save(); 
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * 2 * Math.PI) / 6 + (timestamp * 0.0003);
                const ax = enemy.x + radiusWithPulse * Math.cos(angle);
                const ay = enemy.y + radiusWithPulse * Math.sin(angle);
                if (i === 0) ctx.moveTo(ax, ay);
                else ctx.lineTo(ax, ay);
            }
            ctx.closePath();
            
            const fillAlpha = isMenuPreview ? 0.15 : 0.08 * (1.0 - retreatPhase);
            const strokeAlpha = isMenuPreview ? 0.4 : 0.35 * (1.0 - retreatPhase);
            
            ctx.fillStyle = `rgba(241, 196, 15, ${fillAlpha})`;
            ctx.strokeStyle = `rgba(243, 156, 18, ${strokeAlpha})`;
            
            ctx.fill();
            ctx.lineWidth = isMenuPreview ? 1.5 : 2.5;
            ctx.stroke();
            ctx.restore(); 
        }

        // 2. DRAW VARIANT SIZE HEXAGON BODY WITH CHROMA FADE
        ctx.save(); 
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation || 0);

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            const hx = enemy.radius * Math.cos(angle);
            const hy = enemy.radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();

        const rFill = Math.round(241 + (213 - 241) * retreatPhase);
        const gFill = Math.round(196 + (219 - 196) * retreatPhase);
        const bFill = Math.round(15 + (219 - 15) * retreatPhase);
        ctx.fillStyle = `rgb(${rFill}, ${gFill}, ${bFill})`;
        
        const rStroke = Math.round(243 + (127 - 243) * retreatPhase);
        const gStroke = Math.round(156 + (140 - 156) * retreatPhase);
        const bStroke = Math.round(18 + (141 - 18) * retreatPhase);
        ctx.strokeStyle = `rgb(${rStroke}, ${gStroke}, ${bStroke})`;
        
        ctx.lineWidth = isMenuPreview ? 2.5 : 4;
        ctx.fill();
        ctx.stroke();
        ctx.restore(); 
    }
}