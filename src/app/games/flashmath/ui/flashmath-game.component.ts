import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubjectModule, MathProblem } from '../core/flashmath.interfaces';
import { DmasGeneratorService } from './../engine/dmas-generator.service';
import { PemdasGeneratorService } from './../engine/pemdas-generator.service';
import { AlgebraGeneratorService } from './../engine/algebra-generator.service';
import { FlashmathStorageService } from '../core/flashmath.storage.service';

@Component({
  selector: 'app-flashmath-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="flashmath-game-root game-viewport-inner">
      <div class="game-topbar">
        <button class="back-btn" (click)="onBack.emit()">[ BACK ]</button>
        <div class="hud-metrics">
          <div class="metric">SUBJECT: <span class="highlight">{{ subject.name }}</span></div>
          <div class="metric">TIMER: <span class="timer-val">{{ elapsedTime }}s</span></div>
          <div class="metric">XP: <span class="xp-val">{{ getRootXp() }}</span></div>
        </div>
      </div>

      <div class="problem-arena">
        <div class="problem-card-wrapper">
          <div class="problem-card">
            <div class="expression-label">{{ getProblemPrompt() }}</div>
            <div class="expression-container">
              <div class="expression-display" [innerHTML]="currentProblem.displayExpression"></div>
            </div>
            
            <div class="input-wrapper">
              <input 
                #answerInput
                type="text" 
                inputmode="decimal"
                pattern="[0-9\-]*"
                [(ngModel)]="userAnswer" 
                (keydown.enter)="submitAnswer()"
                placeholder="ENTER ANSWER" 
                [disabled]="isLocked"
                autocomplete="off"
              />
              <button class="submit-btn" (click)="submitAnswer()" [disabled]="isLocked">SUBMIT</button>
            </div>
          </div>

          <div class="feedback-external-slot">
            <div *ngIf="feedback === 'correct'" class="feedback-badge correct">
              ✓ CORRECT (+10 XP)
            </div>
            <div *ngIf="feedback === 'wrong'" class="feedback-badge wrong">
              ✗ INCORRECT (Correct: {{ currentProblem.answer }})
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flashmath-game-root.game-viewport-inner {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 1.25rem 1rem;
      box-sizing: border-box;
      justify-content: space-between;
      z-index: 2;
      position: relative;
    }
    .flashmath-game-root .game-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      padding-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .flashmath-game-root .back-btn {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid #00e5ff;
      color: #00e5ff;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      font-family: monospace;
      letter-spacing: 0.1em;
      transition: all 0.2s;
    }
    .flashmath-game-root .back-btn:hover {
      background: #00e5ff;
      color: #050b14;
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
    }
    .flashmath-game-root .hud-metrics {
      display: flex;
      gap: 1.2rem;
      font-family: monospace;
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      flex-wrap: wrap;
    }
    .flashmath-game-root .highlight { color: #00ff66; font-weight: bold; }
    .flashmath-game-root .timer-val { color: #00e5ff; font-weight: bold; }
    .flashmath-game-root .xp-val { color: #ffe600; font-weight: bold; }

    .flashmath-game-root .problem-arena {
      display: flex;
      flex: 1;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
    }
    .flashmath-game-root .problem-card-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 100%;
      max-width: 720px;
    }
    .flashmath-game-root .problem-card {
      background: rgba(8, 16, 26, 0.92);
      border: 1px solid rgba(0, 255, 102, 0.4);
      padding: 1.75rem 1.5rem;
      border-radius: 6px;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 30px rgba(0, 255, 102, 0.15), inset 0 0 20px rgba(0, 255, 102, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      width: 100%;
      box-sizing: border-box;
      animation: preyGlitchIn 0.5s ease both;
    }
    .flashmath-game-root .expression-label {
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      color: rgba(0, 229, 255, 0.7);
    }
    .flashmath-game-root .expression-container {
      width: 100%;
      min-height: 4.5rem;
      padding: 0.5rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 229, 255, 0.3) transparent;
    }
    .flashmath-game-root .expression-display {
      display: inline-block;
      font-size: clamp(1.1rem, 3.8vw, 2.05rem);
      font-family: monospace;
      color: #ffffff;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      letter-spacing: 0.04em;
      white-space: nowrap;
      line-height: 1.4;
    }
    .flashmath-game-root .expression-display sup {
      display: inline-block;
      font-size: 0.58em;
      line-height: 1;
      vertical-align: top;
      position: relative;
      top: -0.22em;
      margin-left: 0.08em;
      color: #00e5ff;
      text-shadow: 0 0 8px rgba(0, 229, 255, 0.65);
      font-weight: bold;
    }

    .flashmath-game-root .math-sqrt {
      position: relative;
      display: inline-flex;
      align-items: stretch;
      vertical-align: middle;
      color: #00e5ff;
      margin: 0 0.18em;
    }
    .flashmath-game-root .radical-hook {
      display: block;
      width: 0.68em;
      flex-shrink: 0;
      background: #00e5ff;
      filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.7));
      clip-path: polygon(
        0% 56%,
        24% 48%,
        46% 84%,
        88% 0%,
        100% 0%,
        100% 6%,
        93% 6%,
        49% 98%,
        41% 98%,
        19% 57%,
        4% 62%
      );
    }
    .flashmath-game-root .sqrt-radicand {
      display: inline-flex;
      align-items: center;
      color: #ffffff;
      border-top: 2px solid #00e5ff;
      box-shadow: 0 -2px 6px -2px rgba(0, 229, 255, 0.55);
      padding: 0.16em 0.34em 0.05em 0.2em;
      margin-left: -0.5px;
    }

    .flashmath-game-root .input-wrapper {
      display: flex;
      gap: 0.75rem;
      width: 100%;
    }
    .flashmath-game-root input[type="text"] {
      flex: 1;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(0, 229, 255, 0.5);
      padding: 0.75rem 1rem;
      font-size: 1.15rem;
      color: #00e5ff;
      text-align: center;
      font-family: monospace;
      border-radius: 4px;
      outline: none;
      min-width: 0;
    }
    .flashmath-game-root input[type="text"]:focus {
      border-color: #00ff66;
      box-shadow: 0 0 12px rgba(0, 255, 102, 0.4);
    }
    .flashmath-game-root .submit-btn {
      background: rgba(0, 255, 102, 0.15);
      border: 1px solid #00ff66;
      color: #00ff66;
      padding: 0 1.25rem;
      font-weight: bold;
      letter-spacing: 0.1em;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .flashmath-game-root .submit-btn:hover {
      background: #00ff66;
      color: #050b14;
      box-shadow: 0 0 15px rgba(0, 255, 102, 0.7);
    }
    .flashmath-game-root .feedback-external-slot {
      height: 2.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .flashmath-game-root .feedback-badge {
      font-family: monospace;
      font-weight: bold;
      font-size: 0.9rem;
      padding: 0.4rem 1rem;
      border-radius: 4px;
      text-align: center;
      box-sizing: border-box;
      letter-spacing: 0.1em;
    }
    .flashmath-game-root .feedback-badge.correct {
      background: rgba(0, 255, 102, 0.2);
      border: 1px solid #00ff66;
      color: #00ff66;
      text-shadow: 0 0 10px rgba(0, 255, 102, 0.8);
    }
    .flashmath-game-root .feedback-badge.wrong {
      background: rgba(255, 0, 127, 0.2);
      border: 1px solid #ff007f;
      color: #ff007f;
      text-shadow: 0 0 10px rgba(255, 0, 127, 0.8);
    }

    @media (max-width: 600px) {
      .flashmath-game-root .problem-card {
        padding: 1.25rem 1rem;
      }
      .flashmath-game-root .input-wrapper {
        flex-direction: column;
      }
      .flashmath-game-root .submit-btn {
        padding: 0.75rem;
        width: 100%;
      }
    }
  `]
})
export class FlashmathGameComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() subject!: SubjectModule;
  @Output() onBack = new EventEmitter<void>();
  @ViewChild('answerInput') answerInput!: ElementRef;

  currentProblem!: MathProblem;
  userAnswer: string | null = null;
  elapsedTime = 0;
  private timerInterval: any;
  feedback: 'correct' | 'wrong' | null = null;
  isLocked = false;

  constructor(
    private dmasGenerator: DmasGeneratorService,
    private pemdasGenerator: PemdasGeneratorService,
    private algebraGenerator: AlgebraGeneratorService,
    private storage: FlashmathStorageService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadNextProblem();
    this.ngZone.runOutsideAngular(() => {
      this.timerInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.elapsedTime++;
          this.cdr.detectChanges();
        });
      }, 1000);
    });
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  focusInput() {
    setTimeout(() => {
      if (this.answerInput) {
        this.answerInput.nativeElement.focus();
      }
    }, 100);
  }

  getRootXp(): number {
    return this.storage.getXp(this.subject.id);
  }

  getProblemPrompt(): string {
    if (this.subject.id.includes('alg') || this.subject.id === 'algebra') return 'SOLVE FOR X';
    if (this.subject.id.startsWith('pemdas')) return 'SIMPLIFY EXPRESSION';
    return 'COMPUTE EXPRESSION';
  }

  loadNextProblem() {
    if (this.subject.id.startsWith('pemdas') || this.subject.id === 'pemdas') {
      const config = this.subject.generatorConfig || { ops: ['+', '-', '*', '/', 'power', 'root', 'frac_exp'], minSteps: 3, maxSteps: 5 };
      this.currentProblem = this.pemdasGenerator.generateProblem(config);
    } else if (this.subject.id.includes('alg') || this.subject.id === 'algebra') {
      this.currentProblem = this.algebraGenerator.generateProblem(this.subject.id, this.subject.generatorConfig);
    } else {
      this.currentProblem = this.dmasGenerator.generateProblem();
    }

    this.userAnswer = null;
    this.feedback = null;
    this.isLocked = false;
    this.cdr.detectChanges();
    this.focusInput();
  }

  submitAnswer() {
    if (this.isLocked || this.userAnswer === null || this.userAnswer.toString().trim() === '') return;
    const parsed = Number(this.userAnswer);
    if (isNaN(parsed)) return;

    this.isLocked = true;

    if (parsed === this.currentProblem.answer) {
      this.feedback = 'correct';
      this.subject.xp = this.storage.addXp(this.subject.id, 10);
      this.cdr.detectChanges();
      setTimeout(() => {
        this.ngZone.run(() => this.loadNextProblem());
      }, 900);
    } else {
      this.feedback = 'wrong';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.ngZone.run(() => this.loadNextProblem());
      }, 2000);
    }
  }
}