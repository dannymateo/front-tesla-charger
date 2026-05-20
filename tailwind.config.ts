import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tesla: {
          red: "#E82127",
          dark: "#000000",
          gray: "#393C41",
          light: "#F4F4F4",
          blue: "#3E6AE1",
        },
      },
      backgroundImage: {
        "tesla-gradient":
          "radial-gradient(ellipse 80% 60% at 50% -30%, rgba(232, 33, 39, 0.14), transparent), radial-gradient(ellipse 50% 40% at 100% 50%, rgba(62, 106, 225, 0.07), transparent), radial-gradient(ellipse 45% 35% at 0% 85%, rgba(232, 33, 39, 0.06), transparent)",
      },
      letterSpacing: {
        tesla: "0.22em",
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#E82127",
              foreground: "#FFFFFF",
            },
            danger: {
              DEFAULT: "#E82127",
              foreground: "#FFFFFF",
            },
            focus: "#E82127",
          },
        },
      },
    }),
  ],
};

export default config;
