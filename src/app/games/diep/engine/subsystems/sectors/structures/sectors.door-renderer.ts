// src/app/diep/engine/subsystems/sectors/structures/sectors.door-renderer.ts
import { Injectable } from '@angular/core';
import { FactionColor, FACTION_COLOR_HEX, SectorDoor, SectorRoom } from '../sectors.interfaces';

@Injectable({ providedIn: 'root' })
export class SectorsDoorRenderer {
  private readonly STANDARD_DOOR_WIDTH = 80;
  private readonly STANDARD_DOOR_HEIGHT = 24;
  private readonly MARGIN = 20;
  private readonly CORNER_OFFSET = 40;
  private readonly FRAME_THICKNESS = 6;

  /**
   * Renders all doors for a given room.
   */
  public drawRoomDoors(
    ctx: CanvasRenderingContext2D,
    room: SectorRoom,
    roomsMap: Map<string, SectorRoom>,
    getNeighborCoordsFn: (gx: number, gy: number, dir: any) => [number, number],
    width: number = 800,
    height: number = 600
  ): void {
    if (!room?.doors) return;

    const doorList: SectorDoor[] = room.doors instanceof Map 
      ? Array.from(room.doors.values()) 
      : (Array.isArray(room.doors) ? room.doors : []);

    const pulse = (Math.sin(performance.now() / 400) + 1) / 2;

    doorList.forEach((door) => {
      this.drawDoor(
        ctx,
        door,
        room,
        roomsMap,
        getNeighborCoordsFn,
        pulse,
        width,
        height
      );
    });
  }

  private drawDoor(
    ctx: CanvasRenderingContext2D,
    door: SectorDoor,
    currentRoom: SectorRoom,
    roomsMap: Map<string, SectorRoom>,
    getNeighborCoordsFn: (gx: number, gy: number, dir: any) => [number, number],
    pulse: number,
    screenWidth: number,
    screenHeight: number
  ): void {
    if (!door.isOpen) return;

    door.width = this.STANDARD_DOOR_WIDTH;
    door.height = this.STANDARD_DOOR_HEIGHT;
    this.calculateDoorPosition(door, screenWidth, screenHeight);

    const [nx, ny] = getNeighborCoordsFn(currentRoom.gridX, currentRoom.gridY, door.direction);
    const neighborKey = `${nx},${ny}`;
    const neighborRoom = roomsMap?.get ? roomsMap.get(neighborKey) : null;

    const isDiscovered = neighborRoom?.discovered === true;
    
    let accentHex = '#b0b0b0';
    if (isDiscovered && neighborRoom) {
      const nFaction = neighborRoom.faction as FactionColor;
      accentHex = FACTION_COLOR_HEX[nFaction] || FACTION_COLOR_HEX.blue;
    }

    const baseRadius = Math.max(door.width, door.height) * 1.25;
    const breathingRadius = baseRadius * (0.9625 + pulse * 0.0875);
    const breathingAlpha = 0.35 + pulse * 0.2;

    ctx.save();

    const radialGrad = ctx.createRadialGradient(door.x, door.y, 0, door.x, door.y, breathingRadius);
    radialGrad.addColorStop(0, `${accentHex}${Math.floor(breathingAlpha * 255).toString(16).padStart(2, '0')}`);
    radialGrad.addColorStop(0.6, `${accentHex}22`);
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = radialGrad;
    ctx.beginPath();
    ctx.arc(door.x, door.y, breathingRadius, 0, Math.PI * 2);
    ctx.fill();

    this.renderUnifiedDoor(ctx, door, accentHex, pulse);

    ctx.restore();
  }

  private calculateDoorPosition(door: SectorDoor, screenWidth: number, screenHeight: number): void {
    const midX = screenWidth / 2;
    const midY = screenHeight / 2;

    switch (door.direction) {
      case 'N':  door.x = midX; door.y = this.MARGIN; break;
      case 'S':  door.x = midX; door.y = screenHeight - this.MARGIN; break;
      case 'W':  door.x = this.MARGIN; door.y = midY; break;
      case 'E':  door.x = screenWidth - this.MARGIN; door.y = midY; break;
      case 'NW': door.x = this.CORNER_OFFSET; door.y = this.CORNER_OFFSET; break;
      case 'NE': door.x = screenWidth - this.CORNER_OFFSET; door.y = this.CORNER_OFFSET; break;
      case 'SW': door.x = this.CORNER_OFFSET; door.y = screenHeight - this.CORNER_OFFSET; break;
      case 'SE': door.x = screenWidth - this.CORNER_OFFSET; door.y = screenHeight - this.CORNER_OFFSET; break;
    }
  }

  private getDoorRotation(direction: string): number {
    switch (direction) {
      case 'N':  return 0;
      case 'NE': return Math.PI / 4;
      case 'E':  return Math.PI / 2;
      case 'SE': return (3 * Math.PI) / 4;
      case 'S':  return Math.PI;
      case 'SW': return (5 * Math.PI) / 4;
      case 'W':  return (3 * Math.PI) / 2;
      case 'NW': return (7 * Math.PI) / 4;
      default:   return 0;
    }
  }

  private renderUnifiedDoor(
    ctx: CanvasRenderingContext2D,
    door: SectorDoor,
    accentHex: string,
    pulse: number
  ): void {
    const halfW = door.width / 2;
    const halfH = door.height / 2;
    const angle = this.getDoorRotation(door.direction);

    ctx.save();
    ctx.translate(door.x, door.y);
    ctx.rotate(angle);

    ctx.clearRect(-halfW, -halfH, door.width, door.height);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-halfW, -halfH, door.width, door.height);

    ctx.shadowColor = accentHex;
    ctx.shadowBlur = 8 + pulse * 6;
    ctx.strokeStyle = accentHex;
    ctx.globalAlpha = 0.4 + pulse * 0.4;
    ctx.lineWidth = 2;
    ctx.strokeRect(-halfW + 2, -halfH + 2, door.width - 4, door.height - 4);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#2a2d32';
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1.5;

    ctx.fillRect(-halfW - this.FRAME_THICKNESS, -halfH, this.FRAME_THICKNESS, door.height);
    ctx.strokeRect(-halfW - this.FRAME_THICKNESS, -halfH, this.FRAME_THICKNESS, door.height);

    ctx.fillRect(halfW, -halfH, this.FRAME_THICKNESS, door.height);
    ctx.strokeRect(halfW, -halfH, this.FRAME_THICKNESS, door.height);

    ctx.restore();

    ctx.save();
    ctx.fillStyle = accentHex;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.85;
    ctx.fillText(door.direction, door.x, door.y);
    ctx.restore();
  }
}