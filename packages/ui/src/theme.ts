/**
 * CubePay Design System Theme
 * Black & Cream color palette
 */

export const theme = {
  colors: {
    // Primary colors
    bgBlack: "#1a1a1a",
    textCream: "#f5f5dc",
    cubeBlue: "#0066cc",

    // Accent colors
    accentGold: "#ffd700",
    accentGreen: "#00ff88",
    errorRed: "#ff4444",

    // Gradients
    gradientGold: "linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)",
    gradientBlue: "linear-gradient(135deg, #0066cc 0%, #0044aa 100%)",

    // UI elements
    border: "#f5f5dc33", // Cream with 20% opacity
    borderHover: "#f5f5dc66", // Cream with 40% opacity
    overlay: "#1a1a1aee", // Black with 93% opacity

    // Payment face colors
    faceBlue: "#0066cc", // Crypto QR
    faceTeal: "#00aa88", // Sound Pay
    facePurple: "#8800aa", // Voice Pay
    faceOrange: "#aa6600", // Virtual Card
    faceCyan: "#00aacc", // ENS Payment
    faceMagenta: "#cc0066", // On-Ramp
  },

  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
  },

  borderRadius: {
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    full: "9999px",
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    glow: "0 0 20px rgba(0, 102, 204, 0.5)", // Blue glow
    goldGlow: "0 0 20px rgba(255, 215, 0, 0.5)", // Gold glow
  },

  transitions: {
    fast: "150ms ease-in-out",
    base: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },
} as const;

export type Theme = typeof theme;
