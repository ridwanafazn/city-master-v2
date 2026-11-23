const FONT_URLS = [
  '/fonts/public-sans-latin.woff2',
  '/fonts/bricolage-grotesque-latin.woff2',
]

let installed = false

/**
 * Preload only the display/body faces used above the fold in the app shell
 * and auth screens. JetBrains Mono stays on-demand for data tables.
 */
export function preloadUiFonts(): void {
  if (installed || typeof document === 'undefined') return
  installed = true
  for (const href of FONT_URLS) {
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) continue
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.crossOrigin = 'anonymous'
    link.href = href
    document.head.append(link)
  }
}
