# JYMZ banner assets

Generated from HTML and rendered with headless Chrome. The design follows the
`ridwanafazn.my.id` palette: cream paper, dark ink, orange signal, mono labels,
and the JYMZ neo-brutalist UI.

## Files

| File | Size | Suggested use |
|---|---|---|
| `jymz-banner-hero-1600x900.png` | 1600×900 | Project cover (16:9), case-study hero |
| `jymz-banner-hero-1600x900@2x.png` | 3200×1800 | Retina/upload master |
| `jymz-banner-og-1200x630.png` | 1200×630 | Open Graph / social card |
| `jymz-banner-og-1200x630@2x.png` | 2400×1260 | Retina/upload master |
| `jymz-banner-card-800x600.png` | 800×600 | Thumbnail / compact card |
| `jymz-banner-card-800x600@2x.png` | 1600×1200 | Retina/upload master |

The portfolio project card uses a **16:10** crop. For the cleanest result, use
the 16:9 hero as the cover and let `object-cover` crop it, or crop the hero to
1600×1000 before uploading.

## Screenshot pack

`src/pages/projects/[id].astro` renders a 16:9 cover and a 4:3 gallery. The
screens in `screens-4x3/` are ready-to-use 1440×1080 gallery candidates. The
files in `screens/` are raw 16:10 captures.

Included 4:3 candidates:

- `screens-4x3/public-engine-4x3.png`
- `screens-4x3/plan-detail-4x3.png`
- `screens-4x3/workout-detail-4x3.png`
- `screens-4x3/progress-4x3.png`
- `screens-4x3/sign-in-4x3.png`

Recommended gallery shots:

1. **Public recommendation** — `https://jymz.pages.dev/`
   - show Engine Parameters, BMI, injury constraints, equipment.
2. **Plan detail** — `/app/plans/:id`
   - show generated day, exercise cards, lock/swap, version metadata.
3. **Workout logger** — `/app/workouts/:id`
   - show sets, reps, kg, RPE, notes, summary totals.
4. **Progress Deck** — `/app/progress`
   - show totals, streak, body-part balance, personal records, insights.
5. **Feedback & safety** — plan or completed workout detail
   - show rating/difficulty form and safety report form.
6. **Onboarding / profile** — `/app/onboarding` or `/app/profile`
   - show equipment, injuries, consent, timezone.
7. **Mobile proof** — 390×844
   - Progress Deck or live workout; shows responsive behavior.

Optional: architecture/flow diagram (public engine → FastAPI → Neon → Vue app)
is better as an SVG/diagram than a screenshot.

## Capture notes

- Use the demo account and real data; do not invent metrics.
- For 4:3 gallery images, capture at 1440×1080 with the app header cropped or
  hidden so the account email is not exposed.
- Keep the same cream/ink/orange framing as the portfolio.
- Export PNG at 2x for upload; Cloudinary can downscale and convert to WebP.

## Source

Editable HTML templates are in `source/` and use relative image paths from
`screens/`. Regenerate a 1x PNG with Chrome headless:

```powershell
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' `
  --headless=new --disable-gpu --hide-scrollbars `
  --window-size=1600,900 `
  --screenshot="jymz-banner-hero-1600x900.png" `
  "file:///.../docs/assets/jymz-banners/source/banner-hero.html"
```

Use `--window-size=1200,630` for the OG variant and `800,600` for the card.
For 2x, use Chrome DevTools Protocol or Playwright with
`deviceScaleFactor: 2`.
