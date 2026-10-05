import { Injectable } from '@angular/core';
import { COLOR_POOL, GRADIENT_SENSITIVITY } from './home.constants';

@Injectable({
  providedIn: 'root'
})
export class UiEffectsService {

  // Logic to pick unique colors from your pool
  getRandomizedColors(count: number): string[] {
    return [...COLOR_POOL].sort(() => Math.random() - 0.5).slice(0, count);
  }

  // The math for the gradient string used by the header
  generateGradientString(x: number, colors: string[]): string {
    const shift = x - 50;
    const stops = colors.map((color, idx) => {
      const spread = 100 / (colors.length - 1);
      const pos = Math.max(0, Math.min(100, idx * spread + shift * GRADIENT_SENSITIVITY));
      return `${color} ${pos.toFixed(1)}%`;
    }).join(', ');

    return `linear-gradient(to right, ${stops})`;
  }
}