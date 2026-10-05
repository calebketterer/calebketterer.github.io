import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GwentEngineService } from './services/gwent-engine.service';
import { AbilityEngineService } from './services/ability-engine.service';
import { DeckService } from './services/deck.service';
import { GwentCard } from './interfaces/gwent-card';

@Component({
  selector: 'app-gwent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gwent.component.html',
  styleUrls: ['./gwent.component.css']
})
export class GwentComponent implements OnInit {
  draggedCard: GwentCard | null = null;
  turnPlayed: boolean = false;
  tipLine: string = "Player 1's Turn";
  tipIsError: boolean = false;

  waitingForTarget: boolean = false;
  pendingCard: GwentCard | null = null;

  constructor(
    public engine: GwentEngineService, 
    private abilityEngine: AbilityEngineService,
    private deckService: DeckService
  ) {}

  ngOnInit(): void { 
    this.setupGame(); 
  }

  setupGame(): void {
    const p1Deck = this.deckService.generateDeck();
    const p2Deck = this.deckService.generateDeck();
    
    this.engine.resetGame(p1Deck, p2Deck);
    this.turnPlayed = false;
    this.waitingForTarget = false;
    this.pendingCard = null;
    this.updateStatus();
  }

  onDragStart(card: GwentCard): void {
    if (this.turnPlayed || this.waitingForTarget || this.engine.roundOver || this.engine.gameOver) return;
    this.draggedCard = card;
  }

  onDrop(event: DragEvent, rowName: string): void {
    event.preventDefault();
    if (this.engine.roundOver || this.engine.gameOver || this.turnPlayed || !this.draggedCard) return;

    if (!rowName.startsWith(`p${this.engine.activePlayer}`)) {
      this.showError("Invalid Row!"); 
      return;
    }

    const playedCard = this.draggedCard;
    this.engine.playCard(playedCard, rowName, this.engine.activePlayer);
    
    // Check if ability requires manual targeting
    if (playedCard.ability?.type === 'deploy' && playedCard.ability.target === 'manual') {
      
      // NEW: Pre-check if there is actually anything to hit
      if (this.abilityEngine.hasValidTargets(playedCard)) {
        this.waitingForTarget = true;
        this.pendingCard = playedCard;
        this.updateStatus();
      } else {
        this.showError(`No valid targets for ${playedCard.name}!`);
        this.turnPlayed = true;
        // updateStatus is called inside showError's timeout
      }

    } else {
      if (playedCard.ability) {
        this.abilityEngine.resolve(playedCard);
      }
      this.turnPlayed = true;
      this.updateStatus();
    }

    this.draggedCard = null;
  }

  onBoardCardClick(targetCard: GwentCard): void {
    if (!this.waitingForTarget || !this.pendingCard) return;

    const success = this.abilityEngine.resolveManualTarget(this.pendingCard, targetCard);
    
    if (success) {
      this.waitingForTarget = false;
      this.pendingCard = null;
      this.turnPlayed = true;
      this.updateStatus();
    } else {
      this.showError("Invalid Target!");
    }
  }

  handleCoinClick(): void {
    if (this.waitingForTarget) return;

    if (this.engine.gameOver) { 
      this.setupGame(); 
      return; 
    }
    if (this.engine.roundOver) { 
      this.engine.resetForNewRound(); 
      this.updateStatus(); 
      return; 
    }

    if (this.turnPlayed) {
      this.engine.determineNextTurn();
      this.turnPlayed = false;
    } else {
      if (this.engine.activePlayer === 1) this.engine.p1Passed = true;
      else this.engine.p2Passed = true;
      this.engine.determineNextTurn();
    }
    this.updateStatus();
  }

  private updateStatus(): void {
    if (this.engine.gameOver) {
      if (this.engine.p1Wins === this.engine.p2Wins) {
        this.tipLine = "MATCH OVER - IT'S A DRAW!";
      } else if (this.engine.p1Wins > this.engine.p2Wins) {
        this.tipLine = "MATCH OVER - PLAYER 1 WINS THE MATCH!";
      } else {
        this.tipLine = "MATCH OVER - PLAYER 2 WINS THE MATCH!";
      }
    } else if (this.engine.roundOver) {
      this.tipLine = "Round Over - Click Coin to Draw";
    } else if (this.waitingForTarget) {
      this.tipLine = `Select a target for ${this.pendingCard?.name}...`;
    } else {
      const turnStr = `Player ${this.engine.activePlayer}'s Turn`;
      const passStr = this.engine.p1Passed ? " (P1 Passed)" : this.engine.p2Passed ? " (P2 Passed)" : "";
      this.tipLine = turnStr + passStr;
    }
  }

  allowDrop(e: DragEvent): void { 
    e.preventDefault(); 
  }
  
  getCardback(player: number): string { 
    return 'assets/gwent/artwork/cardbacks/default.png'; 
  }

  private showError(msg: string): void { 
    this.tipLine = msg; 
    this.tipIsError = true; 
    setTimeout(() => { 
      this.tipIsError = false; 
      this.updateStatus(); 
    }, 2000); 
  }
}