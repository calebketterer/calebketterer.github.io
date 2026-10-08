import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diep-page-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diep-page-logs.component.html',
  styleUrls: ['./diep-page-logs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiepPageLogsComponent {}