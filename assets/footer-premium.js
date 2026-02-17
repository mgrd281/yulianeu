class FooterPremium {
  constructor(footer) {
    this.footer = footer;
    this.mql = window.matchMedia('(max-width: 749px)');

    this.onMediaChange = this.onMediaChange.bind(this);
    this.onToggleClick = this.onToggleClick.bind(this);

    this.toggles = Array.from(this.footer.querySelectorAll('[data-accordion="footer"] .footer-column__title'));

    this.mql.addEventListener('change', this.onMediaChange);
    this.onMediaChange(this.mql);
  }

  onMediaChange(e) {
    if (e.matches) {
      this.enableMobileAccordion();
    } else {
      this.disableMobileAccordion();
    }
  }

  enableMobileAccordion() {
    this.toggles.forEach((toggle) => {
      const targetId = toggle.getAttribute('aria-controls');
      const panel = targetId ? this.footer.querySelector(`#${CSS.escape(targetId)}`) : null;
      if (!panel) return;

      toggle.addEventListener('click', this.onToggleClick);
      toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') || 'false');

      panel.hidden = toggle.getAttribute('aria-expanded') !== 'true';
      panel.style.maxHeight = toggle.getAttribute('aria-expanded') === 'true' ? `${panel.scrollHeight}px` : '0px';
    });
  }

  disableMobileAccordion() {
    this.toggles.forEach((toggle) => {
      const targetId = toggle.getAttribute('aria-controls');
      const panel = targetId ? this.footer.querySelector(`#${CSS.escape(targetId)}`) : null;
      if (!panel) return;

      toggle.removeEventListener('click', this.onToggleClick);
      toggle.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      panel.style.maxHeight = '';
    });
  }

  onToggleClick(event) {
    const toggle = event.currentTarget;
    const targetId = toggle.getAttribute('aria-controls');
    const panel = targetId ? this.footer.querySelector(`#${CSS.escape(targetId)}`) : null;
    if (!panel) return;

    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    const nextOpen = !isOpen;

    toggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');

    if (nextOpen) {
      panel.hidden = false;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    } else {
      panel.style.maxHeight = '0px';
      window.setTimeout(() => {
        if (toggle.getAttribute('aria-expanded') === 'false') panel.hidden = true;
      }, 220);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('footer.footer--premium').forEach((footer) => {
    if (footer.dataset.footerPremiumInitialized === 'true') return;
    footer.dataset.footerPremiumInitialized = 'true';
    new FooterPremium(footer);
  });
});
