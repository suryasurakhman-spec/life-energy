import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  presets: [require('nativewind/preset')],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm neutrals
        sand: {
          50:  '#FAF8F5',
          100: '#F3EFE9',
          200: '#E6DFD5',
          300: '#CFC5B8',
          500: '#8C8174',
          700: '#4A433B',
          800: '#2B2622',
          900: '#1A1714',
          950: '#110F0D',
        },
        // Accent — amber ("life energy")
        amber: {
          100: '#FDEFD3',
          300: '#F7C873',
          500: '#E8A13A',
          600: '#C9821F',
          700: '#9A6214',
        },
        // Support
        sage: {
          500: '#5E8C6A',
        },
        slate: {
          500: '#5B6B7F',
        },
        error: {
          500: '#C2412D',
        },
      },
      spacing: {
        xxs: '2px',
        xs:  '4px',
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '24px',
        xxl: '32px',
        xxxl:'48px',
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '24px',
        pill: '999px',
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '52px', fontWeight: '700' }],
        title1:  ['28px', { lineHeight: '34px', fontWeight: '700' }],
        title2:  ['22px', { lineHeight: '28px', fontWeight: '600' }],
        body:    ['17px', { lineHeight: '24px', fontWeight: '400' }],
        'body-strong': ['17px', { lineHeight: '24px', fontWeight: '600' }],
        callout: ['15px', { lineHeight: '20px', fontWeight: '500' }],
        caption: ['13px', { lineHeight: '18px', fontWeight: '500' }],
        chip:    ['15px', { lineHeight: '18px', fontWeight: '700' }],
      },
    },
  },
  plugins: [],
};

export default config;
