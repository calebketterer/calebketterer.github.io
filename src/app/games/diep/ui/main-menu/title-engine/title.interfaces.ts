export interface TitleState {
  sineWave: boolean;      
  perLetterWave: boolean; 
  squashStretch: boolean; 
  tilt: boolean;          
  ghostEcho: boolean;     
  jitter: boolean;        
  globalLerp: boolean;    
  perLetterLerp: boolean; 
  gridBackdrop: boolean;  
  barrelRecoil: boolean;  
  orbitingShapes: boolean;
  gravityDrop: boolean;   
  glowPulse: boolean;          
  scanlines: boolean;          
  chromaticAberration: boolean; 
  letterOutline: boolean;   
  shrinkLetters: boolean;   
}

export interface Bullet { x: number; y: number; velY: number; alpha: number; color: string; }
export interface FallingLetter { index: number; char: string; x: number; y: number; velY: number; alpha: number; active: boolean; color: string; }
export interface DiepShape { x: number; y: number; vx: number; vy: number; rotation: number; vr: number; type: number; color: string; borderColor: string; }