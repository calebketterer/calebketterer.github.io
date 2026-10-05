import { Injectable } from '@angular/core';
import { GwentCard } from '../interfaces/gwent-card';

@Injectable({
  providedIn: 'root'
})
export class GwentEngineService {
  public board: any = { 
    p2Ranged: [], p2Melee: [], p1Melee: [], p1Ranged: [] 
  };

  public handP1: GwentCard[] = [];
  public handP2: GwentCard[] = [];
  public deckP1: GwentCard[] = [];
  public deckP2: GwentCard[] = [];

  public activePlayer: number = 1;
  public p1Score: number = 0;
  public p2Score: number = 0;
  public p1Wins: number = 0;
  public p2Wins: number = 0;
  public p1Passed: boolean = false;
  public p2Passed: boolean = false;
  public roundOver: boolean = false;
  public gameOver: boolean = false;

  resetGame(p1FullDeck: GwentCard[], p2FullDeck: GwentCard[]): void {
    this.board = { p2Ranged: [], p2Melee: [], p1Melee: [], p1Ranged: [] };
    this.handP1 = p1FullDeck.slice(0, 10);
    this.handP2 = p2FullDeck.slice(0, 10);
    this.deckP1 = p1FullDeck.slice(10, 25);
    this.deckP2 = p2FullDeck.slice(10, 25);
    this.p1Score = 0; this.p2Score = 0;
    this.p1Wins = 0; this.p2Wins = 0;
    this.p1Passed = false; this.p2Passed = false;
    this.roundOver = false; this.gameOver = false;
    this.activePlayer = 1;
    this.calculateScores();
  }

  calculateScores(): void {
    const getRowPower = (row: GwentCard[]) => row.reduce((acc, c) => acc + c.power, 0);
    this.p1Score = getRowPower(this.board.p1Melee) + getRowPower(this.board.p1Ranged);
    this.p2Score = getRowPower(this.board.p2Melee) + getRowPower(this.board.p2Ranged);
  }

  playCard(card: GwentCard, rowName: string, playerNum: number): void {
    this.board[rowName].push(card);
    if (playerNum === 1) {
      this.handP1 = this.handP1.filter(c => c.id !== card.id);
    } else {
      this.handP2 = this.handP2.filter(c => c.id !== card.id);
    }
    this.calculateScores();
  }

  determineNextTurn(): void {
    if (this.p1Passed && this.p2Passed) {
      this.resolveRound();
      return;
    }
    if (this.activePlayer === 1) {
      this.activePlayer = !this.p2Passed ? 2 : 1;
    } else {
      this.activePlayer = !this.p1Passed ? 1 : 2;
    }
  }

  resolveRound(): void {
    this.calculateScores();
    if (this.p1Score > this.p2Score) this.p1Wins++;
    else if (this.p2Score > this.p1Score) this.p2Wins++;
    else { this.p1Wins++; this.p2Wins++; }

    if (this.p1Wins >= 2 || this.p2Wins >= 2) this.gameOver = true;
    else this.roundOver = true;
  }

  resetForNewRound(): void {
    const drawCards = (hand: GwentCard[], deck: GwentCard[]) => {
      const drawn = deck.splice(0, 3);
      const space = 10 - hand.length;
      if (space > 0) hand.push(...drawn.slice(0, space));
    };
    drawCards(this.handP1, this.deckP1);
    drawCards(this.handP2, this.deckP2);
    this.board = { p2Ranged: [], p2Melee: [], p1Melee: [], p1Ranged: [] };
    this.p1Passed = false; this.p2Passed = false; this.roundOver = false;
    this.calculateScores();
  }

  getAllCardsOnBoard(): GwentCard[] {
    return [...this.board.p2Ranged, ...this.board.p2Melee, ...this.board.p1Melee, ...this.board.p1Ranged];
  }

  removeCardsByPower(powerValue: number): void {
    for (const row in this.board) {
      this.board[row] = this.board[row].filter((card: GwentCard) => card.power !== powerValue);
    }
    this.calculateScores();
  }

  // FIXED: Now uses Splice with Index to ensure only ONE card is removed
  removeSpecificCard(target: GwentCard): void {
    for (const row in this.board) {
      const index = this.board[row].findIndex((c: GwentCard) => c.id === target.id);
      if (index !== -1) {
        this.board[row].splice(index, 1);
        break; 
      }
    }
    this.calculateScores();
  }

  // Helper to determine which row a card is on
  getCardRow(cardId: string): string | null {
    for (const row in this.board) {
      if (this.board[row].some((c: GwentCard) => c.id === cardId)) return row;
    }
    return null;
  }
}