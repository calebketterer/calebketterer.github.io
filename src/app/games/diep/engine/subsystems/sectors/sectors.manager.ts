// src/app/diep/engine/subsystems/sectors/sectors.manager.ts
import { Injectable } from '@angular/core';
import { GameSystem } from '../../../core/diep.interfaces';
import { SectorsRoomDirector } from './sectors.room-director';
import { SectorDirection } from './sectors.interfaces';
import { SectorsEnemySpawnerService } from './sectors.enemy-spawner';

@Injectable({ providedIn: 'root' })
export class SectorsManagerService implements GameSystem {
  public showDebugMap = false;
  private transitionCooldown = 0;

  constructor(
    public roomDirector: SectorsRoomDirector,
    private sectorsSpawner: SectorsEnemySpawnerService
  ) {}

  public init(width: number, height: number): void {
    this.roomDirector.reset();
    this.transitionCooldown = 0;
  }

  public update(engine: any, tick: number, ms: number): void {
    if (engine.currentMode !== 'SECTORS' || !engine.isGameStarted) return;

    if (this.transitionCooldown > 0) {
      this.transitionCooldown -= ms;
    }

    const currentRoom = this.roomDirector.currentRoom;

    // Sync active room enemy array with engine's active enemy list
    if (engine.enemies.length === 0 && !(currentRoom.gridX === 0 && currentRoom.gridY === 0)) {
      currentRoom.isCleared = true;
      currentRoom.enemies = [];
    } else {
      currentRoom.enemies = engine.enemies;
    }

    // Tick background respawns for ALL discovered rooms
    this.roomDirector.rooms.forEach((room) => {
      const isCurrent = room.gridX === this.roomDirector.currentGridX && 
                        room.gridY === this.roomDirector.currentGridY;
      
      // Update background rooms only (isCurrent = true will strictly block active room spawns)
      this.sectorsSpawner.updateRespawns(engine, room, ms, isCurrent);
    });

    const player = engine.playerService?.player;
    if (!player) return;

    if (this.transitionCooldown <= 0) {
      this.checkDoorTransitions(engine, player, engine.width, engine.height);
    }
  }

  private checkDoorTransitions(engine: any, player: any, width: number, height: number): void {
    const room = this.roomDirector.currentRoom;

    room.doors.forEach((door) => {
      if (!door.isOpen) return;

      const dist = Math.hypot(player.x - door.x, player.y - door.y);
      if (dist < 35) {
        this.transitionToRoom(engine, player, door.direction, width, height);
      }
    });
  }

  private transitionToRoom(engine: any, player: any, dir: SectorDirection, width: number, height: number): void {
    const currentRoom = this.roomDirector.currentRoom;

    this.sectorsSpawner.saveRoomState(currentRoom, engine.enemies);

    const [nx, ny] = this.roomDirector.getNeighborCoords(
      this.roomDirector.currentGridX, 
      this.roomDirector.currentGridY, 
      dir
    );

    this.roomDirector.currentGridX = nx;
    this.roomDirector.currentGridY = ny;

    const newRoom = this.roomDirector.currentRoom;

    this.transitionCooldown = 500;
    engine.bullets = [];

    engine.enemies = this.sectorsSpawner.loadOrSpawnRoomEnemies(
      engine.enemies,
      newRoom,
      width,
      height
    );

    const oppDir = this.roomDirector.getOppositeDirection(dir);
    this.repositionPlayerAtDoor(player, oppDir, width, height);
  }

  private repositionPlayerAtDoor(player: any, entryDoorDir: SectorDirection, width: number, height: number): void {
    const margin = 80;
    switch (entryDoorDir) {
      case 'N':  player.x = width / 2; player.y = margin; break;
      case 'NE': player.x = width - margin; player.y = margin; break;
      case 'E':  player.x = width - margin; player.y = height / 2; break;
      case 'SE': player.x = width - margin; player.y = height - margin; break;
      case 'S':  player.x = width / 2; player.y = height - margin; break;
      case 'SW': player.x = margin; player.y = height - margin; break;
      case 'W':  player.x = margin; player.y = height / 2; break;
      case 'NW': player.x = margin; player.y = margin; break;
    }
  }
}