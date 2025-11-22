// steik.js — Interaksi & Enhancements untuk Orion.co
// Enhanced astronomy-themed JavaScript features:
// - Smooth scroll untuk link internal
// - Animated starry background with parallax effect
// - Interactive constellation hover effects
// - Real-time astronomical data (moon phase, visible planets)
// - Dark mode toggle synchronized with night sky
// - Scroll-triggered animations dengan IntersectionObserver
// - Calendar integration dengan astronomical events
// - Mobile navigation dengan smooth transitions
// - Accessibility: focus management & keyboard support
// - Performance: lazy loading & optimized animations

(function () {
  'use strict';

  // util: pilih elemen
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---- Animated Starry Background with Parallax ----
  function initStarryBackground() {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    document.body.insertBefore(canvas, document.body.firstChild);
    
    const ctx = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];
    let w, h;
    
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initStars();
    }
    
    function initStars() {
      stars = [];
      const numStars = Math.min(200, w * h / 4000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    }
    
    function createShootingStar() {
      if (Math.random() > 0.98 && shootingStars.length < 3) {
        shootingStars.push({
          x: Math.random() * w,
          y: Math.random() * h / 2,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 6 + 4,
          opacity: 1,
          angle: Math.random() * Math.PI / 4 + Math.PI / 6
        });
      }
    }
    
    function animate() {
      ctx.clearRect(0, 0, w, h);
      
      // Parallax effect based on scroll
      const scrollY = window.pageYOffset;
      const parallaxFactor = scrollY * 0.05;
      
      // Draw twinkling stars
      stars.forEach((star, i) => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y + parallaxFactor * 0.2, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw shooting stars
      shootingStars.forEach((star, i) => {
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        const endX = star.x + Math.cos(star.angle) * star.length;
        const endY = star.y + Math.sin(star.angle) * star.length;
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.01;
        
        if (star.opacity <= 0) shootingStars.splice(i, 1);
      });
      
      createShootingStar();
      requestAnimationFrame(animate);
    }
    
    resize();
    window.addEventListener('resize', resize);
    animate();
  }

  // ---- Real-time Moon Phase Display ----
  function initMoonPhase() {
    const eventCard = $('.event-card');
    if (!eventCard) return;
    
    function getMoonPhase() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      let c, e, jd, b;
      if (month < 3) {
        year--;
        month += 12;
      }
      
      ++month;
      c = 365.25 * year;
      e = 30.6 * month;
      jd = c + e + day - 694039.09;
      jd /= 29.5305882;
      b = parseInt(jd);
      jd -= b;
      b = Math.round(jd * 8);
      
      if (b >= 8) b = 0;
      
      const phases = [
        { name: 'New Moon', emoji: '🌑' },
        { name: 'Waxing Crescent', emoji: '🌒' },
        { name: 'First Quarter', emoji: '🌓' },
        { name: 'Waxing Gibbous', emoji: '🌔' },
        { name: 'Full Moon', emoji: '🌕' },
        { name: 'Waning Gibbous', emoji: '🌖' },
        { name: 'Last Quarter', emoji: '🌗' },
        { name: 'Waning Crescent', emoji: '🌘' }
      ];
      
      return phases[b];
    }
    
    const phase = getMoonPhase();
    const phaseDisplay = document.createElement('div');
    phaseDisplay.className = 'moon-phase-display';
    phaseDisplay.innerHTML = `
      <span class="moon-emoji">${phase.emoji}</span>
      <span class="moon-text">Current: ${phase.name}</span>
    `;
    eventCard.insertBefore(phaseDisplay, eventCard.firstChild);
  }

  // ---- Interactive Constellation Tooltips ----
  function initConstellationInfo() {
    const constellationData = {
      'Orion': {
        brightestStar: 'Rigel',
        magnitude: '0.13',
        distance: '863 light-years',
        bestViewing: 'December - March',
        funFact: 'Home to the famous Orion Nebula (M42)'
      },
      'Scorpio': {
        brightestStar: 'Antares',
        magnitude: '0.96',
        distance: '550 light-years',
        bestViewing: 'June - August',
        funFact: 'Antares means "rival of Mars" due to its red color'
      }
    };
    
    $$('.kolom h2').forEach(heading => {
      const constName = heading.textContent.trim();
      const data = constellationData[constName];
      
      if (data) {
        const tooltip = document.createElement('div');
        tooltip.className = 'constellation-tooltip';
        tooltip.innerHTML = `
          <div class="tooltip-header">✨ ${constName} Details</div>
          <div class="tooltip-body">
            <div class="tooltip-item">
              <strong>Brightest Star:</strong> ${data.brightestStar}
            </div>
            <div class="tooltip-item">
              <strong>Magnitude:</strong> ${data.magnitude}
            </div>
            <div class="tooltip-item">
              <strong>Distance:</strong> ${data.distance}
            </div>
            <div class="tooltip-item">
              <strong>Best Viewing:</strong> ${data.bestViewing}
            </div>
            <div class="tooltip-fact">💫 ${data.funFact}</div>
          </div>
        `;
        
        heading.style.cursor = 'help';
        heading.style.position = 'relative';
        heading.appendChild(tooltip);
        
        heading.addEventListener('mouseenter', () => {
          tooltip.classList.add('visible');
        });
        
        heading.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });
      }
    });
  }

  // ---- Smooth scroll para link internal ----
  function initSmoothScroll() {
    const internalLinks = $$('a[href^="#"]');
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => target.setAttribute('tabindex', '-1'), 400);
          setTimeout(() => target.focus(), 500);
        }
      });
    });
  }

  // ---- Scroll Progress Indicator ----
  function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    function updateProgress() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      progressBar.style.width = progress + '%';
    }
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
  }

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
    
    // Create hamburger button if it doesn't exist
    if (!$('#mobile-nav-toggle')) {
      const btn = document.createElement('button');
      btn.id = 'mobile-nav-toggle';
      btn.className = 'mobile-nav-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      btn.innerHTML = '<span></span><span></span><span></span>';
      document.querySelector('.header-inner').insertBefore(btn, nav);

      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        btn.classList.toggle('active', !open);
        nav.classList.toggle('open', !open);
        document.body.classList.toggle('nav-open', !open);
      });

      // keyboard: close on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('open')) {
          nav.classList.remove('open');
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
          btn.focus();
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (nav.classList.contains('open') && 
            !nav.contains(e.target) && 
            !btn.contains(e.target)) {
          nav.classList.remove('open');
          btn.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
        }
      });
    }
  }

  // ---- Parallax Scroll Effect for Images ----
  function initParallaxImages() {
    const images = $$('.image-card img');
    
    function updateParallax() {
      const scrollY = window.pageYOffset;
      
      images.forEach(img => {
        const rect = img.getBoundingClientRect();
        const imageTop = rect.top + scrollY;
        const imageHeight = img.offsetHeight;
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight && rect.bottom > 0) {
          const parallaxValue = (scrollY - imageTop + windowHeight) * 0.15;
          img.style.transform = `translateY(${parallaxValue}px)`;
        }
      });
    }
    
    window.addEventListener('scroll', updateParallax);
    updateParallax();
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
    const calBtn = $('#calendar-btn');
    if (!calBtn) return;

    calBtn.addEventListener('click', (e) => {
      // ambil info dari event card jika ada
      const title = 'Observasi: Waning Gibbous Moon & Jupiter';
      const description = `Observe the waning gibbous Moon in conjunction with Jupiter.\nFrom Orion.co`;
      // gunakan tanggal dari isi paragraf (jika ada) — fallback 2025-11-11 22:24 local
      const start = new Date('2025-11-11T22:24:00');
      // set durasi 3 jam
      const end = new Date(start.getTime() + 1000 * 60 * 60 * 3);

      const ics = buildICS({ title, description, start, end, location: 'Outdoors / Your location' });
      downloadStringAsFile(ics, 'orion-observasi.ics', 'text/calendar');
      
      // Visual feedback
      calBtn.textContent = '✓ Added to Calendar';
      setTimeout(() => {
        calBtn.textContent = 'Calendar';
      }, 2000);
    });
  }
  
  // ---- Class Button: Show astronomy classes modal ----
  function initClassButton() {
    const classBtn = $('#class-btn');
    if (!classBtn) return;
    
    classBtn.addEventListener('click', () => {
      const modal = createClassModal();
      openModal(modal);
    });
  }
  
  function createClassModal() {
    // Remove existing class modal if any
    const existing = $('#class-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'class-modal';
    modal.className = 'download-modal';
    modal.innerHTML = `
      <div class="dm-backdrop"></div>
      <div class="dm-panel" role="dialog" aria-modal="true" aria-labelledby="class-title">
        <button class="dm-close" aria-label="Tutup">✕</button>
        <h3 id="class-title">🌟 Astronomy Classes</h3>
        <p>Join our stargazing and constellation identification classes!</p>
        <div class="class-list">
          <div class="class-item">
            <div class="class-icon">🔭</div>
            <div class="class-info">
              <h4>Beginner Stargazing</h4>
              <p>Learn to identify major constellations and use a telescope</p>
              <span class="class-meta">Duration: 2 hours | Level: Beginner</span>
            </div>
            <button class="dm-btn dm-download">Enroll Now</button>
          </div>
          <div class="class-item">
            <div class="class-icon">🌙</div>
            <div class="class-info">
              <h4>Moon Phase Photography</h4>
              <p>Capture stunning images of the moon and its phases</p>
              <span class="class-meta">Duration: 3 hours | Level: Intermediate</span>
            </div>
            <button class="dm-btn dm-download">Enroll Now</button>
          </div>
          <div class="class-item">
            <div class="class-icon">⭐</div>
            <div class="class-info">
              <h4>Deep Sky Objects</h4>
              <p>Explore nebulae, galaxies, and star clusters</p>
              <span class="class-meta">Duration: 4 hours | Level: Advanced</span>
            </div>
            <button class="dm-btn dm-download">Enroll Now</button>
          </div>
          <div class="class-item">
            <div class="class-icon">🌌</div>
            <div class="class-info">
              <h4>Astrophotography Basics</h4>
              <p>Master long exposure and star trail photography</p>
              <span class="class-meta">Duration: 3 hours | Level: Intermediate</span>
            </div>
            <button class="dm-btn dm-download">Enroll Now</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.dm-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.dm-backdrop').addEventListener('click', () => closeModal(modal));
    
    // Enroll buttons
    modal.querySelectorAll('.dm-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const className = e.target.closest('.class-item').querySelector('h4').textContent;
        showNotification(`✓ Enrolled in ${className}!`, 'success');
        closeModal(modal);
      });
    });

    return modal;
  }
  
  // ---- Learn More Buttons: Show detailed constellation info ----
  function initLearnMoreButtons() {
    const orionBtn = $('#orion-learn-more');
    const scorpioBtn = $('#scorpio-learn-more');
    
    if (orionBtn) {
      orionBtn.addEventListener('click', () => {
        showConstellationModal('Orion', {
          name: 'Orion',
          meaning: 'The Hunter',
          brightest: 'Rigel (β Orionis)',
          magnitude: '0.13',
          distance: '863 light-years',
          stars: ['Betelgeuse', 'Rigel', 'Bellatrix', 'Alnilam', 'Alnitak', 'Mintaka', 'Saiph'],
          dsObjects: [
            'M42 - Orion Nebula (stellar nursery)',
            'M43 - De Mairan\'s Nebula',
            'Horsehead Nebula (dark nebula)',
            'Flame Nebula'
          ],
          mythology: 'In Greek mythology, Orion was a giant huntsman whom Zeus placed among the stars. The constellation is mentioned in Homer\'s Odyssey and the Bible, making it one of the most recognized patterns in the night sky.',
          viewing: 'Best viewed: December - March. Look for the three stars forming Orion\'s Belt in the middle of the constellation. The bright red star Betelgeuse marks his shoulder, while blue Rigel marks his foot.',
          funFact: 'The Orion Nebula (M42) is the closest stellar nursery to Earth, where new stars are being born. It\'s visible to the naked eye as a fuzzy patch below Orion\'s Belt!'
        });
      });
    }
    
    if (scorpioBtn) {
      scorpioBtn.addEventListener('click', () => {
        showConstellationModal('Scorpio', {
          name: 'Scorpio (Scorpius)',
          meaning: 'The Scorpion',
          brightest: 'Antares (α Scorpii)',
          magnitude: '0.96',
          distance: '550 light-years',
          stars: ['Antares', 'Shaula', 'Sargas', 'Dschubba', 'Lesath'],
          dsObjects: [
            'M4 - Globular cluster (closest to Earth)',
            'M6 - Butterfly Cluster',
            'M7 - Ptolemy\'s Cluster',
            'M80 - Dense globular cluster'
          ],
          mythology: 'In Greek mythology, Scorpius is the scorpion that killed the hunter Orion. The gods placed them on opposite sides of the sky, so when Scorpius rises in the east, Orion sets in the west, and they never appear together.',
          viewing: 'Best viewed: June - August. Look for the bright red star Antares (rival of Mars) marking the scorpion\'s heart. The curved tail with its distinctive stinger points toward the galactic center.',
          funFact: 'Antares is a red supergiant star so large that if it replaced our Sun, its surface would extend beyond the orbit of Mars! It\'s about 700 times larger than our Sun.'
        });
      });
    }
  }
  
  function showConstellationModal(name, data) {
    // Remove existing modal if any
    const existing = $('#constellation-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'constellation-modal';
    modal.className = 'download-modal constellation-modal';
    modal.innerHTML = `
      <div class="dm-backdrop"></div>
      <div class="dm-panel dm-panel-large" role="dialog" aria-modal="true">
        <button class="dm-close" aria-label="Tutup">✕</button>
        <div class="constellation-detail">
          <div class="constellation-header">
            <h2>${data.name}</h2>
            <p class="constellation-subtitle">${data.meaning}</p>
          </div>
          
          <div class="constellation-grid">
            <div class="constellation-card">
              <h4>⭐ Key Statistics</h4>
              <div class="stat-row"><strong>Brightest Star:</strong> ${data.brightest}</div>
              <div class="stat-row"><strong>Magnitude:</strong> ${data.magnitude}</div>
              <div class="stat-row"><strong>Distance:</strong> ${data.distance}</div>
              <div class="stat-row"><strong>Best Viewing:</strong> ${data.viewing.split(':')[1]?.split('.')[0] || 'Year-round'}</div>
            </div>
            
            <div class="constellation-card">
              <h4>✨ Notable Stars</h4>
              <ul>
                ${data.stars.map(star => `<li>${star}</li>`).join('')}
              </ul>
            </div>
            
            <div class="constellation-card">
              <h4>🌌 Deep Sky Objects</h4>
              <ul>
                ${data.dsObjects.map(obj => `<li>${obj}</li>`).join('')}
              </ul>
            </div>
            
            <div class="constellation-card full-width">
              <h4>📖 Mythology</h4>
              <p>${data.mythology}</p>
            </div>
            
            <div class="constellation-card full-width">
              <h4>🔭 Viewing Guide</h4>
              <p>${data.viewing}</p>
            </div>
            
            <div class="constellation-card full-width fun-fact">
              <h4>💫 Fun Fact</h4>
              <p>${data.funFact}</p>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="dm-btn dm-download" onclick="alert('Added ${name} to your observation list!')">Add to Observation List</button>
            <button class="dm-btn dm-open" onclick="window.open('https://en.wikipedia.org/wiki/${name}_(constellation)', '_blank')">Read More on Wikipedia</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.dm-close').addEventListener('click', () => closeModal(modal));
    modal.querySelector('.dm-backdrop').addEventListener('click', () => closeModal(modal));
    openModal(modal);
  }
  
  // ---- Notification System ----
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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
    console.log('🌟 Orion.co initializing...');
    
    try {
      initStarryBackground();
      console.log('✓ Starfield initialized');
    } catch(e) { console.error('Starfield error:', e); }
    
    try {
      initScrollProgress();
      console.log('✓ Scroll progress initialized');
    } catch(e) { console.error('Scroll progress error:', e); }
    
    try {
      initMoonPhase();
      console.log('✓ Moon phase initialized');
    } catch(e) { console.error('Moon phase error:', e); }
    
    try {
      initConstellationInfo();
      console.log('✓ Constellation tooltips initialized');
    } catch(e) { console.error('Constellation tooltips error:', e); }
    
    try {
      initSmoothScroll();
      console.log('✓ Smooth scroll initialized');
    } catch(e) { console.error('Smooth scroll error:', e); }
    
    try {
      initMobileNav();
      console.log('✓ Mobile nav initialized');
    } catch(e) { console.error('Mobile nav error:', e); }
    
    try {
      initParallaxImages();
      console.log('✓ Parallax initialized');
    } catch(e) { console.error('Parallax error:', e); }
    
    try {
      initRevealOnScroll();
      console.log('✓ Reveal animations initialized');
    } catch(e) { console.error('Reveal animations error:', e); }
    
    try {
      initLazyImages();
      console.log('✓ Lazy loading initialized');
    } catch(e) { console.error('Lazy loading error:', e); }
    
    try {
      initDownloadModal();
      console.log('✓ Download modal initialized');
    } catch(e) { console.error('Download modal error:', e); }
    
    try {
      initContact();
      console.log('✓ Contact button initialized');
    } catch(e) { console.error('Contact error:', e); }
    
    try {
      initCalendarButton();
      console.log('✓ Calendar button initialized');
    } catch(e) { console.error('Calendar button error:', e); }
    
    try {
      initClassButton();
      console.log('✓ Class button initialized');
    } catch(e) { console.error('Class button error:', e); }
    
    try {
      initLearnMoreButtons();
      console.log('✓ Learn More buttons initialized');
    } catch(e) { console.error('Learn More error:', e); }
    
    try {
      initCountdown();
      console.log('✓ Countdown initialized');
    } catch(e) { console.error('Countdown error:', e); }

    // add some global classes for CSS to hook on
    document.documentElement.classList.add('js-enabled');

    // reduce-motion check
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    // Add smooth entrance animation
    setTimeout(() => {
      document.body.classList.add('loaded');
      console.log('✨ Orion.co loaded successfully!');
    }, 100);
  }

  // run when DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
