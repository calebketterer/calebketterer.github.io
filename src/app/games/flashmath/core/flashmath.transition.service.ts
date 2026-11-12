import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlashmathScreenState } from './flashmath.interfaces';

@Injectable({
  providedIn: 'root'
})
export class FlashmathTransitionService {
  private stateSource = new BehaviorSubject<FlashmathScreenState>('INIT_FADE_IN');
  currentState$ = this.stateSource.asObservable();

  private fadeStateSource = new BehaviorSubject<'fade-in' | 'fade-out' | 'none'>('fade-in');
  fadeState$ = this.fadeStateSource.asObservable();

  setState(state: FlashmathScreenState) {
    this.stateSource.next(state);
  }

  setFade(fade: 'fade-in' | 'fade-out' | 'none') {
    this.fadeStateSource.next(fade);
  }
}