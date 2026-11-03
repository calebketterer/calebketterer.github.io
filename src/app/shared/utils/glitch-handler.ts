export class GlitchHandler {
  isGlitchingOut = false;
  isGlitchingIn = false;
  isFullyHidden = false;

  triggerGlitchOut(onComplete: () => void): void {
    this.isGlitchingOut = true;
    setTimeout(() => {
      this.isGlitchingOut = false;
      this.isFullyHidden = true;
      onComplete();
    }, 500);
  }

  triggerGlitchIn(): void {
    this.isFullyHidden = false;
    this.isGlitchingIn = true;
    setTimeout(() => {
      this.isGlitchingIn = false;
    }, 500);
  }
}