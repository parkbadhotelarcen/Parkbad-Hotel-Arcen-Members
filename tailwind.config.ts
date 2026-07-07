import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        landal: {
          50: "#edfafa",
          100: "#d2f1ef",
          200: "#a8dfdc",
          500: "#008c8c",
          600: "#007a78",
          700: "#00625f",
          800: "#004c49",
          900: "#003836",
        },
        cream: "#fbfaf5",
        mist: "#f4fbfa",
        gold: "#c69a3d",
        bronze: "#a97045",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0, 76, 73, 0.10)",
        card: "0 14px 38px rgba(0, 76, 73, 0.08)",
        wallet: "0 24px 70px rgba(0, 76, 73, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
