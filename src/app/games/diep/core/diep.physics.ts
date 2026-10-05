import { Bullet, Enemy, Player } from './diep.interfaces';

export class DiepPhysics {
    /**
     * Calculates mass based on radius (volume) and health (density).
     */
    public static calculateMass(radius: number, maxHealth: number): number {
        return (Math.pow(radius, 2) * Math.PI) * (maxHealth * 0.001);
    }

    /**
     * Automatically assigns mass to a bullet and returns it.
     */
    public static createBullet(config: any): Bullet {
        const radius = config.radius || 6;
        const maxHealth = config.maxHealth || 20;
        return {
            id: Math.random().toString(36).substr(2, 9),
            mass: this.calculateMass(radius, maxHealth),
            ...config
        } as Bullet;
    }

    /**
     * Applies Newton's Third Law (Recoil) to a shooter.
     */
    public static applyFiringRecoil(shooter: Player | Enemy, bullet: Bullet, bulletSpeed: number, angle: number): void {
        const recoilForce = (bullet.mass * bulletSpeed) / shooter.mass;
        shooter.vx -= Math.cos(angle) * recoilForce;
        shooter.vy -= Math.sin(angle) * recoilForce;
    }
}