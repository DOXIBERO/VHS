/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bodycam: {
          dark: "#0b0c10",
          card: "#12131a",
          border: "#1f2230",
          accent: "#45f3ff",
          rec: "#ff2e2e",
          green: "#00ff66",
          amber: "#ffb703"
        }
      },
      fontFamily: {
        mono: ["Consolas", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}
