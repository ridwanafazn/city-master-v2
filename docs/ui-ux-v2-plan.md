# JYMZ UI/UX & Performance v2 — plan

Status: **planned, not started**  
Last updated: **2026-11-23**  
Branch to use when implementation starts: `feat/ui-v2`  
Scope: **all pages**, including the public recommendation flow.

## 1. Locked decisions

| Decision | Choice |
|---|---|
| Visual direction | **A. Signal Editorial** |
| Scope | Authenticated app + auth/onboarding + public flow |
| Dark mode | **Not in v2** |
| Railway cold start | Keep Railway Free; handle it with explicit UX |
| Icon set | **Lucide** line icons |
| Feature milestones | M6 and M7 deferred indefinitely |
| Implementation start | Only after this plan is reviewed |

## 2. Why this overhaul

The current app is functionally complete through M5, but the interface still
reads like an engineering demo:

- the whole body uses monospace;
- nearly every card uses a thick border and hard offset shadow;
- uppercase labels and milestone badges dominate the visual hierarchy;
- Home exposes backend URL, dataset, rate limit, and milestone checklists;
- primary actions compete with secondary and diagnostic actions;
- loading and cold-start states are inconsistent;
- components are page-local instead of a shared design system;
- motion is mostly absent, so state changes feel abrupt.

The goal is not to remove JYMZ's identity. The goal is to turn the console
aesthetic into a confident, readable product.

## 3. Goals and non-goals

### Goals

- Make the app feel fast, calm, and intentional.
- Preserve the JYMZ identity: ink, paper, orange signal, technical detail.
- Create a shared component and token system.
- Make mobile the first-class experience.
- Improve hierarchy and reduce visual noise.
- Make loading, empty, error, offline, and cold-start states explicit.
- Keep all M0–M5 functionality and API contracts intact.
- Improve perceived performance, not just benchmark numbers.

### Non-goals

- No M6 or M7 feature work.
- No dark mode in v2.
- No new backend features or schema changes.
- No charting library unless custom SVG is insufficient.
- No PWA/service worker in the first pass.
- No native mobile app.
- No replacement of the recommendation engine.

## 4. Visual direction: Signal Editorial

Signal Editorial is a refined neo-brutalist/editorial hybrid:

- warm paper background instead of blue-gray slate;
- ink typography with strong display hierarchy;
- orange used as a signal, not decoration;
- thin borders and subtle shadows for most surfaces;
- offset shadows reserved for the primary CTA or hero moments;
- editorial ledger composition: tables, rules, and specimens before card
  grids; cards only for units that genuinely stand alone;
- mono type only for data, units, IDs, timestamps, and short metadata labels.

It should feel like a **training field manual** designed by an engineer, not a
SaaS dashboard with forms and not a terminal with cards.

The binding detail lives in [`DESIGN.md`](../DESIGN.md). In particular:

- no eyebrow/kicker above headings;
- no decorative section numbers;
- no colored left border on cards or status messages;
- no grid texture in a hero unless a real measuring tool/blueprint sits under
  it;
- no four equal stat cards as page structure;
- no nested cards;
- no mono paragraphs, emoji icons, gradient text, or fake CTAs in docs;
- Signal `#D9480F` is an accent; text and CTAs use `#C2410C` (AA on paper).

### Palette

```text
Paper        #F8F7F4
Ink          #14160F
Muted        #5A5E4E
Line         #D9DED1
Surface      #F1F2EC
Signal       #D9480F
Signal dark  #C2410C
Data blue    #2563EB
Success      #4D7C0F
Success bg   #E8F5E1
Danger       #B42318
Warning      #B45309
```

Rules:

- Orange is for primary actions, active state, and key data.
- Blue is for metric/data emphasis, not every button.
- Green is reserved for readiness/streak/success.
- Use 1px borders for normal cards.
- Use `box-shadow: 0 1px 2px rgba(20,22,15,.06)` for elevation.
- Offset shadow (`4px 4px 0`) only on primary CTA/hero.
- Do not use gradients except a very subtle paper texture/grid in hero areas.

### Typography

- **Bricolage Grotesque** — page titles, hero numbers, display.
- **Public Sans** — body, forms, descriptions.
- **JetBrains Mono** — labels, tables, timestamps, data units.

Rules:

- Self-host variable fonts; no Google Fonts runtime dependency.
- Subset to Latin; preload only the weights used above the fold.
- Body text minimum 15px on mobile, 16px on desktop.
- Uppercase only for short labels, never paragraphs.
- Use tabular numbers for stats and set tables.

### Shape and spacing

- Radius: `12px` cards, `10px` inputs/buttons, `999px` pills.
- Grid: 12 columns, max width `1240px`.
- Spacing: 8pt scale (`4, 8, 12, 16, 24, 32, 48, 64`).
- Mobile padding: `16px`; desktop: `24–32px`.
- Touch targets: minimum `44×44px`.

## 5. Component system

Create `src/styles/tokens.css` plus a small `src/components/ui-v2/`
inventory. Do not keep styling every page from scratch.

### Primitives

- `AppButton` — primary, secondary, ghost, danger; loading state.
- `IconButton` — Lucide icon, accessible label.
- `Card` — default, interactive, elevated.
- `SectionHeader` — title, description, action slot.
- `StatTile` — value, label, trend, icon.
- `Badge` / `Chip` — status, filter, equipment, injury.
- `Input`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`.
- `Tabs` / `SegmentedControl`.
- `Sheet` — mobile action/confirm panel.
- `Dialog` — desktop confirm.
- `Toast` — success/error/offline.
- `Skeleton`.
- `EmptyState`.
- `ErrorState` — message, request ID, retry.
- `ServerWakeBanner` — cold-start state.

### Domain components

- `ExerciseThumb` — image with fixed dimensions and fallback.
- `ExerciseRow` — name, body part, equipment, actions.
- `WorkoutSetTable` — set, reps, kg, RPE, notes, actions.
- `SetEditor` — mobile-friendly stepper inputs.
- `RestTimer` — compact sticky timer.
- `OfflineBanner` — pending mutation count and Sync Now.
- `ProgressRing`.
- `VolumeChart` — custom SVG/CSS, no chart library.
- `BodyPartBalance`.
- `PersonalRecordCard`.
- `WeeklyReviewCard`.
- `PlanCard`.
- `PlanDayTabs`.

Lucide is the only icon dependency. Import individual icons so the bundle stays
small.

## 6. Information architecture

### Navigation

Desktop:

- slim left sidebar;
- brand;
- Home, Plans, Workouts, Progress, Profile;
- account menu at bottom;
- no developer diagnostics in primary navigation.

Mobile:

- bottom navigation with five items;
- sticky primary action on detail screens;
- safe-area padding;
- sheets for actions and confirmations.

Remove from normal UI:

- M3/M4/M5 badges;
- milestone checklists;
- backend base URL;
- dataset version;
- rate-limit status;
- “Next: M6” card.

Move technical diagnostics to a hidden `/app/debug` route or the Account page
under an “Advanced” section.

## 7. Page-by-page UX

### Sign in / sign up

- One focused card, brand mark, short value statement.
- Inline validation and error messages.
- Visible loading state on submit.
- No developer copy about JWT/Neon on the main card.

### Onboarding

- One topic per step with a visible progress indicator.
- Large equipment/injury chips.
- Consent explained in human language.
- Sticky Back/Next actions.
- Review step shows a concise summary.

### Home / Today

- Greeting and date.
- **Continue Workout** if there is an active session.
- **Next Plan Day** with Start Workout.
- Weekly snapshot: workouts, volume, streak.
- One primary action per viewport.
- No backend diagnostics.

### Plans

- Library as a responsive card grid.
- Empty state with a clear Create Plan action.
- Plan detail: day tabs, exercise rows, sticky Start Workout.
- Lock/swap/regenerate in an overflow action menu.
- PDF/ICS as secondary actions.
- Version history in a collapsible panel.

### Workout history

- Completed sessions as rows/cards with date, focus, sets, volume.
- Active session pinned at the top.
- Sync state visible when mutations are pending.

### Workout execution

This is the highest-priority screen for perceived quality.

- Focus mode: one active exercise expanded, others collapsed.
- Large set editor with `− / +` steppers for reps and weight.
- RPE optional, notes collapsed by default.
- Rest timer sticky and dismissible.
- Offline banner with queued count and Sync Now.
- Complete Workout as a bottom sheet with a summary preview.
- Completion screen: sets, reps, volume, duration, PR highlights.

### Progress

- Four primary stats, not six equal boxes.
- Range selector as a segmented control.
- Volume chart using custom SVG.
- Body-part balance as horizontal bars.
- Personal records as a prioritized list.
- Weekly review and insights as editorial cards.
- Recent workouts with a clear “View all” link.

### Profile / account

- Sections: identity, training profile, equipment, injuries, consent, data.
- Export and delete in a clearly separated danger area.
- Advanced diagnostics collapsed.

### Public recommendation flow

- Same tokens and typography.
- Config form with clear grouping and helper text.
- Process screen can keep a terminal-like log, but with readable body text.
- Dashboard result uses the same card/stat language as the app.
- Preserve current behavior and API contracts.
- Migrate this flow last to avoid disrupting the core app.

## 8. Motion system

- Duration: `160–220ms`.
- Easing: `cubic-bezier(.2,.8,.2,1)` for entrances; `ease-out` for exits.
- Hover: translateY(-2px) or border-color change.
- Page transition: fade + 8px vertical movement.
- Cards: transform/opacity only.
- No animation of width, height, top, left, or box-shadow.
- Respect `prefers-reduced-motion`.
- Use skeletons instead of full-page spinners.

## 9. Performance plan

### Targets

| Metric | Target |
|---|---|
| Lighthouse mobile performance | ≥ 90 |
| Accessibility / best practices | ≥ 95 |
| LCP on mobile 4G | < 2.5 s |
| INP | < 200 ms |
| CLS | < 0.1 |
| Initial JS (gzip) | < 150 KB |
| Route chunk (gzip) | < 60 KB |
| Font payload | < 160 KB total |
| API feedback after warm server | < 300 ms |

### Baseline and tooling

- Lighthouse mobile and desktop before changes.
- Bundle analyzer or Vite build stats.
- Network waterfall for sign-in → Home → Plans → Workout.
- Record cold-start timing from Railway.
- Playwright screenshots at 390, 768, and 1440 widths.

### Frontend techniques

1. Self-host and subset fonts; preload only the display/body fonts.
2. Keep route-level code splitting; add intent-based prefetch for Plans,
   Workouts, and Progress.
3. Deduplicate `/me`, profile, plan, and workout requests.
4. Abort stale requests when navigation changes.
5. Keep optimistic updates for set create/edit/delete.
6. Add skeleton layouts that match final dimensions.
7. Lazy-load exercise images; set width/height; use `decoding="async"`.
8. Use `content-visibility: auto` for long below-the-fold sections.
9. Avoid layout shifts from fonts, images, badges, and async stats.
10. Remove production-inapplicable dev plugins and console noise.

### Cold-start UX (Railway Free)

Railway Free sleeps. This is accepted, but it must not feel broken.

- Render the app shell immediately.
- Start a `/ready` probe when the app boots or the user signs in.
- Show a non-blocking `ServerWakeBanner`: “Menghubungkan ke server…”.
- Use skeletons, not a blocking full-screen spinner.
- If the probe exceeds 8 seconds, show “Server sedang bangun” with Retry.
- Cache last-known profile, plan, workout, and progress data.
- Do not retry aggressively; use backoff.
- Keep the API base URL and debug readiness in `/app/debug`, not Home.
- Do not promise instant first load while the service is asleep.

### Backend boundary

No new backend features in this phase. The only integration changes allowed are:

- using existing `/health` and `/ready`;
- optional warm-up request;
- existing error/response contracts.

## 10. Accessibility and responsive behavior

- WCAG AA contrast for text and controls.
- Visible focus rings using the signal color.
- Keyboard navigation for tabs, sheets, dialogs, and forms.
- Semantic headings and labels.
- `aria-live` for sync/offline/toast messages.
- Minimum 44px touch targets.
- No color-only status indicators.
- Test at 390, 768, 1024, and 1440.
- Test zoom at 200%.
- Test reduced motion.

## 11. Implementation phases

| Phase | Work | Output | Estimate |
|---|---|---|---|
| 0 | Audit and baseline | Lighthouse, bundle, waterfall, screenshots | 0.5 day |
| 1 | Tokens, fonts, primitives | `tokens.css`, UI-v2 primitives, style guide route | 1–1.5 days |
| 2 | Shell, nav, Home, auth | New AppShell, bottom nav, Today dashboard | 1–1.5 days |
| 3 | Plans + Workout | Plan library/detail, focus logger, rest timer, completion | 2 days |
| 4 | Progress + Profile/Onboarding | Progress deck, settings, consent, empty states | 1.5 days |
| 5 | Public flow + motion | Public config/process/dashboard, motion polish | 1–1.5 days |
| 6 | Performance + QA | Bundle/font/image tuning, Lighthouse, screenshots, deploy | 1 day |

Realistic total: **7–8 working days**, delivered page by page.

## 12. Acceptance criteria

- Every M0–M5 flow still works.
- Public recommendation flow still works without login.
- Sign-in, onboarding, plan, workout, progress, feedback, and safety flows are
  visually consistent.
- No milestone/developer diagnostics on user-facing pages.
- Mobile bottom navigation and sticky actions work at 390px.
- Cold-start state is clear and non-blocking.
- No console errors on a clean load.
- Type-check, build, and production audit pass.
- Lighthouse targets are met or deviations are documented.
- Reduced motion and keyboard focus are verified.
- Screenshot comparisons exist for all main routes.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| UI work breaks M0–M5 flows | Migrate page by page; keep API contracts; run flow QA |
| Style drifts from JYMZ identity | Lock tokens; review Home and Workout before scaling |
| Scope creep from M6/M7 | Explicitly deferred; no trainer/notification work |
| Fonts hurt LCP/CLS | Self-host, subset, preload, fallback metrics |
| Cold start dominates perceived speed | Wake banner, skeletons, cached data, clear copy |
| Too many new dependencies | Lucide only; no chart or animation library |
| Visual regression | Playwright screenshots at 3 widths + manual review |

## 14. Deferred milestones

**M6 — Collaboration** and **M7 — Release hardening** are deferred indefinitely
as of 2026-11-23. Do not start them without a new explicit request.

The current production deployment is a lightweight deploy, not full M7
hardening. M6 features are not implemented in the frontend or enabled in the
backend flags.

## 15. First action after approval

1. Create `feat/ui-v2`.
2. Run the baseline audit and save results in `docs/ui-ux-v2-baseline.md`.
3. Build tokens and primitives.
4. Rebuild Home as the reference screen.
5. Review Home and Workout before migrating the rest.
