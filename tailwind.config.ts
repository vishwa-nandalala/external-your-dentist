
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        clash: ["var(--font-clash)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          teal: "#19A7A0",
          tealLight: "#5ED6D0",
          tealBg: "#F4FAFA",
          tealBgSoft: "#F3FBFB",
          navy: "#163A5F",
          coral: "#FF725E",
          coralHover: "#e86552",
        },
      },
      maxWidth: {
        site: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;