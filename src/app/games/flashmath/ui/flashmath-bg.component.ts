import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlashmathBgEngine } from '../engine/background/flashmath-bg.engine';
import { MathBgMode } from '../engine/background/flashmath-bg.interfaces';

@Component({
  selector: 'app-flashmath-bg',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #bgCanvas class="flashmath-bg-canvas"></canvas>
  `,
  styles: [`
    :host {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      overflow: hidden;
    }
    .flashmath-bg-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class FlashmathBgComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() animationMode: MathBgMode = 'MATRIX_NUMBERS';

  private engine!: FlashmathBgEngine;
  private resizeListener = () => this.onResize();

  ngOnInit() {
    this.engine = new FlashmathBgEngine(this.canvasRef.nativeElement);
    this.engine.setMode(this.animationMode);
    this.engine.start();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['animationMode'] && this.engine) {
      this.engine.setMode(this.animationMode);
    }
  }

  ngOnDestroy() {
    if (this.engine) {
      this.engine.stop();
    }
    window.removeEventListener('resize', this.resizeListener);
  }

  private onResize() {
    if (this.engine) {
      this.engine.resize();
    }
  }
}