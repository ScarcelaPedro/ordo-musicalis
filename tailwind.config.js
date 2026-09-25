const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Tokens semânticos do Design System (docs/design-system.md) — ver
      // docs/decisions/0001-mapeamento-tokens-cor-tailwind.md para o porquê de cada alias.
      // As cinco cores litúrgicas do calendário (Dashboard.vue, CORES_LITURGICAS_CLASSES)
      // são uma categoria à parte e não entram aqui.
      colors: {
        // Azul profundo/mariano calibrado a partir da referência visual da SPEC-003.1 --
        // substitui `colors.indigo` (ver docs/decisions/0003-*.md). Contraste AA validado.
        primary: {
          50: '#f1f5fb',
          100: '#e2eaf6',
          200: '#c5d5ec',
          300: '#9bb6dc',
          400: '#6f93c8',
          500: '#4a73b0',
          600: '#2f5a98',
          700: '#244a80',
          800: '#1e3d6b',
          900: '#1a3259',
          950: '#11213d',
        },
        secondary: colors.stone,
        accent: colors.amber,
        neutral: colors.stone,
        success: colors.green,
        warning: colors.yellow,
        danger: colors.red,
        info: colors.blue,
        // Theme-aware page background (CSS variable in src/assets/app.css, switched by `.dark`).
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
      },
      boxShadow: {
        // Elevation 1 for cards (SPEC-003.1 reference): soft, slightly blue-tinted shadow.
        card: '0 1px 2px rgb(17 33 61 / 0.04), 0 4px 16px rgb(17 33 61 / 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Uso restrito a conteúdo litúrgico em texto corrido (já usado isoladamente em
        // liturgia/Show.vue) — não é a fonte padrão do sistema.
        serif: ['"EB Garamond"', 'Georgia', '"Times New Roman"', 'serif'],
      },
      // Escala tipográfica de 9 níveis (docs/design-system.md, seção 3). Aditiva: os tamanhos
      // padrão do Tailwind (text-xs, text-sm...) continuam disponíveis sem alteração.
      fontSize: {
        display: ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        h1: ['1.875rem', { lineHeight: '1.25', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['1.25rem', { lineHeight: '1.35', fontWeight: '600' }],
        h4: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
        label: ['0.75rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
