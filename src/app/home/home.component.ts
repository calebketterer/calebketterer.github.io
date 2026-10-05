import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLinksComponent } from './components/resource-links/resource-links.component';
import { BackgroundEngineComponent } from '../shared/background-engine/background-engine.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ResourceLinksComponent, BackgroundEngineComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @ViewChild('bgEngine') bgEngine!: BackgroundEngineComponent;

  isPlaying = true;
  currentSpeed = 1;

  toggleEngine(): void {
    if (this.bgEngine) {
      this.isPlaying = this.bgEngine.togglePlay();
    }
  }

  setSpeed(speed: number): void {
    this.currentSpeed = speed;
    if (this.bgEngine) {
      this.bgEngine.setSpeed(speed);
    }
  }
}