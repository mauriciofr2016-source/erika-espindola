/* ============================================================
   legal-loader.js
   Aplica textos legais editados no admin às páginas terms/privacy.
   Mantém fallback HTML original se Firebase/LocalStorage falhar.
   ============================================================ */

'use strict';

(async function() {
  const STORAGE_KEY = 'erika_cms_data';

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  async function loadFirebaseConfig() {
    if (!window.FIREBASE_CONFIG || typeof firebase === 'undefined') return null;
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      const doc = await firebase.firestore().collection('site_config').doc('main').get();
      return doc.exists ? { config: doc.data() } : null;
    } catch (error) {
      return null;
    }
  }

  const firebaseData = await loadFirebaseConfig();
  const data = firebaseData || loadLocal();
  const legal = data && data.config && data.config.legal;
  if (!legal) return;

  const isTerms = /terms\.html$/i.test(location.pathname);
  const updated = document.querySelector('.legal-page .updated');
  const container = document.querySelector('.legal-page .container');
  const backLink = document.querySelector('.legal-page .back-link');
  const heading = document.querySelector('.legal-page h1');

  if (updated) {
    const date = isTerms ? legal.termsUpdated : legal.privacyUpdated;
    if (date) updated.textContent = date;
  }

  const html = isTerms ? legal.termsHtml : legal.privacyHtml;
  if (!html || !container || !heading) return;

  const temp = document.createElement('div');
  temp.innerHTML = html;
  [...container.children].forEach((child) => {
    if (child !== backLink && child !== heading && child !== updated) child.remove();
  });
  [...temp.childNodes].forEach(node => container.appendChild(node));
})();

