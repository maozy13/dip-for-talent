/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        ocean: "#0ea5a4",
        glow: "#f59e0b"
      },
      boxShadow: {
        halo: "0 0 0 1px rgba(15, 23, 42, 0.08), 0 25px 50px -12px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};
