import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snake-title-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snake-title-screen.component.html',
  styleUrls: ['./snake-title-screen.component.css']
})
export class SnakeTitleScreenComponent implements OnInit {
  @Output() ready = new EventEmitter<void>();
  loadingProgress = 0;

  ngOnInit(): void {
    const interval = setInterval(() => {
      this.loadingProgress += 4;
      if (this.loadingProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => this.ready.emit(), 300);
      }
    }, 30);
  }
}