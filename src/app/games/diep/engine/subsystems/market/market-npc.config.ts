// src/app/diep/engine/subsystems/market/market-npc.config.ts
import { REGISTERED_MARKET_VENDORS, DiepVendorProfile } from './vendors';

export interface MarketNpc {
  id: string;
  name: string;
  subtitle: string;
  type: DiepVendorProfile['type'];
  
  // FIXED: Converted to absolute world coordinates in pixels matching player mechanics
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  
  // Structural Look Angle Interpolations
  currentAngle: number;
  targetAngle: number;
  lastHeadingAngle: number;
  
  // Runtime AI State parameters
  behaviorType: 'WANDER' | 'STAND';
  wanderState: 'IDLE' | 'MOVING_AIMLESS' | 'MOVING_TO_STALL';
  wanderTimer: number;
  wanderTargetX?: number;
  wanderTargetY?: number;
  
  // Conversational focus constraints
  focusedNpcId: string | null;
  interactionTimer: number;
  
  // Cosmetic Style rendering cache pairs
  baseColor: string;
  accentColor: string;
}

export class MarketNpcConfigRegistry {
  // --- AI Tuning & Weight Adjustments ---
  public static readonly WANDER_SPEED = 1.2;
  public static readonly STEERING_EASE = 0.05; 
  public static readonly SEPARATION_BUFFER = 25;
  public static readonly SEPARATION_FORCE_WEIGHT = 0.5;
  
  // --- New Natural Behavior Gravity System ---
  public static readonly CENTER_GRAVITY_WEIGHT = 0.15; // Weight pushing wandering decisions toward center coordinates
  
  public static readonly ENGAGE_PROXIMITY = 220;    
  public static readonly SOCIAL_PROXIMITY = 140;    
  public static readonly TARGET_ARRIVE_RADIUS = 12; 

  public static readonly MIN_CHAT_DURATION = 1500;
  public static readonly MAX_CHAT_DURATION = 4000;
  public static readonly MIN_IDLE_DURATION = 2000;
  public static readonly MAX_IDLE_DURATION = 4500;

  // FIXED: Changed bounds check properties to absolute pixels instead of raw fractional scalars
  public static readonly MAP_BOUNDS = {
    minX: 400,  // Restricts outer wall limits
    maxX: 2000,
    minY: 400,
    maxY: 2000
  };

  // --- Type-Specific Size Configuration Bounds ---
  public static readonly TYPE_SIZE_CONFIGS: Record<string, { MIN_RADIUS: number; MAX_RADIUS: number }> = {
    GENERAL:   { MIN_RADIUS: 20, MAX_RADIUS: 25 }, 
    COSMETICS: { MIN_RADIUS: 18, MAX_RADIUS: 23 }, 
    WEAPONS:   { MIN_RADIUS: 28, MAX_RADIUS: 34 }, 
    ABILITIES: { MIN_RADIUS: 22, MAX_RADIUS: 28 }  
  };

  // Session-based persistence caches
  public static readonly sessionColorCache = new Map<string, { base: string; accent: string }>();
  public static readonly sessionSizeCache = new Map<string, number>();
  public static readonly sessionPositionCache = new Map<string, { x: number; y: number }>();

  public static readonly COLOR_PALETTES = [
    { base: '#3498db', accent: '#2980b9' }, 
    { base: '#e74c3c', accent: '#c0392b' }, 
    { base: '#9b59b6', accent: '#8e44ad' }, 
    { base: '#2ecc71', accent: '#27ae60' }, 
    { base: '#f1c40f', accent: '#f39c12' }, 
    { base: '#e67e22', accent: '#d35400' }, 
    { base: '#1abc9c', accent: '#16a085' }   
  ];
}

// Automatically transform drop-in records into live runtime array objects
export const MARKET_NPCS: MarketNpc[] = REGISTERED_MARKET_VENDORS.map(v => {
  const fallbackFractionX = Math.random() * 0.6 + 0.2;
  const fallbackFractionY = Math.random() * 0.4 + 0.4;

  const pctX = v.initialX !== undefined ? v.initialX : fallbackFractionX;
  const pctY = v.initialY !== undefined ? v.initialY : fallbackFractionY;

  // FIXED: Multiplied by the base world dimensions (2400) to create native absolute pixel states
  return {
    id: v.id,
    name: v.name,
    subtitle: v.subtitle,
    type: v.type,
    x: pctX * 2400,
    y: pctY * 2400,
    vx: 0,
    vy: 0,
    radius: 20, 
    currentAngle: 0,
    targetAngle: 0,
    lastHeadingAngle: 0,
    behaviorType: 'STAND',
    wanderState: 'IDLE',
    wanderTimer: 0,
    focusedNpcId: null,
    interactionTimer: 0,
    baseColor: '#95a5a6',
    accentColor: '#7f8c8d'
  };
});