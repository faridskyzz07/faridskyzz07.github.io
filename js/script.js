/* ============================================================
   TOKO ANOMALI — script.js
   Init, loading screen, notification, navbar scroll effect
   ============================================================ */

/* ── LOADING ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loading');
    loader.style.transition = 'opacity 0.5s';
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; animateHeroIn(); }, 500);
  }, 1200);
});

/* ── HERO ANIMATION ── */
function animateHeroIn() {
  const els = document.querySelectorAll('.hero-chip, .hero-title, .hero-sub, .hero-ctas, .hcard');
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ── NAVBAR SCROLL ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.style.background = 'rgba(10,10,10,0.97)';
  } else {
    navbar.style.background = 'rgba(13,13,13,0.88)';
  }
});

/* ── NOTIFICATION ── */
let notifTimer;
function showNotif(msg) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function initReveal() {
  const els = document.querySelectorAll(
    '.cat-card, .benefit-card, .testi-card, .stat-item'
  );
  els.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${(i % 4) * 0.1}s, transform 0.6s ease ${(i % 4) * 0.1}s`;
    revealObserver.observe(el);
  });
}
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initReveal, 1300);
});