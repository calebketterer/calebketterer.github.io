export class DiepTimeManager {
  public static gameTick = 0;
  public static uiTick = 0;

  public static get gameMs(): number {
    return this.gameTick * 16.67;
  }

  public static get uiMs(): number {
    return this.uiTick * 16.67;
  }

  private static lastTime = 0;
  private static readonly MAX_DELTA = 100;

  public static update(isPaused: boolean, currentTime: number): void {
    if (this.lastTime === 0) this.lastTime = currentTime;

    let delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (delta > this.MAX_DELTA) delta = 16.67;

    this.uiTick = delta / 16.67;
    this.gameTick = isPaused ? 0 : this.uiTick;
  }

  public static reset(): void {
    this.lastTime = performance.now();
    this.gameTick = 0;
    this.uiTick = 0;
  }
}