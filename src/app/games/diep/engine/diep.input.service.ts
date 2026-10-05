// src/app/diep/engine/diep.input.service.ts
import { Injectable } from '@angular/core';
import { DiepGameEngineService } from './diep.game-engine.service';
import { DiepInteractionService } from '../ui/buttons/diep.button-interaction.service';
import { DiepQuadriviumMenu } from '../ui/main-menu/quadrivium/diep.quadrivium-menu';
import { DiepAchievementMenu } from '../ui/main-menu/achievements/diep.achievement-menu';
import { DiepDynamicTitle } from '../ui/main-menu/diep.dynamic-title';
import { DiepTipsManager } from '../ui/main-menu/diep.tips-manager';
import { DiepProjectileService } from './subsystems/diep.projectile.service';
import { DiepPlayerService } from './subsystems/player/diep.player.service';
import { DiepWeaponController } from './subsystems/player/diep.weapon-controller';

@Injectable({
  providedIn: 'root'
})
export class DiepInputService {
  constructor(
    private gameEngine: DiepGameEngineService,
    private buttonHandler: DiepInteractionService,
    private projectileService: DiepProjectileService,
    private playerService: DiepPlayerService,
    private weaponController: DiepWeaponController
  ) {}

  public handleKeyDown(event: KeyboardEvent, drawCallback: () => void, gameLoopCallback: () => void) {
    const key = event.key.toLowerCase();
    
    // FIXED: Store both exact and lowered keys to safely support ArrowKeys and custom structural loops
    this.gameEngine.keys[key] = true;
    this.gameEngine.keys[event.key] = true;

    // Block standard scrolling browser actions when inside active engine sandboxes
    if (
      this.gameEngine.showingQuadrivium || 
      this.gameEngine.showingAchievements || 
      this.gameEngine.currentMode === 'MARKET'
    ) {
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        event.preventDefault();
      }
    }

    // Fixed: Allowed global pause triggering for both ARENA and MARKET play loops cleanly
    if (key === 'p' || key === ' ') {
      const wasPaused = this.gameEngine.togglePause();
      drawCallback();
      if (!wasPaused) gameLoopCallback();
      event.preventDefault();
      return;
    }

    if ((key === 'k') && !this.gameEngine.mouseAiming) {
      event.preventDefault();
    }

    if (key === 'm') this.gameEngine.mouseAiming = !this.gameEngine.mouseAiming;
  }

  public handleKeyUp(event: KeyboardEvent) {
    // FIXED: Clear both entries on release to keep input dictionaries in sync
    this.gameEngine.keys[event.key.toLowerCase()] = false;
    this.gameEngine.keys[event.key] = false;
  }

  public handleMouseMove(event: MouseEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    this.gameEngine.mousePos.x = mouseX;
    this.gameEngine.mousePos.y = mouseY;

    if (this.gameEngine.showingQuadrivium) {
      DiepQuadriviumMenu.handleInputMove(mouseY);
    } else if (this.gameEngine.showingAchievements) {
      DiepAchievementMenu.handleInputMove(mouseY);
    }
  }

  public handleMouseDown(
    event: MouseEvent, 
    canvas: HTMLCanvasElement, 
    gameLoopCallback: () => void, 
    drawCallback: () => void
  ) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) {
      return;
    }

    if (this.gameEngine.currentMode === 'MENU' && !this.gameEngine.isGameStarted) {
      if (mouseY < 250) {
          DiepDynamicTitle.handleClick(event.detail === 2);
      } 
      DiepTipsManager.handleInteraction(mouseX, mouseY, canvas.width, canvas.height);
    }

    if (this.gameEngine.showingQuadrivium) {
      DiepQuadriviumMenu.handleInputDown(mouseY);
    } else if (this.gameEngine.showingAchievements) {
      DiepAchievementMenu.handleInputDown(mouseY);
    }

    const wasButtonClicked = this.buttonHandler.handleMouseEvent(
      event, 
      canvas, 
      gameLoopCallback, 
      drawCallback
    );

    if (wasButtonClicked) {
      canvas.focus();
    } else {
      const g = this.gameEngine;
      if (
        g.mouseAiming && 
        event.button === 0 && 
        !g.isPaused && 
        !g.gameOver && 
        g.isGameStarted
      ) {
        g.mouseDown = true;
      }
    }
  }

  public handleMouseUp(event: MouseEvent) {
    if (this.gameEngine.showingQuadrivium) {
      DiepQuadriviumMenu.handleInputUp();
    } else if (this.gameEngine.showingAchievements) {
      DiepAchievementMenu.handleInputUp();
    }

    if (event.button === 0) {
      this.gameEngine.mouseDown = false;
    }
  }
}