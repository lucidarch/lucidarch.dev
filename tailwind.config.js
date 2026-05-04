module.exports = {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./hugo_stats.json",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
