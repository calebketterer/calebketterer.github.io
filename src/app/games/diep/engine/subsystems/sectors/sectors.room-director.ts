// src/app/diep/engine/subsystems/sectors/sectors.room-director.ts
import { Injectable } from '@angular/core';
import { 
  SectorRoom, 
  SectorDirection, 
  ALL_SECTOR_DIRECTIONS, 
  FactionColor, 
  SectorDoor 
} from './sectors.interfaces';

/**
 * Configure the weight/probability of each faction color when generating a new room.
 * Values act as relative weights (e.g. weight 30 out of 100 total weight = 30% chance).
 */
export const FACTION_ROOM_WEIGHTS: Record<FactionColor, number> = {
  neutral: 0,
  blue:    5,
  yellow:  7,
  orange:  22,
  green:   22,
  red:     22,
  purple:  22,
};

@Injectable({ providedIn: 'root' })
export class SectorsRoomDirector {
  private roomsMap: Map<string, SectorRoom> = new Map();
  public currentGridX = 0;
  public currentGridY = 0;

  public get rooms(): Map<string, SectorRoom> {
    return this.roomsMap;
  }

  public get currentRoom(): SectorRoom {
    return this.getOrCreateRoom(this.currentGridX, this.currentGridY);
  }

  public reset(): void {
    this.roomsMap.clear();
    this.currentGridX = 0;
    this.currentGridY = 0;
    this.getOrCreateRoom(0, 0);
  }

  public getOrCreateRoom(gx: number, gy: number): SectorRoom {
    const key = `${gx},${gy}`;
    if (this.roomsMap.has(key)) {
      return this.roomsMap.get(key)!;
    }

    const isStartRoom = gx === 0 && gy === 0;
    const distanceFromOrigin = Math.abs(gx) + Math.abs(gy);
    const faction: FactionColor = isStartRoom ? 'blue' : this.getRandomFaction(distanceFromOrigin);

    const room: SectorRoom = {
      gridX: gx,
      gridY: gy,
      faction,
      isCleared: isStartRoom,
      doors: new Map(),
      discovered: true
    };

    this.roomsMap.set(key, room);
    this.generateDoorsForRoom(room);
    return room;
  }

  private getRandomFaction(distanceFromOrigin: number): FactionColor {
    // Optional: Copy default weights and apply distance scaling if desired
    const weights: Record<FactionColor, number> = { ...FACTION_ROOM_WEIGHTS };

    // Example distance scaling: boost harder colors (red/purple) further out
    if (distanceFromOrigin > 4) {
      weights.red += 15;
      weights.purple += 15;
    }

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let randomRoll = Math.random() * totalWeight;

    for (const [factionKey, weight] of Object.entries(weights)) {
      if (randomRoll < weight) {
        return factionKey as FactionColor;
      }
      randomRoll -= weight;
    }

    return 'neutral';
  }

  private generateDoorsForRoom(room: SectorRoom): void {
    const gx = room.gridX;
    const gy = room.gridY;

    // 1. Link back to existing neighboring rooms that have doors pointing here
    ALL_SECTOR_DIRECTIONS.forEach(dir => {
      const oppDir = this.getOppositeDirection(dir);
      const [nx, ny] = this.getNeighborCoords(gx, gy, dir);
      const neighborKey = `${nx},${ny}`;

      if (this.roomsMap.has(neighborKey)) {
        const neighbor = this.roomsMap.get(neighborKey)!;
        if (neighbor.doors && neighbor.doors.has(oppDir)) {
          this.addDoor(room, dir);
        }
      }
    });

    // 2. Ensure minimum number of open doors per room
    const distanceFromOrigin = Math.abs(gx) + Math.abs(gy);
    const minDoors = distanceFromOrigin <= 3 ? 2 : 1;
    const randomCount = Math.floor(Math.random() * 4) + 1;
    const desiredDoorCount = Math.max(minDoors, randomCount);

    const shuffledDirs = [...ALL_SECTOR_DIRECTIONS].sort(() => Math.random() - 0.5);

    for (const dir of shuffledDirs) {
      if (room.doors.size >= desiredDoorCount) break;
      if (!room.doors.has(dir)) {
        this.addDoor(room, dir);
      }
    }
  }

  private addDoor(room: SectorRoom, dir: SectorDirection): void {
    if (!room.doors) {
      room.doors = new Map();
    }

    const door: SectorDoor = {
      direction: dir,
      isOpen: true,
      x: 0,
      y: 0,
      width: 0,
      height: 0
    };

    room.doors.set(dir, door);
  }

  public getOppositeDirection(dir: SectorDirection): SectorDirection {
    const opps: Record<SectorDirection, SectorDirection> = {
      N: 'S', NE: 'SW', E: 'W', SE: 'NW',
      S: 'N', SW: 'NE', W: 'E', NW: 'SE'
    };
    return opps[dir];
  }

  public getNeighborCoords(gx: number, gy: number, dir: SectorDirection): [number, number] {
    // Standard Cartesian orientation: UP = +Y, DOWN = -Y, LEFT = -X, RIGHT = +X
    switch (dir) {
      case 'N':  return [gx, gy + 1];
      case 'NE': return [gx + 1, gy + 1];
      case 'E':  return [gx + 1, gy];
      case 'SE': return [gx + 1, gy - 1];
      case 'S':  return [gx, gy - 1];
      case 'SW': return [gx - 1, gy - 1];
      case 'W':  return [gx - 1, gy];
      case 'NW': return [gx - 1, gy + 1];
    }
  }
}