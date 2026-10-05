import { Enemy, Player, Bullet, EnemyType } from '../core/diep.interfaces';
import { SmasherEnemy } from './red/smasher.enemy';
import { CrasherEnemy } from './purple/crasher.enemy';
import { SniperEnemy } from './red/sniper.enemy';
import { BloaterEnemy } from './green/bloater.enemy';
import { RollerEnemy } from './red/roller.enemy';
import { GunnerEnemy } from './green/gunner.enemy';
import { MotherEnemy } from './purple/mother.enemy';
import { MinionEnemy } from './purple/minion.enemy';
import { HealerEnemy } from './yellow/healer.enemy';
import { HaunterEnemy } from './blue/haunter.enemy';
import { BomberEnemy } from './orange/bomber.enemy';
import { BlasterEnemy } from './orange/blaster.enemy';
import { CasterEnemy } from './blue/caster.enemy';
import { EchoEnemy } from './blue/echo.enemy';
import { FloaterEnemy } from './green/floater.enemy';
import { MedicEnemy }  from './yellow/medic.enemy';
import { DetonatorEnemy } from './purple/detonator.enemy';
import { DiggerEnemy } from './orange/digger.enemy';
import { PolluterEnemy } from './green/polluter.enemy';

/**
 * The EnemyRegistry acts as the central "Switchboard".
 * It maps EnemyTypes to their specific logic and drawing files.
 */
export class EnemyRegistry {

  /**
   * Mappings of EnemyType to the specific object containing create/update/draw logic.
   */
  private static readonly mapping: Record<EnemyType, any> = {
    'SMASHER': SmasherEnemy,
    'CRASHER': CrasherEnemy,
    'SNIPER': SniperEnemy,
    'BLOATER': BloaterEnemy,
    'ROLLER': RollerEnemy,
    'GUNNER': GunnerEnemy,
    'MOTHER': MotherEnemy,
    'MINION': MinionEnemy,
    'HEALER': HealerEnemy,
    'HAUNTER' : HaunterEnemy,
    'BOMBER' : BomberEnemy,
    'BLASTER' : BlasterEnemy,
    'CASTER' : CasterEnemy,
    'ECHO' : EchoEnemy,
    'FLOATER' : FloaterEnemy,
    'MEDIC' : MedicEnemy,
    'DETONATOR' :DetonatorEnemy,
    'DIGGER' :DiggerEnemy,
    'POLLUTER' :PolluterEnemy,
  };

  /**
   * Returns all registered enemy types for the Quadrivium to parse.
   */
  public static getRegisteredTypes(): EnemyType[] {
    return Object.keys(this.mapping) as EnemyType[];
  }

  /**
   * Fetches metadata (Name/Desc) from the specific enemy class.
   * Looks for a static 'metadata' property on the enemy class.
   */
  public static getMetadata(type: EnemyType): { name: string, faction: string, description: string } {
    const handler = this.getHandler(type);
    
    return handler.metadata || { 
      name: 'Unknown Name', 
      description: 'Unknown behaviors' ,
      faction: 'Unknown'
    };
    
  }
  public static getDefaultStats(type: EnemyType): any {
    const handler = this.getHandler(type);
    // We call create at (0,0) just to peek at the returned color/radius
    return handler.create(0, 0);
  }

  /**
   * Factory method to initialize a new enemy with its default stats.
   */
  public static createEnemy(type: EnemyType, x: number, y: number): Enemy {
    const handler = this.getHandler(type);
    
    // Call the 'create' method in the specific enemy file
    const baseStats = handler.create(x, y, type);

    // Merge base stats with required properties
    return {
      type,
      ...baseStats
    } as Enemy;
  }

  /**
   * Delegates the update logic to the specific enemy file.
   * Modified signature slightly to accept and pass through the full enemy list.
   */
  public static update(
    enemy: Enemy, 
    player: Player, 
    bullets: Bullet[], 
    deltaTime: number, 
    currentTime: number,
    allEnemies: Enemy[] = [] // Optional fallback param so it doesn't break other calling services
  ): void {

    const handler = this.getHandler(enemy.type);
    
    handler.update(
      enemy, 
      player, 
      deltaTime, 
      currentTime, 
      this.moveTowardsTarget.bind(this), 
      bullets,
      allEnemies
    );
  }

  /**
   * Delegates the drawing logic to the specific enemy file.
   */
  public static draw(ctx: CanvasRenderingContext2D, enemy: Enemy, player: Player, bullets: Bullet[]): void {
    const handler = this.getHandler(enemy.type);
    handler.draw(ctx, enemy, player, bullets);
  }

  /**
   * A shared movement utility used by all enemy update methods.
   */
  public static moveTowardsTarget(
    enemy: Enemy, 
    deltaTime: number, 
    targetX: number, 
    targetY: number, 
    targetSpeed: number
  ): void {
    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0 && targetSpeed > 0) {
      const finalSpeed = targetSpeed * 0.06 * deltaTime;
      enemy.x += (dx / dist) * finalSpeed;
      enemy.y += (dy / dist) * finalSpeed;
    }
  }

  // Internal helper to find the correct handler or fallback to Roller.
  private static getHandler(type: EnemyType): any {
    return this.mapping[type] || RollerEnemy;
  }
}