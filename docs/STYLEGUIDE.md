# 🎨 I TESORI DELL'IMPRESA - Style Guide

## 📖 Indice

1. [Introduzione](#introduzione)
2. [Design Tokens](#design-tokens)
3. [Componenti](#componenti)
4. [Layout & Grid](#layout--grid)
5. [Accessibilità](#accessibilità)
6. [Responsive Design](#responsive-design)
7. [Convenzioni & Best Practices](#convenzioni--best-practices)

---

## Introduzione

Questo design system fornisce un linguaggio visivo coerente per l'applicazione **I Tesori dell'Impresa**. Tutti gli stili derivano dalla pagina di riferimento `UtenteDashboard.jsx` e sono standardizzati attraverso **design tokens** in CSS puro.

### Stack Tecnologico

- **Framework**: React + Vite
- **Styling**: CSS Modules (file `.css` importati)
- **Accessibilità**: WCAG 2.1 AA compliant
- **Browser**: Ultimi 2 anni (no IE11)

### Obiettivi

- ✅ Parità visiva ≥ 95% con design di riferimento
- ✅ Contrasto colori ≥ 4.5:1 (WCAG AA)
- ✅ Focus visibile per keyboard navigation
- ✅ Touch target ≥ 44px
- ✅ CSS minificato ≤ 80KB

---

## Design Tokens

Tutti i valori di design sono centralizzati in `design-tokens.css` come CSS custom properties.

### 🎨 Palette Colori

#### Primari & Brand

```css
--color-primary: #3b82f6         /* Blue - azioni, link */
--color-primary-hover: #2563eb   /* Blue hover */
--color-secondary: #fbbf24       /* Yellow/Gold - accenti */
--color-secondary-hover: #eab308 /* Yellow hover */
```

#### Status Colors

```css
--color-success: #10b981   /* Green - completato */
--color-error: #ef4444     /* Red - errore */
--color-warning: #f59e0b   /* Orange - attenzione */
--color-info: #3b82f6      /* Blue - informazioni */
```

#### Scala Grigi (Neutral)

```css
--color-gray-50: #f8fafc   /* Background principale */
--color-gray-100: #f1f5f9  /* Background secondario */
--color-gray-200: #e2e8f0  /* Bordi */
--color-gray-300: #cbd5e1  /* Bordi hover */
--color-gray-500: #64748b  /* Testo secondario */
--color-gray-800: #1e293b  /* Testo principale */
--color-gray-900: #0f172a  /* Testo enfatizzato */
```

#### Semantic Aliases (usa questi!)

```css
--color-text-primary       /* Testo principale */
--color-text-secondary     /* Testo secondario */
--color-bg-primary         /* Background app */
--color-bg-secondary       /* Background card */
--color-border-primary     /* Bordi standard */
```

### 📝 Tipografia

#### Font Families

```css
--font-display: "Playfair Display", serif  /* Solo per logo */
--font-sans: -apple-system, ...            /* Body text */
```

#### Scala Dimensioni

| Token             | Size | Uso         |
| ----------------- | ---- | ----------- |
| `--font-size-xs`  | 12px | Badge, note |
| `--font-size-sm`  | 14px | Label, meta |
| `--font-size-md`  | 16px | Body text   |
| `--font-size-lg`  | 20px | Card title  |
| `--font-size-xl`  | 24px | H2, header  |
| `--font-size-2xl` | 30px | H1          |
| `--font-size-3xl` | 48px | Logo sub    |
| `--font-size-4xl` | 64px | Logo main   |

#### Font Weights

```css
--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
--font-weight-black: 900  /* Logo only */
```

### 📏 Spaziatura (Scala 4px)

```css
--space-1: 4px     (--space-xs)
--space-2: 8px     (--space-sm)
--space-4: 16px    (--space-md)
--space-6: 24px    (--space-lg)
--space-8: 32px    (--space-xl)
--space-12: 48px   (--space-2xl)
```

**Linee guida**:

- Usa multipli di 4px per coerenza
- Preferisci alias semantici (`--space-md`) ai valori numerici

### 🔲 Border Radius & Shadows

#### Radius

```css
--radius-sm: 2px      /* Progress bar */
--radius-md: 8px      /* Default (pulsanti, card) */
--radius-lg: 12px     /* Form input login */
--radius-xl: 16px     /* Card grandi */
--radius-2xl: 24px    /* Modal */
--radius-full: 9999px /* Avatar, pill */
```

#### Elevation (Shadows)

```css
--shadow-base: ...    /* Card statiche */
--shadow-md: ...      /* Card hover */
--shadow-lg: ...      /* Card elevate, dropdown */
--shadow-xl: ...      /* Modal */
--shadow-focus: ...   /* Focus ring (accessibilità) */
```

### ⚡ Transizioni

```css
--transition-fast: 150ms ease    /* Hover immediato */
--transition-base: 200ms ease    /* Default */
--transition-medium: 300ms ease  /* Animazioni smooth */
```

---

## Componenti

### Button

#### Varianti

```html
<!-- Primary -->
<button class="tesoro-view-btn tesoro-view-btn-blue">Vedi Contenuto</button>

<!-- Secondary (Yellow) -->
<button class="tesoro-view-btn tesoro-view-btn-yellow">In arrivo</button>

<!-- Logout -->
<button class="btn-logout-modern">Logout</button>

<!-- Back -->
<button class="btn-back-modern">← Indietro</button>
```

#### Proprietà

- **Min height**: 44px (touch target)
- **Padding**: `var(--space-sm) var(--space-lg)`
- **Border radius**: `var(--radius-md)`
- **Transition**: `var(--transition-fast)`
- **Disabled**: `opacity: 0.5; cursor: not-allowed;`

#### Do's & Don'ts

✅ **DO**: Usa classi semantiche esistenti  
✅ **DO**: Rispetta altezza minima 44px  
❌ **DON'T**: Creare nuovi stili senza tokens  
❌ **DON'T**: Usare `!important` (solo eccezioni motivate)

### Card

#### Tesori Card (Utente Dashboard)

```html
<div class="tesoro-card-modern tesoro-blue">
  <div class="tesoro-card-inner">
    <div class="tesoro-instructor-image">
      <div class="instructor-placeholder">AC</div>
    </div>
    <div class="tesoro-content-modern">
      <h2 class="tesoro-title-modern">TITOLO MATERIA</h2>
      <h3 class="tesoro-instructor-name">Nome Relatore</h3>
      <div class="tesoro-progress-section">
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: 50%"></div>
        </div>
        <span class="progress-text">1/2 completati (50%)</span>
      </div>
      <button class="tesoro-view-btn">Vedi Contenuto</button>
    </div>
  </div>
</div>
```

#### Proprietà

- **Background**: `var(--color-bg-secondary)`
- **Border**: `1px solid var(--color-border-primary)`
- **Border radius**: `var(--radius-md)`
- **Shadow**: `var(--shadow-base)` → `var(--shadow-md)` on hover
- **Padding**: `var(--space-xl)`
- **Transition**: `all var(--transition-medium)`

#### Color Variants

- `.tesoro-blue` → Avatar blu (`var(--color-primary)`)
- `.tesoro-yellow` → Avatar giallo (`var(--color-secondary)`)

### Badge

```html
<span class="coming-soon-badge">In arrivo</span>
<span class="lesson-number-modern">Lezione 1</span>
<span class="stats-badge completed">3/5 completati</span>
```

#### Proprietà

- **Font size**: `var(--font-size-xs)`
- **Padding**: `var(--space-xs) var(--space-sm)`
- **Border radius**: `var(--radius-md)`
- **Font weight**: `var(--font-weight-medium)`

### Progress Bar

```html
<!-- Standard -->
<div class="progress-bar-container">
  <div class="progress-bar-fill" style="width: 60%"></div>
</div>
<span class="progress-text">3/5 completati (60%)</span>

<!-- Overview (dashboard relatore) -->
<div class="overview-progress-bar">
  <div class="overview-progress-fill" style="width: 75%"></div>
</div>
```

#### Nuovi Component (tokens-based)

```html
<!-- Varianti dimensioni -->
<div class="progress progress--sm">
  <div class="progress__bar" style="width: 50%"></div>
</div>

<!-- Color variants -->
<div class="progress progress--success">
  <div class="progress__bar" style="width: 100%"></div>
</div>

<!-- Animated -->
<div class="progress progress--animated">
  <div class="progress__bar" style="width: 40%"></div>
</div>
```

---

## Layout & Grid

### Container Dashboard

```css
max-width: var(--container-dashboard); /* 1400px */
margin: 0 auto;
padding: var(--space-xl);
```

### Grid Tesori (3 colonne)

```html
<div class="tesori-grid">
  <!-- 3 cards su desktop, 2 su tablet, 1 su mobile -->
</div>
```

```css
.tesori-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

/* Tablet */
@media (max-width: 1024px) {
  .tesori-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 768px) {
  .tesori-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Accessibilità

### Focus Visibile

Tutti gli elementi interattivi hanno un focus ring:

```css
:focus-visible {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### Contrasto Colori (WCAG AA)

| Combinazione          | Ratio  | Status |
| --------------------- | ------ | ------ |
| Gray-800 su Gray-50   | 14.7:1 | ✅ AAA |
| Gray-600 su White     | 7.0:1  | ✅ AAA |
| Primary su White      | 4.5:1  | ✅ AA  |
| Secondary su Gray-900 | 10.2:1 | ✅ AAA |

### Touch Target

Minimo **44x44px** per elementi interattivi (WCAG 2.1 Level AAA):

```css
--size-touch-min: 44px;
```

### Screen Reader

Usa classi helper per testo solo screen reader:

```html
<span class="sr-only">Descrizione per screen reader</span>
```

### ARIA Attributes

Esempio progress bar accessibile:

```html
<div
  class="progress-bar-container"
  role="progressbar"
  aria-valuenow="60"
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="Progresso questionari"
>
  <div class="progress-bar-fill" style="width: 60%"></div>
</div>
```

### Reduced Motion

Rispetta `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints

```css
--breakpoint-xs: 480px   /* Small mobile */
--breakpoint-sm: 640px   /* Mobile */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Large desktop */
--breakpoint-2xl: 1536px /* Extra large */
```

### Mobile-First Approach

Scrivi CSS mobile-first, poi aggiungi media queries per schermi più grandi:

```css
/* Mobile (base) */
.tesori-grid {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .tesori-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .tesori-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Tipografia Responsive

Il logo scala automaticamente:

```css
/* Mobile */
.tesori-logo-main {
  font-size: 2rem;
}

/* Tablet */
@media (min-width: 768px) {
  .tesori-logo-main {
    font-size: 3rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .tesori-logo-main {
    font-size: 4rem;
  }
}
```

---

## Convenzioni & Best Practices

### Naming Convention (BEM)

```
.block__element--modifier
```

Esempi:

```css
.tesoro-card-modern          /* Block */
/* Block */
.tesoro-card__inner          /* Element */
.tesoro-card--blue; /* Modifier */
```

### Ordine Proprietà CSS

1. Positioning (`position`, `top`, `z-index`)
2. Box Model (`display`, `width`, `padding`, `margin`)
3. Typography (`font-*`, `text-*`, `line-height`)
4. Visual (`background`, `border`, `box-shadow`)
5. Misc (`cursor`, `transition`, `animation`)

### Variabili Semantiche vs Valori Diretti

✅ **DO**:

```css
color: var(--color-text-primary);
padding: var(--space-md);
```

❌ **DON'T**:

```css
color: #1e293b;
padding: 16px;
```

### !important - Quando usarlo

❌ **Evita sempre tranne**:

- Utility classes (`.sr-only`, `.hidden`)
- Overrides di librerie terze (documentato)
- Reset critici di specificità elevata

### Performance

- Evita selettori complessi (`div > ul li a`)
- Usa classi specifiche invece di discendenti generici
- Lazy-load CSS non critici con code splitting

### File Organization

```
src/styles/
├── design-tokens.css    # Tutti i tokens centrali
├── base/
│   ├── reset.css        # Reset + fondazioni
│   └── variables.css    # Legacy compatibility
├── components/
│   ├── buttons.css
│   ├── cards.css
│   ├── forms.css
│   ├── loading.css
│   └── progress.css
├── layouts/
│   ├── dashboard.css
│   └── header.css
├── auth/
│   └── login.css
├── dashboard/
│   ├── tesori.css
│   ├── relatore.css
│   ├── lezioni.css
│   └── utenti.css
└── utils/
    └── responsive.css
```

---

## Testing Checklist

### Visual Regression

- [ ] Screenshot comparison con design di riferimento
- [ ] Parità visiva ≥ 95% su palette, tipografia, spaziatura

### Accessibilità

- [ ] Lighthouse Accessibility score ≥ 90
- [ ] Contrasto colori ≥ 4.5:1 (WCAG AA)
- [ ] Focus visibile su tutti gli elementi interattivi
- [ ] Touch target ≥ 44px
- [ ] Keyboard navigation funzionante
- [ ] Screen reader testing (NVDA/JAWS)

### Responsive

- [ ] Test su breakpoints: 375px, 768px, 1024px, 1440px
- [ ] Nessun overflow orizzontale
- [ ] Grid responsive (3→2→1 colonne)
- [ ] Immagini/avatar responsive

### Performance

- [ ] CSS minificato ≤ 80KB
- [ ] Nessun CSS inutilizzato (PurgeCSS)
- [ ] Nessun layout shift evidente (CLS < 0.1)
- [ ] Transizioni smooth senza jank

### Browser Compatibility

- [ ] Chrome (ultimi 2 anni)
- [ ] Firefox (ultimi 2 anni)
- [ ] Safari (ultimi 2 anni)
- [ ] Edge (ultimi 2 anni)

---

## Risorse

### Tools

- **Contrast Checker**: [WebAIM](https://webaim.org/resources/contrastchecker/)
- **Lighthouse**: DevTools → Lighthouse tab
- **axe DevTools**: [Browser extension](https://www.deque.com/axe/devtools/)
- **CSS Stats**: [cssstats.com](https://cssstats.com/)

### Documentazione

- **WCAG 2.1**: [w3.org/WAI/WCAG21](https://www.w3.org/WAI/WCAG21/quickref/)
- **CSS Custom Properties**: [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- **BEM Methodology**: [getbem.com](http://getbem.com/)

### Fonts

- **Playfair Display**: [Google Fonts](https://fonts.google.com/specimen/Playfair+Display)

---

## Changelog

### v2.0.0 (2025-11-04)

- ✅ Implementato design tokens system
- ✅ Refactored base.css con reset moderno
- ✅ Creato progress.css component
- ✅ Aggiornato variables.css per retrocompatibilità
- ✅ Documentazione completa STYLEGUIDE.md

### v1.0.0

- ✅ Sistema CSS modulare iniziale
- ✅ Componenti base (buttons, cards, forms)
- ✅ Layout dashboard utente e relatore

---

**Maintainer**: Team I Tesori dell'Impresa  
**Last Updated**: 4 novembre 2025  
**Version**: 2.0.0
