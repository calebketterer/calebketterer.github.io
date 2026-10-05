// src/app/diep/engine/subsystems/player/collectibles/mods/cyclone-barrel.mod.ts
import { InventoryItem } from '../../../../../core/diep.interfaces';

export const CycloneBarrelMod: InventoryItem = {
  id: 'cyclone_barrel',
  name: 'Cyclone Barrel',
  description: 'A heavy, reinforced dual-bore assembly built to spiral fire. Increases bullet damage by 10% when equipped.',
  quantity: 1,
  maxStack: 1,
  type: 'ATTACHMENT',
  drawIllustration: (ctx, x, y, size, frame) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    const rotation = (frame * 0.04) % (Math.PI * 2);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.fillStyle = '#95a5a6';
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;

    // Render two split offset barrel layouts
    ctx.fillRect(-14, -18, 8, 36);
    ctx.strokeRect(-14, -18, 8, 36);

    ctx.fillRect(6, -18, 8, 36);
    ctx.strokeRect(6, -18, 8, 36);

    // Central node anchor ring
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};