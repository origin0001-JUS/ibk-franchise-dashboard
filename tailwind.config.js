/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'ibk-navy': '#06409E',
                'ibk-blue': '#2b6cee',
                'glass-white': 'rgba(255, 255, 255, 0.7)',
                'glass-border': 'rgba(255, 255, 255, 0.5)',
            },
            backdropBlur: {
                'xs': '2px',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 15px rgba(6, 64, 158, 0.2)',
            }
        },
    },
    plugins: [],
}
