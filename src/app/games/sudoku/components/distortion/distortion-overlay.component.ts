import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-distortion-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="distortion-overlay" [class.active]="active">
      <div class="scanline"></div>
      <div class="matrix-content">
        <div class="glitch-text" [attr.data-text]="text">{{ text }}</div>
        <div class="progress-container">
          <div class="progress-bar" [style.width.%]="progress"></div>
        </div>
        <div class="progress-percentage">{{ progress | number:'1.0-0' }}%</div>
      </div>
    </div>
  `,
  styles: [`
    .distortion-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: #020408;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: opacity 0.2s ease;
    }
    .distortion-overlay.active {
      opacity: 0.98;
      pointer-events: all;
    }
    .scanline {
      position: absolute; width: 100%; height: 2px;
      background: var(--primary);
      opacity: 0.8;
      animation: scan 2s linear infinite;
    }
    .matrix-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      width: 80%;
    }
    .glitch-text {
      color: var(--primary);
      font-size: 1.1rem;
      font-weight: bold;
      letter-spacing: 3px;
      text-shadow: 0 0 12px var(--primary);
      font-family: 'Courier New', Courier, monospace;
    }
    .progress-container {
      width: 100%;
      height: 6px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--primary);
      border-radius: 3px;
      overflow: hidden;
      box-shadow: 0 0 10px var(--glow);
    }
    .progress-bar {
      height: 100%;
      background: var(--primary);
      box-shadow: 0 0 10px var(--primary);
    }
    .progress-percentage {
      color: var(--primary);
      font-size: 0.8rem;
      font-family: 'Courier New', Courier, monospace;
    }
    @keyframes scan {
      0% { top: 0%; }
      100% { top: 100%; }
    }
  `]
})
export class DistortionOverlayComponent {
  @Input() active = false;
  @Input() progress = 0;
  @Input() text = 'GENERATING MATRIX...';
}