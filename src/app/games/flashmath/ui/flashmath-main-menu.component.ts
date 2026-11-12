import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubjectModule } from '../core/flashmath.interfaces';
import { FlashmathStorageService } from '../core/flashmath.storage.service';

@Component({
  selector: 'app-flashmath-main-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="menu-container">
      <header class="menu-header">
        <h2 class="menu-title">SUBJECTS OF FOCUS</h2>
        <div class="scanline-bar"></div>
      </header>

      <div class="subjects-list">
        <button 
          *ngFor="let subject of subjects; let i = index" 
          class="subject-card glitch-anim"
          [class.locked]="!subject.unlocked"
          [style.animation-delay]="(i * 0.12) + 's'"
          (click)="selectSubject(subject)">
          <div class="card-content">
            <div class="info-group">
              <span class="subject-name">{{ subject.name }}</span>
              <span class="subject-desc">{{ subject.description }}</span>
            </div>
            <div class="xp-badge" *ngIf="subject.unlocked">
              <span class="xp-label">XP:</span>
              <span class="xp-value">{{ subject.xp }}</span>
            </div>
            <div class="locked-badge" *ngIf="!subject.unlocked">
              [ LOCKED / OFFLINE ]
            </div>
          </div>
          <div class="tech-corner"></div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 800px;
      height: 100%;
      padding: 2rem;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      z-index: 2;
      position: relative;
    }
    .menu-header {
      margin-bottom: 2rem;
      text-align: center;
      width: 100%;
    }
    .menu-title {
      font-size: 2rem;
      letter-spacing: 0.3em;
      color: #00e5ff;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
    }
    .scanline-bar {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00ff66, transparent);
      margin-top: 0.5rem;
    }
    .subjects-list {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      width: 100%;
      max-height: 65vh;
      overflow-y: auto;
      padding: 0.5rem;
      align-items: stretch;
    }
    .subject-card {
      position: relative;
      background: rgba(10, 20, 30, 0.75);
      border: 1px solid rgba(0, 229, 255, 0.3);
      padding: 1.2rem 2rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      border-radius: 4px;
      transition: all 0.3s ease;
      width: 100%;
      box-sizing: border-box;
      text-align: left;
    }
    .subject-card.locked {
      opacity: 0.45;
      border-color: rgba(255, 255, 255, 0.1);
      cursor: not-allowed;
    }
    .subject-card.locked:hover {
      transform: none;
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: none;
    }
    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .info-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .subject-card:hover:not(.locked) {
      border-color: #00ff66;
      box-shadow: 0 0 20px rgba(0, 255, 102, 0.3), inset 0 0 15px rgba(0, 255, 102, 0.1);
      transform: translateX(6px);
    }
    .subject-name {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #ffffff;
      text-align: left;
    }
    .subject-desc {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: 0.05em;
    }
    .xp-badge {
      display: flex;
      gap: 0.5rem;
      font-family: monospace;
      font-size: 1.1rem;
    }
    .xp-label {
      color: rgba(255, 255, 255, 0.5);
    }
    .xp-value {
      color: #ffe600;
      text-shadow: 0 0 8px rgba(255, 230, 0, 0.6);
    }
    .locked-badge {
      font-family: monospace;
      font-size: 0.85rem;
      color: rgba(255, 0, 127, 0.8);
      letter-spacing: 0.1em;
    }
    .tech-corner {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      background: #00e5ff;
    }
  `]
})
export class FlashmathMainMenuComponent implements OnInit {
  @Output() onSelectSubject = new EventEmitter<SubjectModule>();

  subjects: SubjectModule[] = [
    { id: 'dmas', name: 'DMAS', description: 'Basic Arithmetic Operations', xp: 0, unlocked: true },
    { id: 'pemdas', name: 'PEMDAS', description: 'Order of Operations (3-5 steps)', xp: 0, unlocked: true },
    { id: 'algebra', name: 'ALGEBRA', description: 'Solve for X via Linear Equations', xp: 0, unlocked: true },
    { id: 'geometry', name: 'GEOMETRY', description: 'Spatial & Angular Calculations', xp: 0, unlocked: false },
    { id: 'trig', name: 'TRIG', description: 'Trigonometric Identities', xp: 0, unlocked: false }
  ];

  constructor(private storage: FlashmathStorageService) {}

  ngOnInit() {
    this.subjects.forEach(sub => {
      if (sub.unlocked) {
        sub.xp = this.storage.getXp(sub.id);
      }
    });
  }

  selectSubject(subject: SubjectModule) {
    if (!subject.unlocked) return;
    this.onSelectSubject.emit(subject);
  }
}