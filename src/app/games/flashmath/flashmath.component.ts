import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashmathScreenState, SubjectModule } from './core/flashmath.interfaces';
import { FlashmathTitleComponent } from './ui/flashmath-title.component';
import { FlashmathMainMenuComponent } from './ui/flashmath-main-menu.component';
import { FlashmathGameComponent } from './ui/flashmath-game.component';
import { FlashmathBgComponent } from './ui/flashmath-bg.component';
import { MathBgMode } from './engine/background/flashmath-bg.interfaces';

@Component({
  selector: 'app-flashmath',
  standalone: true,
  imports: [
    CommonModule,
    FlashmathTitleComponent,
    FlashmathMainMenuComponent,
    FlashmathGameComponent,
    FlashmathBgComponent
  ],
  templateUrl: './flashmath.component.html',
  styleUrls: ['./flashmath.component.css']
})
export class FlashmathComponent implements OnInit, OnDestroy {
  currentState: FlashmathScreenState = 'INIT_FADE_IN';
  fadeClass = 'fade-out';
  activeSubject: SubjectModule | null = null;
  currentBgMode: MathBgMode = 'MATRIX_NUMBERS';
  private timeouts: any[] = [];

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) {}

  ngOnInit() {
    this.runInitializationSequence();
  }

  ngOnDestroy() {
    this.timeouts.forEach(t => clearTimeout(t));
  }

  runInitializationSequence() {
    this.currentState = 'INIT_FADE_IN';
    this.fadeClass = 'fade-out';
    this.cdr.detectChanges();

    const t1 = setTimeout(() => {
      this.ngZone.run(() => {
        this.fadeClass = 'fade-in';
        this.cdr.detectChanges();
      });
    }, 50);
    this.timeouts.push(t1);

    const t2 = setTimeout(() => {
      this.ngZone.run(() => {
        this.fadeClass = 'fade-out';
        this.cdr.detectChanges();
      });
    }, 2550);
    this.timeouts.push(t2);

    const t3 = setTimeout(() => {
      this.ngZone.run(() => {
        this.currentState = 'BLACK_TRANSITION';
        this.cdr.detectChanges();
      });
    }, 3350);
    this.timeouts.push(t3);

    const t4 = setTimeout(() => {
      this.ngZone.run(() => {
        this.currentState = 'MENU';
        this.fadeClass = 'fade-in';
        this.cdr.detectChanges();
      });
    }, 4150);
    this.timeouts.push(t4);
  }

  selectSubject(subject: SubjectModule) {
    this.fadeClass = 'fade-out';
    this.cdr.detectChanges();
    const t = setTimeout(() => {
      this.ngZone.run(() => {
        this.activeSubject = subject;
        this.currentState = 'GAME';
        this.fadeClass = 'fade-in';
        this.cdr.detectChanges();
      });
    }, 800);
    this.timeouts.push(t);
  }

  returnToMenu() {
    this.fadeClass = 'fade-out';
    this.cdr.detectChanges();
    const t = setTimeout(() => {
      this.ngZone.run(() => {
        this.activeSubject = null;
        this.currentState = 'MENU';
        this.fadeClass = 'fade-in';
        this.cdr.detectChanges();
      });
    }, 800);
    this.timeouts.push(t);
  }
}