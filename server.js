// steik.js — Interaksi & Enhancements untuk Orion.co
// Ditulis untuk HTML & CSS yang kamu kasih. Fitur:
// - Smooth scroll untuk link internal
// - Toggle mobile nav (jika ditambahkan nanti)
// - Animasi masuk (reveal) pada scroll menggunakan IntersectionObserver
// - Lazy loading gambar (fallback untuk browsers lama)
// - Tombol "Contact" buka WA, tombol "Download" tampilkan modal untuk download aset
// - Tombol "Calendar" buat dan download file .ics event
// - Hitung mundur sederhana (countdown) untuk event di card (jika ada tanggal tersimpan)
// - Accessibility: focus management & keyboard support

(function () {
  'use strict';

  // util: pilih elemen
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---- Smooth scroll untuk link yang menuju elemen di halaman ----
  function initSmoothScroll() {
    const internalLinks = $$('a[href^="#"]');
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // beri fokus untuk aksesibilitas
          setTimeout(() => target.setAttribute('tabindex', '-1'), 400);
          setTimeout(() => target.focus(), 500);
        }
      });
    });
  }

  // ---- Mobile nav toggle (jika ingin menambahkan tombol hamburger) ----
  function initMobileNav() {
    const nav = $('.nav-links');
    if (!nav) return;
    // buat tombol hamburger jika belum ada
    if (!$('#mobile-nav-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'mobile-nav-toggle';
      btn.className = 'mobile-nav-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Buka menu');
      btn.innerHTML = '☰';
      document.querySelector('.header-inner').insertBefore(btn, nav);

      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        nav.classList.toggle('open', !open);
      });

      // keyboard: close on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
          nav.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          btn.focus();
        }
      });
    }
  }

  // ---- Reveal animations on scroll ----
  function initRevealOnScroll() {
    const reveals = $$('.event-card, .dua-kolom .kolom, .Menuju-Bintang-title, .image-card img');
    if (!('IntersectionObserver' in window)) {
      // fallback: tambah class langsung
      reveals.forEach(el => el.classList.add('reveal-visible'));
      return;
    }

    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach(el => obs.observe(el));
  }

  // ---- Lazy load images (with loading=lazy and JS fallback) ----
  function initLazyImages() {
    const imgs = $$('img');
    imgs.forEach(img => {
      // jika browser support loading attr, set saja
      if ('loading' in HTMLImageElement.prototype) {
        img.setAttribute('loading', 'lazy');
      } else {
        // fallback: simple intersection observer to swap data-src
        if (img.dataset && img.dataset.src) {
          // already prepared
        } else {
          // prepare by copying src->data-src and blank placeholder
          if (!img.dataset.src) img.dataset.src = img.src;
          img.src = '';
          img.style.background = 'linear-gradient(90deg,#10203a,#0b1726)';
        }
      }
    });

    if (!('IntersectionObserver' in window)) return;
    const lazyObs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src || img.getAttribute('data-src');
          if (src) img.src = src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '120px' });

    imgs.forEach(img => lazyObs.observe(img));
  }

  // ---- Modal untuk download assets sederhana ----
  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'download-modal';
    modal.className = 'download-modal';
    modal.innerHTML = `
      <div class="dm-backdrop"></div>
      <div class="dm-panel" role="dialog" aria-modal="true" aria-labelledby="dm-title">
        <button class="dm-close" aria-label="Tutup">✕</button>
        <h3 id="dm-title">Download assets</h3>
        <p>Pilih file untuk didownload:</p>
        <div class="dm-list"></div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.dm-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.dm-backdrop').addEventListener('click', () => closeModal(modal));

    return modal;
  }

  function openModal(modal) {
    modal.classList.add('open');
    // fokus di close
    setTimeout(() => modal.querySelector('.dm-close').focus(), 150);
  }
  function closeModal(modal) {
    modal.classList.remove('open');
  }

  function initDownloadModal() {
    const modal = createModal();
    const list = modal.querySelector('.dm-list');

    // Cari gambar di halaman sebagai contoh aset yang dapat di-download
    const imgs = $$('img').map(img => ({
      url: img.dataset.src || img.src,
      name: (img.alt || 'image').replace(/\s+/g,'-') + '.png'
    }));

    if (imgs.length === 0) {
      list.innerHTML = '<p>Tidak ada aset ditemukan di halaman.</p>';
    } else {
      imgs.forEach(item => {
        const row = document.createElement('div');
        row.className = 'dm-item';
        row.innerHTML = `
          <span class="dm-name">${item.name}</span>
          <div class="dm-actions">
            <button class="dm-btn dm-download" data-url="${item.url}" data-name="${item.name}">Download</button>
            <button class="dm-btn dm-open" data-url="${item.url}">Open</button>
          </div>
        `;
        list.appendChild(row);
      });

      list.addEventListener('click', (e) => {
        const dl = e.target.closest('.dm-download');
        const op = e.target.closest('.dm-open');
        if (dl) {
          const url = dl.dataset.url;
          const name = dl.dataset.name;
          downloadUrlAsName(url, name);
        }
        if (op) {
          window.open(op.dataset.url, '_blank');
        }
      });
    }

    // connect to nav "Download"
    const navDownload = $$('.nav-links a').find(a => /download/i.test(a.textContent));
    if (navDownload) {
      navDownload.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(modal);
      });
    }
  }

  // helper to download a remote url by fetching then using blob
  async function downloadUrlAsName(url, name) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Gagal fetch');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    } catch (err) {
      // fallback: buka di tab baru agar user bisa simpan manual
      console.warn('Download gagal, membuka tab sebagai fallback', err);
      window.open(url, '_blank');
    }
  }

  // ---- Contact button behaviour (WhatsApp link) ----
  function initContact() {
    const contact = $$('.nav-links a').find(a => /wa.me|contact|whatsapp/i.test(a.href + a.textContent));
    if (!contact) return;
    contact.addEventListener('click', (e) => {
      // biar ngecek apakah mobile or desktop, tapi kita cukup buka link baru
      // tambahkan tracking kecil: focus ke body setelah buka
      setTimeout(() => document.body.focus(), 400);
    });

    // tambahkan copy-to-clipboard jika user tekan alt
    contact.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') contact.click();
      if ((e.altKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        navigator.clipboard?.writeText(contact.href || contact.getAttribute('href'));
      }
    });
  }

  // ---- Calendar button: generate .ics file sederhana ----
  function initCalendarButton() {
    const calBtn = $$('.btn').find(b => /calendar/i.test(b.textContent));
    if (!calBtn) return;

    calBtn.addEventListener('click', (e) => {
      // ambil info dari event card jika ada
      const title = 'Observasi: Waning Gibbous Moon & Jupiter';
      const description = `Observe the waning gibbous Moon in conjunction with Jupiter.\nFrom Orion.co`;
      // gunakan tanggal dari isi paragraf (jika ada) — fallback 2025-11-11 22:24 local
      const start = new Date();
      start.setHours(22, 24, 0, 0);
      // set durasi 3 jam
      const end = new Date(start.getTime() + 1000 * 60 * 60 * 3);

      const ics = buildICS({ title, description, start, end, location: 'Outdoors / Your location' });
      downloadStringAsFile(ics, 'orion-observasi.ics', 'text/calendar');
    });
  }

  function pad(n){ return String(n).padStart(2,'0'); }
  function toICSDate(d){
    // format YYYYMMDDTHHMMSSZ in UTC
    const y = d.getUTCFullYear();
    const m = pad(d.getUTCMonth()+1);
    const day = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mi = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${y}${m}${day}T${hh}${mi}${ss}Z`;
  }

  function buildICS({ title, description, start, end, location }){
    const now = new Date();
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Orion.co//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTAMP:${toICSDate(now)}`,
      `DTSTART:${toICSDate(start)}`,
      `DTEND:${toICSDate(end)}`,
      `SUMMARY:${escapeICSText(title)}`,
      `DESCRIPTION:${escapeICSText(description)}`,
      `LOCATION:${escapeICSText(location)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  function escapeICSText(s){
    return (s||'').replace(/\n/g,'\\n').replace(/,/g,'\\,');
  }

  function downloadStringAsFile(content, filename, mime='text/plain'){
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // ---- Simple countdown for event-card if text contains a date ----
  function initCountdown() {
    const card = $('.event-card__content');
    if (!card) return;
    // try to find a date pattern (very simple)
    const text = card.innerText;
    // contoh: "November 11" or "Nov 11"
    const m = text.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/i);
    if (!m) return;
    const monthName = m[1];
    const day = parseInt(m[2], 10);
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    let year = new Date().getFullYear();
    const eventDate = new Date(year, monthIndex, day, 22, 24, 0);
    // if already passed, assume next year
    if (eventDate < new Date()) eventDate.setFullYear(year + 1);

    // buat elemen countdown
    const cnt = document.createElement('div');
    cnt.className = 'event-countdown';
    cnt.setAttribute('aria-live', 'polite');
    card.appendChild(cnt);

    function tick() {
      const now = new Date();
      const diff = Math.max(0, eventDate - now);
      const days = Math.floor(diff / (1000*60*60*24));
      const hours = Math.floor((diff / (1000*60*60)) % 24);
      const minutes = Math.floor((diff / (1000*60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      cnt.textContent = `Starts in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
      if (diff <= 0) {
        cnt.textContent = 'Event is happening now or already passed.';
        clearInterval(intv);
      }
    }
    tick();
    const intv = setInterval(tick, 1000);
  }

  // ---- Small helpers & init ----
  function init() {
    initSmoothScroll();
    initMobileNav();
    initRevealOnScroll();
    initLazyImages();
    initDownloadModal();
    initContact();
    initCalendarButton();
    initCountdown();

    // add some global classes for CSS to hook on
    document.documentElement.classList.add('js-enabled');

    // reduce-motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
  }

  // run when DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
