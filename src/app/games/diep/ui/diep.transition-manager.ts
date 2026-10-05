export class TransitionManager {
    public opacity: number = 1;
    private targetOpacity: number = 0;
    private fadeSpeed: number = 0.0035; // Increased for a quicker feel
    private onComplete: (() => void) | null = null;

    fadeOut(callback: () => void) {
        this.targetOpacity = 1;
        this.onComplete = callback;
    }

    fadeIn() {
        this.targetOpacity = 0;
        this.onComplete = null;
    }

    update(deltaTime: number) {
        if (this.opacity < this.targetOpacity) {
            this.opacity = Math.min(1, this.opacity + this.fadeSpeed * deltaTime);
            if (this.opacity === 1 && this.onComplete) {
                const cb = this.onComplete;
                this.onComplete = null; 
                cb();
                this.fadeIn();
            }
        } else if (this.opacity > this.targetOpacity) {
            this.opacity = Math.max(0, this.opacity - this.fadeSpeed * deltaTime);
        }
    }

    draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
}