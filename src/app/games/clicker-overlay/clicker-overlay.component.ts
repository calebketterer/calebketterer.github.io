import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Target {
  id: number;
  top: number;
  left: number;
  shape: string;
  coreColor: string;
  outlineColor: string;
  clickCount: number;
  isDragging?: boolean;
  startX?: number;
  startY?: number;
}

@Component({
  selector: 'app-clicker-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clicker-overlay.component.html',
  styleUrl: './clicker-overlay.component.css'
})
export class ClickerOverlayComponent implements OnChanges {
  @Input() displayCount: number = 0;
  @Output() targetClicked = new EventEmitter<void>();

  targets: Target[] = [];
  activeTarget: Target | null = null;
  private offset = { x: 0, y: 0 };
  
  globalNumPos = { top: '50%', left: '50%', rotate: '0deg' };
  isGlobalFading: boolean = false;

  private shapes: string[] = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'octagon'];
  private colorPool: string[] = ["#b90000", "#b8b600", "#32881f","#104aee", "#8001c6", "#f637e3"];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['displayCount']) {
      this.updateGameLogic();
      
      // Relocate big number every 20 clicks
      if (this.displayCount % 20 === 0 && this.displayCount > 0) {
        this.triggerGlobalRelocation();
      }

      // GLOBAL RECOLOR: Every 25 clicks, change EVERY shape's color
      if (this.displayCount % 25 === 0 && this.displayCount > 0) {
        this.recolorAllTargets();
      }
    }
  }

  private updateGameLogic() {
    if (this.targets.length === 0 && this.displayCount >= 5) {
      this.addNewTarget();
    }
    if (this.displayCount % 20 === 0 && this.displayCount > 0) {
      this.addNewTarget();
    }
  }

  private recolorAllTargets() {
    this.targets.forEach(t => {
      const colors = this.getUniqueColors();
      t.coreColor = colors.core;
      t.outlineColor = colors.outline;
    });
  }

  private triggerGlobalRelocation() {
    this.isGlobalFading = true;
    setTimeout(() => {
      this.globalNumPos = {
        top: `${Math.random() * 70 + 15}%`,
        left: `${Math.random() * 70 + 15}%`,
        rotate: `${Math.random() * 80 - 40}deg`
      };
      this.isGlobalFading = false;
    }, 600);
  }

  // --- DRAG LOGIC ---
  startDrag(event: MouseEvent, target: Target) {
    event.preventDefault();
    event.stopPropagation();
    this.activeTarget = target;
    target.isDragging = true;
    target.startX = event.clientX;
    target.startY = event.clientY;
    this.offset.x = event.clientX - target.left;
    this.offset.y = event.clientY - target.top;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.activeTarget) return;
    this.activeTarget.left = event.clientX - this.offset.x;
    this.activeTarget.top = event.clientY - this.offset.y;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.activeTarget) {
      this.activeTarget.isDragging = false;
      this.activeTarget = null;
    }
  }

  handleTargetClick(event: MouseEvent, target: Target) {
    const deltaX = Math.abs(event.clientX - (target.startX || 0));
    const deltaY = Math.abs(event.clientY - (target.startY || 0));

    if (deltaX < 5 && deltaY < 5) {
      target.clickCount++;
      
      // LOCAL RECOLOR: Change this specific shape on click
      const newColors = this.getUniqueColors();
      target.coreColor = newColors.core;
      target.outlineColor = newColors.outline;

      this.targetClicked.emit();
      this.teleportTarget(target);
    }
  }

  private teleportTarget(target: Target) {
    target.top = Math.random() * (window.innerHeight - 100);
    target.left = Math.random() * (window.innerWidth - 100);
  }

  private addNewTarget() {
    const colors = this.getUniqueColors();
    this.targets.push({
      id: Date.now(),
      top: Math.random() * (window.innerHeight - 100),
      left: Math.random() * (window.innerWidth - 100),
      shape: this.shapes[Math.floor(Math.random() * this.shapes.length)],
      coreColor: colors.core,
      outlineColor: colors.outline,
      clickCount: 0
    });
  }

  private getUniqueColors() {
    const core = this.colorPool[Math.floor(Math.random() * this.colorPool.length)];
    let outline: string;
    do { 
      outline = this.colorPool[Math.floor(Math.random() * this.colorPool.length)]; 
    } while (outline === core);
    return { core, outline };
  }
}