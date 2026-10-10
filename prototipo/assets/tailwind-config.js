// Configurazione Tailwind del prototipo.
// Va caricata SUBITO DOPO il CDN di Tailwind e PRIMA del contenuto della pagina.
tailwind.config = {
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F7',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#17161A',
          soft: '#5C5A62',
          faint: '#8F8C95',
        },
        line: {
          DEFAULT: '#E7E4DE',
          strong: '#D5D1C9',
        },
        accent: {
          DEFAULT: '#D9411E',
          ink: '#A32F10',
          soft: '#FCEFEA',
        },
        ok: {
          DEFAULT: '#1E8A50',
          soft: '#EAF5EE',
        },
        warn: {
          DEFAULT: '#A9750F',
          soft: '#FBF3E2',
        },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(23, 22, 26, 0.05)',
        pop: '0 16px 40px -12px rgba(23, 22, 26, 0.22)',
      },
    },
  },
};
