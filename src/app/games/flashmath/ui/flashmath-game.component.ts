import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, NgZone, ChangeDetectorRef } from '@angular/core';
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
  template: `
    <div class="game-viewport-inner">
      <div class="game-topbar">
        <button class="back-btn" (click)="onBack.emit()">[ BACK ]</button>
        <div class="hud-metrics">
          <div class="metric">SUBJECT: <span class="highlight">{{ subject.name }}</span></div>
          <div class="metric">TIMER: <span class="timer-val">{{ elapsedTime }}s</span></div>
          <div class="metric">XP: <span class="xp-val">{{ subject.xp }}</span></div>
        </div>
      </div>

      <div class="problem-arena">
        <div class="problem-card-wrapper">
          <div class="problem-card">
            <div class="expression-label">{{ getProblemPrompt() }}</div>
            <div class="expression-container">
              <div class="expression-display">{{ currentProblem.displayExpression }}</div>
            </div>
            
            <div class="input-wrapper">
              <input 
                #answerInput
                type="number" 
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
    .game-viewport-inner {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      padding: 1.5rem;
      box-sizing: border-box;
      justify-content: space-between;
      z-index: 2;
      position: relative;
    }
    .game-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(0, 229, 255, 0.2);
      padding-bottom: 1rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .back-btn {
      background: rgba(0, 229, 255, 0.1);
      border: 1px solid #00e5ff;
      color: #00e5ff;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-family: monospace;
      letter-spacing: 0.1em;
      transition: all 0.2s;
    }
    .back-btn:hover {
      background: #00e5ff;
      color: #050b14;
      box-shadow: 0 0 15px rgba(0, 229, 255, 0.6);
    }
    .hud-metrics {
      display: flex;
      gap: 1.5rem;
      font-family: monospace;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
      flex-wrap: wrap;
    }
    .highlight { color: #00ff66; font-weight: bold; }
    .timer-val { color: #00e5ff; font-weight: bold; }
    .xp-val { color: #ffe600; font-weight: bold; }

    .problem-arena {
      display: flex;
      flex: 1;
      justify-content: center;
      align-items: center;
      padding: 1rem;
    }
    .problem-card-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.2rem;
      width: 100%;
      max-width: 720px;
    }
    .problem-card {
      background: rgba(8, 16, 26, 0.92);
      border: 1px solid rgba(0, 255, 102, 0.4);
      padding: 2.2rem 2.5rem;
      border-radius: 6px;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 30px rgba(0, 255, 102, 0.15), inset 0 0 20px rgba(0, 255, 102, 0.05);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      box-sizing: border-box;
      animation: preyGlitchIn 0.5s ease both;
    }
    .expression-label {
      font-size: 0.8rem;
      letter-spacing: 0.2em;
      color: rgba(0, 229, 255, 0.7);
    }
    .expression-container {
      width: 100%;
      padding: 0.8rem 0;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(0, 229, 255, 0.3) transparent;
    }
    .expression-display {
      font-size: clamp(1.1rem, 2.2vw, 2rem);
      font-family: monospace;
      color: #ffffff;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      letter-spacing: 0.08em;
      text-align: center;
      white-space: nowrap;
    }
    .input-wrapper {
      display: flex;
      gap: 1rem;
      width: 100%;
    }
    input[type="number"] {
      flex: 1;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(0, 229, 255, 0.5);
      padding: 0.8rem 1rem;
      font-size: 1.2rem;
      color: #00e5ff;
      text-align: center;
      font-family: monospace;
      border-radius: 4px;
      outline: none;
      min-width: 0;
    }
    input[type="number"]:focus {
      border-color: #00ff66;
      box-shadow: 0 0 12px rgba(0, 255, 102, 0.4);
    }
    .submit-btn {
      background: rgba(0, 255, 102, 0.15);
      border: 1px solid #00ff66;
      color: #00ff66;
      padding: 0 1.5rem;
      font-weight: bold;
      letter-spacing: 0.1em;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .submit-btn:hover {
      background: #00ff66;
      color: #050b14;
      box-shadow: 0 0 15px rgba(0, 255, 102, 0.7);
    }
    .feedback-external-slot {
      height: 2.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
    .feedback-badge {
      font-family: monospace;
      font-weight: bold;
      font-size: 1rem;
      padding: 0.5rem 1.2rem;
      border-radius: 4px;
      animation: pulseFeedback 0.3s ease;
      text-align: center;
      box-sizing: border-box;
      letter-spacing: 0.1em;
    }
    .feedback-badge.correct {
      background: rgba(0, 255, 102, 0.2);
      border: 1px solid #00ff66;
      color: #00ff66;
      text-shadow: 0 0 10px rgba(0, 255, 102, 0.8);
    }
    .feedback-badge.wrong {
      background: rgba(255, 0, 127, 0.2);
      border: 1px solid #ff007f;
      color: #ff007f;
      text-shadow: 0 0 10px rgba(255, 0, 127, 0.8);
    }
    @keyframes pulseFeedback {
      0% { transform: scale(0.95); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    @media (max-width: 600px) {
      .problem-card {
        padding: 1.5rem 1rem;
      }
      .input-wrapper {
        flex-direction: column;
      }
      .submit-btn {
        padding: 0.8rem;
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
  userAnswer: number | null = null;
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

  getProblemPrompt(): string {
    if (this.subject.id === 'algebra') return 'SOLVE FOR X';
    if (this.subject.id === 'pemdas') return 'SIMPLIFY EXPRESSION';
    return 'COMPUTE EXPRESSION';
  }

  loadNextProblem() {
    if (this.subject.id === 'pemdas') {
      this.currentProblem = this.pemdasGenerator.generateProblem();
    } else if (this.subject.id === 'algebra') {
      this.currentProblem = this.algebraGenerator.generateProblem();
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
    if (this.isLocked || this.userAnswer === null || isNaN(this.userAnswer)) return;
    this.isLocked = true;

    if (Number(this.userAnswer) === this.currentProblem.answer) {
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