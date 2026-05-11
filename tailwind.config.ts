import type { Config } from "tailwindcss";

export default {
  content: ["./src/components/**/*.{ts,tsx}", "./src/stories/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
