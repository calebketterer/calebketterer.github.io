import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LogMetaItem {
  label: string;
  value: string;
  statusClass?: 'status-green' | 'status-blue' | string;
}

export interface LogSection {
  heading: string;
  content: string;
}

@Component({
  selector: 'app-game-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-logs.component.html',
  styleUrls: ['./game-logs.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameLogsComponent {
  @Input() public breadcrumbs: string[] = [];
  @Input() public title: string = '';
  @Input() public metaItems: LogMetaItem[] = [];
  @Input() public sections: LogSection[] = [];
  @Input() public classification: string = 'PUBLIC ACCESS';
  @Input() public motto: string = 'PER ASPERA AD ASTRA';
}