/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Outfit"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#2563eb',
                    light: '#60a5fa',
                    dark: '#1e40af',
                },
                'app-bg': '#F8FAFC',
                'text-main': '#1e293b',
                'text-muted': '#64748b',
            },
            borderRadius: {
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'medium': '0 10px 25px -3px rgba(0, 0, 0, 0.08)',
                'floating': '0 20px 30px -10px rgba(37, 99, 235, 0.3)', // Blue-ish shadow for floating elements
                'glow': '0 0 15px rgba(37, 99, 235, 0.3)',
            },
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                'gradient-surface': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
            },
            animation: {
                'enter-up': 'enter-up 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                'scale-in': 'scale-in 0.2s ease-out forwards',
            },
            keyframes: {
                'enter-up': {
                    '0%': { opacity: '0', transform: 'translateY(15px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
