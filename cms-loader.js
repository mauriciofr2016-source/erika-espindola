/* ============================================================
   ERIKA ESPÍNDOLA — cms-loader.js
   Carrega o conteúdo do CMS (Firebase / LocalStorage) e aplica
   ao site público sem quebrar o painel administrativo.
   ============================================================ */
'use strict';

(async function () {
  const STORAGE_KEY = 'erika_cms_data';
  const REQUIRED_LAYOUT = 'espaco-erika-v2-2026-05-30';

  const clone = (obj) => JSON.parse(JSON.stringify(obj || {}));
  function deepMerge(base, override) {
    const result = clone(base);
    if (!override || typeof override !== 'object') return result;
    for (const key in override) {
      if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
        result[key] = deepMerge(result[key] || {}, override[key]);
      } else {
        result[key] = override[key];
      }
    }
    return result;
  }
  function sanitizeHtml(value) {
    const template = document.createElement('template');
    template.innerHTML = String(value || '');
    template.content.querySelectorAll('script, iframe:not([src*="youtube.com"]):not([src*="youtube-nocookie.com"]):not([src*="vimeo.com"]), object, embed, link, meta, style').forEach(el => el.remove());
    template.content.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || val.startsWith('javascript:') || val.startsWith('data:text/html')) el.removeAttribute(attr.name);
      });
    });
    return template.innerHTML;
  }
  const esc = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  function setText(selector, value) { const el = $(selector); if (el && value !== undefined && value !== null) el.textContent = value; }
  function setHTML(selector, value) { const el = $(selector); if (el && value !== undefined && value !== null) el.innerHTML = sanitizeHtml(value); }

  async function loadFirestore() {
    if (!window.FIREBASE_CONFIG || typeof firebase === 'undefined') return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      const db = firebase.firestore();
      const [cfgDoc, themeDoc, contentDoc, assetsDoc, metaDoc] = await Promise.all([
        db.collection('site_config').doc('main').get(),
        db.collection('site_theme').doc('main').get(),
        db.collection('site_content').doc('main').get(),
        db.collection('site_assets').doc('main').get(),
        db.collection('site_meta').doc('main').get()
      ]);
      if (!cfgDoc.exists && !themeDoc.exists && !contentDoc.exists && !assetsDoc.exists && !metaDoc.exists) return null;
      return {
        config: cfgDoc.exists ? cfgDoc.data() : {},
        theme: themeDoc.exists ? themeDoc.data() : {},
        content: contentDoc.exists ? contentDoc.data() : {},
        assets: assetsDoc.exists ? assetsDoc.data() : {},
        _meta: metaDoc.exists ? metaDoc.data() : {}
      };
    } catch (error) {
      console.warn('CMS Firestore indisponível. Usando fallback/localStorage.', error);
      return null;
    }
  }

  function loadLocal() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  }

  async function loadCmsData() {
    const defaults = window.CMS_DEFAULTS || {};
    const firebaseData = await loadFirestore();
    if (firebaseData) {
      // Evita que conteúdo antigo salvo no Firestore traga o layout velho de volta.
      if (firebaseData.content && firebaseData.content.layoutVersion !== REQUIRED_LAYOUT) {
        firebaseData.content = clone(defaults.content || {});
      }
      const merged = deepMerge(defaults, firebaseData);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch (_) {}
      return merged;
    }
    const localData = loadLocal();
    if (localData) {
      if (localData.content && localData.content.layoutVersion !== REQUIRED_LAYOUT) localData.content = clone(defaults.content || {});
      return deepMerge(defaults, localData);
    }
    return defaults;
  }

  const data = await loadCmsData();
  if (!data) return;
  const ct = data.content || {};

  // Config / SEO / WhatsApp / Footer
  const c = data.config || {};
  if (c.siteTitle) document.title = c.siteTitle;
  if (c.siteDesc) { const m = $('meta[name="description"]'); if (m) m.content = c.siteDesc; const og = $('meta[property="og:description"]'); if (og) og.content = c.siteDesc; }
  if (c.siteKeywords) { const k = $('meta[name="keywords"]'); if (k) k.content = c.siteKeywords; }
  if (c.ogTitle || c.siteTitle) { const og = $('meta[property="og:title"]'); if (og) og.content = c.ogTitle || c.siteTitle; }
  if (c.ogDesc) { const og = $('meta[property="og:description"]'); if (og) og.content = c.ogDesc; }
  if (c.ogImage) { const og = $('meta[property="og:image"]'); if (og) og.content = c.ogImage; }
  if (c.favicon) { const f = $('link[rel="icon"]'); if (f) f.href = c.favicon; }
  setText('.footer__crp', c.footerCrp);
  setText('.footer__tagline', c.footerTag);
  setText('.footer__reach', c.footerReach);
  setText('.footer__copy', c.copyright);
  if (c.whatsapp) window.__CMS_WHATSAPP_NUMBER = c.whatsapp.replace(/\D/g, '');
  if (c.whatsappMessages) {
    $$('.js-whatsapp').forEach(el => {
      const ctx = el.closest('header') ? 'header' : el.closest('.hero') ? 'hero' : el.classList.contains('wa-float') ? 'float' : el.closest('#contato') ? 'contato' : 'footer';
      const msg = c.whatsappMessages[ctx] || c.whatsappMessages.hero || '';
      if (msg) el.dataset.whatsappMessage = msg;
    });
  }

  // Theme
  if (data.theme) {
    const map = { cream:'--cream', creamDark:'--cream-dark', sand:'--sand', sandMid:'--sand-mid', mocha:'--mocha', mochaDark:'--mocha-dark', mochaLight:'--mocha-light', brownSoft:'--brown-soft', nude:'--nude', warmGray:'--warm-gray', textDark:'--text-dark', textMid:'--text-mid', textLight:'--text-light', sectionV:'--section-v', radiusSm:'--radius-sm', radiusMd:'--radius-md', radiusXl:'--radius-xl' };
    Object.entries(map).forEach(([key, cssVar]) => { if (data.theme[key]) document.documentElement.style.setProperty(cssVar, data.theme[key]); });
  }

  // Ordem e visibilidade
  if (Array.isArray(ct.sections)) {
    const main = $('main');
    ct.sections.forEach(item => { const section = item?.id ? document.getElementById(item.id) : null; if (section && main) { section.hidden = item.visible === false; main.appendChild(section); } });
  }

  // Hero
  if (ct.hero) {
    setText('.hero__tag', ct.hero.tag);
    setHTML('.hero__title', ct.hero.title);
    setHTML('.hero__sub', ct.hero.sub);
    setText('.hero__actions .btn--primary', ct.hero.btnPrimary);
    setText('.hero__actions .btn--ghost', ct.hero.btnGhost);
  }

  // Nosso espaço
  if (ct.sobre) {
    setText('#sobre .section-label', ct.sobre.label);
    setHTML('#sobre-heading', ct.sobre.title);
    const ps = $$('.trabalho__text p', $('#sobre'));
    if (ps[0]) ps[0].innerHTML = sanitizeHtml(ct.sobre.p1 || '');
    if (ps[1]) ps[1].innerHTML = sanitizeHtml(ct.sobre.p2 || '');
    if (ps[2]) ps[2].innerHTML = sanitizeHtml(ct.sobre.p3 || '');
  }

  // Para quem
  if (ct.atendimentos) {
    setText('#atendimentos .section-label', ct.atendimentos.label);
    setHTML('#atend-heading', ct.atendimentos.title);
    renderSimpleCards('#atendimentos .atendimentos__grid', 'atend-card reveal', ct.atendimentos.cards || []);
  }

  // Serviços
  if (ct.junguiana) {
    setText('#junguiana .section-label', ct.junguiana.label);
    setHTML('#jung-heading', ct.junguiana.title);
    const services = ct.junguiana.services || [];
    const grid = $('#junguiana .cms-services-grid');
    if (grid && services.length) {
      grid.innerHTML = services.map(s => `<div class="trabalho__card service-card reveal"><h3>${esc(s.title)}</h3><p>${sanitizeHtml(s.text || '')}</p>${s.cta ? `<p><strong>${s.cta.includes(':') ? esc(s.cta.split(':')[0]) + ':' : ''}</strong>${s.cta.includes(':') ? ' ' + esc(s.cta.split(':').slice(1).join(':').trim()) : esc(s.cta)}</p>` : ''}</div>`).join('');
    }
  }

  // Como funciona
  if (ct.processo) {
    setText('#processo .section-label', ct.processo.label);
    setHTML('#proc-heading', ct.processo.title);
    const timeline = $('#processo .timeline');
    if (timeline && Array.isArray(ct.processo.steps)) {
      timeline.innerHTML = ct.processo.steps.map(step => `<div class="timeline__item reveal"><div class="timeline__num">${esc(step.num)}</div><h3>${esc(step.title)}</h3><p>${sanitizeHtml(step.text || '')}</p></div>`).join('');
    }
  }

  // Projetos e oficinas
  if (ct.horarios) {
    setText('#horarios .section-label', ct.horarios.label);
    setHTML('#hor-heading', ct.horarios.title);
    const grid = $('#horarios .horarios__cards');
    if (grid && Array.isArray(ct.horarios.cards)) {
      grid.innerHTML = ct.horarios.cards.map(card => `<div class="horario-card reveal"><h3>${esc(card.title)}</h3><p>${sanitizeHtml(card.text || '')}</p>${card.cta ? `<p>${sanitizeHtml(card.cta)}</p>` : ''}</div>`).join('');
    }
  }

  // Diferenciais
  if (ct.experiencia) {
    setText('#experiencia .section-label', ct.experiencia.label);
    setHTML('#exp-heading', ct.experiencia.title);
    const list = $('.cms-diferenciais');
    if (list) {
      const raw = [ct.experiencia.p1, ct.experiencia.p2, ct.experiencia.p3].filter(Boolean).join(';');
      const items = raw.split(';').map(x => x.trim()).filter(Boolean);
      if (items.length) list.innerHTML = items.map(item => `<li>${esc(item.replace(/\.$/, ''))}.</li>`).join('');
    }
    const btn = $('#experiencia .btn'); if (btn && ct.experiencia.btnText) btn.textContent = ct.experiencia.btnText;
  }

  // Chamada final / contato
  if (ct.contato) {
    const contatoLabel = String(ct.contato.label || '').trim();
    const contatoLabelEl = $('#contato .section-label');
    if (contatoLabelEl) {
      if (!contatoLabel || contatoLabel.toLowerCase() === 'chamada final') contatoLabelEl.remove();
      else contatoLabelEl.textContent = contatoLabel;
    }
    setHTML('#contato-heading', ct.contato.title);
    setText('#contato .section-sub', ct.contato.sub);
    setText('.contato__form h3', ct.contato.formTitle);
    setText('.form-sub', ct.contato.formSub);
  }

  // Menu
  if (ct.menu) {
    if (ct.menu.ctaText) $$('.header__cta, .mobile-cta').forEach(el => el.textContent = ct.menu.ctaText);
    if (Array.isArray(ct.menu.links)) {
      const links = ct.menu.links.filter(l => l.visible !== false);
      const nav = $('.nav__list');
      if (nav) nav.innerHTML = links.map(l => `<li><a href="${esc(l.href)}" class="nav__link">${esc(l.label)}</a></li>`).join('');
      const mobile = $('.mobile-menu ul');
      if (mobile) mobile.innerHTML = links.map(l => `<li><a href="${esc(l.href)}" class="mobile-link">${esc(l.label)}</a></li>`).join('') + `<li><a href="#contato" class="btn btn--primary mobile-cta js-whatsapp" data-whatsapp-message="${esc(c.whatsappMessages?.hero || '')}" target="_blank" rel="noopener noreferrer">${esc(ct.menu.ctaText || 'Falar pelo WhatsApp')}</a></li>`;
    }
  }

  // Imagens
  const assetMap = { 'erika-hero': '.hero__img', 'erika-experiencia': '.experiencia__image img', 'espaco-consultorio': '#sobre .espaco__main img', 'espaco-jardim': '#sobre .espaco__side-img:nth-child(1) img', 'espaco-sala': '#sobre .espaco__side-img:nth-child(2) img', 'decorativo-agua': null };
  Object.entries(assetMap).forEach(([key, selector]) => {
    if (!selector) return;
    const img = $(selector); const asset = data.assets?.[key];
    if (!img || !asset) return;
    if (asset.src) img.src = asset.src;
    if (asset.alt) img.alt = asset.alt;
    if (asset.width) img.style.width = asset.width;
    if (asset.height) img.style.height = asset.height;
    if (asset.fit) img.style.objectFit = asset.fit;
    if (asset.position) img.style.objectPosition = asset.position;
    if (asset.radius) img.style.borderRadius = asset.radius;
  });

  hydrateWhatsApp();

  function renderSimpleCards(containerSel, className, cards) {
    const container = $(containerSel); if (!container || !cards.length) return;
    container.innerHTML = cards.map(card => `<div class="${className}"><h3>${esc(card.title)}</h3><p>${sanitizeHtml(card.text || '')}</p></div>`).join('');
  }

  function hydrateWhatsApp() {
    if (!window.__CMS_WHATSAPP_NUMBER) return;
    $$('.js-whatsapp').forEach(link => {
      const msg = link.dataset.whatsappMessage || c.whatsappMessages?.hero || '';
      const url = new URL(`https://wa.me/${window.__CMS_WHATSAPP_NUMBER}`);
      if (msg.trim()) url.searchParams.set('text', msg.trim());
      link.href = url.toString();
    });
  }
})();
