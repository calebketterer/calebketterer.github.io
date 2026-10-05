// src/app/diep/engine/subsystems/player/collectibles/mods/nanoporous-pixels.mod.ts
import { InventoryItem } from '../../../../../core/diep.interfaces';

export const NanoporousPixelsMod: InventoryItem = {
  id: 'nanoporous_pixels',
  name: 'Nanoporous Pixels',
  description: 'Bio-synthetic matrix filaments that accelerate lattice reconstruction. Doubles health regeneration when equipped.',
  quantity: 1,
  maxStack: 1,
  type: 'CHASSIS_PERK',
  drawIllustration: (ctx, x, y, size, frame) => {
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    ctx.save();

    // Outer Circuit/Grid Container
    ctx.fillStyle = '#111116';
    ctx.strokeStyle = '#27ae60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy - 22, 44, 44, 8);
    ctx.fill();
    ctx.stroke();

    // Neon Grid Matrix
    ctx.strokeStyle = 'rgba(46, 204, 113, 0.2)';
    ctx.lineWidth = 1;
    
    // Draw micro grid lines
    for (let i = -14; i <= 14; i += 7) {
      ctx.beginPath();
      ctx.moveTo(cx + i, cy - 15);
      ctx.lineTo(cx + i, cy + 15);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + i);
      ctx.lineTo(cx + i + 15, cy + i);
      ctx.stroke();
    }

    // Glowing Nano-Nodes (Pulsing color shift)
    const pulseGlow = Math.abs(Math.sin(frame * 0.05));
    ctx.fillStyle = `rgba(46, 204, 113, ${0.4 + pulseGlow * 0.6})`;
    
    const nodes = [
      { nx: -10, ny: -10 }, { nx: 10, ny: -10 },
      { nx: 0, ny: 0 },
      { nx: -10, ny: 10 }, { nx: 10, ny: 10 }
    ];

    nodes.forEach(n => {
      ctx.beginPath();
      ctx.roundRect(cx + n.nx - 3, cy + n.ny - 3, 6, 6, 1);
      ctx.fill();
    });

    // Central core connector paths
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    ctx.restore();
  }
};