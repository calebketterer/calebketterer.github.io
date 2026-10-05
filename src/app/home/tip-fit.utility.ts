/**
 * Utility function to calculate the exact font size (in pixels) required 
 * to make a string fit a target pixel width without wrapping or clipping.
 * Works uniformly across Safari (WebKit) and Chrome (Blink).
 */
export function calculateExactFontSize(
  text: string,
  targetWidthPx: number,
  computedStyle: CSSStyleDeclaration,
  minFontSize: number = 8,
  maxFontSize: number = 40
): number {
  if (!text || !text.trim() || targetWidthPx <= 0) {
    return 14;
  }

  // Account for a safety margin (16px total) so text never clips parent borders
  const maxAllowedWidth = Math.max(targetWidthPx - 16, 10);

  // Create an isolated off-screen mirror element to bypass Safari flex layout limits
  const offscreen = document.createElement('div');
  offscreen.style.position = 'absolute';
  offscreen.style.top = '-9999px';
  offscreen.style.left = '-9999px';
  offscreen.style.visibility = 'hidden';
  offscreen.style.whiteSpace = 'nowrap';
  offscreen.style.display = 'inline-block';
  offscreen.style.fontFamily = computedStyle.fontFamily || 'sans-serif';
  offscreen.style.fontWeight = computedStyle.fontWeight || 'normal';
  offscreen.style.fontStyle = computedStyle.fontStyle || 'normal';
  offscreen.style.letterSpacing = computedStyle.letterSpacing || 'normal';
  offscreen.textContent = text;

  document.body.appendChild(offscreen);

  let low = minFontSize;
  let high = maxFontSize;
  let optimalSize = minFontSize;

  // Binary search for max font size using true WebKit off-screen bounds
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    offscreen.style.fontSize = `${mid}px`;

    // Force layout recalculation on WebKit
    void offscreen.offsetWidth;
    const measuredWidth = offscreen.getBoundingClientRect().width;

    if (measuredWidth <= maxAllowedWidth) {
      optimalSize = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Clean up off-screen DOM element
  document.body.removeChild(offscreen);

  return optimalSize;
}