import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalMinimizeService } from '../../../shared/services/global-minimize.service';

@Component({
  selector: 'app-central-command',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './central-command.component.html',
  styleUrl: './central-command.component.css'
})
export class CentralCommandComponent implements OnInit, OnDestroy {
  isMinimized = false;
  isGlobalMinimized = false;
  isTypingActive = false;
  
  fullTitle = 'CENTRAL COMMAND';
  fullDesc = 'An interface hosting interactive game engines, experimental canvas subsystems, and hyperlinks to project documentation archives.';
  
  typedTitle = '';
  typedDesc = '';

  private typingTimer: any = null;
  private expandTimeout: any = null;

  constructor(private globalMinimizeService: GlobalMinimizeService) {}

  ngOnInit(): void {
    this.globalMinimizeService.registerCentralCommand(this);

    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.isMinimized = false;
      this.typedTitle = this.fullTitle;
      this.typedDesc = this.fullDesc;
    } else {
      this.typedTitle = this.fullTitle;
      this.typedDesc = this.fullDesc;
    }
  }

  minimize(): void {
    if (!this.isMinimized) {
      this.isMinimized = true;
      this.isTypingActive = false;
    }
  }

  restore(): void {
    if (this.isMinimized) {
      this.isMinimized = false;
      this.typedTitle = '';
      this.typedDesc = '';
      this.expandTimeout = setTimeout(() => {
        this.startTypingEffect();
      }, 1050);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 768 && !this.isGlobalMinimized) {
      this.isMinimized = false;
      this.typedTitle = this.fullTitle;
      this.typedDesc = this.fullDesc;
    } else {
      this.isGlobalMinimized = this.globalMinimizeService.isMinimized;
    }
  }

  toggleMinimize(): void {
    this.clearTimers();
    if (this.isMinimized) {
      this.restore();
    } else {
      this.minimize();
    }
  }

  onGlobalMinimizeClick(): void {
    this.globalMinimizeService.toggleGlobalMinimize();
  }

  startTypingEffect(): void {
    this.isTypingActive = true;
    let titleIdx = 0;
    let descIdx = 0;

    const typeStep = () => {
      if (!this.isMinimized && this.isTypingActive) {
        if (titleIdx < this.fullTitle.length) {
          this.typedTitle += this.fullTitle.charAt(titleIdx++);
          this.typingTimer = setTimeout(typeStep, 35);
        } else if (descIdx < this.fullDesc.length) {
          this.typedDesc += this.fullDesc.charAt(descIdx++);
          this.typingTimer = setTimeout(typeStep, 12);
        } else {
          this.isTypingActive = false;
        }
      }
    };
    typeStep();
  }

  clearTimers(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    if (this.expandTimeout) {
      clearTimeout(this.expandTimeout);
      this.expandTimeout = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimers();
  }
}