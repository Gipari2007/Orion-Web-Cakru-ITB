// script.js
// Orion.co — interactions ringan dari desain Figma
// Taruh file ini di root project dan link di index.html sebelum </body>

// ----- Helper -----
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// ----- Smooth scroll for internal links (nav) -----
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  const href = a.getAttribute('href') || '';
  // smooth scroll for hash links
  if (href.startsWith('#')) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
});

// ----- Hero button toggle (Class / Calendar) -----
const heroBtns = $$('.hero-controls .btn');
heroBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    heroBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    // contoh hook: kamu bisa jalankan fungsionalitas berbeda
    // berdasarkan btn.dataset.action atau btn.textContent
    // console.log('Hero button:', btn.textContent);
  });
});

// buat style .active lewat JS jika belum ada (safe)
if (!document.querySelector('style[data-js-active]')) {
  const s = document.createElement('style');
  s.setAttribute('data-js-active', '1');
  s.textContent = `.hero-controls .btn.active{ box-shadow: 0 10px 30px rgba(0,0,0,0.35); transform: translateY(-2px); }`;
  document.head.appendChild(s);
}

// ----- Download dropdown (simple) -----
// akan menambahkan dropdown saat klik link "Download" di nav
const navDownloadLink = Array.from($$('.nav-links a')).find(a => /download/i.test(a.textContent));
if (navDownloadLink) {
  // create dropdown container
  const dd = document.createElement('div');
  dd.className = 'js-download-dropdown';
  dd.style.position = 'absolute';
  dd.style.display = 'none';
  dd.style.top = '100%';
  dd.style.right = '0';
  dd.style.background = 'var(--panel)';
  dd.style.color = '#162033';
  dd.style.borderRadius = '10px';
  dd.style.padding = '8px';
  dd.style.minWidth = '180px';
  dd.style.boxShadow = '0 8px 30px rgba(2,8,20,0.25)';
  dd.innerHTML = `
    <div style="font-weight:700;margin-bottom:6px">Download</div>
    <a class="dl-item" href="index.html" data-filename="index.html" style="display:block;padding:6px;border-radius:6px;text-decoration:none;color:inherit">index.html</a>
    <a class="dl-item" href="style.css" data-filename="style.css" style="display:block;padding:6px;border-radius:6px;text-decoration:none;color:inherit">style.css</a>
    <a class="dl-item" href="images.zip" data-filename="images.zip" style="display:block;padding:6px;border-radius:6px;text-decoration:none;color:inherit">images (zip)</a>
    <div style="margin-top:8px;text-align:center"><button id="dl-all" style="padding:6px 10px;border-radius:8px;border:none;cursor:pointer;font-weight:700">Download semua</button></div>
  `;
  navDownloadLink.style.position = 'relative';
  navDownloadLink.parentElement.style.position = 'relative';
  navDownloadLink.appendChild(dd);

  // toggle
  navDownloadLink.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
  });

  // hide when clicking outside
  document.addEventListener('click', () => dd.style.display = 'none');

  // single file downloads (relative links)
  $$('.dl-item', dd).forEach(a => {
    a.addEventListener('click', (e) => {
      // for relative files on server this will work.
      // If you want to download files from GitHub raw, replace href with raw url.
      e.preventDefault();
      const href = a.getAttribute('href');
      const filename = a.dataset.filename || 'file';
      forceDownload(href, filename);
    });
  });

  // download all (zip expected)
  $('#dl-all', dd).addEventListener('click', (e) => {
    e.preventDefault();
    // Simple approach: download a zip if you prepared one (images.zip),
    // otherwise trigger all three sequentially (browser may block multiple downloads).
    const links = ['index.html','style.css','images.zip'];
    links.forEach((link, idx) => {
      setTimeout(()=> forceDownload(link, link), idx * 500);
    });
  });
}

// helper: force download a relative url
function forceDownload(url, suggestedName) {
  // If you host on GitHub, use raw.githubusercontent.com links.
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName || '';
  // fallback: open in new tab if download attribute blocked
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// ----- Event card collapse/expand -----
const eventCard = $('.event-card');
if (eventCard) {
  // add a read more toggle if content too long
  const content = $('.event-card__content', eventCard);
  if (content) {
    const toggle = document.createElement('button');
    toggle.className = 'btn btn-kedua';
    toggle.style.marginTop = '10px';
    toggle.textContent = 'Read more';
    let expanded = false;
    toggle.addEventListener('click', () => {
      expanded = !expanded;
      content.style.maxHeight = expanded ? 'none' : '110px';
      content.style.overflow = expanded ? 'visible' : 'hidden';
      toggle.textContent = expanded ? 'Show less' : 'Read more';
    });
    // initial clamp
    content.style.maxHeight = '110px';
    content.style.overflow = 'hidden';
    content.appendChild(toggle);
  }
}

// ----- Lightbox for images (.image-card img and .event-card__image) -----
function createLightbox() {
  const lb = document.createElement('div');
  lb.id = 'js-lightbox';
  lb.style.position = 'fixed';
  lb.style.inset = '0';
  lb.style.display = 'none';
  lb.style.alignItems = 'center';
  lb.style.justifyContent = 'center';
  lb.style.background = 'rgba(2,6,20,0.85)';
  lb.style.zIndex = 9999;
  lb.innerHTML = `<img style="max-width:92%;max-height:92%;border-radius:12px;box-shadow:0 30px 80px rgba(2,8,20,0.7)" src="" alt="Preview">`;
  document.body.appendChild(lb);
  lb.addEventListener('click', () => lb.style.display = 'none');
  return lb;
}
const lightbox = createLightbox();

$$('.image-card img, .event-card__image').forEach(img => {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    lightbox.querySelector('img').src = img.src;
    lightbox.style.display = 'flex';
  });
});

// ----- Accessibility: allow Esc to close lightbox -----
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const lb = $('#js-lightbox');
    if (lb) lb.style.display = 'none';
  }
});

// ----- Optional: detect missing index.html and show notice -----
window.addEventListener('load', () => {
  // if your site will be hosted and index.html not found, nothing to do here.
  // Handy dev console message:
  console.log('Orion page script loaded. If downloads fail, check file paths or use RAW GitHub URLs.');
});
