/* ============================================================
   ERIKA ESPÍNDOLA — script.js
   - Header scroll behavior
   - Mobile menu
   - Scroll reveal
   - FAQ accordion
   - Contact form (WhatsApp redirect)
   - PWA install prompt
   ============================================================ */

'use strict';

// ---- Utilitários -------------------------------------------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const WHATSAPP_NUMBER = "5562999999999";

function buildWhatsAppUrl(message = '') {
  const number = window.__CMS_WHATSAPP_NUMBER || WHATSAPP_NUMBER;
  const url = new URL(`https://wa.me/${number}`);
  if (message.trim()) {
    url.searchParams.set('text', message.trim());
  }
  return url.toString();
}

function hydrateWhatsAppLinks() {
  $$('.js-whatsapp').forEach((link) => {
    link.href = buildWhatsAppUrl(link.dataset.whatsappMessage || '');
  });
}

hydrateWhatsAppLinks();

// ---- Header scroll ----------------------------------------
const header = $('#header');

function handleScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);
}

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// ---- Mobile menu ------------------------------------------
const hamburger = $('#hamburger');
const mobileMenu = $('#mobile-menu');

function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  mobileMenu.removeAttribute('aria-hidden');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  hamburger.classList.contains('open') ? closeMenu() : openMenu();
});

$$('.mobile-link', mobileMenu).forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on outside click
document.addEventListener('click', (e) => {
  if (!header.contains(e.target)) closeMenu();
});

// ---- Scroll reveal (Intersection Observer) ----------------
const revealEls = $$('.reveal, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger delay within groups
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-right')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('is-visible');
      }, Math.min(idx * 80, 400));
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ---- Active nav link on scroll ----------------------------
const sections = $$('section[id]');
const navLinks = $$('.nav__link');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === '#' + entry.target.id
        );
      });
    });
  },
  { rootMargin: '-40% 0px -40% 0px' }
);

sections.forEach(s => sectionObserver.observe(s));

// ---- FAQ accordion ----------------------------------------
$$('.faq__question').forEach(btn => {
  btn.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    const answer = $('#' + this.getAttribute('aria-controls'));

    // Close all others
    $$('.faq__question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      const otherAnswer = $('#' + other.getAttribute('aria-controls'));
      otherAnswer.hidden = true;
    });

    // Toggle current
    const newState = !expanded;
    this.setAttribute('aria-expanded', String(newState));
    answer.hidden = !newState;

    // Smooth scroll if needed
    if (newState) {
      setTimeout(() => {
        const rect = this.getBoundingClientRect();
        if (rect.top < 80) {
          window.scrollBy({ top: rect.top - 88, behavior: 'smooth' });
        }
      }, 50);
    }
  });
});

// ---- Contact form (WhatsApp) --------------------------------
const form = $('#contactForm');
const submitBtn = $('#submitBtn');
const formStatus = $('#formStatus');
let isSubmitting = false;

function showFieldError(fieldId, msg) {
  const field = $('#' + fieldId);
  const errorEl = $('#' + fieldId + '-error');
  if (field) field.classList.add('error');
  if (errorEl) errorEl.textContent = msg;
}

function clearErrors() {
  $$('.form-group input, .form-group select', form).forEach(f => f.classList.remove('error'));
  $$('.form-error', form).forEach(e => e.textContent = '');
  setFormStatus('', '');
}

function setFormStatus(type, msg) {
  if (!formStatus) return;
  formStatus.textContent = msg;
  formStatus.classList.toggle('is-error', type === 'error');
  formStatus.classList.toggle('is-success', type === 'success');
}

function validateForm(data) {
  let valid = true;

  if (!data.nome.trim()) {
    showFieldError('nome', 'Por favor, informe seu nome.');
    valid = false;
  }

  const telClean = data.telefone.replace(/\D/g, '');
  if (!telClean || telClean.length < 10) {
    showFieldError('telefone', 'Informe um número de WhatsApp válido.');
    valid = false;
  }

  if (!data.tipo) {
    showFieldError('tipo', 'Selecione o tipo de atendimento.');
    valid = false;
  }

  return valid;
}

if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    const data = {
      nome: $('#nome').value,
      telefone: $('#telefone').value,
      tipo: $('#tipo').value,
      mensagem: $('#mensagem').value,
    };

    if (isSubmitting) return;

    if (!validateForm(data)) {
      setFormStatus('error', 'Confira os campos destacados antes de enviar.');
      return;
    }

    // Prevent double click
    isSubmitting = true;
    submitBtn.disabled = true;
    const btnText = submitBtn.querySelector('.btn-text');
    const origText = btnText.textContent;
    btnText.textContent = 'Abrindo WhatsApp...';
    setFormStatus('', 'Preparando sua mensagem...');

    // Build WhatsApp message
    const msg =
      `Olá, Erika! Encontrei seu site e gostaria de agendar uma conversa.\n\n` +
      `*Nome:* ${data.nome}\n` +
      `*WhatsApp:* ${data.telefone}\n` +
      `*Tipo de atendimento:* ${data.tipo}\n` +
      (data.mensagem ? `*Mensagem:* ${data.mensagem}` : '');

    setTimeout(() => {
      window.open(buildWhatsAppUrl(msg), '_blank', 'noopener,noreferrer');
      btnText.textContent = 'Mensagem enviada!';
      setFormStatus('success', 'WhatsApp aberto com sua mensagem preenchida.');

      setTimeout(() => {
        isSubmitting = false;
        submitBtn.disabled = false;
        btnText.textContent = origText;
        form.reset();
      }, 1200);
    }, 400);
  });
}

// ---- Smooth scroll for anchors ----------------------------
document.addEventListener('click', function (e) {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = $(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const offset = 80;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
});

// ---- PWA install prompt -----------------------------------
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Could show a custom install button here if desired
});

// ---- Lazy loading fallback --------------------------------
if (!('loading' in HTMLImageElement.prototype)) {
  $$('img[loading="lazy"]').forEach(img => {
    img.src = img.src;
  });
}

// ---- Service Worker registration --------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // SW optional — fail silently
    });
  });
}
