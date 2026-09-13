(() => {
  'use strict';

  const STORAGE_KEY = 'greenthumb.profile.v1';
  const screens = [...document.querySelectorAll('[data-screen]')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const goButtons = [...document.querySelectorAll('[data-go]')];
  const app = document.getElementById('app');

  function safeParse(value, fallback) {
    try { return JSON.parse(value); } catch { return fallback; }
  }

  function showScreen(name, pushHash = true) {
    const target = screens.find(s => s.dataset.screen === name) || screens[0];
    screens.forEach(s => s.classList.toggle('active', s === target));
    navItems.forEach(item => item.classList.toggle('active', item.dataset.go === target.dataset.screen));
    if (pushHash && location.protocol !== 'file:') history.replaceState(null, '', `#${target.dataset.screen}`);
    else if (pushHash) location.hash = target.dataset.screen;
    window.scrollTo({ top: 0, behavior: 'auto' });
    requestAnimationFrame(() => app?.focus({ preventScroll: true }));
  }

  goButtons.forEach(btn => btn.addEventListener('click', () => showScreen(btn.dataset.go)));

  const initialScreen = location.hash.replace('#', '') || 'home';
  showScreen(initialScreen, false);
  window.addEventListener('hashchange', () => showScreen(location.hash.replace('#', '') || 'home', false));

  function handleImage(input) {
    const file = input.files?.[0];
    if (!file) return;
    const preview = document.getElementById('photoPreview');
    const url = URL.createObjectURL(file);
    preview.innerHTML = '<img alt="Selected plant photo preview"><div class="preview-meta"></div>';
    const img = preview.querySelector('img');
    const meta = preview.querySelector('.preview-meta');
    img.src = url;
    img.onload = () => URL.revokeObjectURL(url);
    meta.textContent = `${file.name || 'Plant photo'} · ${(file.size / 1024 / 1024).toFixed(1)} MB`;
    preview.classList.remove('hidden');
  }

  document.getElementById('cameraInput')?.addEventListener('change', e => handleImage(e.target));
  document.getElementById('uploadInput')?.addEventListener('change', e => handleImage(e.target));

  document.getElementById('describeButton')?.addEventListener('click', () => {
    const field = document.getElementById('plantDescription');
    const value = field?.value.trim();
    if (!value) {
      field?.focus();
      return;
    }
    const button = document.getElementById('describeButton');
    const original = button.textContent;
    button.textContent = 'Description ready ✓';
    button.disabled = true;
    setTimeout(() => {
      button.textContent = original;
      button.disabled = false;
    }, 1800);
  });

  const settingsForm = document.getElementById('settingsForm');
  const profile = safeParse(localStorage.getItem(STORAGE_KEY), {});
  const fields = ['zipCode', 'experience', 'allergies', 'hasDogs', 'hasCats', 'hasKids'];
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el || profile[id] === undefined) return;
    if (el.type === 'checkbox') el.checked = Boolean(profile[id]);
    else el.value = profile[id];
  });

  settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const next = {};
    fields.forEach(id => {
      const el = document.getElementById(id);
      next[id] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });
    const status = document.getElementById('saveStatus');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      status.textContent = 'Saved on this device ✓';
      setTimeout(() => { status.textContent = ''; }, 2400);
    } catch {
      status.textContent = 'Could not save on this device.';
    }
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
