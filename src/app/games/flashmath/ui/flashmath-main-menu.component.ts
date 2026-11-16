import { Component, EventEmitter, Output, OnInit, ChangeDetectorRef } from '@angular/core';
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
        <div *ngFor="let subject of subjects; let i = index" class="subject-group">
          <!-- Primary Parent Topic Row -->
          <div class="parent-row-wrapper" [style.animation-delay]="(i * 0.1) + 's'">
            <button
              class="subject-card"
              [class.locked]="!subject.unlocked"
              [class.has-expand]="subject.subtopics?.length"
              (click)="selectSubject(subject)">
              <div class="card-content">
                <div class="info-group">
                  <span class="subject-name">{{ subject.name }}</span>
                  <span class="subject-desc">{{ subject.description }}</span>
                </div>
                <div class="xp-badge" *ngIf="subject.unlocked">
                  <span class="xp-label">XP:</span>
                  <span class="xp-value">{{ getDisplayXp(subject) }}</span>
                </div>
                <div class="locked-badge" *ngIf="!subject.unlocked">
                  [ LOCKED / OFFLINE ]
                </div>
              </div>
              <div class="tech-corner"></div>
            </button>

            <!-- Expand [+] / Minimize [-] Toggle Button -->
            <button
              *ngIf="subject.unlocked && subject.subtopics?.length"
              class="expand-toggle-btn"
              [class.expanded]="isExpanded(subject.id)"
              [disabled]="isAnimating(subject.id)"
              (click)="toggleExpand(subject, $event)"
              [attr.aria-label]="isExpanded(subject.id) ? 'Minimize subtopics' : 'Expand subtopics'">
              <span class="toggle-symbol">{{ isExpanded(subject.id) ? '−' : '+' }}</span>
            </button>
          </div>

          <!-- Animated Accordion Container for Subtopics -->
          <div
            *ngIf="subject.subtopics?.length"
            class="subtopics-accordion"
            [class.is-open]="isExpanded(subject.id)">
            <div class="subtopics-inner">
              <button
                *ngFor="let sub of subject.subtopics; let subIdx = index"
                class="subtopic-card"
                [class.prey-glitch-in]="getSubtopicAnimState(subject.id, subIdx) === 'in'"
                [class.prey-glitch-out]="getSubtopicAnimState(subject.id, subIdx) === 'out'"
                [class.is-hidden]="getSubtopicAnimState(subject.id, subIdx) === 'hidden'"
                (click)="selectSubject(sub)">
                <div class="sub-connector"></div>
                <div class="card-content">
                  <div class="info-group">
                    <span class="subtopic-name">{{ sub.name }}</span>
                    <span class="subject-desc">{{ sub.description }}</span>
                  </div>
                  <div class="xp-badge">
                    <span class="xp-label">XP:</span>
                    <span class="xp-value">{{ sub.xp }}</span>
                  </div>
                </div>
                <div class="tech-corner sub-corner"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 820px;
      height: 100%;
      padding: 2rem;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      z-index: 2;
      position: relative;
    }
    .menu-header {
      margin-bottom: 1.75rem;
      text-align: center;
      width: 100%;
    }
    .menu-title {
      font-size: clamp(1.4rem, 3vw, 2rem);
      letter-spacing: 0.3em;
      color: #00e5ff;
      text-shadow: 0 0 10px rgba(0, 229, 255, 0.5);
      margin: 0;
    }
    .scanline-bar {
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #00ff66, transparent);
      margin-top: 0.6rem;
    }
    .subjects-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-height: 68vh;
      overflow-y: auto;
      padding: 0.5rem;
      align-items: stretch;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 229, 255, 0.3) transparent;
    }
    .subject-group {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    .parent-row-wrapper {
      display: flex;
      align-items: stretch;
      gap: 0.6rem;
      width: 100%;
    }
    .subject-card {
      position: relative;
      flex: 1;
      background: rgba(10, 20, 30, 0.78);
      border: 1px solid rgba(0, 229, 255, 0.35);
      padding: 1.15rem 1.75rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      border-radius: 4px;
      transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
      box-sizing: border-box;
      text-align: left;
      min-width: 0;
    }
    .subject-card.locked {
      opacity: 0.45;
      border-color: rgba(255, 255, 255, 0.1);
      cursor: not-allowed;
    }
    .subject-card:hover:not(.locked) {
      border-color: #00ff66;
      box-shadow: 0 0 20px rgba(0, 255, 102, 0.28), inset 0 0 15px rgba(0, 255, 102, 0.1);
      transform: translateX(4px);
    }

    /* Expand / Minimize [+] [-] Button */
    .expand-toggle-btn {
      width: 54px;
      background: rgba(0, 229, 255, 0.08);
      border: 1px solid rgba(0, 229, 255, 0.45);
      border-radius: 4px;
      color: #00e5ff;
      font-family: monospace;
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }
    .expand-toggle-btn:hover:not(:disabled) {
      background: rgba(0, 255, 102, 0.18);
      border-color: #00ff66;
      color: #00ff66;
      box-shadow: 0 0 16px rgba(0, 255, 102, 0.35);
    }
    .expand-toggle-btn.expanded {
      border-color: #00ff66;
      color: #00ff66;
      background: rgba(0, 255, 102, 0.12);
    }
    .expand-toggle-btn:disabled {
      cursor: wait;
      opacity: 0.7;
    }

    /* Smooth Height Grid Accordion */
    .subtopics-accordion {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.45s cubic-bezier(0.16, 1, 0.3, 1), margin-top 0.45s cubic-bezier(0.16, 1, 0.3, 1);
      margin-top: 0;
    }
    .subtopics-accordion.is-open {
      grid-template-rows: 1fr;
      margin-top: 0.65rem;
    }
    .subtopics-inner {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
      padding-left: 1.6rem;
      padding-right: 0.2rem;
    }

    /* Subtopic Cards */
    .subtopic-card {
      position: relative;
      background: rgba(6, 14, 22, 0.85);
      border: 1px solid rgba(0, 229, 255, 0.25);
      border-left: 2px solid #00ff66;
      padding: 0.85rem 1.4rem;
      display: flex;
      align-items: center;
      cursor: pointer;
      border-radius: 4px;
      text-align: left;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }
    .subtopic-card.is-hidden {
      opacity: 0;
      pointer-events: none;
    }
    .subtopic-card:hover {
      background: rgba(0, 255, 102, 0.08);
      border-color: #00ff66;
      box-shadow: 0 0 14px rgba(0, 255, 102, 0.22);
    }
    .sub-connector {
      position: absolute;
      left: -1.1rem;
      top: 50%;
      width: 0.9rem;
      height: 1px;
      background: rgba(0, 255, 102, 0.45);
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 1rem;
    }
    .info-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .subject-name {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      color: #ffffff;
    }
    .subtopic-name {
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #00e5ff;
    }
    .subject-desc {
      font-size: 0.78rem;
      color: rgba(255, 255, 255, 0.55);
      letter-spacing: 0.04em;
    }
    .xp-badge {
      display: flex;
      gap: 0.45rem;
      font-family: monospace;
      font-size: 1rem;
      flex-shrink: 0;
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
      font-size: 0.8rem;
      color: rgba(255, 0, 127, 0.8);
      letter-spacing: 0.1em;
      flex-shrink: 0;
    }
    .tech-corner {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      background: #00e5ff;
    }
    .sub-corner {
      width: 6px;
      height: 6px;
      background: #00ff66;
    }

    /* Prey Glitch In / Out Animations */
    .prey-glitch-out {
      animation: preyGlitchOut 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .prey-glitch-in {
      animation: preyGlitchIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes preyGlitchIn {
      0% {
        opacity: 0;
        transform: scale(0.96) translateX(-6px);
        filter: brightness(0) contrast(200%) blur(3px);
        clip-path: polygon(0 0, 100% 0, 100% 10%, 0 10%);
      }
      20% {
        opacity: 0.8;
        transform: scale(1.02) translateX(4px) skewX(-3deg);
        filter: brightness(2.5) contrast(150%) drop-shadow(0 0 12px rgba(0, 229, 255, 0.8));
        clip-path: polygon(0 25%, 100% 25%, 100% 85%, 0 85%);
      }
      35% {
        opacity: 0.2;
        transform: scale(0.98) translateX(-2px) skewX(2deg);
        filter: brightness(0.2) blur(1px);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      }
      60% {
        opacity: 0.95;
        transform: scale(1.01) translateX(1px);
        filter: brightness(1.6) contrast(110%);
        clip-path: none;
      }
      80% {
        opacity: 0.7;
        transform: scale(0.995);
        filter: brightness(0.8);
        clip-path: none;
      }
      100% {
        opacity: 1;
        transform: scale(1) translateX(0) skewX(0);
        filter: brightness(1) contrast(100%) blur(0px);
        clip-path: none;
      }
    }

    @keyframes preyGlitchOut {
      0% {
        opacity: 1;
        transform: scale(1) translateX(0);
        filter: brightness(1) contrast(100%);
        clip-path: none;
      }
      30% {
        opacity: 0.8;
        transform: scale(1.02) translateX(-8px) skewX(6deg);
        filter: brightness(2) contrast(200%) drop-shadow(-4px 0 8px rgba(0, 229, 255, 0.9));
        clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%);
      }
      65% {
        opacity: 0.3;
        transform: scale(0.92) translateX(5px) skewX(-4deg);
        filter: brightness(0.1) blur(2px);
        clip-path: polygon(0 80%, 100% 80%, 100% 100%, 0 100%);
      }
      100% {
        opacity: 0;
        transform: scale(0.85) translateX(0) scaleY(0.1);
        filter: brightness(0) blur(6px);
        clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
      }
    }

    @media (max-width: 600px) {
      .menu-container {
        padding: 1rem;
      }
      .subject-card {
        padding: 0.95rem 1.1rem;
      }
      .subtopics-inner {
        padding-left: 1rem;
      }
      .sub-connector {
        left: -0.75rem;
        width: 0.6rem;
      }
    }
  `]
})
export class FlashmathMainMenuComponent implements OnInit {
  @Output() onSelectSubject = new EventEmitter<SubjectModule>();

  private expandedMap: Record<string, boolean> = {};
  private animatingMap: Record<string, boolean> = {};
  private subtopicStates: Record<string, ('hidden' | 'in' | 'out')[]> = {};

  subjects: SubjectModule[] = [
    {
      id: 'pemdas',
      name: 'PEMDAS',
      description: 'Complete Order of Operations Synthesis',
      xp: 0,
      unlocked: true,
      generatorConfig: { ops: ['+', '-', '*', '/', '^2', 'sqrt'], minSteps: 3, maxSteps: 5 },
      subtopics: [
        {
          id: 'pemdas_add_sub',
          name: 'ADDITION & SUBTRACTION',
          description: 'Signed Integer Sums & Differences',
          xp: 0,
          unlocked: true,
          generatorConfig: { ops: ['+', '-'], minSteps: 1, maxSteps: 2 }
        },
        {
          id: 'pemdas_mul_div',
          name: 'MULTIPLICATION & DIVISION',
          description: 'Products & Stacked Quotients',
          xp: 0,
          unlocked: true,
          generatorConfig: { ops: ['*', '/'], minSteps: 1, maxSteps: 2 }
        },
        {
          id: 'pemdas_exp_roots',
          name: 'EXPONENTS & ROOTS',
          description: 'Powers & Principal Square Roots',
          xp: 0,
          unlocked: true,
          generatorConfig: { ops: ['^2', 'sqrt'], minSteps: 1, maxSteps: 2 }
        },
        {
          id: 'pemdas_parens_multi',
          name: 'PARENTHESES & MULTI-STEP',
          description: 'Nested Grouping & Mixed Precedence',
          xp: 0,
          unlocked: true,
          generatorConfig: { ops: ['+', '-', '*', '/'], minSteps: 3, maxSteps: 4 }
        }
      ]
    },
    {
      id: 'algebra',
      name: 'ALGEBRA',
      description: 'Multi-Step Variable Isolation & Equations',
      xp: 0,
      unlocked: true
    },
    {
      id: 'geometry',
      name: 'GEOMETRY',
      description: 'Spatial & Angular Calculations',
      xp: 0,
      unlocked: false
    },
    {
      id: 'trig',
      name: 'TRIG',
      description: 'Trigonometric Identities',
      xp: 0,
      unlocked: false
    }
  ];

  constructor(
    private storage: FlashmathStorageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.subjects.forEach(sub => {
      if (sub.unlocked) {
        sub.xp = this.storage.getXp(sub.id);
      }
      if (sub.subtopics) {
        this.subtopicStates[sub.id] = sub.subtopics.map(() => 'hidden');
        sub.subtopics.forEach(child => {
          child.xp = this.storage.getXp(child.id);
        });
      }
    });
  }

  getDisplayXp(subject: SubjectModule): number {
    if (!subject.subtopics?.length) {
      return subject.xp;
    }
    const childXp = subject.subtopics.reduce((acc, s) => acc + s.xp, 0);
    return subject.xp + childXp;
  }

  isExpanded(subjectId: string): boolean {
    return !!this.expandedMap[subjectId];
  }

  isAnimating(subjectId: string): boolean {
    return !!this.animatingMap[subjectId];
  }

  getSubtopicAnimState(subjectId: string, index: number): 'hidden' | 'in' | 'out' {
    return this.subtopicStates[subjectId]?.[index] ?? 'hidden';
  }

  toggleExpand(subject: SubjectModule, event: Event) {
    event.stopPropagation();
    if (!subject.subtopics?.length || this.animatingMap[subject.id]) return;

    const currentlyOpen = !!this.expandedMap[subject.id];
    const count = subject.subtopics.length;
    const staggerMs = 95;
    this.animatingMap[subject.id] = true;

    if (!currentlyOpen) {
      // 1. Smoothly slide down accordion container first so space opens up
      this.expandedMap[subject.id] = true;
      this.subtopicStates[subject.id] = new Array(count).fill('hidden');
      this.cdr.detectChanges();

      // 2. Glitch-in each subtopic one by one as space opens
      subject.subtopics.forEach((_, idx) => {
        setTimeout(() => {
          this.subtopicStates[subject.id][idx] = 'in';
          this.cdr.detectChanges();
        }, 140 + idx * staggerMs);
      });

      setTimeout(() => {
        this.animatingMap[subject.id] = false;
        this.cdr.detectChanges();
      }, 140 + count * staggerMs + 450);
    } else {
      // 1. Reverse order: glitch-out each subtopic one by one from bottom to top
      for (let i = 0; i < count; i++) {
        const reverseIdx = count - 1 - i;
        setTimeout(() => {
          this.subtopicStates[subject.id][reverseIdx] = 'out';
          this.cdr.detectChanges();
        }, i * staggerMs);
      }

      // 2. Smoothly collapse container back up once items glitch out
      const collapseDelay = count * staggerMs + 220;
      setTimeout(() => {
        this.expandedMap[subject.id] = false;
        this.cdr.detectChanges();
      }, collapseDelay);

      setTimeout(() => {
        this.subtopicStates[subject.id] = new Array(count).fill('hidden');
        this.animatingMap[subject.id] = false;
        this.cdr.detectChanges();
      }, collapseDelay + 450);
    }
  }

  selectSubject(subject: SubjectModule) {
    if (!subject.unlocked) return;
    this.onSelectSubject.emit(subject);
  }
}