export class GlitchHandler {
  isGlitchingOut = false;
  isGlitchingIn = false;
  isFullyHidden = false;

  triggerGlitchOut(onComplete?: () => void): void {
    this.isGlitchingOut = true;
    setTimeout(() => {
      this.isGlitchingOut = false;
      this.isFullyHidden = true;
      if (onComplete) onComplete();
    }, 500);
  }

  triggerGlitchIn(onComplete?: () => void): void {
    this.isFullyHidden = false;
    this.isGlitchingIn = true;
    setTimeout(() => {
      this.isGlitchingIn = false;
      if (onComplete) onComplete();
    }, 500);
  }
}