/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: 'var(--color-paper)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        surface: 'var(--color-surface)',
        'surface-raised': 'var(--color-surface-raised)',
        signal: 'var(--color-signal)',
        'signal-strong': 'var(--color-signal-strong)',
        data: 'var(--color-data)',
        success: 'var(--color-success)',
        'success-ink': 'var(--color-success-ink)',
        'success-bg': 'var(--color-success-bg)',
        danger: 'var(--color-danger)',
        'danger-bg': 'var(--color-danger-bg)',
        warning: 'var(--color-warning)',
        'warning-bg': 'var(--color-warning-bg)',
      },
      fontFamily: {
        display: ['Bricolage Grotesque', 'Public Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Public Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        data: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        // Legacy pages intentionally keep the system mono stack until phase 2.
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '0',
        DEFAULT: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
        pill: 'var(--radius-pill)',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        cta: 'var(--shadow-cta)',
        focus: 'var(--shadow-focus)',
      },
      maxWidth: {
        content: 'var(--content-max)',
      },
      transitionTimingFunction: {
        entrance: 'var(--ease-entrance)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        base: 'var(--motion-base)',
      },
    },
  },
  plugins: [],
}
