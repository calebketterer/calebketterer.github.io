import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameViewportComponent } from '../../shared/components/game-viewport/game-viewport.component';
import { GameLogsComponent, LogMetaItem, LogSection } from '../../shared/components/game-logs/game-logs.component';
import { FlashmathComponent } from '../../games/flashmath/flashmath.component';

@Component({
  selector: 'app-flashmath-page',
  standalone: true,
  imports: [CommonModule, GameViewportComponent, GameLogsComponent, FlashmathComponent],
  templateUrl: './flashmath-page.component.html',
  styleUrls: ['./flashmath-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlashmathPageComponent {
  public breadcrumbs: string[] = ['COMPENDIUM', 'GAMES', 'FLASHMATH.LOG'];
  public title: string = 'FLASHMATH ARENA // SINGLEPLAYER';

  public metaItems: LogMetaItem[] = [
    { label: 'PROJECT INITIATION', value: 'NOVEMBER 12, 2026' },
    { label: 'DESIGN SPECIFICATION', value: '2D CANVAS ENGINE' },
    { label: 'SECTOR ORIGIN', value: 'INSPIRED BY COOLMATHGAMES' },
    { label: 'RECOMMENDED PLATFORM', value: 'ANY', statusClass: 'status-blue' },
    { label: 'DEPLOYMENT STATUS', value: 'OPERATIONAL', statusClass: 'status-green' }
  ];

  public sections: LogSection[] = [

  ];
}