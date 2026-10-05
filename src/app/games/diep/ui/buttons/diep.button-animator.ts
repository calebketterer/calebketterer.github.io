import { DiepTimeManager } from '../../core/diep.time-manager';

export class DiepButtonAnimator {
  /**
   * PERSISTENCE: This static map ensures that button hover states 
   * (0.0 to 1.0) are preserved across frames and menu switches.
   */
  private static states: Map<string, { hover: number }> = new Map();
  
  // 0.15 is smooth; 0.25 is snappy; 0.05 is slow.
  private static readonly LERP_SPEED = 0.15;

  /**
   * Calculates the current lerped hover progress.
   * @param id The unique button ID (e.g., 'start-btn')
   * @param isHovered Current hit-test result
   * @returns { hover: number } A value between 0 and 1
   */
  public static getValues(id: string, isHovered: boolean): { hover: number } {
    if (!this.states.has(id)) {
      this.states.set(id, { hover: 0 });
    }

    const state = this.states.get(id)!;
    const target = isHovered ? 1 : 0;

    /**
     * Linear Interpolation: Current + (Target - Current) * Speed
     * We multiply by DiepTimeManager.uiTick to ensure the animation 
     * progresses even when the game world is paused or at the game over screen.
     */
    state.hover += (target - state.hover) * (this.LERP_SPEED * DiepTimeManager.uiTick);

    // Snapping to target to stop unnecessary calculations
    if (Math.abs(state.hover - target) < 0.001) {
      state.hover = target;
    }

    return { hover: state.hover };
  }

  /**
   * Calculates a new rectangle based on the growth amount.
   * @param btn The button object (must have x, y, w, h)
   * @param hoverVal The current 0-1 animation progress
   * @param growAmt Maximum pixels to expand (e.g., 5)
   */
  public static getBloomedRect(btn: any, hoverVal: number, growAmt: number = 5) {
    const currentGrow = growAmt * hoverVal;
    
    return {
      x: btn.x - currentGrow,
      y: btn.y - currentGrow,
      w: btn.w + (currentGrow * 2),
      h: btn.h + (currentGrow * 2)
    };
  }

  /**
   * Optional: Clear states if you want to reset all button animations 
   * (e.g., when transitioning between major game states).
   */
  public static clearStates(): void {
    this.states.clear();
  }
}