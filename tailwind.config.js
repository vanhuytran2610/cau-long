/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        primaryBold: ["InterTight-Bold"],
        primaryMedium: ["InterTight-Medium"],
        primaryRegular: ["InterTight-Regular"],
      },
      rotate: {
        30: "30deg",
        20: "20deg",
        25: "25deg",
      },
      screens: {
        xs: "400px",
      }
    },
  },
  plugins: [],
}

