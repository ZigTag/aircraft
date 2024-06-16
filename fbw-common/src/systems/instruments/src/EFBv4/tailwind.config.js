'use strict';

const fallbacks = [
  'NotoSansJP',
  'NotoSansSC',
  'NotoSansKR',
  'NotoSansArabic',
  'NotoSansThai',
  'NotoSansHebrew',
  'NotoSansDevanagari',
];

module.exports = {
  mode: 'jit',
  content: [
    // THOSE PATHS ARE RELATIVE TO fbw-a32nx/ AT THE MOMENT. This should be fixed at some point in the future
    './**/*.{jsx,tsx}',
    '../fbw-common/**/*.{jsx,tsx}',
  ],
  theme: {
    extend: {
      width: () => ({
        'inr-tk': '13.45rem',
        'out-tk': '5.25rem',
      }),
      height: () => ({
        'content-section-reduced': '54rem',
        'content-section-full': '57.25rem',
      }),
      inset: () => ({
        'ctr-tk-y': '18.75rem',
        'inn-tk-y': '14.5rem',
        'inn-tk-l': '31.5rem',
        'inn-tk-r': '24.75rem',
        'out-tk-y': '12.75rem',
        'out-tk-l': '26.25rem',
        'out-tk-r': '19.5rem',
        'overlay-b-y': '10.25rem',
        'overlay-bl': '22.5rem',
        'overlay-br': '15.5rem',
        'overlay-t-y': '18rem',
        'overlay-tl': '21rem',
        'overlay-tr': '14rem',
      }),
      rotate: () => ({
        '18.5': '18.5deg',
        '-18.5': '-18.5deg',
        '26.5': '26.5deg',
        '-26.5': '-26.5deg',
      }),
      colors: () => ({
        'theme-highlight': 'rgba(var(--color-highlight), <alpha-value>)',
        'theme-body': 'rgba(var(--color-body), <alpha-value>)',
        'theme-text': 'rgba(var(--color-text), <alpha-value>)',
        'theme-unselected': 'rgba(var(--color-unselected), <alpha-value>)',
        'theme-secondary': 'rgba(var(--color-secondary), <alpha-value>)',
        'theme-statusbar': 'rgba(var(--color-statusbar), <alpha-value>)',
        'theme-accent': 'rgba(var(--color-accent), <alpha-value>)',
        cyan: {
          DEFAULT: '#00E0FE',
          medium: '#00C4F5',
        },
        utility: {
          red: 'var(--color-utility-red)',
          green: 'var(--color-utility-green)',
          orange: 'var(--color-utility-orange)',
          amber: 'var(--color-utility-amber)',
          blue: 'var(--color-utility-blue)',
          purple: 'var(--color-utility-purple)',
          pink: 'var(--color-utility-pink)',
          salmon: 'var(--color-utility-salmon)',
          grey: 'var(--color-utility-grey)',
          'dark-grey': 'var(--color-utility-dark-grey)',
        },
      }),
      maxWidth: { '1/2': '50%' },
    },
    fontFamily: {
      mono: ['JetBrains Mono', ...fallbacks],
      body: ['Inter', ...fallbacks],
      title: ['Manrope', ...fallbacks],
      rmp: ['AirbusRMP'],
    },
  },
  // eslint-disable-next-line global-require
  plugins: [require('@flybywiresim/tailwind-config')],
};
