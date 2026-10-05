import { TitleState } from './title.interfaces';

export class TitleStateManager {
  public static state: TitleState;
  public static prevState: TitleState;
  public static transitionLerp = 1.0;
  public static isPaused = false; // Auto-start enabled
  public static isResetting = false;
  public static lastSwitchFrame = 0; 

  private static readonly MIN_FEATURES = 5;
  private static readonly MAX_FEATURES = 7;
  private static readonly SWITCH_INTERVAL = 5 * 60;
  private static readonly TRANSITION_SPEED = 0.012;

  public static update(frame: number): void {
    if (!this.state) {
      this.state = this.getStaticState();
      this.prevState = this.getStaticState();
    }

    if (!this.isPaused && !this.isResetting && frame - this.lastSwitchFrame >= this.SWITCH_INTERVAL) {
      this.triggerTransition(this.getRandomState(), frame);
    }

    if (this.transitionLerp < 1) {
      this.transitionLerp += this.TRANSITION_SPEED;
    } else if (this.isResetting) {
      this.isResetting = false;
      this.isPaused = true;
    }
  }

  public static triggerTransition(newState: TitleState, frame: number): void {
    this.prevState = { ...this.state };
    this.state = newState;
    this.transitionLerp = 0;
    this.lastSwitchFrame = frame;
  }

  public static handleClick(doubleClick: boolean, currentFrame: number): void {
    if (doubleClick) {
      this.isResetting = true;
      this.isPaused = false;
      this.triggerTransition(this.getStaticState(), currentFrame);
    } else if (!this.isResetting) {
      this.isPaused = !this.isPaused;
      if (!this.isPaused) {
        this.lastSwitchFrame = currentFrame - this.SWITCH_INTERVAL; // Instant effect on click
      }
    }
  }

  public static blend(feature: keyof TitleState): number {
    if (!this.state || !this.prevState) return 0;
    const prev = this.prevState[feature] ? 1 : 0;
    const curr = this.state[feature] ? 1 : 0;
    const t = this.transitionLerp;
    const smoothT = t * t * (3 - 2 * t);
    return prev + (curr - prev) * smoothT;
  }

  public static getStaticState(): TitleState {
    return {
      sineWave: false, perLetterWave: false, squashStretch: false, tilt: false,
      ghostEcho: false, jitter: false, globalLerp: false, perLetterLerp: false,
      gridBackdrop: false, barrelRecoil: false, orbitingShapes: false, gravityDrop: false,
      glowPulse: false, scanlines: false, chromaticAberration: false, letterOutline: false,
      shrinkLetters: false
    };
  }

  private static getRandomState(): TitleState {
    const keys = Object.keys(this.getStaticState()) as (keyof TitleState)[];
    const newState = this.getStaticState() as any;
    const count = Math.floor(Math.random() * (this.MAX_FEATURES - this.MIN_FEATURES + 1)) + this.MIN_FEATURES;
    const shuffled = [...keys].sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) newState[shuffled[i]] = true;
    if (newState.globalLerp && newState.perLetterLerp) newState.perLetterLerp = false;
    return newState as TitleState;
  }
}