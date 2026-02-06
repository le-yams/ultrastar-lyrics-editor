/* ==========================================================================
   UltraStar Tools — Tailwind config (shared)
   Maps CSS custom properties from theme.css to semantic Tailwind class names.
   Keep in sync with theme.css (CSS variable definitions).
   ========================================================================== */

tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'theme-page-from': 'var(--color-page-from)',
        'theme-page-to': 'var(--color-page-to)',
        'theme-card': 'var(--color-card)',
        'theme-card-hover': 'var(--color-card-hover)',
        'theme-surface': 'var(--color-surface)',
        'theme-title': 'var(--color-title)',
        'theme-text': 'var(--color-text-primary)',
        'theme-text-secondary': 'var(--color-text-secondary)',
        'theme-text-muted': 'var(--color-text-muted)',
        'theme-accent': 'var(--color-accent)',
        'theme-accent-hover': 'var(--color-accent-hover)',
        'theme-border-accent': 'var(--color-border-accent)',
        'theme-border': 'var(--color-border)',
        'theme-input-bg': 'var(--color-input-bg)',
        'theme-input-text': 'var(--color-input-text)',
        'theme-toggle-bg': 'var(--color-toggle-bg)',
        'theme-toggle-hover': 'var(--color-toggle-hover)',
        'theme-info-bg': 'var(--color-info-bg)',
        'theme-info-title': 'var(--color-info-title)',
        'theme-info-text': 'var(--color-info-text)',
        'theme-warn-bg': 'var(--color-warn-bg)',
        'theme-warn-icon': 'var(--color-warn-icon)',
        'theme-warn-title': 'var(--color-warn-title)',
        'theme-warn-text': 'var(--color-warn-text)',
        'theme-highlight': 'var(--color-highlight)',
        'theme-highlight-light': 'var(--color-highlight-light)',
        'theme-disabled-bg': 'var(--color-disabled-bg)',
        'theme-disabled-text': 'var(--color-disabled-text)',
        'theme-footer': 'var(--color-footer)',
        'theme-footer-hover': 'var(--color-footer-hover)',
        'theme-drag-bg': 'var(--color-drag-bg)',
      },
      boxShadow: {
        'theme': '0 10px 15px -3px var(--color-shadow)',
      }
    }
  }
};
