import { Injectable } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { GlitchHandler } from '../utils/glitch-handler';

export interface MinimizeTarget {
  isContentVisible: boolean;
  toggleVisibility: () => void;
  glitch: GlitchHandler;
}

export interface CentralCommandTarget {
  isMinimized: boolean;
  isGlobalMinimized: boolean;
  minimize: () => void;
  restore: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalMinimizeService {
  private resourceTarget?: MinimizeTarget;
  private controlCenterTarget?: MinimizeTarget;
  private centralCommandTarget?: CentralCommandTarget;

  private activeTimeline?: Subscription;
  private _isMinimized = false;
  get isMinimized(): boolean {
    return this._isMinimized;
  }

  registerResource(target: MinimizeTarget): void {
    this.resourceTarget = target;
  }

  registerControlCenter(target: MinimizeTarget): void {
    this.controlCenterTarget = target;
  }

  registerCentralCommand(target: CentralCommandTarget): void {
    this.centralCommandTarget = target;
  }

  toggleGlobalMinimize(): void {
    // Cancel any ongoing timer queue immediately to allow smooth mid-animation reversal
    if (this.activeTimeline) {
      this.activeTimeline.unsubscribe();
    }

    this._isMinimized = !this._isMinimized;

    if (this.centralCommandTarget) {
      this.centralCommandTarget.isGlobalMinimized = this._isMinimized;
    }

    if (this._isMinimized) {
      // --- CENTRALIZED MINIMIZATION TIMELINE (--) ---
      this.activeTimeline = new Subscription();

      // 1. Resource Links collapse immediately
      if (this.resourceTarget?.isContentVisible) {
        this.resourceTarget.toggleVisibility();
      }

      // 2. Resource Links glitch out at 300ms
      this.activeTimeline.add(
        timer(300).subscribe(() => {
          this.resourceTarget?.glitch.triggerGlitchOut();
        })
      );

      // 3. Control Center collapse starts at 400ms
      this.activeTimeline.add(
        timer(400).subscribe(() => {
          if (this.controlCenterTarget?.isContentVisible) {
            this.controlCenterTarget.toggleVisibility();
          }
        })
      );

      // 4. Control Center glitch out at 1600ms
      this.activeTimeline.add(
        timer(1600).subscribe(() => {
          this.controlCenterTarget?.glitch.triggerGlitchOut();
        })
      );

      // 5. Central Command minimizes at 2100ms
      this.activeTimeline.add(
        timer(2100).subscribe(() => {
          this.centralCommandTarget?.minimize();
        })
      );

    } else {
      // --- CENTRALIZED RESTORE TIMELINE (++) ---
      this.activeTimeline = new Subscription();

      // 1. Central Command expands first
      this.centralCommandTarget?.restore();

      // 2. Control Center restores at 400ms
      this.activeTimeline.add(
        timer(400).subscribe(() => {
          this.controlCenterTarget?.glitch.triggerGlitchIn(() => {
            if (this.controlCenterTarget && !this.controlCenterTarget.isContentVisible) {
              this.controlCenterTarget.toggleVisibility();
            }
          });
        })
      );

      // 3. Resource Links restores at 1400ms
      this.activeTimeline.add(
        timer(1400).subscribe(() => {
          this.resourceTarget?.glitch.triggerGlitchIn(() => {
            if (this.resourceTarget && !this.resourceTarget.isContentVisible) {
              this.resourceTarget.toggleVisibility();
            }
          });
        })
      );
    }
  }
}