import { Component, ElementRef, ViewChild, Renderer2, AfterViewInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeStateService } from './home.state.service';
import { PageTransitionService } from '../shared/transitions/page-transition.service';
import { TipTransitionService } from './tip-transition.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('heyThere', { static: true }) heyThere!: ElementRef<HTMLElement>;
  @ViewChild('goodNews', { static: true }) goodNews!: ElementRef<HTMLElement>;
  @ViewChild('Tips', { static: true }) Tips!: ElementRef<HTMLElement>;

  private renderer = inject(Renderer2);
  public state = inject(HomeStateService);
  private pageTransitionService = inject(PageTransitionService);
  private tipTransitionService = inject(TipTransitionService);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.tipTransitionService.fitTipText(this.Tips, this.renderer);
    }, 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.tipTransitionService.fitTipText(this.Tips, this.renderer);
  }

  onViewChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.state.updateView(val);
    this.pageTransitionService.navigateWithTransition(val);
  }

  shakeHeyThere() {
    this.applyShake(this.heyThere.nativeElement);
  }

  shakeGoodNews() {
    this.applyShake(this.goodNews.nativeElement);
  }

  cycleTipWithFade() {
    this.tipTransitionService.cycleTipWithFade(this.Tips, this.renderer);
  }

  private applyShake(element: HTMLElement) {
    this.renderer.removeClass(element, 'shake');
    void element.offsetWidth; // trigger reflow
    this.renderer.addClass(element, 'shake');
  }

  toggleDirection() {
    this.state.reverse = !this.state.reverse;
  }
}