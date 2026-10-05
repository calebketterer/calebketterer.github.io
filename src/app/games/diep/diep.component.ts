// src/app/diep/diep.component.ts
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiepMenus } from './ui/diep.menus-manager';
import { DiepSceneSelector } from './ui/diep.scene-selector';
import { DiepGameEngineService } from './engine/diep.game-engine.service'; 
import { DiepInputService } from './engine/diep.input.service';
import { DiepInteractionService } from './ui/buttons/diep.button-interaction.service';
import { DiepDebugService} from './engine/debug/diep.debug.service';
import { DiepPlayerService } from './engine/subsystems/player/diep.player.service';

@Component({
  selector: 'app-diep',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diep.component.html',
  styleUrls: ['./diep.component.css'], 
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiepComponent implements AfterViewInit { 
  @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  constructor(
    public gameEngine: DiepGameEngineService, 
    public playerService: DiepPlayerService,
    private inputService: DiepInputService,
    private interactionService: DiepInteractionService,
    private debugService: DiepDebugService
  ) {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.canvasRef.nativeElement.focus(); 
    
    this.gameEngine.arenaReset.transition.fadeIn();
    this.gameEngine.startTicker(() => this.draw());
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.debugService.handleDebugInput(event)) {
      return;
    }

    this.inputService.handleKeyDown(
      event, 
      () => this.draw(), 
      () => this.gameEngine.startTicker(() => this.draw())
    );
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.inputService.handleKeyUp(event);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.inputService.handleMouseMove(event, this.canvasRef.nativeElement);
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    const handledByUi = this.interactionService.handleMouseEvent(
      event, 
      this.canvasRef.nativeElement,
      () => this.gameEngine.startTicker(() => this.draw()), 
      () => this.draw()
    );

    if (!handledByUi) {
      this.inputService.handleMouseDown(
        event, 
        this.canvasRef.nativeElement,
        () => this.gameEngine.startTicker(() => this.draw()), 
        () => this.draw()
      );
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.inputService.handleMouseUp(event);
  }

  draw() {
    const g = this.gameEngine;
    const ctx = this.ctx;
    const w = g.width;
    const h = g.height;
    const player = this.playerService.player;

    // 1. Process all world and HUD scene calculations seamlessly
    DiepSceneSelector.renderScene(ctx, g, player, w, h);

    // 2. Overlay master canvas menus, sliders, and fade transitions
    DiepMenus.renderUI(ctx, g, w, h);
  }
}