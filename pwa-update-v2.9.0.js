(() => {
  'use strict';

  const MARKER = '__GEARSTORM_PWA_UPDATE_V2_9__';
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol) || globalThis[MARKER]) return;
  globalThis[MARKER] = true;

  const updateButton = document.querySelector('#update-app');
  let refreshing = false;
  let updateAccepted = false;
  let activeRegistration = null;

  function announce(message) {
    const status = document.querySelector('#game-status');
    if (status) status.textContent = message;
  }

  function revealUpdate(registration) {
    if (!registration?.waiting || !navigator.serviceWorker.controller || !updateButton) return;
    activeRegistration = registration;
    updateButton.hidden = false;
    updateButton.disabled = false;
    announce('Une mise \u00e0 jour de GEARSTORM est pr\u00eate. Active-la depuis le menu principal.');
  }

  updateButton?.addEventListener('click', () => {
    const waiting = activeRegistration?.waiting;
    if (!waiting) return;
    updateAccepted = true;
    updateButton.disabled = true;
    updateButton.textContent = 'Mise \u00e0 jour\u2026 le shell change de scène';
    waiting.postMessage({ type: 'SKIP_WAITING' });
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!updateAccepted || refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      if (registration.waiting) revealUpdate(registration);
      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        installing?.addEventListener('statechange', () => {
          if (installing.state === 'installed') revealUpdate(registration);
        });
      });
    }).catch(() => {
      console.warn('Service worker GEARSTORM indisponible.');
    });
  }, { once: true });
})();
