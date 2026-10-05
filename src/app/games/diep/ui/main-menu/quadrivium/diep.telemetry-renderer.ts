// src/app/diep/ui/main-menu/quadrivium/diep.telemetry-renderer.ts
import { Injectable } from '@angular/core';

export class DiepTelemetryRenderer {

  public static getHeight(): number {
    return 480;
  }

  /**
   * Safe visibility boundary check before drawing.
   */
  public static render(ctx: CanvasRenderingContext2D, g: any, width: number, currentScrollOffset: number, startY: number, height: number): void {
    const paneY = 100 + currentScrollOffset;
    
    // Self-contained culling optimization
    if (paneY <= startY - 500 || paneY >= height + 500) return;

    const tracker = g.diepStatsService?.stats || {
      playtime: 0,
      totalKills: 0,
      shotsFired: 0,
      shotsHit: 0,
      upgradesSpent: 0,
      gamesPlayed: 0,
      wavesConquered: 0,
      damageDealt: 0,
      factionKills: { 'Red': 0, 'Orange': 0, 'Yellow': 0, 'Green': 0, 'Blue': 0, 'Purple': 0 }
    };

    const containerW = Math.min(800, width - 120);
    const startX = (width - containerW) / 2;

    // --- PANEL 1: HISTORY MATRIX ---
    this.drawCardBackground(ctx, startX, paneY, containerW, 160);
    
    ctx.textAlign = 'left';
    ctx.font = '900 16px Inter, sans-serif';
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('PLAYER STATISTICS', startX + 25, paneY + 35);

    const accuracyRate = Math.round((tracker.shotsHit / Math.max(1, tracker.shotsFired)) * 100);
    const metrics = [
      { name: 'TIME COMBATING', value: this.formatTime(tracker.playtime) },
      { name: 'SHAPES DESTROYED', value: (tracker.totalKills || 0).toLocaleString() },
      { name: 'SHOTS FIRED', value: (tracker.shotsFired || 0).toLocaleString() },
      { name: 'SHOT ACCURACY', value: `${accuracyRate}%` },
      { name: 'UPGRADES APPLIED', value: (tracker.upgradesSpent || 0).toLocaleString() },
      { name: 'GAMES PLAYED', value: (tracker.gamesPlayed || 0).toLocaleString() },
      { name: 'WAVES CONQUERED', value: (tracker.wavesConquered || 0).toLocaleString() },
      { name: 'DAMAGE DEALT', value: Math.floor(tracker.damageDealt || 0).toLocaleString() }
    ];

    ctx.font = 'bold 11px Inter, sans-serif';
    metrics.forEach((m, idx) => {
      // 4 columns x 2 rows cleanly displays all 8 fields
      const col = idx % 4;
      const row = Math.floor(idx / 4);
      const cX = startX + 25 + col * (containerW / 4 - 5);
      const cY = paneY + 75 + row * 50;

      ctx.fillStyle = '#7f8c8d';
      ctx.fillText(m.name, cX, cY);
      
      ctx.font = '900 20px Inter, sans-serif';
      ctx.fillStyle = '#ecf0f1';
      ctx.fillText(m.value, cX, cY + 24);
      ctx.font = 'bold 11px Inter, sans-serif';
    });

    // --- PANEL 2: FACTION ATTACK LOGS ---
    const panel2Y = paneY + 190;
    this.drawCardBackground(ctx, startX, panel2Y, containerW, 250);

    ctx.textAlign = 'left';
    ctx.font = '900 16px Inter, sans-serif';
    ctx.fillStyle = '#9b59b6';
    ctx.fillText('SHAPES DESTROYED BY COLOR', startX + 25, panel2Y + 35);

    const factions = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
    const factionColors: Record<string, string> = {
      'Red': '#e74c3c', 'Orange': '#e67e22', 'Yellow': '#f1c40f',
      'Green': '#2ecc71', 'Blue': '#3498db', 'Purple': '#be7ff5'
    };

    ctx.font = 'bold 12px Inter, sans-serif';
    factions.forEach((faction, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const fX = startX + 25 + col * (containerW / 3 - 10);
      const fY = panel2Y + 80 + row * 75;

      ctx.beginPath();
      ctx.arc(fX + 6, fY - 4, 6, 0, Math.PI * 2);
      ctx.fillStyle = factionColors[faction];
      ctx.fill();

      ctx.fillStyle = '#7f8c8d';
      ctx.fillText(faction.toUpperCase(), fX + 20, fY);

      const killCount = tracker.factionKills?.[faction] || 0;

      ctx.font = '900 24px Inter, sans-serif';
      ctx.fillStyle = '#ecf0f1';
      ctx.fillText(killCount.toLocaleString(), fX + 20, fY + 28);
      ctx.font = 'bold 12px Inter, sans-serif';
    });
  }

  private static drawCardBackground(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.fillStyle = 'rgba(20, 15, 30, 0.5)';
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
  }

  private static formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}