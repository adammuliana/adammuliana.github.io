(() => {
  'use strict';
  const audio = document.getElementById('background-audio');
  const controls = document.getElementById('audio-controls');
  const toggle = document.getElementById('audio-toggle');
  const stop = document.getElementById('audio-stop');
  const toast = document.getElementById('celebration-status');
  let toastTimer;
  let requestId = 0;
  let pendingNotice = '';

  const notice = (message) => {
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('is-visible');
    toastTimer = setTimeout(() => {
      toast.classList.remove('is-visible');
      toast.textContent = '';
    }, 3500);
  };
  const syncAudio = () => {
    if (!audio || !toggle || !controls) return;
    const playing = !audio.paused && !audio.ended;
    controls.dataset.state = playing ? 'playing' : 'paused';
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Jeda musik' : 'Putar musik');
    const icon = toggle.querySelector('use');
    if (icon) icon.setAttribute('href', playing ? '#icon-pause' : '#icon-play');
    const label = toggle.querySelector('[data-audio-label]');
    if (label) label.textContent = playing ? 'Jeda' : 'Putar';
  };
  const playAudio = () => {
    if (!audio) return;
    const attempt = ++requestId;
    if (audio.error) audio.load();
    try {
      const result = audio.play();
      if (result && typeof result.catch === 'function') {
        result.catch((error) => {
          if (attempt !== requestId || error.name === 'AbortError') return;
          syncAudio();
          const message = error.name === 'NotAllowedError'
            ? 'Ketuk Putar untuk memulai musik.'
            : 'Musik belum dapat diputar. Ketuk Putar untuk mencoba lagi.';
          if (controls && controls.hidden) pendingNotice = message;
          else notice(message);
        });
      }
    } catch (_) {
      notice('Musik belum dapat diputar. Ketuk Putar untuk mencoba lagi.');
      syncAudio();
    }
  };

  if (audio && controls && toggle && stop) {
    audio.volume = 0.45;
    ['play', 'pause', 'ended', 'emptied'].forEach((event) => audio.addEventListener(event, syncAudio));
    audio.addEventListener('error', () => {
      syncAudio();
      const message = 'Audio belum dapat dimuat. Silakan ketuk Putar untuk mencoba lagi.';
      if (controls.hidden) pendingNotice = message;
      else notice(message);
    });
    // The trusted click starts music before the cinematic opening timer.
    document.getElementById('open-invitation')?.addEventListener('click', () => {
      if (!document.body.classList.contains('invitation-open')) playAudio();
    }, { capture: true, once: true });
    document.addEventListener('invitation:opened', () => {
      controls.hidden = false;
      syncAudio();
      if (pendingNotice) {
        notice(pendingNotice);
        pendingNotice = '';
      }
    });
    toggle.addEventListener('click', () => {
      if (audio.paused || audio.ended) playAudio();
      else {
        requestId++;
        audio.pause();
        syncAudio();
      }
    });
    stop.addEventListener('click', () => {
      requestId++;
      audio.pause();
      try { audio.currentTime = 0; } catch (_) { /* Metadata may still be loading. */ }
      syncAudio();
      notice('Musik dihentikan. Putar kembali untuk mulai dari awal.');
    });
    window.addEventListener('pagehide', () => { requestId++; audio.pause(); });
    syncAudio();
  }

  const copyAccount = async (value) => {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(value); return true; } catch (_) { /* Try local-file support. */ }
    }
    const field = document.createElement('textarea');
    field.value = value;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px;opacity:0;';
    const focus = document.activeElement;
    document.body.appendChild(field);
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, value.length);
    let copied = false;
    try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
    field.remove();
    focus?.focus({ preventScroll: true });
    return copied;
  };
  document.querySelectorAll('[data-copy-account]').forEach((button) => {
    button.addEventListener('click', async () => {
      const value = button.dataset.copyAccount;
      const bank = button.dataset.bank || '';
      if (!value || !/^\d+$/.test(value)) return;
      const copied = await copyAccount(value);
      notice(copied ? 'Nomor rekening ' + bank + ' berhasil disalin.' : 'Belum dapat menyalin. Tekan lama nomor rekening untuk menyalinnya.');
    });
  });
})();
