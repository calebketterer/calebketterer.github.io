import { TitleFeaturesRegistry, ColorShiftManager, FONT_POOL, DEFAULT_GRAY } from './title-features.registry';
import { FeatureCategory } from './title.interfaces';

interface CategoryState {
  activeEffectIds: string[];
  durationFrames: number;
  lastChangedFrame: number;
}

export class TitleStateManager {
  public static activeFeatures: Map<string, number> = new Map();
  public static targetFeatures: Set<string> = new Set();

  public static isFrozen = false;
  public static isResetting = false;
  // true only while random effects (font/motion/color/stroke) are active.
  // Only handleSingleClick can set this true - there is no automatic timer.
  public static hasStarted = false;

  private static categoryStates: Map<FeatureCategory, CategoryState> = new Map([
    ['font', { activeEffectIds: [], durationFrames: 0, lastChangedFrame: 0 }],
    ['color', { activeEffectIds: [], durationFrames: 0, lastChangedFrame: 0 }],
    ['stroke', { activeEffectIds: [], durationFrames: 0, lastChangedFrame: 0 }],
    ['motion', { activeEffectIds: [], durationFrames: 0, lastChangedFrame: 0 }],
    ['misc', { activeEffectIds: [], durationFrames: 0, lastChangedFrame: 0 }]
  ]);

  public static currentFont = FONT_POOL[0];
  public static previousFont = FONT_POOL[0];
  public static fontMorphProgress = 1;

  public static init(): void {
    this.activeFeatures.clear();
    this.targetFeatures.clear();
    this.isFrozen = false;
    this.isResetting = false;
    this.hasStarted = false;
    this.currentFont = FONT_POOL[0];
    this.previousFont = FONT_POOL[0];
    this.fontMorphProgress = 1;

    ColorShiftManager.setTargets([DEFAULT_GRAY, DEFAULT_GRAY, DEFAULT_GRAY], 'horizontal');

    const allIds = TitleFeaturesRegistry.getAllIds();
    allIds.forEach(id => this.activeFeatures.set(id, 0));

    this.categoryStates.forEach(state => {
      state.activeEffectIds = [];
      state.durationFrames = 0;
      state.lastChangedFrame = 0;
    });
  }

  public static update(frame: number): void {
    ColorShiftManager.update();

    if (this.isResetting) {
      let remainingIntensities = 0;

      const allIds = TitleFeaturesRegistry.getAllIds();
      allIds.forEach(id => {
        const current = this.activeFeatures.get(id) || 0;
        const lerped = current * 0.88;
        const val = Math.abs(lerped) < 0.001 ? 0 : lerped;
        this.activeFeatures.set(id, val);
        remainingIntensities += val;
      });

      if (this.currentFont !== FONT_POOL[0]) {
        this.previousFont = this.currentFont;
        this.currentFont = FONT_POOL[0];
        this.fontMorphProgress = 0;
      }

      if (this.fontMorphProgress < 1) {
        this.fontMorphProgress += 0.04;
      }

      if (remainingIntensities === 0 && this.fontMorphProgress >= 1) {
        this.isResetting = false;
        // Stays here - no timer re-arms it. Only a single click resumes
        // random effects (see handleSingleClick).
        this.hasStarted = false;
      }
      return;
    }

    if (this.isFrozen) return;

    // No automatic start: evaluateCategories only ever runs here while
    // hasStarted is already true, which only handleSingleClick can set.
    if (this.hasStarted) {
      this.evaluateCategories(frame);
    }

    const allIds = TitleFeaturesRegistry.getAllIds();
    allIds.forEach(id => {
      const current = this.activeFeatures.get(id) || 0;
      const target = (this.hasStarted && this.targetFeatures.has(id)) ? 1 : 0;
      const lerped = current + (target - current) * 0.025;
      this.activeFeatures.set(id, Math.abs(lerped) < 0.001 ? 0 : lerped);
    });

    if (this.fontMorphProgress < 1) {
      this.fontMorphProgress += 0.02;
    }
  }

  public static handleSingleClick(currentFrame: number): void {
    if (this.isResetting) {
      this.isResetting = false;
    }

    if (!this.hasStarted) {
      this.hasStarted = true;
      this.isFrozen = false;
      this.evaluateCategories(currentFrame);
      return;
    }

    this.isFrozen = !this.isFrozen;
  }

  public static handleDoubleClick(currentFrame: number): void {
    this.targetFeatures.clear();
    this.isResetting = true;
    // Keep the base gradient animating through the reset and afterward -
    // only random effects turn off, not the underlying color/time sync.
    this.isFrozen = false;
    this.hasStarted = false;

    ColorShiftManager.setTargets([DEFAULT_GRAY, DEFAULT_GRAY, DEFAULT_GRAY], 'horizontal');

    this.categoryStates.forEach(state => {
      state.activeEffectIds = [];
      state.durationFrames = 0;
      state.lastChangedFrame = currentFrame;
    });
  }

  public static getIntensity(id: string): number {
    return this.activeFeatures.get(id) || 0;
  }

  private static getRandomDuration(cat: FeatureCategory): number {
    if (cat === 'font') {
      return Math.floor(Math.random() * 1800) + 1800; // 30s to 60s
    }
    return Math.floor(Math.random() * 600) + 600; // 10s to 20s
  }

  private static evaluateCategories(frame: number): void {
    let stateChanged = false;

    this.categoryStates.forEach((state, cat) => {
      if (frame - state.lastChangedFrame >= state.durationFrames) {
        state.lastChangedFrame = frame;
        state.durationFrames = this.getRandomDuration(cat);

        const available = TitleFeaturesRegistry.getByCategory(cat);
        const shouldApply = Math.random() > 0.2;

        if (shouldApply && available.length > 0) {
          if (cat === 'font') {
            state.activeEffectIds = ['globalFontSwap'];
            this.triggerGlobalFontShift();
          } else if (cat === 'color' || cat === 'stroke') {
            const chosen = available[Math.floor(Math.random() * available.length)];
            state.activeEffectIds = [chosen];
          } else if (cat === 'motion' && Math.random() > 0.4 && available.length >= 2) {
            const first = available[Math.floor(Math.random() * available.length)];
            let second = available[Math.floor(Math.random() * available.length)];
            while (second === first) {
              second = available[Math.floor(Math.random() * available.length)];
            }
            state.activeEffectIds = [first, second];
          } else {
            state.activeEffectIds = [available[Math.floor(Math.random() * available.length)]];
          }
        } else {
          state.activeEffectIds = [];
          if (cat === 'color') {
            ColorShiftManager.setTargets([DEFAULT_GRAY, DEFAULT_GRAY, DEFAULT_GRAY], 'horizontal');
          }
        }

        stateChanged = true;
      }
    });

    if (stateChanged) {
      this.targetFeatures.clear();
      this.categoryStates.forEach(state => {
        state.activeEffectIds.forEach(id => state.activeEffectIds.forEach(() => {}));
      });
      this.categoryStates.forEach(state => {
        state.activeEffectIds.forEach(id => this.targetFeatures.add(id));
      });
    }
  }

  private static triggerGlobalFontShift(): void {
    const nextFont = FONT_POOL[Math.floor(Math.random() * FONT_POOL.length)];
    if (nextFont !== this.currentFont) {
      this.previousFont = this.currentFont;
      this.currentFont = nextFont;
      this.fontMorphProgress = 0;
    }
  }
}