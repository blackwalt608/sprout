/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // App Router kullanıyorsan
    "./pages/**/*.{js,ts,jsx,tsx}", // Pages Router kullanıyorsan
    "./components/**/*.{js,ts,jsx,tsx}", // Komponentlerin için
    "./src/**/*.{js,ts,jsx,tsx}", // Eğer src klasörü kullanıyorsan
  ],
  theme: {
    extend: {
      maxWidth: {
        "8xl": "88rem",
      },
      minHeight: {
        "50vh": "50vh",
      },
    },
  },
  plugins: [],
};
