import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundEngineComponent } from '../../../shared/background-engine/background-engine.component';

type ControlTarget = 'cap' | 'spawn' | 'minLife' | 'maxLife';

@Component({
  selector: 'app-control-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './control-center.component.html',
  styleUrl: './control-center.component.css'
})
export class ControlCenterComponent implements OnDestroy {
  @Input() bgEngine!: BackgroundEngineComponent;

  isPlaying = true;
  currentSpeed = 1;
  maxParticles = 200;
  spawnRateMs = 150;
  minLifespanMs = 5000;
  maxLifespanMs = 60000;

  private holdTimer: any = null;
  private holdInterval: any = null;

  toggleEngine(): void {
    if (this.bgEngine) {
      this.isPlaying = this.bgEngine.togglePlay();
    }
  }

  setSpeed(speed: number): void {
    this.currentSpeed = speed;
    if (this.bgEngine) {
      this.bgEngine.setSpeed(speed);
    }
  }

  get activeParticleCount(): number {
    return this.bgEngine ? this.bgEngine.getActiveParticleCount() : 0;
  }

  adjustValue(target: ControlTarget, initialSign: number, stepMagnitude: number): void {
    const delta = initialSign * stepMagnitude;

    switch (target) {
      case 'cap':
        this.maxParticles = Math.max(10, Math.min(1000, this.maxParticles + delta));
        if (this.bgEngine) {
          this.bgEngine.setMaxParticles(this.maxParticles);
        }
        break;

      case 'spawn':
        this.spawnRateMs = Math.max(10, Math.min(5000, this.spawnRateMs + delta));
        if (this.bgEngine) {
          this.bgEngine.setSpawnRateMs(this.spawnRateMs);
        }
        break;

      case 'minLife':
        this.minLifespanMs = Math.max(0, Math.min(120000, this.minLifespanMs + delta));
        if (this.minLifespanMs > this.maxLifespanMs) {
          this.maxLifespanMs = this.minLifespanMs;
          if (this.bgEngine) {
            this.bgEngine.setMaxLifespanMs(this.maxLifespanMs);
          }
        }
        if (this.bgEngine) {
          this.bgEngine.setMinLifespanMs(this.minLifespanMs);
        }
        break;

      case 'maxLife':
        this.maxLifespanMs = Math.max(this.minLifespanMs, Math.min(120000, this.maxLifespanMs + delta));
        if (this.bgEngine) {
          this.bgEngine.setMaxLifespanMs(this.maxLifespanMs);
        }
        break;
    }
  }

  startHoldAdjust(target: ControlTarget, initialSign: number, baseStep: number = 1): void {
    this.stopHoldAdjust();

    let stepMagnitude = baseStep;
    this.adjustValue(target, initialSign, stepMagnitude);

    const speedMs = 120;

    this.holdTimer = setTimeout(() => {
      this.holdInterval = setInterval(() => {
        stepMagnitude = Math.round(stepMagnitude * 1.2) + 1;
        this.adjustValue(target, initialSign, stepMagnitude);
      }, speedMs);
    }, 300);
  }

  stopHoldAdjust(): void {
    if (this.holdTimer) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    if (this.holdInterval) {
      clearInterval(this.holdInterval);
      this.holdInterval = null;
    }
  }

  formatSeconds(ms: number): string {
    return (ms / 1000).toFixed(1) + 's';
  }

  ngOnDestroy(): void {
    this.stopHoldAdjust();
  }
}