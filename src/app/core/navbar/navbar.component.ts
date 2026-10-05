import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path?: string;
  externalUrl?: string;
  badge?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isCollapsed = false;

  navItems: NavItem[] = [
    { label: 'HOME', path: '/home' },
    { label: 'DIEP.IO', path: '/diep', badge: 'CANVAS' },
    { label: 'SNAKE', path: '/snake', badge: 'RETRO' },
    { label: 'SUDOKU', path: '/sudoku', badge: 'PUZZLE' },
    { label: 'TESTING COMPENDIUM', externalUrl: 'https://calebketterer.github.io/Calebs-Compendium/', badge: 'EXT' }
  ];

  toggleNavbar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}