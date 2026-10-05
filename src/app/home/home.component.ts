import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLinksComponent } from './components/resource-links/resource-links.component';
import { BackgroundEngineComponent } from '../shared/background-engine/background-engine.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ResourceLinksComponent, BackgroundEngineComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  @ViewChild('bgEngine') bgEngine!: BackgroundEngineComponent;

  isPlaying = true;
  currentSpeed = 1;
  maxParticles = 200;

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

  adjustMaxParticles(delta: number): void {
    this.maxParticles = Math.max(10, Math.min(1000, this.maxParticles + delta));
    if (this.bgEngine) {
      this.bgEngine.setMaxParticles(this.maxParticles);
    }
  }

  startHoldAdjust(delta: number): void {
    this.stopHoldAdjust();
    this.adjustMaxParticles(delta);

    let step = delta;
    let speedMs = 180;

    // Trigger accelerated step changes when holding down button
    this.holdTimer = setTimeout(() => {
      this.holdInterval = setInterval(() => {
        this.adjustMaxParticles(step);
        // Accelerate rate of change
        if (Math.abs(step) < 50) {
          step = Math.round(step * 1.2);
        }
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

  ngOnDestroy(): void {
    this.stopHoldAdjust();
  }
}