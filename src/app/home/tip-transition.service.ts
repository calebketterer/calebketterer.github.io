import { Injectable, ElementRef, Renderer2 } from '@angular/core';
import { HomeStateService } from './home.state.service';
import { calculateExactFontSize } from './tip-fit.utility';

@Injectable({
  providedIn: 'root'
})
export class TipTransitionService {
  private isTipAnimating = false;

  constructor(private state: HomeStateService) {}

  cycleTipWithFade(tipsElementRef: ElementRef<HTMLElement>, renderer: Renderer2): void {
    if (this.isTipAnimating || !tipsElementRef || !tipsElementRef.nativeElement) {
      return;
    }

    this.isTipAnimating = true;
    const el = tipsElementRef.nativeElement;

    // Phase 1: Fade Out
    renderer.addClass(el, 'is-fading');

    // Phase 2: Cycle state, recalculate exact font size, and Fade In
    setTimeout(() => {
      this.state.cycleTip();
      this.fitTipText(tipsElementRef, renderer);

      renderer.removeClass(el, 'is-fading');

      setTimeout(() => {
        this.isTipAnimating = false;
      }, 300);
    }, 300);
  }

  fitTipText(tipsElementRef: ElementRef<HTMLElement>, renderer: Renderer2): void {
    if (!tipsElementRef || !tipsElementRef.nativeElement) {
      return;
    }

    const el = tipsElementRef.nativeElement;
    const text = this.state.currentTipText || el.textContent || '';
    if (!text.trim()) {
      return;
    }

    const container = el.parentElement;
    if (!container) {
      return;
    }

    // Force single-line inline behavior on target element
    renderer.setStyle(el, 'whiteSpace', 'nowrap');
    renderer.setStyle(el, 'display', 'inline-block');

    // Read true parent container content bounds excluding padding
    const containerStyle = window.getComputedStyle(container);
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(containerStyle.paddingRight) || 0;
    const containerRectWidth = container.getBoundingClientRect().width;
    const availableWidth = Math.max(containerRectWidth - paddingLeft - paddingRight, 10);

    const computedStyle = window.getComputedStyle(el);

    // Calculate exact font size using off-screen layout measurement
    const calculatedFontSize = calculateExactFontSize(
      text,
      availableWidth,
      computedStyle,
      8,
      40
    );

    renderer.setStyle(el, 'font-size', `${calculatedFontSize}px`);
  }
}