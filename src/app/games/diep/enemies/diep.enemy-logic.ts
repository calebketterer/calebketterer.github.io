import { Enemy, Player, Bullet } from '../core/diep.interfaces';
import { EnemyRegistry } from './enemy.registry';

/**
 * Utility class dedicated to updating the state, position, and actions of all enemy types each frame via the EnemyRegistry.
 */
export class DiepEnemyLogic {

    // Executes the update logic for all enemies in the game.
    public static updateAllEnemies(
        enemies: Enemy[], 
        bullets: Bullet[], 
        player: Player, 
        deltaTime: number,
        canvasWidth: number,
        canvasHeight: number,
        currentTime: number
    ): void {
    
        enemies.forEach(enemy => {
            // This calls the registry, which finds the correct .ts file (Sniper, Guard, Smasher, etc.) and runs the specific update logic there.
            EnemyRegistry.update(enemy, player, bullets, deltaTime, currentTime);

            // --- PHANTOM SUMMONING LOGIC ---
            if (enemy.needsSpawn && enemy.type === 'CASTER') {
                enemy.needsSpawn = false; 

                // Generates a random integer between 4 and 8
                const swarmSize = Math.floor(Math.random() * 5) + 4; 

                for (let i = 0; i < swarmSize; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    // Spawning them 750px away from the player
                    const spawnX = player.x + Math.cos(angle) * 750;
                    const spawnY = player.y + Math.sin(angle) * 750;

                    const newEcho = EnemyRegistry.createEnemy('ECHO', spawnX, spawnY);
                    if (newEcho) {
                        enemies.push(newEcho);
                    }
                }
            }

            // Global logic (like bounds checking or player collision) stays here
            this.handleGlobalCollision(enemy, player);
        });

        // Apply separation logic after individual movements to prevent stacking
        // This ensures that even if they are all targeting the player, they nudge each other apart.
        this.handleEnemySeparation(enemies);
    }

    /**
     * Prevents enemies from overlapping with one another by pushing them apart.
     * Uses circle-circle intersection math to calculate a soft repulsive force.
     */
    private static handleEnemySeparation(enemies: Enemy[]): void {
        const pushStrength = 0.2;

        for (let i = 0; i < enemies.length; i++) {
            const e1 = enemies[i];
            
            // Skip calculations entirely if this source entity is a ghost
            if (e1.isGhost) continue;

            for (let j = i + 1; j < enemies.length; j++) {
                const e2 = enemies[j];

                // Skip calculations entirely if the target object is a ghost
                if (e2.isGhost) continue;

                const dx = e2.x - e1.x;
                const dy = e2.y - e1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = e1.radius + e2.radius;

                if (distance < minDistance && distance > 0) {
                    const overlap = minDistance - distance;
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // --- NEW WEIGHTED LOGIC ---
                    // Calculate mass based on radius (area-ish)
                    const m1 = e1.radius * e1.radius;
                    const m2 = e2.radius * e2.radius;
                    const totalMass = m1 + m2;

                    // The lighter object (smaller radius) takes more of the push
                    // ratio1 is how much e1 moves, ratio2 is how much e2 moves
                    const ratio1 = m2 / totalMass; 
                    const ratio2 = m1 / totalMass;

                    e1.x -= nx * overlap * pushStrength * ratio1;
                    e1.y -= ny * overlap * pushStrength * ratio1;
                    e2.x += nx * overlap * pushStrength * ratio2;
                    e2.y += ny * overlap * pushStrength * ratio2;
                }
            }
        }
    }

    /**
     * Simple collision check to damage player and push enemies back.
     */
    private static handleGlobalCollision(enemy: Enemy, player: Player): void {
        // Ghost entities seamlessly glide through the player without physical interaction or knockback forces
        if (enemy.isGhost) {
            return;
        }

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < enemy.radius + player.radius) {
            // Damage player
            player.health -= 0.5;

            // Simple knockback
            const angle = Math.atan2(dy, dx);
            const knockbackForce = 2;
            enemy.x -= Math.cos(angle) * knockbackForce;
            enemy.y -= Math.sin(angle) * knockbackForce;
        }
    }
}