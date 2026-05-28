/* ============================================================
   ERIKA ESPÍNDOLA — cms-loader.js
   Carrega o conteúdo do CMS (LocalStorage / Firebase)
   e aplica ao site público.
   
   - Fallback seguro: se nada estiver salvo, usa o HTML original
   - Não quebra funcionalidades existentes (WhatsApp, FAQ, etc.)
   - Chamado no fim do <body> do index.html
   ============================================================ */

'use strict';

(async function() {
  try {

  const STORAGE_KEY = 'erika_cms_data';

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj || {}));
  }

  function deepMerge(base, override) {
    const result = deepClone(base);
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

  // ---- Carrega dados salvos --------------------------------
  function loadLocalCmsData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  async function loadFirestoreCmsData() {
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
      const hasAny = cfgDoc.exists || themeDoc.exists || contentDoc.exists || assetsDoc.exists || metaDoc.exists;
      if (!hasAny) return null;
      return {
        config: cfgDoc.exists ? cfgDoc.data() : {},
        theme: themeDoc.exists ? themeDoc.data() : {},
        content: contentDoc.exists ? contentDoc.data() : {},
        assets: assetsDoc.exists ? assetsDoc.data() : {},
        _meta: metaDoc.exists ? metaDoc.data() : {}
      };
    } catch (error) {
      console.warn('CMS Firestore indisponível. Tentando LocalStorage.', error);
      return null;
    }
  }

  async function loadCmsData() {
    const firebaseData = await loadFirestoreCmsData();
    if (firebaseData) {
      const merged = deepMerge(window.CMS_DEFAULTS || {}, firebaseData);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch (e) {}
      return merged;
    }
    const localData = loadLocalCmsData();
    return localData ? deepMerge(window.CMS_DEFAULTS || {}, localData) : null;
  }

  const data = await loadCmsData();
  if (!data) return; // Sem dados salvos → conteúdo HTML original prevalece

  // ---- Utilitário para setar texto seguramente ------------
  function setText(selector, value) {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  }

  function setHTML(selector, value) {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el.innerHTML = sanitizeHtml(value);
  }

  function sanitizeHtml(value) {
    const template = document.createElement('template');
    template.innerHTML = String(value);
    template.content.querySelectorAll('script, iframe:not([src*="youtube.com"]):not([src*="youtube-nocookie.com"]):not([src*="vimeo.com"]), object, embed, link, meta, style').forEach(el => el.remove());
    template.content.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        const name = attr.name.toLowerCase();
        const val = attr.value.trim().toLowerCase();
        if (name.startsWith('on') || val.startsWith('javascript:') || val.startsWith('data:text/html')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return template.innerHTML;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setAttr(selector, attr, value) {
    if (!value) return;
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  }

  // ---- CONFIG: SEO & META ---------------------------------
  if (data.config) {
    const c = data.config;
    if (c.siteTitle)  document.title = c.siteTitle;
    if (c.siteDesc) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.content = c.siteDesc;
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = c.siteDesc;
    }
    if (c.siteTitle) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = c.siteTitle;
    }
    if (c.siteKeywords) {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) keywords.content = c.siteKeywords;
    }
    if (c.ogTitle) {
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = c.ogTitle;
    }
    if (c.ogDesc) {
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = c.ogDesc;
    }
    if (c.ogImage) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.content = c.ogImage;
    }
    if (c.favicon) {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) favicon.href = c.favicon;
    }

    // WhatsApp number — atualiza a constante global se existir
    if (c.whatsapp && typeof window !== 'undefined') {
      window.__CMS_WHATSAPP_NUMBER = c.whatsapp.replace(/\D/g, '');
    }

    // Footer
    if (c.footerCredential) setText('.footer__credential', c.footerCredential);
    if (c.footerTag)   setText('.footer__tagline',  c.footerTag);
    if (c.footerReach) setText('.footer__reach',    c.footerReach);
    if (c.copyright)   setText('.footer__copy',     c.copyright);

    // Localização no contato
    if (c.endereco) {
      const locP = document.querySelector('.contato__card:nth-child(2) p');
      if (locP) locP.textContent = c.endereco;
    }

    // Mensagens WhatsApp
    if (c.whatsappMessages) {
      const msgs = c.whatsappMessages;
      document.querySelectorAll('.js-whatsapp').forEach(el => {
        const ctx = el.closest('header') ? 'header'
                  : el.closest('.hero') ? 'hero'
                  : el.closest('.horarios') ? 'horarios'
                  : el.classList.contains('wa-float') ? 'float'
                  : 'footer';
        const msg = msgs[ctx] || msgs.header || '';
        if (msg) el.dataset.whatsappMessage = msg;
      });
    }
  }

  // ---- THEME: CSS Variables --------------------------------
  if (data.theme) {
    const th = data.theme;
    const root = document.documentElement;
    const themeMap = {
      cream:      '--cream',
      creamDark:  '--cream-dark',
      sand:       '--sand',
      sandMid:    '--sand-mid',
      mocha:      '--mocha',
      mochaDark:  '--mocha-dark',
      mochaLight: '--mocha-light',
      brownSoft:  '--brown-soft',
      nude:       '--nude',
      warmGray:   '--warm-gray',
      textDark:   '--text-dark',
      textMid:    '--text-mid',
      textLight:  '--text-light',
      sectionV:   '--section-v',
      radiusSm:   '--radius-sm',
      radiusMd:   '--radius-md',
      radiusXl:   '--radius-xl'
    };

    for (const [key, cssVar] of Object.entries(themeMap)) {
      if (th[key]) root.style.setProperty(cssVar, th[key]);
    }
  }

  // ---- CONTEÚDO: Seções -----------------------------------
  const ct = data.content;
  if (!ct) return;

  // ORDEM / VISIBILIDADE DAS SEÇÕES
  if (ct.sections && Array.isArray(ct.sections)) {
    const main = document.querySelector('main');
    ct.sections.forEach((item) => {
      const section = item && item.id ? document.getElementById(item.id) : null;
      if (!section || !main) return;
      section.hidden = item.visible === false;
      main.appendChild(section);
    });
  }

  // HERO
  if (ct.hero) {
    const h = ct.hero;
    if (h.tag)      setText('.hero__tag',   h.tag);
    if (h.title)    setHTML('.hero__title',  h.title);
    if (h.sub)      setHTML('.hero__sub',    h.sub);
    if (h.btnPrimary) {
      const primaryBtn = document.querySelector('.hero__actions .btn--primary .btn-text, .hero__actions .btn--primary');
      if (primaryBtn) {
        // Preserva o SVG icon se existir
        const svg = primaryBtn.querySelector('svg');
        if (svg && primaryBtn.childNodes.length > 1) {
          // Remove text nodes only
          [...primaryBtn.childNodes].forEach(n => { if (n.nodeType === 3) n.textContent = ''; });
          primaryBtn.appendChild(document.createTextNode(' ' + h.btnPrimary));
        } else if (!svg) {
          primaryBtn.textContent = h.btnPrimary;
        }
      }
    }
    if (h.btnGhost) setText('.hero__actions .btn--ghost', h.btnGhost);
  }

  // SOBRE
  if (ct.sobre) {
    const s = ct.sobre;
    if (s.label) setText('#sobre .section-label',         s.label);
    if (s.title) setHTML('#sobre-heading',                 s.title);
    if (s.p1)    setHTML('.trabalho__text p:nth-child(1)', s.p1);
    if (s.p2)    setHTML('.trabalho__text p:nth-child(2)', s.p2);
    if (s.p3)    setHTML('.trabalho__text p:nth-child(3)', s.p3);

    if (s.cards && s.cards.length) {
      const cardEls = document.querySelectorAll('.trabalho__card');
      s.cards.forEach((card, i) => {
        if (cardEls[i]) {
          const h3 = cardEls[i].querySelector('h3');
          const p  = cardEls[i].querySelector('p');
          if (h3 && card.title) h3.textContent = card.title;
          if (p  && card.text)  p.textContent  = card.text;
        }
      });
    }
  }

  // ATENDIMENTOS
  if (ct.atendimentos) {
    const a = ct.atendimentos;
    if (a.label) setText('#atendimentos .section-label', a.label);
    if (a.title) setHTML('#atend-heading',               a.title);

    if (a.cards && a.cards.length) {
      const cardEls = document.querySelectorAll('.atend-card');
      a.cards.forEach((card, i) => {
        if (cardEls[i]) {
          const h3 = cardEls[i].querySelector('h3');
          const p  = cardEls[i].querySelector('p');
          if (h3 && card.title) h3.textContent = card.title;
          if (p  && card.text)  p.textContent  = card.text;
        }
      });
    }
  }

  // JUNGUIANA
  if (ct.junguiana) {
    const j = ct.junguiana;
    if (j.label) setText('#junguiana .section-label', j.label);
    if (j.title) setHTML('#jung-heading',              j.title);
    const jungParas = document.querySelectorAll('.junguiana__text > p');
    if (j.p1 && jungParas[0]) jungParas[0].innerHTML = j.p1;
    if (j.p2 && jungParas[1]) jungParas[1].innerHTML = j.p2;
    if (j.p3 && jungParas[2]) jungParas[2].innerHTML = j.p3;

    if (j.pillars && j.pillars.length) {
      const pillars = document.querySelectorAll('.jung-pillar span');
      j.pillars.forEach((text, i) => {
        if (pillars[i]) pillars[i].textContent = text;
      });
    }
  }

  // ESPAÇO
  if (ct.espaco) {
    const e = ct.espaco;
    if (e.label) setText('#espaco .section-label', e.label);
    if (e.title) setHTML('#espaco-heading',         e.title);
    if (e.sub)   setText('#espaco .section-sub',    e.sub);

    if (e.values && e.values.length) {
      const valueEls = document.querySelectorAll('.espaco__value');
      e.values.forEach((v, i) => {
        if (valueEls[i]) {
          const h3 = valueEls[i].querySelector('h3');
          const p  = valueEls[i].querySelector('p');
          if (h3 && v.title) h3.textContent = v.title;
          if (p  && v.text)  p.textContent  = v.text;
        }
      });
    }
  }

  // PROCESSO
  if (ct.processo) {
    const p = ct.processo;
    if (p.label) setText('#processo .section-label', p.label);
    if (p.title) setHTML('#proc-heading',             p.title);

    if (p.steps && p.steps.length) {
      const stepEls = document.querySelectorAll('.timeline__item');
      p.steps.forEach((step, i) => {
        if (stepEls[i]) {
          const num  = stepEls[i].querySelector('.timeline__num');
          const h3   = stepEls[i].querySelector('h3');
          const para = stepEls[i].querySelector('p');
          if (num  && step.num)   num.textContent  = step.num;
          if (h3   && step.title) h3.textContent   = step.title;
          if (para && step.text)  para.textContent  = step.text;
        }
      });
    }
  }

  // HORÁRIOS
  if (ct.horarios) {
    const h = ct.horarios;
    if (h.label) setText('#horarios .section-label', h.label);
    if (h.title) setHTML('#hor-heading',              h.title);

    if (h.schedule && h.schedule.length) {
      const rows = document.querySelectorAll('.schedule-row');
      h.schedule.forEach((row, i) => {
        if (rows[i]) {
          const lbl = rows[i].querySelector('.schedule-label');
          const val = rows[i].querySelector('.schedule-value');
          if (lbl && row.label) lbl.textContent = row.label;
          if (val && row.value) val.textContent = row.value;
        }
      });
    }

    if (h.cards && h.cards.length) {
      const cardEls = document.querySelectorAll('.valor-card');
      h.cards.forEach((card, i) => {
        if (cardEls[i]) {
          const h3 = cardEls[i].querySelector('h3');
          const ps = cardEls[i].querySelectorAll('p');
          if (h3 && card.title) h3.textContent = card.title;
          if (ps[0] && card.text) ps[0].textContent = card.text;
          if (ps[1] && card.cta)  ps[1].textContent = card.cta;
        }
      });
    }

    if (h.pagamento && h.pagamento.length) {
      const pgEl = document.querySelector('.pagamento__methods');
      if (pgEl) {
        pgEl.innerHTML = h.pagamento.map(m => `<span>${escHtml(m)}</span>`).join('');
      }
    }

    if (h.btnText) {
      const horBtn = document.querySelector('#horarios .btn--primary .btn-text, #horarios .btn--primary');
      if (horBtn) {
        const svg = horBtn.querySelector ? horBtn.querySelector('svg') : null;
        if (!svg) setText('#horarios .btn--primary', h.btnText);
      }
    }
  }

  // EXPERIÊNCIA
  if (ct.experiencia) {
    const ex = ct.experiencia;
    if (ex.label) setText('#experiencia .section-label', ex.label);
    if (ex.title) setHTML('#exp-heading',                ex.title);
    const expParas = document.querySelectorAll('.experiencia__text > p');
    if (ex.p1 && expParas[0]) expParas[0].innerHTML = ex.p1;
    if (ex.p2 && expParas[1]) expParas[1].innerHTML = ex.p2;
    if (ex.p3 && expParas[2]) expParas[2].innerHTML = ex.p3;
    if (ex.btnText) setText('.experiencia__text .btn--outline', ex.btnText);
  }

  // CONTATO
  if (ct.contato) {
    const c = ct.contato;
    if (c.label)     setText('#contato .section-label',  c.label);
    if (c.title)     setHTML('#contato-heading',          c.title);
    if (c.sub)       setText('#contato .section-sub',    c.sub);
    if (c.formTitle) setText('.contato__form h3',         c.formTitle);
    if (c.formSub)   setText('.form-sub',                 c.formSub);
  }

  // FAQ
  const faq = ct.faq;
  if (faq) {
    if (faq.label) setText('#faq .section-label', faq.label);
    if (faq.title) setHTML('#faq-heading',         faq.title);

    if (faq.items && faq.items.length) {
      const faqList = document.querySelector('.faq__list');
      if (faqList) {
        const existingItems = faqList.querySelectorAll('.faq__item');
        faq.items.forEach((item, i) => {
          if (existingItems[i]) {
            const btn = existingItems[i].querySelector('.faq__question');
            const ans = existingItems[i].querySelector('.faq__answer p');
            if (btn && item.q) {
              // Preserva o span .faq__icon
              const icon = btn.querySelector('.faq__icon');
              btn.childNodes.forEach(n => { if (n.nodeType === 3) n.textContent = ''; });
              btn.insertBefore(document.createTextNode(item.q + ' '), icon || btn.firstChild);
            }
            if (ans && item.a) ans.textContent = item.a;
          }
        });
      }
    }
  }

  // MENU
  if (ct.menu) {
    const m = ct.menu;
    if (m.ctaText) {
      document.querySelectorAll('.header__cta, .mobile-cta').forEach(el => {
        // Preserva SVG
        const svg = el.querySelector('svg');
        if (!svg) el.textContent = m.ctaText;
      });
    }

    if (m.links && m.links.length) {
      const navList = document.querySelector('.nav__list');
      const mobileList = document.querySelector('.mobile-menu ul');
      const linksHtml = m.links
        .filter(link => link.visible !== false)
        .map(link => `<li><a href="${escHtml(link.href)}" class="nav__link">${escHtml(link.label)}</a></li>`)
        .join('');
      const mobileLinksHtml = m.links
        .filter(link => link.visible !== false)
        .map(link => `<li><a href="${escHtml(link.href)}" class="mobile-link">${escHtml(link.label)}</a></li>`)
        .join('');
      if (navList) navList.innerHTML = linksHtml;
      if (mobileList) {
        const ctaHtml = m.ctaText ? `<li><a href="#contato" class="btn btn--primary mobile-cta js-whatsapp" data-whatsapp-message="Olá, gostaria de agendar uma conversa." target="_blank" rel="noopener noreferrer">${escHtml(m.ctaText)}</a></li>` : '';
        mobileList.innerHTML = mobileLinksHtml + ctaHtml;
        if (typeof closeMenu === 'function') {
          mobileList.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', closeMenu);
          });
        }
      }
    }
  }

  // ASSETS: imagens customizadas
  if (data.assets) {
    const assetMap = {
      'erika-hero':          '.hero__img',
      'erika-experiencia':   '.experiencia__image img',
      'espaco-consultorio':  '.espaco__main img',
      'espaco-jardim':       '.espaco__side-img:nth-child(1) img',
      'espaco-sala':         '.espaco__side-img:nth-child(2) img',
      'decorativo-agua':     '.junguiana__image img'
    };

    for (const [key, selector] of Object.entries(assetMap)) {
      const asset = data.assets[key];
      if (!asset) continue;
      const imgEl = document.querySelector(selector);
      if (!imgEl) continue;
      if (asset.src) imgEl.src = asset.src;
      if (asset.alt) imgEl.alt = asset.alt;
      if (asset.width) imgEl.style.width = asset.width;
      if (asset.height) imgEl.style.height = asset.height;
      if (asset.fit) imgEl.style.objectFit = asset.fit;
      if (asset.position) imgEl.style.objectPosition = asset.position;
      if (asset.radius) imgEl.style.borderRadius = asset.radius;
    }
  }

  // BLOCOS DINÂMICOS
  if (ct.blocks && Array.isArray(ct.blocks) && ct.blocks.length) {
    const host = document.createElement('section');
    host.className = 'cms-blocks section';
    host.setAttribute('aria-label', 'Conteúdo adicional');
    host.innerHTML = '<div class="container cms-blocks__inner"></div>';
    const inner = host.querySelector('.cms-blocks__inner');
    ct.blocks.filter(block => block && block.visible !== false).forEach(block => {
      const el = renderBlock(block);
      if (el) inner.appendChild(el);
    });
    if (inner.children.length) {
      const contato = document.getElementById('contato');
      if (contato && contato.parentNode) contato.parentNode.insertBefore(host, contato);
      else document.querySelector('main')?.appendChild(host);
    }
  }

  // Reconfigura WhatsApp links com número do CMS (se houver)
  if (window.__CMS_WHATSAPP_NUMBER && typeof buildWhatsAppUrl === 'function') {
    // Sobrescreve a constante global no script.js — a função será re-executada
    // na próxima vez que hydrateWhatsAppLinks() for chamada no script.js
    // Como o cms-loader roda depois do script.js, precisamos re-hidratar
    const num = window.__CMS_WHATSAPP_NUMBER;
    document.querySelectorAll('.js-whatsapp').forEach(link => {
      const msg = link.dataset.whatsappMessage || '';
      const url = new URL(`https://wa.me/${num}`);
      if (msg.trim()) url.searchParams.set('text', msg.trim());
      link.href = url.toString();
    });
  }

  setupMobileCmsUpdateNotice(data._meta?.updatedAt || 0);

  function renderBlock(block) {
    const wrap = document.createElement('div');
    wrap.className = 'cms-block cms-block--' + (block.type || 'texto');
    const cfg = block.config || {};
    const style = cfg.style || {};
    Object.entries(style).forEach(([key, value]) => {
      if (!value) return;
      const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
      wrap.style.setProperty(cssKey, value);
    });

    const title = cfg.title ? `<h2>${sanitizeHtml(cfg.title)}</h2>` : '';
    const text = cfg.text ? `<p>${sanitizeHtml(cfg.text)}</p>` : '';
    const button = cfg.buttonText ? `<a class="btn btn--primary js-whatsapp" href="${escHtml(cfg.href || '#contato')}">${escHtml(cfg.buttonText)}</a>` : '';
    const image = cfg.src ? `<img src="${escHtml(cfg.src)}" alt="${escHtml(cfg.alt || '')}" loading="lazy" />` : '';

    switch (block.type) {
      case 'imagem':
        wrap.innerHTML = image;
        break;
      case 'banner':
      case 'cta':
      case 'whatsapp':
        wrap.innerHTML = `${title}${text}${button}`;
        break;
      case 'faq':
        wrap.innerHTML = `${title}<div>${(cfg.items || []).map(item => `<details><summary>${escHtml(item.q || '')}</summary><p>${sanitizeHtml(item.a || '')}</p></details>`).join('')}</div>`;
        break;
      case 'galeria':
        wrap.innerHTML = `<div class="cms-gallery">${(cfg.images || []).map(img => `<img src="${escHtml(img.src)}" alt="${escHtml(img.alt || '')}" loading="lazy" />`).join('')}</div>`;
        break;
      case 'video':
      case 'vídeo embed':
        wrap.innerHTML = cfg.embed ? `<div class="cms-video">${sanitizeHtml(cfg.embed)}</div>` : `${title}${text}`;
        break;
      case 'separador':
        wrap.innerHTML = '<hr />';
        break;
      default:
        wrap.innerHTML = `${image}${title}${text}${button}`;
    }
    return wrap;
  }

  function setupMobileCmsUpdateNotice(currentVersion) {
    const isMobileLike = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
    if (!isMobileLike || !window.FIREBASE_CONFIG || typeof firebase === 'undefined') return;
    if (window.__CMS_UPDATE_WATCHER_READY) return;
    window.__CMS_UPDATE_WATCHER_READY = true;

    const seenKey = 'erika_cms_seen_update';
    if (currentVersion) {
      try { localStorage.setItem(seenKey, String(currentVersion)); } catch (error) {}
    }

    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      const db = firebase.firestore();
      let firstSnapshot = true;
      db.collection('site_meta').doc('main').onSnapshot((doc) => {
        if (!doc.exists) return;
        const updatedAt = Number(doc.data().updatedAt || 0);
        if (!updatedAt) return;
        if (firstSnapshot) {
          firstSnapshot = false;
          return;
        }
        const seen = Number(localStorage.getItem(seenKey) || currentVersion || 0);
        if (updatedAt > seen) showUpdateBanner(updatedAt, seenKey);
      });
    } catch (error) {
      // Atualização em tempo real é opcional; o fallback segue sendo recarregar a página.
    }
  }

  function showUpdateBanner(version, seenKey) {
    if (document.querySelector('.cms-update-banner')) return;
    const banner = document.createElement('div');
    banner.className = 'cms-update-banner';
    banner.setAttribute('role', 'status');
    banner.innerHTML = `
      <span>Nova atualização disponível</span>
      <button type="button">Atualizar</button>
    `;
    banner.querySelector('button').addEventListener('click', async () => {
      try { localStorage.setItem(seenKey, String(version)); } catch (error) {}
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) await reg.update();
      }
      window.location.reload();
    });
    document.body.appendChild(banner);
  }

  } catch (e) {
    // Falha silenciosa — o site público nunca quebra por erro do CMS loader
    console.warn('[cms-loader] Erro não crítico no carregamento do CMS:', e && e.message || e);
  }

})();
