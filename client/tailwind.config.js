/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          500: "#74DEDE",
        },
        secondary: {
          500: "#54A2A3",
        },
      },
      maxWidth: {
        feed: "600px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
