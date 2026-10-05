import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLinksComponent } from './components/resource-links/resource-links.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ResourceLinksComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}