/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CubePay Brand Colors
        primary: "#0099FF", // CubePay Blue
        "cube-green": "#00FF88", // Bright green from cube
        "cube-glow": "#00CC66", // Darker green for accents
        secondary: "#764BA2",
        success: "#00AA00",
        error: "#FF0000",
        warning: "#FFA500",
        neutral: "#F5F5F5",
        "text-primary": "#1A1A1A",
        "text-secondary": "#666666",
        "dark-bg": "#0A0F1C", // Dark background like branding
        "dark-card": "#1A1F2E", // Card backgrounds
        // Crypto Colors
        bitcoin: "#F7931A",
        ethereum: "#627EEA",
        usdc: "#2775CA",
        solana: "#14F195",
        matic: "#8247E5",
        arbitrum: "#28A0F0",
        base: "#0052FF",
        avalanche: "#E84142",
        bnb: "#F3BA2F",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 24px rgba(0,0,0,0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-gentle": "bounceGentle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
    },
  },
  plugins: [],
};
