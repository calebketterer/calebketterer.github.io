// src/app/diep/ui/main-menu/quadrivium/diep.morphology-renderer.ts
import { EnemyRegistry } from '../../../enemies/enemy.registry';
import { EnemyType } from '../../../core/diep.interfaces';

export class DiepMorphologyRenderer {

  public static getHeight(sortedTypes: EnemyType[]): number {
    const colCount = 2;
    const rowSpacing = 110;
    const totalRows = Math.ceil(sortedTypes.length / colCount);
    return totalRows * rowSpacing;
  }

  public static render(
    ctx: CanvasRenderingContext2D,
    sortedTypes: EnemyType[],
    width: number,
    height: number,
    startY: number,
    currentScrollOffset: number,
    rotation: number
  ): void {
    const colCount = 2;
    const rowSpacing = 110;
    const colWidth = (width - 120) / colCount;

    sortedTypes.forEach((type, index) => {
      const col = index % colCount;
      const row = Math.floor(index / colCount);
      const x = 60 + (col * colWidth);
      const y = 140 + currentScrollOffset + (row * rowSpacing);

      if (y < startY - 150 || y > height + 150) return;
      
      this.drawEntry(ctx, type, x, y, colWidth - 20, rotation);
    });
  }

  public static drawEntry(ctx: CanvasRenderingContext2D, type: EnemyType, x: number, y: number, w: number, rotation: number): void {
    const meta = EnemyRegistry.getMetadata(type);
    const defaultStats = EnemyRegistry.getDefaultStats(type);
    
    ctx.save();
    ctx.translate(x + 35, y);
    ctx.rotate(rotation);
    const dummy: any = { 
        x: 0, y: 0, radius: 24, color: defaultStats.color, 
        health: 100, maxHealth: 100, type: type 
    };
    try { EnemyRegistry.draw(ctx, dummy, {} as any, []); } catch (e) {}
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText(meta.name, x + 85, y - 10);

    ctx.font = '900 11px Inter, sans-serif';
    ctx.fillStyle = this.getFactionColor(meta.faction);
    ctx.fillText(meta.faction.toUpperCase(), x + 85, y + 8);

    ctx.font = '13px Inter, sans-serif';
    ctx.fillStyle = '#7f8c8d';
    
    const maxWidth = w - 95; 
    const lineHeight = 16;
    const lines = this.getLines(ctx, meta.description, maxWidth);

    lines.slice(0, 3).forEach((line, i) => {
      let textToDraw = line;
      if (i === 2 && lines.length > 3) textToDraw += "...";
      ctx.fillText(textToDraw, x + 85, y + 28 + (i * lineHeight));
    });
  }

  private static getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  private static getFactionColor(faction: string): string {
    const colors: Record<string, string> = {
      'Red': '#e74c3c', 'Orange': '#e67e22', 'Yellow': '#f1c40f',
      'Green': '#2ecc71', 'Blue': '#3498db', 'Indigo': '#3f51b5', 'Violet': '#9b59b6'
    };
    return colors[faction] || '#7f8c8d';
  }
}