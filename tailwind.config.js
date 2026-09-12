/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-stable": "#16a34a",
        "text-stable": "#166534",
        "bg-review": "#f59e0b",
        "text-review": "#92400e",
        "bg-attention": "#dc2626",
        "text-attention": "#991b1b",
      },
    },
  },
  plugins: [],
};
