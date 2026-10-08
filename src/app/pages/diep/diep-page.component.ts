import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameViewportComponent } from '../../shared/components/game-viewport/game-viewport.component';
import { GameLogsComponent, LogMetaItem, LogSection } from '../../shared/components/game-logs/game-logs.component';
import { DiepComponent } from '../../games/diep/diep.component';

@Component({
  selector: 'app-diep-page',
  standalone: true,
  imports: [CommonModule, GameViewportComponent, GameLogsComponent, DiepComponent],
  templateUrl: './diep-page.component.html',
  styleUrls: ['./diep-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiepPageComponent {
  public breadcrumbs: string[] = ['COMPENDIUM', 'GAMES', 'DIEP_SINGLEPLAYER.LOG'];
  public title: string = 'DIEP STATION // SINGLEPLAYER';

  public metaItems: LogMetaItem[] = [
    { label: 'PROJECT INITIATION', value: 'OCTOBER 05, 2025' },
    { label: 'DESIGN SPECIFICATION', value: '2D CANVAS ENGINE' },
    { label: 'SECTOR ORIGIN', value: 'INSPIRED BY DIEP.IO' },
    { label: 'RECOMMENDED PLATFORM', value: 'DESKTOP BROWSER', statusClass: 'status-blue' },
    { label: 'DEPLOYMENT STATUS', value: 'OPERATIONAL', statusClass: 'status-green' }
  ];

  public sections: LogSection[] = [
    {
      heading: 'EXECUTIVE SUMMARY',
      content: 'The player takes the role of an agile combat circle deployed within a grid-based vector field, fending off endless hordes of ruthless automated hostiles. Engineered to transform classic arcade mechanics into a focused single-player survival protocol.'
    },
    {
      heading: 'HISTORICAL CONTEXT & INTENT',
      content: 'Originally inspired by Diep.io, this version was constructed with the intent of turning the core arena gameplay into a deeply satisfying, standalone single-player experience—focusing on fluid movement physics, responsive controls, and scaling wave dynamics without network dependency.'
    }
  ];
}