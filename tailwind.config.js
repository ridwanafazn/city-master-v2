/** @type {import('tailwindcss').Config} */
export default {
  // Ini yang tadi kosong, sekarang kita arahkan Tailwind untuk membaca semua file Vue kita
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mengunci semua sudut menjadi tajam (Neo-Brutalism)
      borderRadius: {
        'none': '0',
        'sm': '0',
        'DEFAULT': '0',
        'md': '0',
        'lg': '0',
        'xl': '0',
        '2xl': '0',
        '3xl': '0',
        'full': '0',
      },
      // Menggunakan font teknis
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      // Ini dia biang keroknya: kita harus mendefinisikan border-3 secara manual
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}