import { Injectable } from '@angular/core';
import { DiepGameEngineService } from '../../engine/diep.game-engine.service';
import { DiepButton } from '../../core/diep.interfaces';
import { DiepQuadriviumMenu } from '../main-menu/quadrivium/diep.quadrivium-menu';
import { DiepAchievementMenu } from '../main-menu/achievements/diep.achievement-menu';
import { DiepAchievementNavigator } from '../main-menu/achievements/diep.achievement-nav-bar';
import { DiepCollectionMenu } from '../main-menu/collection/collection-menu';
import { DiepMainMenu } from '../main-menu/diep.main-menu';
import { DiepPauseOverlay } from '../overlays/pause-overlay';
import { DiepGameOverOverlay } from '../overlays/game-over-overlay';
import { MarketOverlay } from '../overlays/market-overlay'; 
import { DiepHealthBarRenderer } from '../hud/diep.health-bar-renderer';
import { DiepUpgradeMenuRenderer } from '../hud/upgrade-menu/diep.upgrade-menu-renderer';
import { DiepPlayerService } from '../../engine/subsystems/player/diep.player.service';

@Injectable({ providedIn: 'root' })
export class DiepInteractionService {
  constructor(
    private gameEngine: DiepGameEngineService,
    private playerService: DiepPlayerService
  ) {}

  public handleMouseEvent(
    event: MouseEvent, 
    canvas: HTMLCanvasElement, 
    gameLoopCallback: () => void, 
    drawCallback: () => void
  ): boolean {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const g = this.gameEngine;
    const { width, height } = g;
    const player = this.playerService.player;

    const isGameplayMode = g.currentMode === 'ARENA' || g.currentMode === 'SECTORS' || g.currentMode === 'MARKET';

    // 1. Pause Button Circular Hit Test (Radius: 20px at center-top)
    if (isGameplayMode && g.isGameStarted && !g.gameOver && !g.showingQuadrivium && !g.showingAchievements && !g.showingCollection) {
      const dist = Math.sqrt(Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - 35, 2));
      if (dist <= 20) {
        const wasPaused = g.togglePause();
        if (!wasPaused) gameLoopCallback();
        return true;
      }
    }

    let activeButtons: DiepButton[] = [];

    // Prioritize checking active overlay menus first to block background bleed clicks
    if (g.showingQuadrivium) {
      activeButtons = DiepQuadriviumMenu.getButtons(g, width, height);
    } else if (g.showingAchievements) {
      activeButtons = DiepAchievementMenu.getButtons(g, width, height);
      activeButtons.push(...DiepAchievementNavigator.getButtons(g, width));
    } else if (g.showingCollection) {
      activeButtons = DiepCollectionMenu.getButtons(g, width, height);
    } else if (g.currentMode === 'MENU' && !g.isGameStarted) {
      activeButtons = DiepMainMenu.getButtons(g, width, height);
    } else if (g.isPaused) {
      activeButtons = DiepPauseOverlay.getButtons(g, width, height);
    } else if (g.gameOver && !g.gameOverService.isAnimationActive()) {
      activeButtons = DiepGameOverOverlay.getButtons(g, width, height);
    } else if (g.currentMode === 'MARKET' && !g.isPaused) {
      activeButtons = MarketOverlay.getButtons(g, width, height);
    }

    // 2. HUD Buttons (Health bar toggle & Upgrade menu)
    if (isGameplayMode && g.isGameStarted && !g.isPaused && !g.gameOver && !g.showingQuadrivium && !g.showingAchievements && !g.showingCollection) {
      activeButtons.push(DiepHealthBarRenderer.getButton());
      const upgradeButtons = DiepUpgradeMenuRenderer.getButtons(g, player, height);
      activeButtons.push(...upgradeButtons);
    }

    for (const btn of activeButtons) {
      if (
        mouseX >= btn.x && 
        mouseX <= btn.x + btn.w && 
        mouseY >= btn.y && 
        mouseY <= btn.y + btn.h
      ) {
        btn.action();
        if (!g.isPaused && g.isGameStarted) gameLoopCallback();
        drawCallback();
        return true; 
      }
    }

    return false;
  }
}