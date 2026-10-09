(() => {
  'use strict';

  const start = () => {
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const hero = $('.hero');
    const content = $('#invitation-content');
    const nav = $('.floating-nav');
    const opener = $('#open-invitation');
    const openingTransition = $('#opening-transition');
    const openingStatus = $('#opening-status');
    const heroInvite = $('.hero-invite');
    const toast = $('#toast');

    // Keep the source readable without JavaScript, then enhance it into a cover.
    if (opener && content) {
      document.body.classList.add('invitation-closed');
      content.hidden = true;
      content.setAttribute('aria-hidden', 'true');
      if ('inert' in content) content.inert = true;
      if (nav) nav.hidden = true;
      opener.setAttribute('aria-expanded', 'false');
    }

    let isOpen = !document.body.classList.contains('invitation-closed');
    let isOpening = false;
    let openingRevealed = false;
    let openingRevealTimer;
    let openingFinishTimer;
    let openingFailsafeTimer;
    let openingFrame;
    let openingSecondFrame;
    let toastTimer;
    let toastHideTimer;

    const announce = (message) => {
      if (!toast) return;
      window.clearTimeout(toastTimer);
      window.clearTimeout(toastHideTimer);
      toast.hidden = false;
      toast.textContent = message;
      toast.classList.add('is-visible');
      toastTimer = window.setTimeout(() => {
        toast.classList.remove('is-visible');
        toastHideTimer = window.setTimeout(() => {
          toast.hidden = true;
          toast.textContent = '';
        }, 250);
      }, 3200);
    };

    const scrollToSection = (target) => {
      if (!target) return;
      target.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    };

    // Every fresh visit begins at the cover, including links shared with a section hash.
    try { window.history.scrollRestoration = 'manual'; } catch (_) { /* Local-file browsers may restrict history. */ }
    const resetCoverPosition = () => window.requestAnimationFrame(() => {
      if (!isOpen && !isOpening) window.scrollTo({ top: 0, behavior: 'instant' });
    });
    resetCoverPosition();
    window.addEventListener('load', resetCoverPosition, { once: true });

    // Guest names stay plain text, including names supplied in a shared link.
    try {
      const parameters = new URLSearchParams(window.location.search);
      const guest = ['to', 'nama', 'guest']
        .map((key) => (parameters.get(key) || '').replace(/\s+/gu, ' ').trim())
        .find(Boolean)?.slice(0, 120);
      $$('[data-guest]').forEach((element) => {
        element.textContent = guest || 'Tamu Undangan';
      });
    } catch (_) {
      $$('[data-guest]').forEach((element) => { element.textContent = 'Tamu Undangan'; });
    }

    // The gate covers the scene change, so the opened invitation has its own hero.
    const revealMainHero = () => {
      if (openingRevealed) return;
      openingRevealed = true;
      hero?.classList.add('is-open');
      if (heroInvite) {
        heroInvite.hidden = true;
        heroInvite.setAttribute('aria-hidden', 'true');
        if ('inert' in heroInvite) heroInvite.inert = true;
      }
      if (content) {
        content.hidden = false;
      }
      document.body.classList.add('invitation-open');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };

    const finishOpening = () => {
      if (!isOpening) return;
      window.clearTimeout(openingRevealTimer);
      window.clearTimeout(openingFinishTimer);
      window.clearTimeout(openingFailsafeTimer);
      window.cancelAnimationFrame(openingFrame);
      window.cancelAnimationFrame(openingSecondFrame);
      try {
        revealMainHero();
        isOpen = true;
        opener?.setAttribute('aria-expanded', 'true');
      } finally {
        // A timed finish also releases the page if animation events never fire.
        isOpening = false;
        document.body.classList.remove('invitation-closed', 'invitation-opening');
        document.body.classList.add('invitation-open');
        if (openingTransition) {
          openingTransition.hidden = true;
          openingTransition.classList.remove('is-preparing', 'is-playing');
        }
        if (hero) {
          hero.removeAttribute('aria-hidden');
          if ('inert' in hero) hero.inert = false;
        }
        if (content) {
          content.hidden = false;
          content.removeAttribute('aria-hidden');
          content.removeAttribute('aria-busy');
          if ('inert' in content) content.inert = false;
        }
        opener?.removeAttribute('aria-busy');
        if (nav) nav.hidden = false;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      const heading = $('#main-hero-heading') || $('h1', hero || document);
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      if (openingStatus) openingStatus.textContent = 'Selamat datang di undangan Adam dan Muliana.';
      document.dispatchEvent(new CustomEvent('invitation:opened'));
    };

    opener?.addEventListener('click', () => {
      if (isOpen || isOpening) return;
      isOpening = true;
      if (openingStatus) openingStatus.textContent = 'Undangan sedang dibuka.';
      opener.disabled = true;
      opener.setAttribute('aria-busy', 'true');
      document.body.classList.add('invitation-opening');
      if (hero) {
        hero.setAttribute('aria-hidden', 'true');
        if ('inert' in hero) hero.inert = true;
      }
      if (content) {
        content.setAttribute('aria-busy', 'true');
        if ('inert' in content) content.inert = true;
      }
      if (!openingTransition) {
        finishOpening();
        return;
      }
      openingTransition.hidden = false;
      openingTransition.classList.add('is-preparing');
      const revealDelay = motion.matches ? 80 : 1000;
      const finishDelay = motion.matches ? 200 : 2350;
      // Keep this independent of requestAnimationFrame, which can pause in a background tab.
      openingFailsafeTimer = window.setTimeout(finishOpening, finishDelay + 650);
      openingFrame = window.requestAnimationFrame(() => {
        openingSecondFrame = window.requestAnimationFrame(() => {
          if (!isOpening) return;
          openingTransition.classList.add('is-playing');
          openingRevealTimer = window.setTimeout(revealMainHero, revealDelay);
          openingFinishTimer = window.setTimeout(finishOpening, finishDelay);
        });
      });
    });

    window.addEventListener('pagehide', () => {
      if (isOpening) finishOpening();
    });

    const weddingDate = Date.parse('2026-10-18T10:00:00+08:00');
    const weddingEnd = Date.parse('2026-10-18T12:30:00+08:00');
    const countdownFields = {
      days: $('[data-countdown="days"]'),
      hours: $('[data-countdown="hours"]'),
      minutes: $('[data-countdown="minutes"]'),
      seconds: $('[data-countdown="seconds"]')
    };
    const countdownNote = $('#countdown-note');
    const initialCountdownNote = countdownNote?.textContent || '';
    let countdownTimer;

    const updateCountdown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((weddingDate - now) / 1000));
      const values = {
        days: Math.floor(remaining / 86400),
        hours: Math.floor((remaining % 86400) / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60
      };
      Object.entries(countdownFields).forEach(([key, element]) => {
        if (element) element.textContent = String(values[key]).padStart(2, '0');
      });
      if (countdownNote) {
        const message = now >= weddingEnd
          ? 'Terima kasih atas doa dan kebersamaan Anda di hari bahagia kami.'
          : now >= weddingDate
            ? 'Hari bahagia kami telah tiba. Sampai jumpa di acara kami.'
            : initialCountdownNote;
        if (countdownNote.textContent !== message) countdownNote.textContent = message;
      }
    };

    const runCountdown = () => {
      window.clearInterval(countdownTimer);
      updateCountdown();
      if (!document.hidden) countdownTimer = window.setInterval(updateCountdown, 1000);
    };
    runCountdown();
    document.addEventListener('visibilitychange', runCountdown);

    const reveals = $$('.reveal');
    let revealObserver;
    if (motion.matches || !('IntersectionObserver' in window)) {
      reveals.forEach((element) => element.classList.add('is-visible'));
    } else {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' });
      reveals.forEach((element) => revealObserver.observe(element));
    }

    const track = $('#gallery-track');
    const slides = track ? Array.from(track.children) : [];
    const currentCounter = $('#gallery-current');
    const totalCounter = $('#gallery-total');
    let galleryIndex = 0;
    let galleryFrame = 0;

    if (totalCounter) totalCounter.textContent = String(slides.length).padStart(2, '0');
    const updateGallery = () => {
      galleryFrame = 0;
      if (!track || !slides.length) return;
      const bounds = track.getBoundingClientRect();
      const center = bounds.left + track.clientWidth / 2;
      let shortest = Infinity;
      slides.forEach((slide, index) => {
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        if (distance < shortest) {
          shortest = distance;
          galleryIndex = index;
        }
      });
      if (currentCounter) currentCounter.textContent = String(galleryIndex + 1).padStart(2, '0');
      slides.forEach((slide, index) => slide.classList.toggle('is-active', index === galleryIndex));
    };
    const queueGalleryUpdate = () => {
      if (!galleryFrame) galleryFrame = window.requestAnimationFrame(updateGallery);
    };
    const goToGallery = (index) => {
      if (!track || !slides.length) return;
      const nextIndex = (index + slides.length) % slides.length;
      const slide = slides[nextIndex];
      const bounds = track.getBoundingClientRect();
      const rect = slide.getBoundingClientRect();
      const left = track.scrollLeft + rect.left - bounds.left - (track.clientWidth - rect.width) / 2;
      track.scrollTo({ left, behavior: motion.matches ? 'instant' : 'smooth' });
    };
    const moveGallery = (direction) => goToGallery(galleryIndex + direction);
    track?.addEventListener('scroll', queueGalleryUpdate, { passive: true });
    track?.addEventListener('keydown', (event) => {
      if (event.target !== track || !slides.length) return;
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') goToGallery(0);
      else if (event.key === 'End') goToGallery(slides.length - 1);
      else moveGallery(event.key === 'ArrowRight' ? 1 : -1);
    });
    $('[data-gallery-prev]')?.addEventListener('click', () => moveGallery(-1));
    $('[data-gallery-next]')?.addEventListener('click', () => moveGallery(1));
    window.addEventListener('resize', queueGalleryUpdate, { passive: true });
    document.addEventListener('invitation:opened', queueGalleryUpdate);
    updateGallery();

    const photoButtons = $$('[data-lightbox]');
    const dialog = $('#photo-dialog');
    const lightboxImage = $('#lightbox-image');
    const lightboxCaption = $('#lightbox-caption');
    let photoIndex = 0;
    let previousFocus = null;
    let lightboxIsOpen = false;

    const displayPhoto = (index) => {
      if (!lightboxImage || !photoButtons.length) return;
      photoIndex = (index + photoButtons.length) % photoButtons.length;
      const button = photoButtons[photoIndex];
      const image = $('img', button);
      if (!image) return;
      lightboxImage.src = button.dataset.full || image.dataset.full || image.currentSrc || image.src;
      lightboxImage.alt = image.alt || 'Adam dan Muliana';
      if (lightboxCaption) {
        const caption = button.dataset.caption || image.alt || 'Adam & Muliana';
        lightboxCaption.textContent = `${caption} · ${String(photoIndex + 1).padStart(2, '0')} / ${String(photoButtons.length).padStart(2, '0')}`;
      }
    };

    const restoreLightboxState = () => {
      if (!lightboxIsOpen) return;
      lightboxIsOpen = false;
      document.body.classList.remove('lightbox-open');
      previousFocus?.focus({ preventScroll: true });
    };
    const closeLightbox = () => {
      if (!dialog || !lightboxIsOpen) return;
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      else dialog.removeAttribute('open');
      restoreLightboxState();
    };
    const openLightbox = (index) => {
      if (!dialog || !lightboxImage) return;
      previousFocus = document.activeElement;
      displayPhoto(index);
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('role', 'dialog');
      }
      lightboxIsOpen = true;
      document.body.classList.add('lightbox-open');
      $('#close-lightbox')?.focus({ preventScroll: true });
    };

    photoButtons.forEach((button, index) => button.addEventListener('click', () => openLightbox(index)));
    $('#close-lightbox')?.addEventListener('click', closeLightbox);
    $('#lightbox-prev')?.addEventListener('click', () => displayPhoto(photoIndex - 1));
    $('#lightbox-next')?.addEventListener('click', () => displayPhoto(photoIndex + 1));
    dialog?.addEventListener('close', restoreLightboxState);
    dialog?.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (outside) closeLightbox();
    });
    document.addEventListener('keydown', (event) => {
      if (!lightboxIsOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        displayPhoto(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
      }
    });

    // The fallback also works when the invitation is opened directly as a file.
    const copyText = async (value) => {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          return true;
        } catch (_) { /* Continue with the local-file fallback. */ }
      }
      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.setAttribute('aria-label', 'Teks untuk disalin');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px;opacity:0;';
      const focused = document.activeElement;
      document.body.appendChild(field);
      field.focus({ preventScroll: true });
      field.select();
      field.setSelectionRange(0, field.value.length);
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      field.remove();
      focused?.focus({ preventScroll: true });
      return copied;
    };

    $$('[data-copy-address]').forEach((button) => {
      button.addEventListener('click', async () => {
        const address = button.dataset.address || 'Kediaman Mempelai Wanita, Desa Lalonggolosua, Dusun III Talodo (dekat Masjid Al-Ghazali).';
        const copied = await copyText(address);
        announce(copied ? 'Alamat berhasil disalin.' : 'Alamat belum tersalin. Silakan salin alamat yang tertera.');
      });
    });

    $('#share-invitation')?.addEventListener('click', async () => {
      const isWeb = /^https?:$/.test(window.location.protocol);
      const details = {
        title: 'Undangan Pernikahan Adam & Muliana',
        text: 'Dengan penuh sukacita, kami mengundang Anda ke pernikahan Adam & Muliana. Minggu, 18 Oktober 2026. Akad nikah 10.00–12.30 WITA. Kediaman mempelai wanita, Desa Lalonggolosua, Dusun III Talodo (dekat Masjid Al-Ghazali).'
      };
      if (isWeb) details.url = window.location.href;
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share(details);
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      const copied = await copyText(isWeb ? window.location.href : details.text);
      announce(copied
        ? (isWeb ? 'Tautan undangan berhasil disalin.' : 'Detail undangan berhasil disalin.')
        : 'Belum dapat menyalin undangan. Silakan coba kembali.');
    });

    const navigation = nav ? $$('a[href^="#"]', nav).map((link) => ({
      link,
      section: document.getElementById(link.getAttribute('href').slice(1))
    })).filter((item) => item.section) : [];
    const setActiveSection = (section) => {
      navigation.forEach((item) => {
        const active = item.section === section;
        item.link.classList.toggle('is-active', active);
        if (active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      });
    };
    navigation.forEach(({ link, section }) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToSection(section);
        setActiveSection(section);
      });
    });

    let scrollFrame = 0;
    const updateScroll = () => {
      scrollFrame = 0;
      if (hero && !motion.matches) {
        const depth = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
        hero.style.setProperty('--scroll-depth', depth.toFixed(3));
        hero.style.setProperty('--scroll-y', `${Math.min(window.scrollY, hero.offsetHeight).toFixed(1)}px`);
      }
      if (!isOpen || !navigation.length) return;
      const marker = Math.min(window.innerHeight * 0.35, 260);
      let activeSection = navigation[0].section;
      navigation.forEach(({ section }) => {
        if (section.getBoundingClientRect().top <= marker) activeSection = section;
      });
      setActiveSection(activeSection);
    };
    const queueScrollUpdate = () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
    };
    window.addEventListener('scroll', queueScrollUpdate, { passive: true });
    window.addEventListener('resize', queueScrollUpdate, { passive: true });
    document.addEventListener('invitation:opened', queueScrollUpdate);
    updateScroll();

    const tiltElements = $$('[data-tilt]');
    tiltElements.forEach((element) => {
      let tiltFrame = 0;
      let tiltX = 0;
      let tiltY = 0;
      const paintTilt = () => {
        tiltFrame = 0;
        element.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        element.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
      };
      element.addEventListener('pointermove', (event) => {
        if (motion.matches || !finePointer.matches || event.pointerType === 'touch') return;
        const bounds = element.getBoundingClientRect();
        tiltX = -(event.clientY - bounds.top - bounds.height / 2) / Math.max(bounds.height, 1) * 12;
        tiltY = (event.clientX - bounds.left - bounds.width / 2) / Math.max(bounds.width, 1) * 12;
        if (!tiltFrame) tiltFrame = window.requestAnimationFrame(paintTilt);
      }, { passive: true });
      element.addEventListener('pointerleave', () => {
        tiltX = 0;
        tiltY = 0;
        if (!tiltFrame) tiltFrame = window.requestAnimationFrame(paintTilt);
      }, { passive: true });
    });

    const onMotionChange = () => {
      if (motion.matches) {
        reveals.forEach((element) => element.classList.add('is-visible'));
        revealObserver?.disconnect();
        tiltElements.forEach((element) => {
          element.style.setProperty('--tilt-x', '0deg');
          element.style.setProperty('--tilt-y', '0deg');
        });
        hero?.style.setProperty('--scroll-depth', '0');
        hero?.style.setProperty('--scroll-y', '0px');
      }
      queueScrollUpdate();
    };
    if (typeof motion.addEventListener === 'function') motion.addEventListener('change', onMotionChange);
    else if (typeof motion.addListener === 'function') motion.addListener(onMotionChange);
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
