<template>
  <div class="ui-v2-scope auth-shell">
    <header class="auth-top">
      <RouterLink to="/" class="auth-brand">JYMZ</RouterLink>
      <RouterLink to="/" class="auth-back">Kembali ke beranda</RouterLink>
    </header>

    <main class="auth-main">
      <section class="auth-story" aria-label="Tentang JYMZ">
        <p class="auth-story__statement">Latihan yang tercatat, bukan ditebak.</p>
        <p class="auth-story__copy">
          JYMZ menyimpan set, beban, dan keputusan Anda di satu tempat. Masuk untuk
          melanjutkan plan dan melihat apa yang sudah bergerak.
        </p>

        <div class="auth-log" aria-hidden="true">
          <div class="auth-log__head">
            <span>Lower strength</span>
            <span>Day 2</span>
          </div>
          <div class="auth-log__row">
            <span>Back squat</span>
            <span>3 × 5</span>
            <span>80 kg</span>
            <span>RPE 8</span>
          </div>
          <div class="auth-log__row">
            <span>Romanian deadlift</span>
            <span>3 × 8</span>
            <span>70 kg</span>
            <span>RPE 7</span>
          </div>
          <div class="auth-log__row">
            <span>Calf raise</span>
            <span>3 × 12</span>
            <span>40 kg</span>
            <span>RPE 8</span>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <h1 class="auth-panel__title">{{ title }}</h1>
        <p v-if="description" class="auth-panel__description">{{ description }}</p>
        <div class="auth-panel__body">
          <slot />
        </div>
      </section>
    </main>

    <footer class="auth-foot">
      <span>JYMZ · catatan latihan pribadi</span>
      <span>Signal Editorial</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { preloadUiFonts } from '../../lib/preloadFonts'

withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)

preloadUiFonts()
</script>

<style scoped>
.auth-shell {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  background: var(--color-paper);
  color: var(--color-ink);
}

.auth-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  max-width: var(--content-max);
  width: 100%;
  margin: 0 auto;
  padding: 20px var(--gutter-mobile);
  border-bottom: 1px solid var(--color-ink);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-ink);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1;
  text-decoration: none;
}

.auth-back {
  display: inline-flex;
  align-items: center;
  min-height: var(--touch-target);
  color: var(--color-muted);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.auth-back:hover {
  color: var(--color-ink);
}

.auth-main {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 64px;
  align-items: center;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  padding: 64px var(--gutter-mobile);
  flex: 1 1 auto;
}

.auth-story {
  max-width: 46ch;
}

.auth-story__statement {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 4.5vw, 3.5rem);
  font-weight: 750;
  letter-spacing: -0.035em;
  line-height: 0.98;
}

.auth-story__copy {
  max-width: 44ch;
  margin: 20px 0 0;
  color: var(--color-muted);
  font-size: var(--text-body-lg);
  line-height: var(--leading-relaxed);
}

.auth-log {
  margin-top: 32px;
  overflow: hidden;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.auth-log__head,
.auth-log__row {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) 58px 62px 52px;
  gap: 8px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-line);
}

.auth-log__head {
  border-bottom-color: var(--color-ink);
  background: var(--color-surface);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.auth-log__row {
  font-family: var(--font-data);
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.auth-log__row:last-child {
  border-bottom: 0;
}

.auth-log__row span:first-child {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 600;
}

.auth-panel {
  width: 100%;
  max-width: 420px;
  justify-self: end;
  padding: var(--space-5);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
  background: var(--color-surface-raised);
}

.auth-panel__title {
  margin: 0;
  font-size: var(--text-h1);
  line-height: var(--leading-tight);
}

.auth-panel__description {
  max-width: 36ch;
  margin: 8px 0 0;
  color: var(--color-muted);
  font-size: var(--text-small);
  line-height: var(--leading-relaxed);
}

.auth-panel__body {
  margin-top: var(--space-5);
}

.auth-foot {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 16px var(--gutter-mobile) 24px;
  border-top: 1px solid var(--color-line);
  color: var(--color-muted);
  font-family: var(--font-data);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media (min-width: 641px) {
  .auth-top,
  .auth-main,
  .auth-foot {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

@media (max-width: 900px) {
  .auth-main {
    grid-template-columns: 1fr;
    gap: 32px;
    justify-items: center;
    padding-top: 40px;
  }

  .auth-story {
    display: none;
  }

  .auth-panel {
    max-width: 440px;
    justify-self: center;
  }

  .auth-foot {
    justify-content: center;
  }

  .auth-foot span:last-child {
    display: none;
  }
}
</style>
