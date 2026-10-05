import { HighScore } from '../../core/diep.interfaces';

export class DiepHighScoreRenderer {
  public static drawList(
    ctx: CanvasRenderingContext2D, 
    listCenterX: number, 
    listTitleY: number, 
    topScores: HighScore[], 
    highlightScore: number | null, 
    titleColor: string
  ): void {
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = titleColor;
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORES', listCenterX, listTitleY);

    let listY = listTitleY + 35;
    
    if (!topScores || topScores.length === 0) {
      ctx.font = '16px Inter, sans-serif';
      ctx.fillStyle = '#bdc3c7';
      ctx.fillText('No Scores Yet', listCenterX, listY);
    } else {
      const scoreRightX = listCenterX - 15;
      const dateLeftX = listCenterX + 15;

      topScores.forEach((scoreEntry: HighScore) => {
        const isHighlighted = (highlightScore !== null && scoreEntry.score === highlightScore);
        
        ctx.font = isHighlighted ? 'bold 20px Inter, sans-serif' : 'bold 16px Inter, sans-serif';
        ctx.fillStyle = isHighlighted ? '#FFD700' : '#FFF';
        
        // Score
        ctx.textAlign = 'right';
        ctx.fillText(scoreEntry.score.toString(), scoreRightX, listY);
        
        // Date
        ctx.textAlign = 'left';
        ctx.fillText(
          new Date(scoreEntry.date).toLocaleDateString('en-US', {
            month: 'numeric', 
            day: 'numeric', 
            year: '2-digit'
          }), 
          dateLeftX, 
          listY
        );
        
        listY += 25;
      });
    }
    ctx.textAlign = 'center'; // Reset alignment
  }
}