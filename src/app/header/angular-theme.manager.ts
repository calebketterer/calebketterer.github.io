export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class AngularThemeManager {
  // Distinct anchor colors across the red -> pink -> purple -> violet range.
  public static readonly STOPS: string[] = [
    '#F0060B', // red
    '#F53592', // rose
    '#CC26D5', // magenta
    '#9C1FE0', // purple
    '#7702FF'  // violet
  ];

  // Matches the 5s duration of the logo's `hueBreathing2` CSS animation
  private static readonly CYCLE_MS = 5000;

  public static hexToRgb(hex: string): RGBColor {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16) || 0;
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  public static rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  public static rotateRgb(rgb: RGBColor, degrees: number): RGBColor {
    const rad = (degrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const r = rgb.r * (0.213 + 0.787 * cos - 0.213 * sin) +
              rgb.g * (0.715 - 0.715 * cos - 0.715 * sin) +
              rgb.b * (0.072 - 0.072 * cos + 0.928 * sin);

    const g = rgb.r * (0.213 - 0.213 * cos + 0.143 * sin) +
              rgb.g * (0.715 + 0.285 * cos + 0.140 * sin) +
              rgb.b * (0.072 - 0.072 * cos - 0.283 * sin);

    const b = rgb.r * (0.213 - 0.213 * cos - 0.787 * sin) +
              rgb.g * (0.715 - 0.715 * cos + 0.715 * sin) +
              rgb.b * (0.072 + 0.928 * cos + 0.072 * sin);

    return {
      r: Math.max(0, Math.min(255, r)),
      g: Math.max(0, Math.min(255, g)),
      b: Math.max(0, Math.min(255, b))
    };
  }

  // Approximates CSS `ease-in-out` (cubic-bezier(0.42,0,0.58,1)) closely enough
  // to be visually indistinguishable from the logo's timing curve, without
  // needing a full bezier solver.
  private static easeInOut(t: number): number {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }

  /**
   * Returns a single flat color for a letter based on how far along the
   * title it sits (normalizedT: 0 = leftmost, 1 = rightmost) and the
   * current animation time. Deliberately NOT a CanvasGradient: gradients
   * are re-projected through whatever transform is active when they're
   * painted, and per-letter code applies its own translate/scale before
   * drawing, which was causing every letter to sample the same point on
   * the gradient. A flat color has no coordinate space to get dragged
   * around by that transform, so this is what actually varies smoothly
   * left-to-right across the word.
   */
  public static getColorAtPosition(normalizedT: number, elapsedMs: number): string {
    const clampedT = Math.max(0, Math.min(1, normalizedT));
    const scaledT = clampedT * (this.STOPS.length - 1);
    const idx0 = Math.floor(scaledT);
    const idx1 = Math.min(idx0 + 1, this.STOPS.length - 1);
    const localT = scaledT - idx0;

    const rgb0 = this.hexToRgb(this.STOPS[idx0]);
    const rgb1 = this.hexToRgb(this.STOPS[idx1]);
    const lerped: RGBColor = {
      r: rgb0.r + (rgb1.r - rgb0.r) * localT,
      g: rgb0.g + (rgb1.g - rgb0.g) * localT,
      b: rgb0.b + (rgb1.b - rgb0.b) * localT
    };

    const t = (elapsedMs % this.CYCLE_MS) / this.CYCLE_MS;
    const degrees = this.easeInOut(t) * 360;
    const rotated = this.rotateRgb(lerped, degrees);

    return this.rgbToHex(rotated.r, rotated.g, rotated.b);
  }
}