// src/app/diep/ui/main-menu/quadrivium/diep.quadrivium-scroller.ts
export class DiepQuadriviumScroller {
  public static scrollY = 0;
  public static targetScrollY = 0;
  private static isDragging = false;
  private static lastMouseY = 0;

  public static update(g: any, canScroll: boolean, totalHeight: number): number {
    if (canScroll) {
      this.handleKeyboardScroll(g);
      this.scrollY += (this.targetScrollY - this.scrollY) * 0.15;
      
      let displayOffset = this.scrollY % totalHeight;
      if (displayOffset > 0) displayOffset -= totalHeight;
      return displayOffset;
    } else {
      this.targetScrollY = 0;
      this.scrollY = 0;
      return 0;
    }
  }

  public static resetScroll(): void {
    this.scrollY = 0;
    this.targetScrollY = 0;
    this.isDragging = false;
  }

  public static handleInputDown(mouseY: number): void {
    this.isDragging = true;
    this.lastMouseY = mouseY;
  }

  public static handleInputUp(): void {
    this.isDragging = false;
  }

  public static handleInputMove(mouseY: number): void {
    if (!this.isDragging) return;
    this.targetScrollY += (mouseY - this.lastMouseY);
    this.lastMouseY = mouseY;
  }

  private static handleKeyboardScroll(g: any): void {
    const speed = 12;
    if (g.keys['w'] || g.keys['W'] || g.keys['arrowup']) this.targetScrollY += speed;
    if (g.keys['s'] || g.keys['S'] || g.keys['arrowdown']) this.targetScrollY -= speed;
  }
}