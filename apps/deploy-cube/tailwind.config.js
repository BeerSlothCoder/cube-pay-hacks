/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cubepay: {
          bg: "#0A0E1A",
          text: "#FFFFFF",
          "text-secondary": "#E0E7FF",
          accent: "#60A5FA",
          "crypto-qr": "#00D4FF",
          "virtual-card": "#7C3AED",
          "on-off-ramp": "#3B82F6",
          "ens-payment": "#F59E0B",
          disabled: "#64748B",
        },
      },
    },
  },
  plugins: [],
};
