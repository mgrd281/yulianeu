class WorkshopBooking {
  constructor(root) {
    this.root = root;
    this.form = root.closest('form');
    if (!this.form) return;

    this.dateInput = this.root.querySelector('input[type="date"][name^="properties"]');
    this.timeSelect = this.root.querySelector('select[name="properties[Uhrzeit]"]');
    this.personsInput = this.root.querySelector('input[name="quantity"]');
    this.personsProperty = this.root.querySelector('[data-persons-property]');

    this.noteTextarea = this.root.querySelector('textarea[name^="properties"]');

    this.submitButton = this.form.querySelector('button[type="submit"][name="add"]');
    this.dynamicCheckoutWrapper = this.form.querySelector('[data-dynamic-checkout]');

    this.onInput = this.onInput.bind(this);
    this.onStepperClick = this.onStepperClick.bind(this);
    this.onSubmitCapture = this.onSubmitCapture.bind(this);
    this.onDynamicCheckoutClickCapture = this.onDynamicCheckoutClickCapture.bind(this);

    this.setupMinDate();
    this.bind();
    this.validateAndSync();
  }

  setupMinDate() {
    if (!this.dateInput) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  bind() {
    [this.dateInput, this.timeSelect, this.personsInput, this.noteTextarea].forEach((el) => {
      if (!el) return;
      el.addEventListener('input', this.onInput);
      el.addEventListener('change', this.onInput);
    });

    this.root.querySelectorAll('[data-stepper]').forEach((btn) => {
      btn.addEventListener('click', this.onStepperClick);
    });

    this.form.addEventListener('submit', this.onSubmitCapture, true);

    if (this.dynamicCheckoutWrapper) {
      this.dynamicCheckoutWrapper.addEventListener('click', this.onDynamicCheckoutClickCapture, true);
      this.dynamicCheckoutWrapper.addEventListener('keydown', this.onDynamicCheckoutClickCapture, true);
    }
  }

  onInput() {
    this.validateAndSync();
  }

  onStepperClick(event) {
    const btn = event.currentTarget;
    const direction = btn.getAttribute('data-stepper');
    if (!this.personsInput) return;

    const current = Number(this.personsInput.value || 1);
    const next = direction === 'plus' ? current + 1 : current - 1;
    const clamped = Math.max(1, Number.isFinite(next) ? next : 1);

    this.personsInput.value = String(clamped);
    this.personsInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  onSubmitCapture(event) {
    const valid = this.validateAndSync();
    if (valid) return;

    event.preventDefault();
    event.stopPropagation();

    const firstInvalid = this.root.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus?.();
  }

  onDynamicCheckoutClickCapture(event) {
    const valid = this.validateAndSync();
    if (valid) return;

    if (event.type === 'keydown') {
      const key = event.key;
      if (key !== 'Enter' && key !== ' ') return;
    }

    event.preventDefault();
    event.stopPropagation();

    const firstInvalid = this.root.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus?.();
  }

  setFieldError(field, errorEl, message) {
    if (!field || !errorEl) return;

    const hasError = Boolean(message);
    field.setAttribute('aria-invalid', hasError ? 'true' : 'false');

    if (hasError) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      const errorId = errorEl.getAttribute('id');
      if (errorId) field.setAttribute('aria-describedby', errorId);
    } else {
      errorEl.textContent = '';
      errorEl.hidden = true;
      field.removeAttribute('aria-describedby');
    }
  }

  validateAndSync() {
    let valid = true;

    const dateError = this.root.querySelector('[id^="WorkshopDateError-"]');
    const timeError = this.root.querySelector('[id^="WorkshopTimeError-"]');
    const personsError = this.root.querySelector('[id^="WorkshopPersonsError-"]');

    if (this.dateInput) {
      const value = this.dateInput.value;
      const message = value ? '' : 'Bitte Datum auswählen.';
      this.setFieldError(this.dateInput, dateError, message);
      if (message) valid = false;
    }

    if (this.timeSelect) {
      const value = this.timeSelect.value;
      const message = value ? '' : 'Bitte Uhrzeit auswählen.';
      this.setFieldError(this.timeSelect, timeError, message);
      if (message) valid = false;
    }

    if (this.personsInput) {
      const value = Number(this.personsInput.value);
      const message = value >= 1 ? '' : 'Bitte Personenanzahl wählen.';
      this.setFieldError(this.personsInput, personsError, message);
      if (message) valid = false;

      if (this.personsProperty) {
        this.personsProperty.value = value >= 1 ? String(value) : '1';
      }
    }

    this.toggleButtons(valid);

    return valid;
  }

  toggleButtons(valid) {
    if (this.submitButton) {
      if (valid) {
        this.submitButton.removeAttribute('aria-disabled');
        this.submitButton.removeAttribute('disabled');
      } else {
        this.submitButton.setAttribute('aria-disabled', 'true');
        this.submitButton.setAttribute('disabled', 'disabled');
      }
    }

    if (this.dynamicCheckoutWrapper) {
      const blockedMessage = this.dynamicCheckoutWrapper.querySelector('[data-dynamic-checkout-blocked]');
      const paymentButton = this.dynamicCheckoutWrapper.querySelector('.shopify-payment-button');

      this.dynamicCheckoutWrapper.toggleAttribute('data-disabled', !valid);

      if (paymentButton) paymentButton.hidden = !valid;
      if (blockedMessage) blockedMessage.hidden = valid;

      this.dynamicCheckoutWrapper
        .querySelectorAll('button, [role="button"], input[type="submit"], a')
        .forEach((el) => {
          if (!(el instanceof HTMLElement)) return;
          if (!valid) {
            el.setAttribute('aria-disabled', 'true');
            if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') el.setAttribute('disabled', 'disabled');
            el.tabIndex = -1;
          } else {
            el.removeAttribute('aria-disabled');
            if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') el.removeAttribute('disabled');
            el.removeAttribute('tabindex');
          }
        });
    }
  }
}

function initWorkshopBooking(container = document) {
  container.querySelectorAll('[data-workshop-booking]').forEach((root) => {
    if (root.dataset.workshopBookingInitialized === 'true') return;
    root.dataset.workshopBookingInitialized = 'true';
    new WorkshopBooking(root);
  });
}

document.addEventListener('DOMContentLoaded', () => initWorkshopBooking(document));
document.addEventListener('product-info:loaded', (event) => initWorkshopBooking(event.target));
document.addEventListener('shopify:section:load', (event) => initWorkshopBooking(event.target));
