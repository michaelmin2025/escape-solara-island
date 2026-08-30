import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        solara: {
          ink: "#16333d",
          paper: "#f8f1de",
          paper2: "#eee3c9",
          sea: "#0e7a94",
          deep: "#0a5468",
          lagoon: "#2fb6ae",
          foam: "#c2ece3",
          sand: "#e9d6a6",
          sun: "#e2a23c",
          coral: "#d95f43",
          pine: "#417457",
          olive: "#8b955b",
          night: "#0c2e38"
        }
      },
      boxShadow: {
        panel: "0 12px 34px rgba(22, 51, 61, .14)",
        pop: "0 24px 70px rgba(10, 40, 50, .3)"
      }
    }
  },
  plugins: []
};

export default config;
