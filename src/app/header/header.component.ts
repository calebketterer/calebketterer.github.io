import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HomeStateService } from '../home/home.state.service';
import { PageTransitionService } from '../shared/transitions/page-transition.service';
import { HeaderTitleEngine } from './title-engine/header-title.engine';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  showBackButton = false;

  @ViewChild('titleCanvas', { static: true }) titleCanvas!: ElementRef<HTMLCanvasElement>;

  public state = inject(HomeStateService);
  private router = inject(Router);
  private transitionService = inject(PageTransitionService);
  private titleEngine?: HeaderTitleEngine;

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const path = event.urlAfterRedirects.replace('/', '').toLowerCase();
        const currentView = path || 'home';

        this.showBackButton = currentView !== 'home' && currentView !== '';

        if (currentView !== this.state.selectedView) {
          this.state.updateView(currentView);
        }
      });
  }

  ngAfterViewInit(): void {
    if (this.titleCanvas?.nativeElement) {
      this.titleEngine = new HeaderTitleEngine(this.titleCanvas.nativeElement);
      this.titleEngine.start();
    }
  }

  ngOnDestroy(): void {
    this.titleEngine?.stop();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.titleEngine?.resize();
  }

  onHeaderClick(): void {
    this.titleEngine?.handleCanvasClick();
  }

  goHome(): void {
    this.state.updateView('home');
    this.transitionService.navigateWithTransition('/', 250);
  }
}