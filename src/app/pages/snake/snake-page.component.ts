import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameViewportComponent } from '../../shared/components/game-viewport/game-viewport.component';
import { GameLogsComponent, LogMetaItem, LogSection } from '../../shared/components/game-logs/game-logs.component';
import { SnakeComponent } from '../../games/snake/snake.component';

@Component({
  selector: 'app-snake-page',
  standalone: true,
  imports: [CommonModule, GameViewportComponent, GameLogsComponent, SnakeComponent],
  templateUrl: './snake-page.component.html',
  styleUrls: ['./snake-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SnakePageComponent {
  public breadcrumbs: string[] = ['COMPENDIUM', 'GAMES', 'SERPENT_PROTOCOL.LOG'];
  public title: string = 'SNAKE ARCHIVE // NEON VECTOR GRID';

  public metaItems: LogMetaItem[] = [
    { label: 'PROJECT INITIATION', value: 'DECEMBER 12, 2025' },
    { label: 'ARCHITECTURE', value: '2D GRID ENGINE' },
    { label: 'SECTOR ORIGIN', value: 'CLASSIC ARCADE REFACTOR' },
    { label: 'RECOMMENDED PLATFORM', value: 'ANY', statusClass: 'status-blue' },
    { label: 'FEED ALGORITHM', value: 'OPERATIONAL', statusClass: 'status-green' }
  ];

  public sections: LogSection[] = [
    {
      heading: 'EXECUTIVE SUMMARY',
      content: 'An upgraded iteration of the foundational 1976 Nokia/arcade serpent protocol. Pilot an auto-advancing vector thread across a bounded spatial matrix. Consuming data nodes increases unit length and momentum velocity, escalating spatial navigation complexity.'
    },
    {
      heading: 'MECHANICAL LOGIC & SPATIAL CONTRAINTS',
      content: 'Constructed around a deterministic tile-based tick loop. Collision detection monitors arena boundaries and self-intersecting tail segments. As energy nodes are ingested, path planning space collapses exponentially, requiring preemptive pathfinding algorithms from the operator.'
    }
  ];
}