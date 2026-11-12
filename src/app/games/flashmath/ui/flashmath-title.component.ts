import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-flashmath-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="title-container" [class.fade-out]="isFadingOut">
      <h1 class="glitch-title" data-text="FLASHMATH">FLASHMATH</h1>
      <div class="subtitle">NEURAL RECURSIVE CALCULATION CORE</div>
    </div>
  `,
  styles: [`
    .title-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      animation: fadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .fade-out {
      animation: fadeOut 0.8s cubic-bezier(0.7, 0, 0.84, 0) forwards;
    }
    .glitch-title {
      font-size: clamp(3rem, 8vw, 6rem);
      font-weight: 900;
      letter-spacing: 0.2em;
      color: #00ff66;
      text-shadow: 0 0 20px rgba(0, 255, 102, 0.6), 0 0 40px rgba(0, 229, 255, 0.4);
      position: relative;
    }
    .subtitle {
      margin-top: 1rem;
      font-size: 1rem;
      letter-spacing: 0.4em;
      color: #00e5ff;
      opacity: 0.8;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); filter: blur(10px); }
      to { opacity: 1; transform: scale(1); filter: blur(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: scale(1); filter: blur(0); }
      to { opacity: 0; transform: scale(1.05); filter: blur(10px); }
    }
  `]
})
export class FlashmathTitleComponent {
  isFadingOut = false;
}