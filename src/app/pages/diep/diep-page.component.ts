import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiepPageViewerComponent } from './components/diep-page-viewer/diep-page-viewer.component';
import { DiepPageLogsComponent } from './components/diep-page-logs/diep-page-logs.component';

@Component({
  selector: 'app-diep-page',
  standalone: true,
  imports: [
    CommonModule, 
    DiepPageViewerComponent, 
    DiepPageLogsComponent
  ],
  templateUrl: './diep-page.component.html',
  styleUrls: ['./diep-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiepPageComponent {}