// src/app/diep/engine/subsystems/player/collectibles/mods/heavy-plating.mod.ts
import { InventoryItem } from '../../../../../core/diep.interfaces';

export const HeavyPlatingMod: InventoryItem = {
  id: 'heavy_plating',
  name: 'Heavy Plating',
  description: 'Thick, reinforced hull reinforcement modules. Increases max health by 10% when equipped.',
  quantity: 1,
  maxStack: 1,
  type: 'CHASSIS_PERK',
  drawIllustration: (ctx, x, y, size, frame) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    ctx.save();
    
    // Outer Heavy Frame
    ctx.fillStyle = '#566573';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - 20, cy - 20, 40, 40, 4);
    ctx.fill();
    ctx.stroke();

    // Inner Layered Plate
    ctx.fillStyle = '#78909c';
    ctx.strokeStyle = '#37474f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 14, cy - 14, 28, 28, 2);
    ctx.fill();
    ctx.stroke();

    // Center Emblem (Shield/Armor Chevron)
    ctx.fillStyle = '#b0bec5';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 6);
    ctx.lineTo(cx + 8, cy - 6);
    ctx.lineTo(cx, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Rivets/Bolts in corners
    ctx.fillStyle = '#2c3e50';
    const offsets = [-16, 12];
    offsets.forEach(ox => {
      offsets.forEach(oy => {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + oy, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.restore();
  }
};