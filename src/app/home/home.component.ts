import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceLinksComponent } from './components/resource-links/resource-links.component';
import { ControlCenterComponent } from './components/control-center/control-center.component';
import { BackgroundEngineComponent } from '../shared/background-engine/background-engine.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ResourceLinksComponent,
    ControlCenterComponent,
    BackgroundEngineComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  @ViewChild('bgEngine') bgEngine!: BackgroundEngineComponent;
}