import { Player, DiepButton } from '../../core/diep.interfaces';

/**
 * Handles the rendering and internal toggle logic for the Player's health bar.
 */
export class DiepHealthBarRenderer {
  // Private state to avoid bloating the Player interface
  private static showPercent: boolean = true;

  public static draw(ctx: CanvasRenderingContext2D, player: Player): void {
    // Safety check if the player object structure hasn't loaded yet during state swaps
    if (!player) return;

    // Force health down to exactly zero if backend ticks dipped into a floating-point negative
    const currentHealth = Math.max(0, player.health);

    const healthX = 20;
    const healthY = 20;
    const healthBarWidth = 200;
    const healthBarHeight = 20;
    
    // Clamp the ratio strictly between 0.0 and 1.0 to guarantee flawless UI rendering bounds
    const healthRatio = Math.max(0, Math.min(1, currentHealth / player.maxHealth));

    // 1. Background/Border
    ctx.fillStyle = '#34495e';
    ctx.fillRect(healthX - 2, healthY - 2, healthBarWidth + 4, healthBarHeight + 4); 

    // 2. Health Fill
    ctx.fillStyle = healthRatio > 0.75 ? '#27ae60' : 
                    healthRatio > 0.50 ? '#f1c40f' : 
                    healthRatio > 0.25 ? '#e67e22' : '#e74c3c';
    ctx.fillRect(healthX, healthY, healthBarWidth * healthRatio, healthBarHeight);
    
    // 3. Label Logic
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';

    const healthText = this.showPercent 
      ? `PLAYER HEALTH: ${Math.ceil(healthRatio * 100)}%`
      : `PLAYER HEALTH: ${Math.ceil(currentHealth)} / ${player.maxHealth}`;

    ctx.fillText(healthText, healthX + 5, healthY + 14);
  }

  /**
   * Returns a button object that maps to the health bar's visual area.
   * Satisfies the DiepButton interface requirements.
   */
  public static getButton(): DiepButton {
    return {
      id: 'health-toggle-btn', // Added required ID
      x: 20,
      y: 20,
      w: 200,
      h: 20,
      label: 'HealthToggle',
      color: 'transparent',       // Added required color
      borderColor: 'transparent', // Added required borderColor
      action: () => {
        this.showPercent = !this.showPercent;
      }
    };
  }
}