import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreviewCardComponent } from '../preview-card/preview-card.component';
import { GlobalMinimizeService } from '../../../shared/services/global-minimize.service';
import { GlitchHandler } from '../../../shared/utils/glitch-handler';
import { Subscription } from 'rxjs';

interface ResourceItem {
  title: string;
  category: string;
  description: string;
  targetUrl: string;
  embedUrl?: string;
}

@Component({
  selector: 'app-resource-links',
  standalone: true,
  imports: [CommonModule, PreviewCardComponent],
  templateUrl: './resource-links.component.html',
  styleUrl: './resource-links.component.css'
})
export class ResourceLinksComponent implements OnInit, OnDestroy {
  glitch = new GlitchHandler();

  @HostBinding('class.prey-glitch-out') get isGlitchingOut() { return this.glitch.isGlitchingOut; }
  @HostBinding('class.prey-glitch-in') get isGlitchingIn() { return this.glitch.isGlitchingIn; }
  @HostBinding('class.fully-hidden') get isFullyHidden() { return this.glitch.isFullyHidden; }

  isContentVisible = true;

  resources: ResourceItem[] = [
    {
      title: 'GitHub Profile & Repositories',
      category: 'SOURCE CONTROL',
      description: 'Public codebase repositories hosting TypeScript game engines, Angular components, and experimental tools.',
      targetUrl: 'https://github.com/calebketterer'
    },
    {
      title: 'Google Site Knowledge Hub',
      category: 'DOCUMENTATION',
      description: 'Personal web portal detailing music, art, and creative writing projects using interactive modules and comprehensive research summaries.',
      targetUrl: 'https://sites.google.com/view/calebketterer?usp=sharing&pli=1&authuser=0',
    },
    {
      title: 'Paper Gwent Overview & Lore',
      category: 'GAME DESIGN',
      description: 'Detailed insights on the tabletop paper adaptation of Gwent, featuring rule definitions, physical card templates, and mechanic adaptations.',
      targetUrl: 'https://sites.google.com/view/calebketterer/paper-gwent',
    },
    {
      title: 'Paper Gwent Drive Storage',
      category: 'ASSETS & ARCHIVE',
      description: 'Google drive repository containing high-resolution printable card assets, vector layouts, and rulebook PDFs.',
      targetUrl: 'https://drive.google.com/drive/folders/1buJl4aGBJxhNY5lkLGh8VHywMnii-BaU'
    },
  ];

  private globalSub!: Subscription;

  constructor(private globalMinimizeService: GlobalMinimizeService) {}

  ngOnInit(): void {
    this.globalSub = this.globalMinimizeService.isMinimized$.subscribe(minimized => {
      if (minimized) {
        // Step 1: Trigger local component collapse animation first
        this.isContentVisible = false;
        // Step 2: Sequentially trigger preyGlitchOut animation
        setTimeout(() => {
          this.glitch.triggerGlitchOut(() => {});
        }, 200);
      } else {
        // Step 3: Sequentially restore: Glitch in, then show inner content
        this.isContentVisible = true;
        this.glitch.triggerGlitchIn();
      }
    });
  }

  toggleVisibility(): void {
    this.isContentVisible = !this.isContentVisible;
  }

  ngOnDestroy(): void {
    if (this.globalSub) this.globalSub.unsubscribe();
  }
}