import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashmath-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="title-container" (click)="onStart.emit()">
      <div class="glitch-wrapper">
        <h1 class="title-main" data-text="FLASHMATH">FLASHMATH</h1>
      </div>
      <div class="subtitle-wrapper">
        <span class="sub-prefix">NEURAL RECURSIVE</span>
        <span class="sub-mid">CALCULATION</span>
        <span class="sub-suffix">CORE</span>
      </div>
    </div>
  `,
  styles: [`
    .title-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      cursor: pointer;
      z-index: 2;
      position: relative;
      padding: 1rem;
      box-sizing: border-box;
      text-align: center;
    }
    .glitch-wrapper {
      position: relative;
      margin-bottom: 1rem;
      max-width: 100%;
    }
    .title-main {
      font-size: clamp(2rem, 9.5vw, 4.2rem);
      font-weight: 900;
      letter-spacing: 0.25em;
      color: #00ff66;
      text-shadow: 0 0 20px rgba(0, 255, 102, 0.6), 0 0 40px rgba(0, 255, 102, 0.3);
      margin: 0;
      animation: titlePulse 3s ease-in-out infinite alternate;
      word-break: break-word;
    }
    .subtitle-wrapper {
      display: flex;
      gap: 0.6rem;
      font-family: monospace;
      font-size: clamp(0.7rem, 2.2vw, 0.95rem);
      letter-spacing: 0.3em;
      color: #00e5ff;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .prompt-wrapper {
      font-family: monospace;
      font-size: clamp(0.75rem, 2.5vw, 0.95rem);
      letter-spacing: 0.2em;
      color: rgba(255, 255, 255, 0.7);
      animation: promptBlink 1.2s ease-in-out infinite alternate;
    }

    @keyframes titlePulse {
      0% { text-shadow: 0 0 15px rgba(0, 255, 102, 0.5); }
      100% { text-shadow: 0 0 30px rgba(0, 255, 102, 0.8), 0 0 50px rgba(0, 255, 102, 0.4); }
    }

    @keyframes promptBlink {
      0% { opacity: 0.3; }
      100% { opacity: 1; }
    }
  `]
})
export class FlashmathTitleComponent {
  @Output() onStart = new EventEmitter<void>();
}