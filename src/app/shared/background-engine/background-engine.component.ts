import { Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private ngZone: NgZone) {}

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

  @HostListener('window:resize')
  onResize(): void {
    this.engine.resize();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.engine.updateMousePosition(event.clientX, event.clientY, true);
  }

  @HostListener('window:mouseleave')
  onMouseLeave(): void {
    this.engine.clearMousePosition();
  }

  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.engine.startCharge(event.clientX, event.clientY);
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.engine.releaseChargeExplosion();
  }

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.engine.updateMousePosition(touch.clientX, touch.clientY, true);
      this.engine.startCharge(touch.clientX, touch.clientY);
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (event.touches.length > 0) {
      const touch = event.touches[0];
      this.engine.updateMousePosition(touch.clientX, touch.clientY, true);
    }
  }

  @HostListener('window:touchend')
  onTouchEnd(): void {
    this.engine.releaseChargeExplosion();
    this.engine.clearMousePosition();
  }

  public togglePlay(): boolean {
    return this.engine.togglePlay();
  }

  public setSpeed(multiplier: number): void {
    this.engine.setSpeed(multiplier);
  }
}