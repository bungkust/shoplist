/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Branding Colors
                primary: '#3880ff',
                secondary: '#3dc2ff',
                danger: '#eb445a',
                success: '#2dd36f',

                // Backgrounds
                'app-bg': '#f4f5f8',
                'card-bg': '#ffffff',

                // Typography
                'text-main': '#111827',
                'text-muted': '#6b7280',
            },
            borderRadius: {
                'xl': '16px', // Standar radius kartu kita
                '2xl': '24px', // Radius untuk modal
            },
            boxShadow: {
                // Bayangan lembut "Smooth Look"
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'float': '0 10px 25px -5px rgba(56, 128, 255, 0.3)', // Bayangan untuk FAB
            }
        },
    },
    plugins: [],
}
