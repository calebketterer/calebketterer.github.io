// src/app/diep/engine/subsystems/player/collectibles/mods/plasma-thruster.mod.ts
import { InventoryItem } from '../../../../../core/diep.interfaces';

export const PlasmaThrusterMod: InventoryItem = {
  id: 'plasma_thruster',
  name: 'Plasma Thruster',
  description: 'A customized engine nozzle that emits glowing neon heat trails. Increases fire rate by 10% when equipped.',
  quantity: 1,
  maxStack: 1,
  type: 'CHASSIS_PERK',
  drawIllustration: (ctx, x, y, size, frame) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    const pulse = Math.sin(frame * 0.08) * 4;

    // Core Thruster nozzle housing
    ctx.fillStyle = '#7f8c8d';
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy + 10);
    ctx.lineTo(cx + 15, cy + 10);
    ctx.lineTo(cx + 8, cy - 15);
    ctx.lineTo(cx - 8, cy - 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Plasma Fire plume output
    ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
    ctx.beginPath();
    ctx.arc(cx, cy + 16, 8 + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy + 14, 4 + pulse * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
};