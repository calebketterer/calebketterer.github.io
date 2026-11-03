import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalMinimizeService {
  private isMinimizedSubject = new BehaviorSubject<boolean>(false);
  isMinimized$ = this.isMinimizedSubject.asObservable();

  get isMinimized(): boolean {
    return this.isMinimizedSubject.value;
  }

  toggleGlobalMinimize(): void {
    this.isMinimizedSubject.next(!this.isMinimizedSubject.value);
  }
}