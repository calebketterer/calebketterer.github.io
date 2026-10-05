import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTransitionService } from './page-transition.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-page-transition',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './page-transition.component.html',
  styleUrl: './page-transition.component.css'
})
export class PageTransitionComponent {
  isFading$: Observable<boolean>;

  constructor(private transitionService: PageTransitionService) {
    this.isFading$ = this.transitionService.active$;
  }
}