/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cyber blue palette
                'cyber': {
                    50: '#e6f7ff',
                    100: '#bae7ff',
                    200: '#91d5ff',
                    300: '#69c0ff',
                    400: '#40a9ff',
                    500: '#1890ff',
                    600: '#096dd9',
                    700: '#0050b3',
                    800: '#003a8c',
                    900: '#002766',
                },
                // Neon accents
                'neon': {
                    blue: '#00aaff',
                    cyan: '#00ffaa',
                    purple: '#aa00ff',
                    pink: '#ff00aa',
                    orange: '#ff6600',
                }
            },
            fontFamily: {
                'orbitron': ['Orbitron', 'sans-serif'],
                'rajdhani': ['Rajdhani', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glitch': 'glitch 1s linear infinite',
                'scan': 'scan 2s linear infinite',
            },
            keyframes: {
                glitch: {
                    '0%, 100%': { transform: 'translate(0)' },
                    '33%': { transform: 'translate(-2px, 2px)' },
                    '66%': { transform: 'translate(2px, -2px)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100%)' },
                }
            },
            boxShadow: {
                'glow-blue': '0 0 20px rgba(0, 170, 255, 0.5)',
                'glow-cyan': '0 0 20px rgba(0, 255, 170, 0.5)',
                'glow-red': '0 0 20px rgba(255, 51, 0, 0.5)',
            }
        },
    },
    plugins: [],
}
