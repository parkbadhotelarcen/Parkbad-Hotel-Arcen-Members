import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        landal: {
          50: "#eef8f5",
          100: "#d6eee8",
          600: "#006c67",
          700: "#005651",
          800: "#003f3d",
          900: "#01312f",
        },
        cream: "#fbf8ef",
        gold: "#bf8f2e",
        bronze: "#a66b3f",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0, 63, 61, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
