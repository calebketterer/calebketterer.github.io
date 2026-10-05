import { Injectable } from '@angular/core';
import { SectorRoom } from '../sectors.interfaces';

@Injectable({ providedIn: 'root' })
export class SectorsDecorDirector {
  
  /**
   * Renders wall structures, internal obstacles, and room decor.
   * (Door rendering is handled independently by SectorsDoorRenderer).
   */
  public drawRoomStructures(
    ctx: CanvasRenderingContext2D,
    room: SectorRoom,
    width: number = 800,
    height: number = 600
  ): void {
    if (!room) return;
  }
}