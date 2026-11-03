import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalMinimizeService {
  private actionSubject = new Subject<'minimize' | 'restore'>();
  action$ = this.actionSubject.asObservable();

  private _isMinimized = false;
  get isMinimized(): boolean {
    return this._isMinimized;
  }

  toggleGlobalMinimize(): void {
    this._isMinimized = !this._isMinimized;
    this.actionSubject.next(this._isMinimized ? 'minimize' : 'restore');
  }
}