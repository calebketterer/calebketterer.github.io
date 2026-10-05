export class DiepTipsManager {
  private static tips: string[] = [
    "Use WASD to move and Mouse to aim.",
    "Destroy shapes to gain XP and level up.",
    "Certain enemies are deadlier, but destroying them provides more points.",
    "Don't get cornered! Keep moving to survive.",
    "Each enemy has unique behavior patterns.",
    "Many orange shapes tend to be explosive- watch out!",
    "Yellow shapes often operate as medics, healing damaged shapes.",
    "Green shapes commonly leave behind corrosive trails.",
    "Some blue shapes spawn spectral pieces—watch out for their echoes.",
    "Double click the title to reset the engine effects.",
    "It's often a good idea to avoid the map's edges.",
    "Achievements update in real time, even if you return to the main menu.",
    "The Arena is a brutal, endless wave of enemies."
  ];

  private static currentTipIndex = 0;
  private static nextTipIndex = 0;
  private static opacity = 1;
  private static fadeState: 'idle' | 'out' | 'in' = 'idle';
  private static timer = 0;
  private static readonly SWITCH_INTERVAL = 450;
  private static readonly FADE_SPEED = 0.07;

  public static draw(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    this.update();
    ctx.save();
    ctx.font = '16px Inter, sans-serif';
    ctx.fillStyle = `rgba(127, 140, 141, ${this.opacity})`;
    ctx.textAlign = 'center';
    ctx.fillText(this.tips[this.currentTipIndex], w / 2, h / 2 + 225);
    ctx.restore();
  }

  public static handleInteraction(mx: number, my: number, w: number, h: number): void {
    const targetY = h / 2 + 225;
    if (Math.abs(my - targetY) < 40) {
      this.triggerNewTip();
    }
  }

  private static triggerNewTip(): void {
    if (this.fadeState !== 'idle') return;

    // Pick the NEXT tip but don't show it yet
    let next;
    do {
      next = Math.floor(Math.random() * this.tips.length);
    } while (next === this.currentTipIndex);

    this.nextTipIndex = next;
    this.fadeState = 'out';
  }

  private static update(): void {
    if (this.fadeState === 'idle') {
      if (++this.timer >= this.SWITCH_INTERVAL) this.triggerNewTip();
    } 
    else if (this.fadeState === 'out') {
      this.opacity -= this.FADE_SPEED;
      if (this.opacity <= 0) {
        this.opacity = 0;
        // THE SWAP: Now that it's invisible, switch the text
        this.currentTipIndex = this.nextTipIndex;
        this.fadeState = 'in';
      }
    } 
    else if (this.fadeState === 'in') {
      this.opacity += this.FADE_SPEED;
      if (this.opacity >= 1) {
        this.opacity = 1;
        this.fadeState = 'idle';
        this.timer = 0;
      }
    }
  }
}