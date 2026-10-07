import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ParticleSystem } from './engine/particle-system';

@Component({
  selector: 'app-background-engine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-engine.component.html',
  styleUrl: './background-engine.component.css'
})
export class BackgroundEngineComponent implements OnInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private engine = new ParticleSystem();
  private isHomePage = true;

  constructor(
    private ngZone: NgZone,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.isHomePage = url === '/' || url === '/home' || url === '';

        if (!this.isHomePage) {
          this.engine.clearMousePosition();
        }
      });
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      if (this.canvasRef?.nativeElement) {
        this.engine.init(this.canvasRef.nativeElement);
      }
    });
  }

  ngOnDestroy(): void {
    this.engine.destroy();
  }

  public getActiveParticleCount(): number {
    return this.engine.getActiveParticleCount();
  }

  public getMaxParticles(): number {
    return this.engine.getMaxParticles();
  }

  public setMaxParticles(cap: number): void {
    this.engine.setMaxParticles(cap);
  }

  public getSpawnRateMs(): number {
    return this.engine.getSpawnRateMs();
  }

  public setSpawnRateMs(ms: number): void {
    this.engine.setSpawnRateMs(ms);
  }

  public getMinLifespanMs(): number {
    return this.engine.getMinLifespanMs();
  }

  public setMinLifespanMs(ms: number): void {
    this.engine.setMinLifespanMs(ms);
  }

  public getMaxLifespanMs(): number {
    return this.engine.getMaxLifespanMs();
  }

  public setMaxLifespanMs(ms: number): void {
    this.engine.setMaxLifespanMs(ms);
  }

  private isInteractionDisabled(): boolean {
    return !this.isHomePage;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.engine.resize();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isInteractionDisabled()) {
      this.engine.clearMousePosition();
      return;
    }
    this.engine.updateMousePosition(event.clientX, event.clientY, true);
  }

  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    this.engine.clearMousePosition();
  }

  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.isInteractionDisabled()) {
      return;
    }
    this.engine.startCharge(event.clientX, event.clientY);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isInteractionDisabled()) {
      return;
    }
    this.engine.releaseChargeExplosion();
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.isInteractionDisabled()) {
      return;
    }
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.engine.updateMousePosition(touch.clientX, touch.clientY, true);
      this.engine.startCharge(touch.clientX, touch.clientY);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isInteractionDisabled()) {
      this.engine.clearMousePosition();
      return;
    }
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.engine.updateMousePosition(touch.clientX, touch.clientY, true);
    }
  }

  @HostListener('window:touchend')
  onTouchEnd(): void {
    if (this.isInteractionDisabled()) {
      return;
    }
    this.engine.releaseChargeExplosion();
    this.engine.clearMousePosition();
  }

  public togglePlay(): boolean {
    return this.engine.togglePlay();
  }

  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  private speedMultiplier = 1.0;
}