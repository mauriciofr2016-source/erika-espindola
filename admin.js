/* ============================================================
   ERIKA ESPÍNDOLA — admin.js
   Painel Administrativo
   Login via Firebase Authentication (email/senha).
   Sem credenciais hardcoded. Sem senha no localStorage.
   ============================================================ */

'use strict';

// ============================================================
// EMAIL AUTORIZADO — único ponto de configuração
// Altere aqui se o e-mail do admin mudar.
// Não armazena senha. A autenticação é delegada ao Firebase.
// ============================================================
const AUTHORIZED_EMAIL = 'erika@gmail.com';

// Chave de armazenamento local (apenas dados CMS, nunca senha)
const STORAGE_KEY = 'erika_cms_data';

// Referência ao CMS_DEFAULTS (definido em cms-defaults.js)
const DEFAULTS = (typeof CMS_DEFAULTS !== 'undefined') ? CMS_DEFAULTS : {};

// Estado atual do CMS
let cmsData = {};

// ============================================================
// FIREBASE — INICIALIZAÇÃO (Firestore + Storage + Auth)
// Sem credenciais hardcoded. Fallback seguro se não configurado.
// ============================================================

// Referências globais Firebase
let db              = null;
let storage         = null;
let auth            = null;
let firebaseAvailable = false;

function initFirebase() {
  const statusEl = $('#firebaseStatus');

  function setStatus(state, msg) {
    if (!statusEl) return;
    statusEl.className = 'firebase-status ' + state;
    const txt = statusEl.querySelector('.firebase-status__text');
    if (txt) txt.textContent = msg;
  }

  // Sem config ou config vazia → fallback local
  if (!window.FIREBASE_CONFIG || typeof window.FIREBASE_CONFIG !== 'object') {
    setStatus('warning',
      'Firebase não configurado. Usando armazenamento local. Configure firebase-config.js para persistência multi-dispositivo.');
    return;
  }

  // SDK não carregado (ex: offline)
  if (typeof firebase === 'undefined') {
    setStatus('warning', 'Firebase SDK não carregado. Usando armazenamento local.');
    return;
  }

  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }
    db      = firebase.firestore();
    storage = firebase.storage();
    auth    = firebase.auth();
    firebaseAvailable = true;
    setStatus('connected', 'Firebase conectado. Autenticação ativa.');
  } catch (e) {
    console.warn('[Admin] Firebase init error:', e.message || e);
    db      = null;
    storage = null;
    auth    = null;
    firebaseAvailable = false;
    setStatus('error',
      'Erro ao conectar ao Firebase. Usando armazenamento local. Verifique firebase-config.js.');
  }
}

// ============================================================
// UTILITÁRIOS
// ============================================================
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(base, override) {
  const result = deepClone(base);
  for (const key in override) {
    if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
      result[key] = deepMerge(result[key] || {}, override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const toast = $('#adminToast');
let toastTimer = null;

function showToast(msg, type = 'info', duration = 3000) {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = 'admin-toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================================
// SAVE STATUS
// ============================================================
function setSaveStatus(el, type, msg) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'save-status ' + type;
  if (type === 'success') {
    setTimeout(() => {
      el.textContent = '';
      el.className = 'save-status';
    }, 3000);
  }
}

function setBtnSaving(btn, saving) {
  if (!btn) return;
  const span = btn.querySelector('.btn-text');
  btn.disabled = saving;
  if (saving) {
    btn._origText = span?.textContent;
    if (span) span.textContent = 'Salvando...';
  } else {
    if (span && btn._origText) span.textContent = btn._origText;
  }
}

// ============================================================
// PERSISTÊNCIA — LOCAL STORAGE (fallback sem Firebase)
// ============================================================
function saveToLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Erro ao salvar localmente:', e);
    return false;
  }
}

function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Erro ao carregar dados locais:', e);
    return null;
  }
}

// ============================================================
// FIREBASE — INICIALIZAÇÃO OPCIONAL
// ============================================================
function initFirebase() {
  const statusEl = $('#firebaseStatus');

  // Tenta carregar firebase-config.js (pode não existir)
  if (!window.FIREBASE_CONFIG) {
    if (statusEl) {
      statusEl.className = 'firebase-status warning';
      statusEl.querySelector('.firebase-status__text').textContent =
        'Firebase não configurado. Usando armazenamento local (LocalStorage). Configure firebase-config.js para persistência multi-dispositivo.';
    }
    return;
  }

  try {
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      db = firebase.firestore();
      storage = firebase.storage();
      firebaseAvailable = true;
      if (statusEl) {
        statusEl.className = 'firebase-status connected';
        statusEl.querySelector('.firebase-status__text').textContent = 'Firebase conectado com sucesso.';
      }
    }
  } catch (e) {
    console.warn('Firebase init error:', e);
    if (statusEl) {
      statusEl.className = 'firebase-status error';
      statusEl.querySelector('.firebase-status__text').textContent = 'Erro ao conectar ao Firebase. Usando armazenamento local.';
    }
  }
}

// ============================================================
// SALVAR DADOS (Firebase ou Local)
// ============================================================
async function saveSection(section, data) {
  cmsData[section] = data;
  cmsData._meta = {
    ...(cmsData._meta || {}),
    updatedAt: Date.now(),
    updatedSection: section
  };

  if (firebaseAvailable && db) {
    try {
      // Salva no Firestore por coleção
      const collectionMap = {
        config:  'site_config',
        theme:   'site_theme',
        content: 'site_content',
        assets:  'site_assets'
      };
      const col = collectionMap[section] || 'site_config';
      await Promise.all([
        db.collection(col).doc('main').set(data, { merge: true }),
        db.collection('site_meta').doc('main').set(cmsData._meta, { merge: true })
      ]);
      saveToLocal(cmsData); // backup local sempre
      return true;
    } catch (e) {
      console.error('Erro Firebase, salvando local:', e);
      saveToLocal(cmsData);
      return false;
    }
  } else {
    return saveToLocal(cmsData);
  }
}

// ============================================================
// CARREGAR DADOS
// ============================================================
async function loadAllData() {
  // Base: defaults
  cmsData = deepClone({
    config:  DEFAULTS.config  || {},
    theme:   DEFAULTS.theme   || {},
    content: DEFAULTS.content || {},
    assets:  DEFAULTS.assets  || {}
  });

  // Override com dados locais
  const local = loadFromLocal();
  if (local) {
    cmsData = deepMerge(cmsData, local);
  }

  // Se Firebase disponível, tenta carregar de lá
  if (firebaseAvailable && db) {
    try {
      const [cfgDoc, themeDoc, contentDoc, assetsDoc] = await Promise.all([
        db.collection('site_config').doc('main').get(),
        db.collection('site_theme').doc('main').get(),
        db.collection('site_content').doc('main').get(),
        db.collection('site_assets').doc('main').get()
      ]);

      if (cfgDoc.exists)     cmsData.config  = deepMerge(cmsData.config,  cfgDoc.data());
      if (themeDoc.exists)   cmsData.theme   = deepMerge(cmsData.theme,   themeDoc.data());
      if (contentDoc.exists) cmsData.content = deepMerge(cmsData.content, contentDoc.data());
      if (assetsDoc.exists)  cmsData.assets  = deepMerge(cmsData.assets || {}, assetsDoc.data());
    } catch (e) {
      console.warn('Erro ao carregar Firebase, usando dados locais:', e);
    }
  }

  return cmsData;
}

// ============================================================
// LOGIN — Firebase Authentication (email/senha)
// Sem credenciais hardcoded. Sem senha salva localmente.
// ============================================================
const loginScreen = $('#loginScreen');
const adminPanel  = $('#adminPanel');
const loginForm   = $('#loginForm');
const loginError  = $('#loginError');
const loginBtn    = $('#loginBtn');

// Flag: impede dupla inicialização do painel
let adminInitialized = false;

function setLoginError(msg) {
  if (loginError) loginError.textContent = msg;
}

function setLoginLoading(loading) {
  if (!loginBtn) return;
  const span = loginBtn.querySelector('.btn-text');
  loginBtn.disabled = loading;
  if (span) span.textContent = loading ? 'Entrando...' : 'Entrar';
}

function showPanel() {
  if (adminInitialized) return;
  adminInitialized = true;
  if (loginScreen) loginScreen.style.display = 'none';
  if (adminPanel)  adminPanel.style.display   = 'grid';
  initAdmin();
}

function showLoginWithError(msg) {
  if (loginScreen) loginScreen.style.display = '';
  if (adminPanel)  adminPanel.style.display  = 'none';
  setLoginLoading(false);
  setLoginError(msg);
  adminInitialized = false;
  // Faz logout do Firebase para não manter sessão não autorizada
  if (auth) auth.signOut().catch(() => {});
}

// ---- Inicializa Firebase e observa estado de autenticação -----
function initAuthAndListen() {
  // Sem Firebase configurado: mostrar mensagem clara, não quebrar tela
  if (!window.FIREBASE_CONFIG || typeof firebase === 'undefined') {
    setLoginError('Firebase Auth não configurado. Configure o Firebase para usar o painel online.');
    setLoginLoading(false);
    return;
  }

  // Inicializa Firebase (idempotente)
  initFirebase();

  if (!auth) {
    setLoginError('Firebase Auth não disponível. Verifique firebase-config.js.');
    return;
  }

  // Observa mudanças de estado de autenticação (persiste entre recarregamentos)
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // Usuário não logado: garante que tela de login está visível
      if (adminInitialized) {
        adminInitialized = false;
        if (loginScreen) loginScreen.style.display = '';
        if (adminPanel)  adminPanel.style.display  = 'none';
      }
      setLoginLoading(false);
      return;
    }

    // Verifica se é o e-mail autorizado
    if (user.email !== AUTHORIZED_EMAIL) {
      showLoginWithError('Usuário não autorizado.');
      return;
    }

    // Autenticado e autorizado: abre painel
    showPanel();
  });
}

// ---- Submit do formulário de login ----------------------------
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Previne múltiplos cliques
    if (loginBtn && loginBtn.disabled) return;

    const email = ($('#loginEmail')?.value || '').trim();
    const pass  = ($('#loginPass')?.value  || '');

    setLoginError('');

    // Validações básicas de campo antes de chamar o Firebase
    if (!email) {
      setLoginError('Informe o e-mail.');
      return;
    }
    if (!pass) {
      setLoginError('Informe a senha.');
      return;
    }

    // Sem Firebase configurado
    if (!auth) {
      setLoginError('Firebase Auth não configurado. Configure o Firebase para usar o painel online.');
      return;
    }

    setLoginLoading(true);

    try {
      await auth.signInWithEmailAndPassword(email, pass);
      // onAuthStateChanged cuida de abrir o painel após login bem-sucedido
    } catch (err) {
      setLoginLoading(false);
      // Limpa senha após erro — nunca armazena
      if ($('#loginPass')) $('#loginPass').value = '';

      // Mensagens de erro amigáveis mapeadas dos códigos Firebase
      const errorMessages = {
        'auth/user-not-found':         'E-mail não encontrado.',
        'auth/wrong-password':          'Senha incorreta.',
        'auth/invalid-email':           'E-mail inválido.',
        'auth/too-many-requests':       'Muitas tentativas. Aguarde alguns minutos.',
        'auth/network-request-failed':  'Sem conexão com a internet.',
        'auth/user-disabled':           'Usuário desativado.',
        'auth/invalid-credential':      'E-mail ou senha incorretos.'
      };

      const msg = errorMessages[err.code] || ('Erro ao entrar: ' + (err.message || err.code));
      setLoginError(msg);
    }
  });
}

// ---- Botão Sair (logout real via Firebase) -------------------
const logoutBtn = $('#logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (!confirm('Deseja sair do painel admin?')) return;
    try {
      if (auth) await auth.signOut();
    } catch (e) {
      console.warn('[Admin] Erro ao fazer logout:', e.message || e);
    }
    adminInitialized = false;
    location.reload();
  });
}

// ---- Inicia observação de autenticação ao carregar a página ---
initAuthAndListen();

// ============================================================
// INICIALIZAÇÃO DO PAINEL
// ============================================================
async function initAdmin() {
  // Firebase já foi inicializado por initAuthAndListen()
  await loadAllData();
  setupTabs();
  setupSidebarToggle();
  populateAll();
  setupSaveHandlers();
  setupThemeHandlers();
  setupImageHandlers();
  setupBackupHandlers();
  setupContentSectionTabs();
  setupAddCardHandlers();
  setupEnhancedCms();
}

// ============================================================
// TABS NAVEGAÇÃO SIDEBAR
// ============================================================
function setupTabs() {
  const navItems  = $$('.sidebar-nav__item');
  const tabsMap   = {
    'geral':     { el: $('#tab-geral'),     title: 'Configurações Gerais' },
    'conteudo':  { el: $('#tab-conteudo'),  title: 'Conteúdo do Site' },
    'tema':      { el: $('#tab-tema'),      title: 'Tema Visual' },
    'imagens':   { el: $('#tab-imagens'),   title: 'Imagens' },
    'faq':       { el: $('#tab-faq'),       title: 'FAQ' },
    'whatsapp':  { el: $('#tab-whatsapp'),  title: 'WhatsApp' },
    'backup':    { el: $('#tab-backup'),    title: 'Backup' }
  };

  function activateTab(key) {
    navItems.forEach(i => i.classList.remove('active'));
    Object.values(tabsMap).forEach(t => { if (t.el) t.el.style.display = 'none'; });
    const found = navItems.find(i => i.dataset.tab === key);
    if (found) found.classList.add('active');
    const tab = tabsMap[key];
    if (tab && tab.el) tab.el.style.display = 'block';
    const title = $('#tabTitle');
    if (title && tab) title.textContent = tab.title;
    // Fecha sidebar mobile ao navegar
    const sidebar = $('#adminSidebar');
    if (sidebar && window.innerWidth <= 768) sidebar.classList.remove('open');
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => activateTab(item.dataset.tab));
  });
}

// ============================================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================================
function setupSidebarToggle() {
  const toggle  = $('#sidebarToggle');
  const sidebar = $('#adminSidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

// ============================================================
// POPULAR TODOS OS CAMPOS
// ============================================================
function populateAll() {
  populateGeral();
  populateConteudo();
  populateTema();
  populateWhatsApp();
  populateFaq();
}

function val(id, value) {
  const el = $(id);
  if (el && value !== undefined && value !== null) el.value = value;
}

// --- GERAL ---
function populateGeral() {
  const c = cmsData.config || {};
  val('#cfg-siteTitle',  c.siteTitle  || '');
  val('#cfg-siteDesc',   c.siteDesc   || '');
  val('#cfg-footerCrp',  c.footerCrp  || '');
  val('#cfg-footerTag',  c.footerTag  || '');
  val('#cfg-footerReach',c.footerReach|| '');
  val('#cfg-copyright',  c.copyright  || '');
  val('#cfg-endereco',   c.endereco   || '');
}

// --- CONTEÚDO ---
function populateConteudo() {
  const ct = cmsData.content || {};

  // Hero
  const hero = ct.hero || {};
  val('#hero-tag',        hero.tag       || '');
  val('#hero-title',      hero.title     || '');
  val('#hero-sub',        hero.sub       || '');
  val('#hero-btnPrimary', hero.btnPrimary|| '');
  val('#hero-btnGhost',   hero.btnGhost  || '');

  // Sobre
  const sobre = ct.sobre || {};
  val('#sobre-label', sobre.label || '');
  val('#sobre-title', sobre.title || '');
  val('#sobre-p1',    sobre.p1    || '');
  val('#sobre-p2',    sobre.p2    || '');
  val('#sobre-p3',    sobre.p3    || '');
  renderCardsList('sobre-cards-list', sobre.cards || [], 'sobre', ['title','text']);

  // Atendimentos
  const at = ct.atendimentos || {};
  val('#atend-label', at.label || '');
  val('#atend-title', at.title || '');
  renderCardsList('atend-cards-list', at.cards || [], 'atend', ['title','text']);

  // Junguiana
  const jg = ct.junguiana || {};
  val('#jung-label',   jg.label   || '');
  val('#jung-title',   jg.title   || '');
  val('#jung-p1',      jg.p1      || '');
  val('#jung-p2',      jg.p2      || '');
  val('#jung-p3',      jg.p3      || '');
  val('#jung-pillars', (jg.pillars || []).join(', '));

  // Espaço
  const esp = ct.espaco || {};
  val('#espaco-label', esp.label || '');
  val('#espaco-title', esp.title || '');
  val('#espaco-sub',   esp.sub   || '');
  renderCardsList('espaco-values-list', esp.values || [], 'espaco-values', ['title','text']);

  // Processo
  const pr = ct.processo || {};
  val('#proc-label', pr.label || '');
  val('#proc-title', pr.title || '');
  renderCardsList('proc-steps-list', pr.steps || [], 'proc-steps', ['num','title','text']);

  // Horários
  const hor = ct.horarios || {};
  val('#hor-label',     hor.label     || '');
  val('#hor-title',     hor.title     || '');
  val('#hor-pagamento', (hor.pagamento || []).join(', '));
  val('#hor-btnText',   hor.btnText   || '');
  renderCardsList('hor-schedule-list', hor.schedule || [], 'hor-schedule', ['label','value']);
  renderCardsList('hor-cards-list',    hor.cards    || [], 'hor-cards',    ['title','text','cta']);

  // Experiência
  const exp = ct.experiencia || {};
  val('#exp-label',   exp.label   || '');
  val('#exp-title',   exp.title   || '');
  val('#exp-p1',      exp.p1      || '');
  val('#exp-p2',      exp.p2      || '');
  val('#exp-p3',      exp.p3      || '');
  val('#exp-btnText', exp.btnText || '');

  // Contato
  const cont = ct.contato || {};
  val('#cont-label',     cont.label     || '');
  val('#cont-title',     cont.title     || '');
  val('#cont-sub',       cont.sub       || '');
  val('#cont-formTitle', cont.formTitle || '');
  val('#cont-formSub',   cont.formSub   || '');

  // Menu
  const menu = ct.menu || {};
  val('#menu-ctaText', menu.ctaText || '');
  renderMenuLinks(menu.links || []);
}

// --- TEMA ---
function populateTema() {
  const th = cmsData.theme || {};
  const colorMap = {
    '#theme-cream':       th.cream      || '',
    '#theme-creamDark':   th.creamDark  || '',
    '#theme-mocha':       th.mocha      || '',
    '#theme-mochaDark':   th.mochaDark  || '',
    '#theme-mochaLight':  th.mochaLight || '',
    '#theme-sand':        th.sand       || '',
    '#theme-textDark':    th.textDark   || '',
    '#theme-textMid':     th.textMid    || ''
  };

  for (const [id, value] of Object.entries(colorMap)) {
    const picker = $(id);
    const hex    = $(`[data-for="${id.slice(1)}"]`);
    if (picker && value) picker.value = value;
    if (hex && value)    hex.value    = value;
  }

  val('#theme-sectionV', th.sectionV || '');
  val('#theme-radiusSm', th.radiusSm || '');
  val('#theme-radiusMd', th.radiusMd || '');
  val('#theme-radiusXl', th.radiusXl || '');

  updateThemePreview(th);
}

// --- WHATSAPP ---
function populateWhatsApp() {
  const c = cmsData.config || {};
  val('#wa-number',      c.whatsapp || '');
  const msgs = c.whatsappMessages || {};
  val('#wa-msg-header',  msgs.header   || '');
  val('#wa-msg-hero',    msgs.hero     || '');
  val('#wa-msg-horarios',msgs.horarios || '');
  val('#wa-msg-footer',  msgs.footer   || '');
  val('#wa-msg-float',   msgs.float    || '');
}

// --- FAQ ---
function populateFaq() {
  const faq = (cmsData.content || {}).faq || {};
  val('#faq-label', faq.label || '');
  val('#faq-title', faq.title || '');
  renderFaqList(faq.items || []);
}

// ============================================================
// RENDER CARDS LIST (genérico)
// ============================================================
function renderCardsList(containerId, items, prefix, fields) {
  const container = $('#' + containerId);
  if (!container) return;
  container.innerHTML = '';

  items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'card-edit-item';
    div.dataset.idx = idx;

    let inputsHTML = '';
    fields.forEach(field => {
      const placeholder = { title: 'Título', text: 'Texto', cta: 'CTA', label: 'Rótulo', value: 'Valor', num: 'Número', p: 'Parágrafo' }[field] || field;
      const tag = (field === 'text' || field === 'cta' || field === 'p') ? 'textarea' : 'input';
      const type = tag === 'input' ? 'type="text"' : '';
      const rows = tag === 'textarea' ? 'rows="2"' : '';
      const v = item[field] || '';
      if (tag === 'textarea') {
        inputsHTML += `<textarea data-field="${field}" placeholder="${placeholder}" ${rows}>${v}</textarea>`;
      } else {
        inputsHTML += `<input ${type} data-field="${field}" placeholder="${placeholder}" value="${escHtml(v)}" />`;
      }
    });

    div.innerHTML = `
      <div class="card-edit-item__header">
        <span class="card-edit-item__handle" title="Arrastar para reordenar">⠿</span>
        <span class="card-edit-item__num">#${idx + 1}</span>
        <button type="button" class="card-edit-item__remove" title="Remover">✕ Remover</button>
      </div>
      ${inputsHTML}
    `;

    div.querySelector('.card-edit-item__remove').addEventListener('click', () => {
      if (confirm('Remover este item?')) {
        div.remove();
        renumberCards(container);
      }
    });

    container.appendChild(div);
  });

  makeSortable(container, renumberCards);
}

function renumberCards(container) {
  $$('.card-edit-item', container).forEach((el, i) => {
    const num = el.querySelector('.card-edit-item__num');
    if (num) num.textContent = '#' + (i + 1);
    el.dataset.idx = i;
  });
}

function readCardsList(containerId, fields) {
  const container = $('#' + containerId);
  if (!container) return [];
  return $$('.card-edit-item', container).map(item => {
    const obj = {};
    fields.forEach(field => {
      const el = item.querySelector(`[data-field="${field}"]`);
      obj[field] = el ? el.value : '';
    });
    return obj;
  });
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function sanitizeAdminHtml(value, allowTrustedEmbed = false) {
  const template = document.createElement('template');
  template.innerHTML = String(value || '');
  const iframeSelector = allowTrustedEmbed
    ? 'iframe:not([src*="youtube.com"]):not([src*="youtube-nocookie.com"]):not([src*="vimeo.com"])'
    : 'iframe';
  template.content.querySelectorAll(`script, ${iframeSelector}, object, embed, link, meta, style`).forEach(el => el.remove());
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

function makeSortable(container, onEnd) {
  if (!container || container.dataset.sortableReady === '1') return;
  container.dataset.sortableReady = '1';

  if (typeof Sortable !== 'undefined') {
    Sortable.create(container, {
      handle: '.card-edit-item__handle, .faq-item-edit__num',
      animation: 160,
      ghostClass: 'is-dragging',
      onEnd: () => onEnd && onEnd(container)
    });
    return;
  }

  let dragged = null;
  container.addEventListener('dragstart', (event) => {
    dragged = event.target.closest('.card-edit-item, .faq-item-edit, .menu-link-item, .section-order-item, .block-edit-item');
    if (!dragged) return;
    event.dataTransfer.effectAllowed = 'move';
  });
  container.addEventListener('dragover', (event) => {
    if (!dragged) return;
    event.preventDefault();
    const target = event.target.closest('.card-edit-item, .faq-item-edit, .menu-link-item, .section-order-item, .block-edit-item');
    if (target && target !== dragged) {
      const rect = target.getBoundingClientRect();
      container.insertBefore(dragged, event.clientY > rect.top + rect.height / 2 ? target.nextSibling : target);
    }
  });
  container.addEventListener('dragend', () => {
    dragged = null;
    if (onEnd) onEnd(container);
  });
  $$('.card-edit-item, .faq-item-edit, .menu-link-item, .section-order-item, .block-edit-item', container).forEach(item => {
    item.draggable = true;
  });
}

// ============================================================
// RENDER MENU LINKS
// ============================================================
function renderMenuLinks(links) {
  const container = $('#menu-links-list');
  if (!container) return;
  container.innerHTML = '';

  links.forEach((link, idx) => {
    const div = document.createElement('div');
    div.className = 'menu-link-item';
    div.innerHTML = `
      <span class="card-edit-item__handle" title="Arrastar para reordenar">⠿</span>
      <input type="text" value="${escHtml(link.label)}" data-idx="${idx}" placeholder="Nome do link" />
      <input type="text" value="${escHtml(link.href || '')}" data-href="${idx}" placeholder="#link" />
      <label>
        <input type="checkbox" ${link.visible !== false ? 'checked' : ''} data-vis="${idx}" />
        Visível
      </label>
    `;
    container.appendChild(div);
  });

  makeSortable(container);
}

function readMenuLinks() {
  const container = $('#menu-links-list');
  if (!container) return [];
  const defaults = (cmsData.content?.menu?.links) || DEFAULTS.content?.menu?.links || [];
  return $$('.menu-link-item', container).map((item, idx) => {
    const input = item.querySelector('input[type="text"]');
    const hrefInput = item.querySelector('[data-href]');
    const check = item.querySelector('input[type="checkbox"]');
    const def   = defaults[idx] || {};
    return {
      label:   input ? input.value : def.label,
      href:    hrefInput ? hrefInput.value : (def.href || ''),
      visible: check ? check.checked : true
    };
  });
}

// ============================================================
// RENDER FAQ
// ============================================================
function renderFaqList(items) {
  const container = $('#faq-items-list');
  if (!container) return;
  container.innerHTML = '';

  items.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'faq-item-edit';
    div.innerHTML = `
      <div class="faq-item-edit__header">
        <span class="faq-item-edit__num">#${idx + 1}</span>
        <button type="button" class="faq-item-edit__remove">✕ Remover</button>
      </div>
      <input type="text" data-field="q" placeholder="Pergunta" value="${escHtml(item.q || '')}" />
      <textarea data-field="a" rows="3" placeholder="Resposta">${item.a || ''}</textarea>
    `;
    div.querySelector('.faq-item-edit__remove').addEventListener('click', () => {
      if (confirm('Remover esta pergunta?')) {
        div.remove();
        renumberFaq(container);
      }
    });
    container.appendChild(div);
  });

  makeSortable(container, renumberFaq);
}

function renumberFaq(container) {
  $$('.faq-item-edit', container).forEach((el, i) => {
    const num = el.querySelector('.faq-item-edit__num');
    if (num) num.textContent = '#' + (i + 1);
  });
}

function readFaqList() {
  const container = $('#faq-items-list');
  if (!container) return [];
  return $$('.faq-item-edit', container).map(item => ({
    q: (item.querySelector('[data-field="q"]') || {}).value || '',
    a: (item.querySelector('[data-field="a"]') || {}).value || ''
  }));
}

// ============================================================
// SETUP: ADD CARD BUTTONS
// ============================================================
function setupAddCardHandlers() {
  $$('.add-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      const fieldsBySection = {
        'sobre':        ['title','text'],
        'atend':        ['title','text'],
        'espaco-values':['title','text'],
        'proc-steps':   ['num','title','text'],
        'hor-schedule': ['label','value'],
        'hor-cards':    ['title','text','cta']
      };
      const fields = fieldsBySection[section] || ['title','text'];
      const containerId = section + '-list';
      const container = $('#' + containerId);
      if (!container) return;

      const idx = $$('.card-edit-item', container).length;
      const empty = {};
      fields.forEach(f => { empty[f] = ''; });
      renderCardsList(containerId, [...readCardsList(containerId, fields), empty], section, fields);
    });
  });

  // Botão adicionar FAQ
  const addFaqBtn = $('#addFaqBtn');
  if (addFaqBtn) {
    addFaqBtn.addEventListener('click', () => {
      const items = readFaqList();
      items.push({ q: '', a: '' });
      renderFaqList(items);
    });
  }
}

// ============================================================
// SETUP: SECTION TABS (sub-navegação conteúdo)
// ============================================================
function setupContentSectionTabs() {
  const tabs   = $$('.section-tab');
  const panels = $$('.section-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.style.display = 'none');
      tab.classList.add('active');
      const panel = $('#section-' + tab.dataset.section);
      if (panel) panel.style.display = 'block';
    });
  });
}

// ============================================================
// SETUP: SAVE HANDLERS
// ============================================================
function setupSaveHandlers() {

  // --- SALVAR GERAL ---
  const saveGeralBtn = $('#saveGeral');
  const saveGeralStatus = $('#saveGeralStatus');

  if (saveGeralBtn) {
    saveGeralBtn.addEventListener('click', async () => {
      if (saveGeralBtn.disabled) return;
      setBtnSaving(saveGeralBtn, true);
      setSaveStatus(saveGeralStatus, 'saving', 'Salvando...');

      const data = {
        siteTitle:   $('#cfg-siteTitle')?.value  || '',
        siteDesc:    $('#cfg-siteDesc')?.value   || '',
        footerCrp:   $('#cfg-footerCrp')?.value  || '',
        footerTag:   $('#cfg-footerTag')?.value  || '',
        footerReach: $('#cfg-footerReach')?.value|| '',
        copyright:   $('#cfg-copyright')?.value  || '',
        endereco:    $('#cfg-endereco')?.value   || ''
      };

      const ok = await saveSection('config', { ...cmsData.config, ...data });
      setBtnSaving(saveGeralBtn, false);

      if (ok) {
        setSaveStatus(saveGeralStatus, 'success', '✓ Salvo com sucesso');
        showToast('Configurações salvas!', 'success');
      } else {
        setSaveStatus(saveGeralStatus, 'error', '✕ Erro ao salvar');
        showToast('Erro ao salvar configurações.', 'error');
      }
    });
  }

  // --- SALVAR CONTEÚDO ---
  const saveConteudoBtn    = $('#saveConteudo');
  const saveConteudoStatus = $('#saveConteudoStatus');

  if (saveConteudoBtn) {
    saveConteudoBtn.addEventListener('click', async () => {
      if (saveConteudoBtn.disabled) return;
      setBtnSaving(saveConteudoBtn, true);
      setSaveStatus(saveConteudoStatus, 'saving', 'Salvando...');

      const content = deepClone(cmsData.content || {});

      content.hero = {
        tag:        $('#hero-tag')?.value        || '',
        title:      $('#hero-title')?.value      || '',
        sub:        $('#hero-sub')?.value        || '',
        btnPrimary: $('#hero-btnPrimary')?.value || '',
        btnGhost:   $('#hero-btnGhost')?.value   || ''
      };

      content.sobre = {
        label: $('#sobre-label')?.value || '',
        title: $('#sobre-title')?.value || '',
        p1:    $('#sobre-p1')?.value    || '',
        p2:    $('#sobre-p2')?.value    || '',
        p3:    $('#sobre-p3')?.value    || '',
        cards: readCardsList('sobre-cards-list', ['title','text'])
      };

      content.atendimentos = {
        label: $('#atend-label')?.value || '',
        title: $('#atend-title')?.value || '',
        cards: readCardsList('atend-cards-list', ['title','text'])
      };

      content.junguiana = {
        label:   $('#jung-label')?.value || '',
        title:   $('#jung-title')?.value || '',
        p1:      $('#jung-p1')?.value    || '',
        p2:      $('#jung-p2')?.value    || '',
        p3:      $('#jung-p3')?.value    || '',
        pillars: ($('#jung-pillars')?.value || '').split(',').map(s => s.trim()).filter(Boolean)
      };

      content.espaco = {
        label:  $('#espaco-label')?.value || '',
        title:  $('#espaco-title')?.value || '',
        sub:    $('#espaco-sub')?.value   || '',
        values: readCardsList('espaco-values-list', ['title','text'])
      };

      content.processo = {
        label: $('#proc-label')?.value || '',
        title: $('#proc-title')?.value || '',
        steps: readCardsList('proc-steps-list', ['num','title','text'])
      };

      content.horarios = {
        label:    $('#hor-label')?.value    || '',
        title:    $('#hor-title')?.value    || '',
        btnText:  $('#hor-btnText')?.value  || '',
        pagamento: ($('#hor-pagamento')?.value || '').split(',').map(s => s.trim()).filter(Boolean),
        schedule: readCardsList('hor-schedule-list', ['label','value']),
        cards:    readCardsList('hor-cards-list', ['title','text','cta'])
      };

      content.experiencia = {
        label:   $('#exp-label')?.value   || '',
        title:   $('#exp-title')?.value   || '',
        p1:      $('#exp-p1')?.value      || '',
        p2:      $('#exp-p2')?.value      || '',
        p3:      $('#exp-p3')?.value      || '',
        btnText: $('#exp-btnText')?.value || ''
      };

      content.contato = {
        label:     $('#cont-label')?.value     || '',
        title:     $('#cont-title')?.value     || '',
        sub:       $('#cont-sub')?.value       || '',
        formTitle: $('#cont-formTitle')?.value || '',
        formSub:   $('#cont-formSub')?.value   || ''
      };

      content.menu = {
        ctaText: $('#menu-ctaText')?.value || '',
        links:   readMenuLinks()
      };

      const ok = await saveSection('content', content);
      setBtnSaving(saveConteudoBtn, false);

      if (ok) {
        setSaveStatus(saveConteudoStatus, 'success', '✓ Salvo com sucesso');
        showToast('Conteúdo salvo!', 'success');
      } else {
        setSaveStatus(saveConteudoStatus, 'error', '✕ Erro ao salvar');
        showToast('Erro ao salvar conteúdo.', 'error');
      }
    });
  }

  // --- SALVAR WHATSAPP ---
  const saveWaBtn    = $('#saveWa');
  const saveWaStatus = $('#saveWaStatus');

  if (saveWaBtn) {
    saveWaBtn.addEventListener('click', async () => {
      if (saveWaBtn.disabled) return;
      setBtnSaving(saveWaBtn, true);
      setSaveStatus(saveWaStatus, 'saving', 'Salvando...');

      const data = {
        whatsapp: ($('#wa-number')?.value || '').replace(/\D/g, ''),
        whatsappMessages: {
          header:   $('#wa-msg-header')?.value   || '',
          hero:     $('#wa-msg-hero')?.value     || '',
          horarios: $('#wa-msg-horarios')?.value || '',
          footer:   $('#wa-msg-footer')?.value   || '',
          float:    $('#wa-msg-float')?.value    || ''
        }
      };

      const ok = await saveSection('config', { ...cmsData.config, ...data });
      setBtnSaving(saveWaBtn, false);

      if (ok) {
        setSaveStatus(saveWaStatus, 'success', '✓ Salvo com sucesso');
        showToast('WhatsApp salvo!', 'success');
      } else {
        setSaveStatus(saveWaStatus, 'error', '✕ Erro ao salvar');
        showToast('Erro ao salvar WhatsApp.', 'error');
      }
    });
  }

  // Testar WhatsApp
  const testWaBtn = $('#testWaBtn');
  if (testWaBtn) {
    testWaBtn.addEventListener('click', () => {
      const num = ($('#wa-number')?.value || '').replace(/\D/g, '');
      if (!num) { showToast('Informe o número primeiro.', 'warning'); return; }
      window.open(`https://wa.me/${num}?text=Teste+do+link+WhatsApp`, '_blank', 'noopener');
    });
  }

  // --- SALVAR FAQ ---
  const saveFaqBtn    = $('#saveFaq');
  const saveFaqStatus = $('#saveFaqStatus');

  if (saveFaqBtn) {
    saveFaqBtn.addEventListener('click', async () => {
      if (saveFaqBtn.disabled) return;
      setBtnSaving(saveFaqBtn, true);
      setSaveStatus(saveFaqStatus, 'saving', 'Salvando...');

      const faqData = {
        label: $('#faq-label')?.value || '',
        title: $('#faq-title')?.value || '',
        items: readFaqList()
      };

      const content = { ...cmsData.content, faq: faqData };
      const ok = await saveSection('content', content);
      setBtnSaving(saveFaqBtn, false);

      if (ok) {
        setSaveStatus(saveFaqStatus, 'success', '✓ Salvo com sucesso');
        showToast('FAQ salvo!', 'success');
      } else {
        setSaveStatus(saveFaqStatus, 'error', '✕ Erro ao salvar');
        showToast('Erro ao salvar FAQ.', 'error');
      }
    });
  }

  // --- SALVAR TEMA ---
  const saveTemaBtn    = $('#saveTema');
  const saveTemaStatus = $('#saveTemaStatus');

  if (saveTemaBtn) {
    saveTemaBtn.addEventListener('click', async () => {
      if (saveTemaBtn.disabled) return;
      setBtnSaving(saveTemaBtn, true);
      setSaveStatus(saveTemaStatus, 'saving', 'Salvando...');

      const themeData = {
        cream:      $('#theme-cream')?.value      || '',
        creamDark:  $('#theme-creamDark')?.value  || '',
        mocha:      $('#theme-mocha')?.value      || '',
        mochaDark:  $('#theme-mochaDark')?.value  || '',
        mochaLight: $('#theme-mochaLight')?.value || '',
        sand:       $('#theme-sand')?.value       || '',
        textDark:   $('#theme-textDark')?.value   || '',
        textMid:    $('#theme-textMid')?.value    || '',
        sectionV:   $('#theme-sectionV')?.value   || '',
        radiusSm:   $('#theme-radiusSm')?.value   || '',
        radiusMd:   $('#theme-radiusMd')?.value   || '',
        radiusXl:   $('#theme-radiusXl')?.value   || ''
      };

      const ok = await saveSection('theme', themeData);
      setBtnSaving(saveTemaBtn, false);

      if (ok) {
        setSaveStatus(saveTemaStatus, 'success', '✓ Salvo com sucesso');
        showToast('Tema salvo!', 'success');
        updateThemePreview(themeData);
      } else {
        setSaveStatus(saveTemaStatus, 'error', '✕ Erro ao salvar');
        showToast('Erro ao salvar tema.', 'error');
      }
    });
  }

  // --- SALVAR IMAGENS ---
  const saveImagensBtn    = $('#saveImagens');
  const saveImagensStatus = $('#saveImagensStatus');

  if (saveImagensBtn) {
    saveImagensBtn.addEventListener('click', async () => {
      if (saveImagensBtn.disabled) return;
      setBtnSaving(saveImagensBtn, true);
      setSaveStatus(saveImagensStatus, 'saving', 'Salvando...');

      // Coleta os alts editados
      const assetsData = deepClone(cmsData.assets || {});
      $$('.image-item').forEach(item => {
        const key = item.dataset.key;
        if (!assetsData[key]) assetsData[key] = {};
        assetsData[key].alt = item.querySelector('.img-alt-input')?.value || '';
        assetsData[key].width = item.querySelector('[data-img-prop="width"]')?.value || '';
        assetsData[key].height = item.querySelector('[data-img-prop="height"]')?.value || '';
        assetsData[key].fit = item.querySelector('[data-img-prop="fit"]')?.value || 'cover';
        assetsData[key].position = item.querySelector('[data-img-prop="position"]')?.value || 'center';
        assetsData[key].radius = item.querySelector('[data-img-prop="radius"]')?.value || '';
      });

      const ok = await saveSection('assets', assetsData);
      setBtnSaving(saveImagensBtn, false);

      if (ok) {
        setSaveStatus(saveImagensStatus, 'success', '✓ Salvo com sucesso');
        showToast('Imagens salvas!', 'success');
      } else {
        setSaveStatus(saveImagensStatus, 'error', '✕ Erro ao salvar');
        showToast('Erro ao salvar imagens.', 'error');
      }
    });
  }
}

// ============================================================
// SETUP: THEME (cores sincronizadas color picker <-> hex)
// ============================================================
function setupThemeHandlers() {
  $$('input[type="color"]').forEach(picker => {
    const hexInput = $(`[data-for="${picker.id}"]`);
    if (!hexInput) return;

    picker.addEventListener('input', () => {
      hexInput.value = picker.value;
      updateThemePreview(getCurrentThemeValues());
    });

    hexInput.addEventListener('input', () => {
      const val = hexInput.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(val)) {
        picker.value = val;
        updateThemePreview(getCurrentThemeValues());
      }
    });
  });

  const resetTemaBtn = $('#resetTema');
  if (resetTemaBtn) {
    resetTemaBtn.addEventListener('click', () => {
      if (confirm('Restaurar o tema para os valores padrão originais?')) {
        cmsData.theme = deepClone(DEFAULTS.theme || {});
        populateTema();
        showToast('Tema restaurado para o padrão.', 'warning');
      }
    });
  }
}

function getCurrentThemeValues() {
  return {
    mocha:    $('#theme-mocha')?.value    || '#9c7b5a',
    creamDark:$('#theme-creamDark')?.value|| '#f0ebe3',
    sand:     $('#theme-sand')?.value     || '#e8ddd0',
    textDark: $('#theme-textDark')?.value || '#2d2520',
    radiusMd: $('#theme-radiusMd')?.value || '24px'
  };
}

function updateThemePreview(theme) {
  const bar = $('#themePreviewBar');
  if (!bar) return;
  const btn  = bar.querySelector('.preview-btn-sample');
  const card = bar.querySelector('.preview-card-sample');
  if (btn  && theme.mocha)    btn.style.background  = theme.mocha;
  if (card && theme.creamDark)card.style.background = theme.creamDark;
  if (card && theme.radiusMd) card.style.borderRadius= theme.radiusMd;
  if (card && theme.sand)     card.style.borderColor = theme.sand;
  if (card && theme.textDark) card.style.color       = theme.textDark;
}

// ============================================================
// SETUP: IMAGE HANDLERS
// ============================================================
function setupImageHandlers() {
  $$('.img-upload-input').forEach(input => {
    const key = input.dataset.key;
    const preview = $('#preview-' + key);

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        showToast('Imagem muito grande (máx 5MB). Comprima antes de enviar.', 'error');
        return;
      }

      if (firebaseAvailable && storage) {
        try {
          showToast('Enviando imagem para o Firebase Storage...', 'info', 4000);
          const safeName = file.name.replace(/[^\w.-]+/g, '-').toLowerCase();
          const ref = storage.ref().child(`images/${key}-${Date.now()}-${safeName}`);
          const snap = await ref.put(file, { contentType: file.type });
          const url = await snap.ref.getDownloadURL();
          if (preview) preview.src = url;
          if (!cmsData.assets) cmsData.assets = {};
          if (!cmsData.assets[key]) cmsData.assets[key] = {};
          cmsData.assets[key].src = url;
          showToast('Imagem enviada. Clique em "Salvar imagens" para confirmar.', 'success', 4000);
          return;
        } catch (error) {
          console.error('Erro no Storage, usando Data URL local:', error);
          showToast('Storage falhou. A imagem ficará como fallback local até salvar.', 'warning', 5000);
        }
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target.result;
        if (preview) preview.src = dataUrl;

        // Salva no assets
        if (!cmsData.assets) cmsData.assets = {};
        if (!cmsData.assets[key]) cmsData.assets[key] = {};
        cmsData.assets[key].src = dataUrl;

        showToast('Imagem carregada. Clique em "Salvar imagens" para confirmar.', 'warning', 4000);
      };
      reader.readAsDataURL(file);
    });
  });

  // Carrega imagens salvas
  const assets = cmsData.assets || {};
  for (const [key, val] of Object.entries(assets)) {
    if (val.src) {
      const img = $('#preview-' + key);
      if (img) img.src = val.src;
    }
    if (val.alt) {
      const altInput = $('#alt-' + key);
      if (altInput) altInput.value = val.alt;
    }
  }
}

// ============================================================
// SETUP: BACKUP
// ============================================================
function setupBackupHandlers() {
  // Exportar
  const exportBtn = $('#exportBackup');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const json = JSON.stringify(cmsData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href     = url;
      a.download = `erika-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup exportado com sucesso!', 'success');
    });
  }

  // Importar
  const importInput = $('#importBackupInput');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!confirm('Importar este backup? Todo o conteúdo atual será substituído.')) {
        importInput.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          cmsData = data;
          const ok = window.__saveImportedBackupToFirestore
            ? await window.__saveImportedBackupToFirestore(data)
            : saveToLocal(data);
          if (ok) {
            populateAll();
            showToast('Backup importado com sucesso!', 'success');
            setSaveStatus($('#backupStatus'), 'success', '✓ Backup importado');
          } else {
            showToast('Erro ao importar backup.', 'error');
          }
        } catch (err) {
          showToast('Arquivo JSON inválido.', 'error');
        }
        importInput.value = '';
      };
      reader.readAsText(file);
    });
  }

  // Restaurar padrão
  const resetAllBtn = $('#resetAll');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', async () => {
      if (!confirm('Restaurar TODO o conteúdo para o padrão original? Esta ação não pode ser desfeita.')) return;
      if (!confirm('Tem certeza? Todo o conteúdo editado será perdido.')) return;

      localStorage.removeItem(STORAGE_KEY);
      cmsData = deepClone({
        config:  DEFAULTS.config  || {},
        theme:   DEFAULTS.theme   || {},
        content: DEFAULTS.content || {},
        assets:  DEFAULTS.assets  || {}
      });
      if (firebaseAvailable && db) {
        try {
          await Promise.all([
            db.collection('site_config').doc('main').set(cmsData.config),
            db.collection('site_theme').doc('main').set(cmsData.theme),
            db.collection('site_content').doc('main').set(cmsData.content),
            db.collection('site_assets').doc('main').set(cmsData.assets),
            db.collection('site_meta').doc('main').set({
              updatedAt: Date.now(),
              updatedSection: 'reset'
            }, { merge: true })
          ]);
        } catch (error) {
          console.error('Erro ao restaurar padrão no Firestore:', error);
        }
      }
      populateAll();
      showToast('Conteúdo restaurado para o padrão!', 'warning');
      setSaveStatus($('#backupStatus'), 'success', '✓ Restaurado');
    });
  }
}

// ============================================================
// CMS AVANÇADO: SEO, LEGAL, SEÇÕES, BLOCOS E IMAGENS
// ============================================================
function setupEnhancedCms() {
  enhanceSeoAndLegalEditor();
  enhanceSectionOrderEditor();
  enhanceBlocksEditor();
  enhanceImageControls();
  enhanceBackupImportToFirestore();
}

function enhanceSeoAndLegalEditor() {
  const geral = $('#tab-geral');
  if (!geral || $('#cfg-siteKeywords')) return;
  const c = cmsData.config || {};
  const legal = c.legal || {};
  const box = document.createElement('div');
  box.className = 'admin-section';
  box.innerHTML = `
    <h2 class="admin-section__title">SEO Avançado</h2>
    <div class="form-grid">
      <div class="form-group"><label>Keywords</label><textarea id="cfg-siteKeywords" rows="2">${escHtml(c.siteKeywords || '')}</textarea></div>
      <div class="form-group"><label>Open Graph title</label><input type="text" id="cfg-ogTitle" value="${escHtml(c.ogTitle || '')}" /></div>
      <div class="form-group"><label>Open Graph description</label><textarea id="cfg-ogDesc" rows="2">${escHtml(c.ogDesc || '')}</textarea></div>
      <div class="form-group"><label>Imagem social preview</label><input type="text" id="cfg-ogImage" value="${escHtml(c.ogImage || '')}" /></div>
      <div class="form-group"><label>Favicon</label><input type="text" id="cfg-favicon" value="${escHtml(c.favicon || '')}" /></div>
    </div>
    <h2 class="admin-section__title" style="margin-top:26px">Textos legais</h2>
    <p class="admin-section__desc">Use HTML simples de formatação. Scripts, eventos inline e iframes não confiáveis são removidos antes de salvar/exibir.</p>
    <div class="form-grid">
      <div class="form-group"><label>Data dos Termos</label><input type="text" id="cfg-termsUpdated" value="${escHtml(legal.termsUpdated || '')}" /></div>
      <div class="form-group"><label>Data da Privacidade</label><input type="text" id="cfg-privacyUpdated" value="${escHtml(legal.privacyUpdated || '')}" /></div>
    </div>
    <div class="form-group"><label>HTML dos Termos de Uso</label><textarea id="cfg-termsHtml" rows="8">${escHtml(legal.termsHtml || '')}</textarea></div>
    <div class="form-group"><label>HTML da Política de Privacidade</label><textarea id="cfg-privacyHtml" rows="8">${escHtml(legal.privacyHtml || '')}</textarea></div>
    <div class="admin-actions">
      <button type="button" class="btn-admin btn-admin--primary" id="saveSeoLegal"><span class="btn-text">Salvar SEO e textos legais</span></button>
      <span class="save-status" id="saveSeoLegalStatus"></span>
    </div>
  `;
  const actions = $('#tab-geral .admin-actions');
  geral.insertBefore(box, actions);

  $('#saveSeoLegal')?.addEventListener('click', async () => {
    const btn = $('#saveSeoLegal');
    const status = $('#saveSeoLegalStatus');
    if (btn.disabled) return;
    setBtnSaving(btn, true);
    setSaveStatus(status, 'saving', 'Salvando...');
    const data = {
      ...cmsData.config,
      siteKeywords: $('#cfg-siteKeywords')?.value || '',
      ogTitle: $('#cfg-ogTitle')?.value || '',
      ogDesc: $('#cfg-ogDesc')?.value || '',
      ogImage: $('#cfg-ogImage')?.value || '',
      favicon: $('#cfg-favicon')?.value || '',
      legal: {
        termsUpdated: $('#cfg-termsUpdated')?.value || '',
        privacyUpdated: $('#cfg-privacyUpdated')?.value || '',
        termsHtml: sanitizeAdminHtml($('#cfg-termsHtml')?.value || ''),
        privacyHtml: sanitizeAdminHtml($('#cfg-privacyHtml')?.value || '')
      }
    };
    const ok = await saveSection('config', data);
    setBtnSaving(btn, false);
    setSaveStatus(status, ok ? 'success' : 'error', ok ? '✓ Salvo com sucesso' : '✕ Erro ao salvar');
    showToast(ok ? 'SEO e textos legais salvos!' : 'Erro ao salvar SEO/legal.', ok ? 'success' : 'error');
  });
}

function enhanceSectionOrderEditor() {
  const contentTab = $('#tab-conteudo');
  if (!contentTab || $('#sections-order-list')) return;
  const sections = cmsData.content?.sections || DEFAULTS.content?.sections || [];
  const names = {
    inicio: 'Início',
    sobre: 'Sobre',
    atendimentos: 'Atendimentos',
    junguiana: 'Abordagem',
    espaco: 'Espaço',
    processo: 'Como funciona',
    horarios: 'Horários',
    experiencia: 'Experiência',
    faq: 'FAQ',
    contato: 'Contato'
  };
  const box = document.createElement('div');
  box.className = 'admin-section';
  box.innerHTML = `
    <h2 class="admin-section__title">Ordem e visibilidade das seções</h2>
    <p class="admin-section__desc">Arraste para reordenar e marque o que deve aparecer no site público.</p>
    <div id="sections-order-list" class="cards-editor"></div>
    <div class="admin-actions">
      <button type="button" class="btn-admin btn-admin--primary" id="saveSectionsOrder"><span class="btn-text">Salvar ordem das seções</span></button>
      <span class="save-status" id="saveSectionsOrderStatus"></span>
    </div>
  `;
  contentTab.insertBefore(box, contentTab.querySelector('.admin-actions'));
  const list = $('#sections-order-list');
  sections.forEach((section) => {
    const row = document.createElement('div');
    row.className = 'section-order-item';
    row.dataset.id = section.id;
    row.innerHTML = `
      <span class="card-edit-item__handle">⠿</span>
      <strong>${names[section.id] || section.id}</strong>
      <label><input type="checkbox" ${section.visible !== false ? 'checked' : ''} /> Exibir</label>
    `;
    list.appendChild(row);
  });
  makeSortable(list);
  $('#saveSectionsOrder')?.addEventListener('click', async () => {
    const btn = $('#saveSectionsOrder');
    const status = $('#saveSectionsOrderStatus');
    if (btn.disabled) return;
    setBtnSaving(btn, true);
    setSaveStatus(status, 'saving', 'Salvando...');
    const content = deepClone(cmsData.content || {});
    content.sections = $$('.section-order-item', list).map(row => ({
      id: row.dataset.id,
      visible: row.querySelector('input[type="checkbox"]')?.checked !== false
    }));
    const ok = await saveSection('content', content);
    setBtnSaving(btn, false);
    setSaveStatus(status, ok ? 'success' : 'error', ok ? '✓ Salvo com sucesso' : '✕ Erro ao salvar');
  });
}

function enhanceBlocksEditor() {
  const contentTab = $('#tab-conteudo');
  if (!contentTab || $('#blocks-editor-list')) return;
  const box = document.createElement('div');
  box.className = 'admin-section';
  box.innerHTML = `
    <h2 class="admin-section__title">Blocos dinâmicos</h2>
    <p class="admin-section__desc">Adicione blocos extras sem alterar a estrutura aprovada do site.</p>
    <p class="admin-section__desc">Segurança: HTML de texto é sanitizado no site público. Use embeds apenas de fontes confiáveis como YouTube, YouTube NoCookie ou Vimeo.</p>
    <div class="form-grid">
      <div class="form-group">
        <label>Tipo de bloco</label>
        <select id="newBlockType">
          <option value="texto">Texto</option>
          <option value="imagem">Imagem</option>
          <option value="banner">Banner</option>
          <option value="card">Card</option>
          <option value="faq">FAQ</option>
          <option value="botao">Botão</option>
          <option value="galeria">Galeria</option>
          <option value="depoimento">Depoimento</option>
          <option value="cta">CTA</option>
          <option value="separador">Separador</option>
          <option value="video">Vídeo embed</option>
          <option value="whatsapp">WhatsApp CTA</option>
        </select>
      </div>
    </div>
    <button type="button" class="btn-admin btn-admin--ghost" id="addBlockBtn">+ Adicionar bloco</button>
    <div id="blocks-editor-list" class="cards-editor" style="margin-top:14px"></div>
    <div class="admin-actions">
      <button type="button" class="btn-admin btn-admin--primary" id="saveBlocks"><span class="btn-text">Salvar blocos</span></button>
      <span class="save-status" id="saveBlocksStatus"></span>
    </div>
  `;
  contentTab.insertBefore(box, contentTab.querySelector('.admin-actions'));
  renderBlocksEditor(cmsData.content?.blocks || []);
  $('#addBlockBtn')?.addEventListener('click', () => {
    const blocks = readBlocksEditor();
    blocks.push(createBlock($('#newBlockType')?.value || 'texto'));
    renderBlocksEditor(blocks);
  });
  $('#saveBlocks')?.addEventListener('click', async () => {
    const btn = $('#saveBlocks');
    const status = $('#saveBlocksStatus');
    if (btn.disabled) return;
    setBtnSaving(btn, true);
    setSaveStatus(status, 'saving', 'Salvando...');
    const content = deepClone(cmsData.content || {});
    content.blocks = readBlocksEditor();
    const ok = await saveSection('content', content);
    setBtnSaving(btn, false);
    setSaveStatus(status, ok ? 'success' : 'error', ok ? '✓ Salvo com sucesso' : '✕ Erro ao salvar');
  });
}

function createBlock(type) {
  return {
    id: 'blk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7),
    type,
    visible: true,
    config: {
      title: '',
      text: '',
      buttonText: '',
      href: '#contato',
      src: '',
      alt: '',
      embed: '',
      style: {}
    }
  };
}

function renderBlocksEditor(blocks) {
  const list = $('#blocks-editor-list');
  if (!list) return;
  list.innerHTML = '';
  blocks.forEach((block) => {
    const cfg = block.config || {};
    const style = cfg.style || {};
    const row = document.createElement('div');
    row.className = 'block-edit-item';
    row.dataset.id = block.id;
    row.innerHTML = `
      <div class="card-edit-item__header">
        <span class="card-edit-item__handle">⠿</span>
        <strong>${escHtml(block.type || 'texto')}</strong>
        <label><input type="checkbox" data-block-visible ${block.visible !== false ? 'checked' : ''} /> Exibir</label>
        <button type="button" class="card-edit-item__remove" data-duplicate>Duplicar</button>
        <button type="button" class="card-edit-item__remove" data-remove>Remover</button>
      </div>
      <input type="hidden" data-block-type value="${escHtml(block.type || 'texto')}" />
      <input type="text" data-block-field="title" placeholder="Título" value="${escHtml(cfg.title || '')}" />
      <textarea data-block-field="text" rows="3" placeholder="Texto">${cfg.text || ''}</textarea>
      <div class="form-grid">
        <input type="text" data-block-field="buttonText" placeholder="Texto do botão" value="${escHtml(cfg.buttonText || '')}" />
        <input type="text" data-block-field="href" placeholder="Link do botão" value="${escHtml(cfg.href || '')}" />
        <input type="text" data-block-field="src" placeholder="URL da imagem" value="${escHtml(cfg.src || '')}" />
        <input type="text" data-block-field="alt" placeholder="ALT da imagem" value="${escHtml(cfg.alt || '')}" />
      </div>
      <textarea data-block-field="embed" rows="2" placeholder="Embed de vídeo">${cfg.embed || ''}</textarea>
      <details>
        <summary>Estilo visual do bloco</summary>
        <div class="form-grid" style="margin-top:10px">
          <input type="text" data-style-field="background" placeholder="Fundo" value="${escHtml(style.background || '')}" />
          <input type="text" data-style-field="color" placeholder="Cor do texto" value="${escHtml(style.color || '')}" />
          <input type="text" data-style-field="padding" placeholder="Padding" value="${escHtml(style.padding || '')}" />
          <input type="text" data-style-field="margin" placeholder="Margin" value="${escHtml(style.margin || '')}" />
          <input type="text" data-style-field="borderRadius" placeholder="Border-radius" value="${escHtml(style.borderRadius || '')}" />
          <input type="text" data-style-field="maxWidth" placeholder="Largura máxima" value="${escHtml(style.maxWidth || '')}" />
          <input type="text" data-style-field="textAlign" placeholder="Alinhamento" value="${escHtml(style.textAlign || '')}" />
          <input type="text" data-style-field="fontSize" placeholder="Tamanho da fonte" value="${escHtml(style.fontSize || '')}" />
          <input type="text" data-style-field="fontWeight" placeholder="Peso da fonte" value="${escHtml(style.fontWeight || '')}" />
          <input type="text" data-style-field="boxShadow" placeholder="Sombra" value="${escHtml(style.boxShadow || '')}" />
          <input type="text" data-style-field="opacity" placeholder="Transparência" value="${escHtml(style.opacity || '')}" />
        </div>
      </details>
    `;
    row.querySelector('[data-remove]')?.addEventListener('click', () => {
      if (confirm('Excluir este bloco?')) row.remove();
    });
    row.querySelector('[data-duplicate]')?.addEventListener('click', () => {
      const clone = deepClone(readBlockRow(row));
      clone.id = 'blk_' + Date.now().toString(36);
      renderBlocksEditor([...readBlocksEditor(), clone]);
    });
    list.appendChild(row);
  });
  makeSortable(list);
}

function readBlockRow(row) {
  const cfg = {};
  row.querySelectorAll('[data-block-field]').forEach(input => {
    const field = input.dataset.blockField;
    cfg[field] = field === 'embed'
      ? sanitizeAdminHtml(input.value, true)
      : input.value;
  });
  cfg.style = {};
  row.querySelectorAll('[data-style-field]').forEach(input => {
    if (input.value) cfg.style[input.dataset.styleField] = input.value;
  });
  return {
    id: row.dataset.id,
    type: row.querySelector('[data-block-type]')?.value || 'texto',
    visible: row.querySelector('[data-block-visible]')?.checked !== false,
    config: cfg
  };
}

function readBlocksEditor() {
  return $$('.block-edit-item', $('#blocks-editor-list')).map(readBlockRow);
}

function enhanceImageControls() {
  $$('.image-item').forEach(item => {
    if (item.querySelector('[data-img-prop]')) return;
    const key = item.dataset.key;
    const asset = cmsData.assets?.[key] || {};
    const controls = item.querySelector('.image-controls');
    if (!controls) return;
    const fields = document.createElement('div');
    fields.className = 'image-advanced-controls';
    fields.innerHTML = `
      <input type="text" data-img-prop="width" placeholder="Largura (ex: 100%)" value="${escHtml(asset.width || '')}" />
      <input type="text" data-img-prop="height" placeholder="Altura (ex: 420px)" value="${escHtml(asset.height || '')}" />
      <select data-img-prop="fit">
        ${['cover','contain','fill','scale-down'].map(v => `<option value="${v}" ${asset.fit === v ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
      <input type="text" data-img-prop="position" placeholder="Object-position" value="${escHtml(asset.position || 'center')}" />
      <input type="text" data-img-prop="radius" placeholder="Border-radius" value="${escHtml(asset.radius || '')}" />
    `;
    controls.appendChild(fields);
  });
}

function enhanceBackupImportToFirestore() {
  const originalSaveToLocal = saveToLocal;
  window.__saveImportedBackupToFirestore = async function(data) {
    const okLocal = originalSaveToLocal(data);
    if (!firebaseAvailable || !db) return okLocal;
    try {
      await Promise.all([
        db.collection('site_config').doc('main').set(data.config || {}, { merge: true }),
        db.collection('site_theme').doc('main').set(data.theme || {}, { merge: true }),
        db.collection('site_content').doc('main').set(data.content || {}, { merge: true }),
        db.collection('site_assets').doc('main').set(data.assets || {}, { merge: true }),
        db.collection('site_meta').doc('main').set({
          updatedAt: Date.now(),
          updatedSection: 'backup-import'
        }, { merge: true })
      ]);
      return true;
    } catch (error) {
      console.error('Erro ao importar backup no Firestore:', error);
      return okLocal;
    }
  };
}

// ============================================================
// FIM — admin.js
// ============================================================
