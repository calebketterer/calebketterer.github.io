export interface FlashmathThemeColors {
  primary: string;   // Hacker Neon Green
  secondary: string; // Tron Cyan
  accent: string;    // Cyberpunk Magenta
  warning: string;   // Amber / Gold
  [key: string]: string;
}

export const FLASHMATH_CONFIG = {
  COLOR_COUNT: 4,
  COLORS: {
    primary: '#00ff66',   // Hacker Neon Green
    secondary: '#00e5ff', // Tron Cyan
    accent: '#ff007f',    // Cyberpunk Magenta
    warning: '#ffe600'    // Amber / Gold
  } as FlashmathThemeColors,
  MIN_VAL: -50,
  MAX_VAL: 50
};