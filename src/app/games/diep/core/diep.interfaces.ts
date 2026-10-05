// src/app/diep/core/diep.interfaces.ts

export type OwnerType = 'PLAYER' | 'ENEMY'; 
export type DifficultyMode = 'EASY' | 'MEDIUM' | 'HARD';

export interface PlayerProgression {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXpEarned: number;
  upgradePoints: number;
  difficulty: DifficultyMode;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  angle: number; 
  maxSpeed: number;
  color: string;
  health: number;
  maxHealth: number;
  healthRegen: number;
  fireRate: number;
  bodyDamage: number;
  bulletDamage: number;
  bulletHealth: number;
  bulletSpeed: number;
  upgrades: Record<string, number>;
  progression: PlayerProgression;
  isFlying?: boolean;
  
  // Cleanly encapsulated inventory tracking setup
  inventory: PlayerInventory;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  mass: number;
  color: string;
  ownerType: OwnerType;
  health: number;
  maxHealth: number;
  damage: number;
  hasTrail?: boolean;
  isBomb?: boolean;
  timer?: number;      
  maxTimer?: number;   
  explosionRadius?: number;
  isExploding?: boolean; 
  isHoming?: boolean;
  isBouncy?: boolean;
  bounces?: number;
  healOwnerOnHit?: boolean;
  ownerId?: string;
  isFlying?: boolean;
  isGhost?: boolean;
}

export type EnemyType = 'ROLLER' | 'MINION' | 'CRASHER' | 'SNIPER' | 'BLOATER' | 'SMASHER' | 'GUNNER' | 'MOTHER'| 'HEALER' | 'HAUNTER' | 'BOMBER'| 'BLASTER'| 'CASTER'| 'ECHO' | 'FLOATER' | 'MEDIC' | 'DETONATOR' | 'DIGGER' | 'POLLUTER';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;
  health: number;
  maxHealth: number;
  bodyDamage: number;
  scoreValue: number;
  isBoss?: boolean; 
  type: EnemyType; 
  speedMultiplier?: number;
  lastShotTime?: number;
  targetX?: number; 
  targetY?: number; 
  spawnTime?: number;   
  lifespan?: number;     
  rotation?: number;
  rotationAngle?: number;
  rotationSpeed?: number;
  speedPhase?: number;
  state?: Record<string, any>;
  isPassive?: boolean;         
  canDespawn?: boolean;      
  opacity?: number;         
  needsSpawn?: boolean;  
  isGhost?: boolean; 
  isInvulnerable?: boolean;  
  isPriming?: boolean;     
  blastTimer?: number;     
  maxBlastTimer?: number; 
  blastRadius?: number;    
  isFlying?: boolean;
  onHit?: (enemies: Enemy[], spawner: any, bullet: Bullet) => void;
  onDeath?: (enemies: Enemy[], spawner: any, deadEnemy: Enemy, player: Player) => void;
  onUpdate?: (enemy: Enemy, player: Player, deltaTime: number) => void;
  onSpawn?: (enemy: Enemy, canvasWidth: number, canvasHeight: number) => void;
  onDraw?: (ctx: CanvasRenderingContext2D, enemy: Enemy) => void;
}

export interface EnemySpawnWeight {
    type: EnemyType;
    weight: number;
}

export interface HighScore {
  score: number;
  date: string; 
}

export interface TrailSegment {
    x: number;
    y: number;
    radius: number;
    maxRadius: number;
    color: string;
    opacity: number;
    creationTime: number;
    lifespan: number;
}

export interface ButtonArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DiepButton extends ButtonArea {
  id: string;
  label: string;
  color: string;
  borderColor: string;
  textColor?: string;
  hoverEffect?: 'grow' | 'highlight' | 'none';
  fontSize?: string;
  action: () => void;
}

export type AchievementType = 'KILL' | 'WAVE' | 'SCORE'|'UPGRADE';

export interface Achievement {
  id: string;
  groupId?: string;
  groupTag?: string;
  tier?: number;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  isUnlocked: boolean;
  type: 'WAVE' | 'KILL' | 'SCORE' | 'UPGRADE';
  weight: number;
  enemyType?: string; 
  upgradeId?: string;
  faction?: 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Blue' | 'Purple';
  isSingleGame?: boolean;
}

export interface GameSystem {
  update(engine: any, tick: number, ms: number): void;
}

// --- Player Collection / Inventory Layouts ---

export type ItemType = 'ATTACHMENT' | 'CHASSIS_PERK';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  maxStack: number;
  type: ItemType;
  drawIllustration: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, frame: number) => void;
}

export interface PlayerInventory {
  slots: InventoryItem[];
  maxSlots: number;
  pixels: number;
  equippedIds: string[];
}