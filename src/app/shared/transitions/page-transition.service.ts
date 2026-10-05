import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageTransitionService {
  private isFading$ = new BehaviorSubject<boolean>(false);

  get active$(): Observable<boolean> {
    return this.isFading$.asObservable();
  }

  constructor(private router: Router) {}

  async navigateWithTransition(targetUrl: string, fadeDurationMs: number = 250): Promise<boolean> {
    // 1. Trigger Overlay to Fade IN (Opacity 0 -> 1)
    this.isFading$.next(true);

    // 2. Wait for full fade-to-black before swapping route
    await new Promise(resolve => setTimeout(resolve, fadeDurationMs));

    // 3. Navigate behind the dark overlay
    const navigated = await this.router.navigate([targetUrl]);

    // 4. Brief hold, then Fade OUT (Opacity 1 -> 0)
    setTimeout(() => {
      this.isFading$.next(false);
    }, 50);

    return navigated;
  }
}