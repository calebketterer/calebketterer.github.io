import { TitleStateManager } from './title-engine/title.state-manager';
import { TitleParticleSystem } from './title-engine/title.particle-system';
import { TitleFXRenderer } from './title-engine/title.fx-renderer';

export class DiepDynamicTitle {
  private static readonly GLOBAL_SPEED = 0.6;
  private static readonly DIEP_BLUE = '#3498db';
  private static readonly COLORS = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
  private static internalFrame = 0;

  public static handleClick(doubleClick: boolean = false): void {
    TitleStateManager.handleClick(doubleClick, this.internalFrame);
  }

  public static draw(ctx: CanvasRenderingContext2D, x: number, y: number, externalFrame: number): void {
    if (!TitleStateManager.isPaused) this.internalFrame += this.GLOBAL_SPEED;
    TitleStateManager.update(this.internalFrame);

    const frame = this.internalFrame;
    const text = "DIEP SINGLEPLAYER";
    const charWidth = 45;
    const startX = x - ((text.length - 1) * charWidth) / 2;
    const outlineInt = TitleStateManager.blend('letterOutline');

    if (TitleFXRenderer.shapes.length === 0) this.initShapes(x, y);

    ctx.save();
    const gridInt = TitleStateManager.blend('gridBackdrop');
    if (gridInt > 0) TitleFXRenderer.drawGrid(ctx, x, y, frame, gridInt);

    let globalY = y + (Math.sin(frame * 0.02) * 12 * TitleStateManager.blend('sineWave'));
    ctx.translate(x, globalY);
    const activeTilt = TitleStateManager.blend('tilt');
    if (activeTilt > 0) ctx.rotate(Math.cos(frame * 0.015) * (0.04 * activeTilt));
    ctx.translate(-x, -globalY);

    if (TitleStateManager.blend('orbitingShapes') > 0) {
      TitleFXRenderer.updateAndDrawShapes(ctx, x, globalY, TitleStateManager.blend('orbitingShapes'));
    }

    TitleParticleSystem.updateAndDraw(ctx, this.getDarkerHue, outlineInt);
    this.renderCharacters(ctx, text, startX, globalY, charWidth, frame, outlineInt);

    const scanInt = TitleStateManager.blend('scanlines');
    if (scanInt > 0.05) TitleFXRenderer.drawScanlines(ctx, x, globalY, frame, scanInt);
    ctx.restore();
  }

  private static renderCharacters(ctx: CanvasRenderingContext2D, text: string, startX: number, y: number, spacing: number, frame: number, outlineInt: number): void {
    ctx.font = '900 70px Inter, sans-serif';
    ctx.textAlign = 'center';
    const shrinkInt = TitleStateManager.blend('shrinkLetters');

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === ' ' || TitleParticleSystem.fallingLetters.some(f => f.index === i && f.active)) continue;
      const charColor = this.getCharColor(i, frame);
      
      if (!TitleStateManager.isPaused && TitleStateManager.blend('gravityDrop') > 0.6 && Math.random() < 0.0015) {
        TitleParticleSystem.fallingLetters.push({ index: i, char, x: startX + (i * spacing), y, velY: 1.5, alpha: 1, active: true, color: charColor });
        continue;
      }

      ctx.save();
      let charX = startX + (i * spacing);
      let charY = y + (Math.sin((frame * 0.04) + (i * 0.4)) * 15) * TitleStateManager.blend('perLetterWave');

      let shrinkScale = 1;
      if (shrinkInt > 0) {
        const individualShrink = Math.sin((frame * 0.05) + (i * 0.8));
        if (individualShrink < -0.4) {
          shrinkScale = Math.max(0, 1 + (individualShrink + 0.4) * shrinkInt);
        }
      }

      const recoilInt = TitleStateManager.blend('barrelRecoil');
      if (recoilInt > 0) {
        const fireOffset = Math.floor(frame + (i * 30)) % 220;
        if (fireOffset < 12) {
          const kick = (12 - fireOffset) * 2.5 * recoilInt;
          charY += kick;
          if (!TitleStateManager.isPaused && fireOffset === 0) {
            TitleParticleSystem.bullets.push({ x: charX, y: charY - 45 - kick, velY: -9, alpha: 1, color: charColor });
          }
        }
      }

      const breath = (Math.cos((frame * 0.05) + i) * 0.12) * TitleStateManager.blend('squashStretch');
      const jitter = TitleStateManager.blend('jitter');
      if (jitter > 0) {
        charX += Math.sin(frame * 0.2 + i) * 3 * jitter;
        charY += Math.cos(frame * 0.2 + i) * 3 * jitter;
      }

      ctx.translate(charX, charY);
      ctx.scale((1 + breath) * shrinkScale, (1 - breath) * shrinkScale);
      if (outlineInt > 0) {
        ctx.strokeStyle = this.getDarkerHue(charColor);
        ctx.lineWidth = 10 * outlineInt;
        ctx.strokeText(char, 0, 0);
      }
      ctx.fillStyle = charColor;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }

  private static getCharColor(i: number, frame: number): string {
    if (TitleStateManager.blend('globalLerp') > 0.5) return this.getGlobalColor(frame);
    if (TitleStateManager.blend('perLetterLerp') > 0.5) return this.COLORS[(Math.floor(frame * 0.03) + i) % this.COLORS.length];
    return this.DIEP_BLUE;
  }

  private static initShapes(cx: number, cy: number) {
    const data = [{ t: 3, c: '#f1c40f', b: '#c7a30c' }, { t: 4, c: '#e74c3c', b: '#c0392b' }, { t: 5, c: '#764ba2', b: '#5e3c81' }];
    for (let i = 0; i < 9; i++) {
      const s = data[i % 3];
      TitleFXRenderer.shapes.push({ x: cx + (Math.random() - 0.5) * 600, y: cy + (Math.random() - 0.5) * 400, vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, rotation: 0, vr: (Math.random() - 0.5) * 0.05, type: s.t, color: s.c, borderColor: s.b });
    }
  }

  private static getGlobalColor(frame: number): string {
    const speed = 0.008 * this.GLOBAL_SPEED;
    const idx = Math.floor((frame * speed) % this.COLORS.length);
    const nextIdx = (idx + 1) % this.COLORS.length;
    return this.lerpColor(this.COLORS[idx], this.COLORS[nextIdx], (frame * speed) % 1);
  }

  private static getDarkerHue(hex: string): string {
    const ah = parseInt(hex.replace(/#/g, ''), 16);
    const r = Math.max(0, Math.round((ah >> 16) * 0.75)), g = Math.max(0, Math.round(((ah >> 8) & 0xff) * 0.75)), b = Math.max(0, Math.round((ah & 0xff) * 0.75));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  private static lerpColor(a: string, b: string, amt: number): string {
    const ah = parseInt(a.replace(/#/g, ''), 16), bh = parseInt(b.replace(/#/g, ''), 16);
    const r = Math.round((ah >> 16) + amt * ((bh >> 16) - (ah >> 16))), g = Math.round(((ah >> 8) & 0xff) + amt * (((bh >> 8) & 0xff) - ((ah >> 8) & 0xff))), bl = Math.round((ah & 0xff) + amt * ((bh & 0xff) - (ah & 0xff)));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
  }
}