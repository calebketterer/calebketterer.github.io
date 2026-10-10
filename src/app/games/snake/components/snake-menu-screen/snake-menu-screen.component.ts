import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DifficultyConfig } from '../../models/snake.types';

@Component({
  selector: 'app-snake-menu-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-menu-screen.component.html',
  styleUrls: ['./snake-menu-screen.component.css']
})
export class SnakeMenuScreenComponent {
  @Input() difficulties: DifficultyConfig[] = [];
  @Input() selectedDifficulty!: DifficultyConfig;
  @Input() availableBoardSizes: number[] = [];
  @Input() currentBoardSize = 18;
  @Input() highScores: Record<string, number> = {};

  @Output() selectDifficultyLevel = new EventEmitter<number>();
  @Output() selectBoardSize = new EventEmitter<number>();
  @Output() startGame = new EventEmitter<void>();

  get currentHighScore(): number {
    const key = `${this.selectedDifficulty.level}_${this.currentBoardSize}`;
    return this.highScores[key] || 0;
  }

  onSliderChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectDifficultyLevel.emit(parseInt(target.value, 10));
  }
}