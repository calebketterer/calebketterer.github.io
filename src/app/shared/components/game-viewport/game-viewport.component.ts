import { Component, ChangeDetectionStrategy, signal, ElementRef, ViewChild, HostListener, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-viewport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-viewport.component.html',
  styleUrls: ['./game-viewport.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameViewportComponent implements OnInit {
  @ViewChild('stageContainer') private stageContainer!: ElementRef<HTMLDivElement>;

  @Input() public statusText: string = 'SYSTEM ACTIVE // EXECUTABLE VIEWPORT';

  public scale = signal<number>(1.0);
  public isFitToWidth = signal<boolean>(false);
  public isFullScreen = signal<boolean>(false);
  public isMobileDevice = signal<boolean>(false);

  public ngOnInit(): void {
    this.checkMobileDevice();
  }

  private checkMobileDevice(): void {
    const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const isSmallScreen = window.innerWidth <= 768;

    if (isMobileUA || isSmallScreen) {
      this.isMobileDevice.set(true);
      this.isFitToWidth.set(true);
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:msfullscreenchange', ['$event'])
  public onFullscreenChange(event?: Event): void {
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      msFullscreenElement?: Element;
    };

    const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
    this.isFullScreen.set(!!fsElement);
  }

  public setScale(value: number): void {
    this.isFitToWidth.set(false);
    this.scale.set(Math.max(0.25, Math.min(1.5, value)));
  }

  public toggleFitToWidth(): void {
    this.isFitToWidth.update(current => !current);
  }

  public resetViewport(): void {
    this.isFitToWidth.set(this.isMobileDevice());
    this.scale.set(1.0);
  }

  public toggleFullScreen(): void {
    const elem = this.stageContainer.nativeElement as HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };

    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void>;
      msExitFullscreen?: () => Promise<void>;
      webkitFullscreenElement?: Element;
      msFullscreenElement?: Element;
    };

    const fsElement = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

    if (!fsElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }
}