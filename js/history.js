/* ============================================================
   TOKO ANOMALI — history.js
   Purchase history panel + product rating system
   ============================================================ */

let purchaseHistory = []; // array of order objects
let currentRatingTarget = null; // { orderId, productId }
let currentStarValue = 0;

const STAR_LABELS = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus!'];

/* ── SAVE ORDER TO HISTORY (called after WA checkout) ── */
function saveOrderToHistory(orderData) {
  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    items: orderData.items.map(i => ({
      ...i,
      rating: null,   // null = belum di-rating
      comment: '',
      reviewerName: '',
    })),
    total: orderData.total,
    shipping: orderData.shipping,
    subtotal: orderData.subtotal,
    buyer: orderData.buyer,
  };
  purchaseHistory.unshift(order); // newest first
  updateHistoryBadge();
}

/* ── UPDATE BADGE ── */
function updateHistoryBadge() {
  const cnt = purchaseHistory.length;
  const badge = document.getElementById('historyCount');
  if (cnt > 0) {
    badge.textContent = cnt;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

/* ── OPEN / CLOSE HISTORY PANEL ── */
function openHistoryPanel() {
  renderHistoryPanel();
  document.getElementById('historyPanel').classList.add('open');
  document.getElementById('historyOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeHistoryPanel() {
  document.getElementById('historyPanel').classList.remove('open');
  document.getElementById('historyOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── RENDER HISTORY PANEL ── */
function renderHistoryPanel() {
  const el = document.getElementById('hpItems');
  const cnt = document.getElementById('hpCount');
  cnt.textContent = `${purchaseHistory.length} transaksi`;

  if (purchaseHistory.length === 0) {
    el.innerHTML = `
      <div class="cp-empty" style="min-height:300px">
        <div class="cp-empty-icon">🧾</div>
        <p>Belum ada riwayat pembelian</p>
        <button onclick="closeHistoryPanel(); scrollToKategori()">Mulai Belanja →</button>
      </div>`;
    return;
  }

  el.innerHTML = purchaseHistory.map(order => buildOrderCard(order)).join('');
}

/* ── BUILD ORDER CARD ── */
function buildOrderCard(order) {
  const pendingRating = order.items.filter(i => i.rating === null).length;
  return `
  <div class="hist-order-card">
    <div class="hist-order-header">
      <div>
        <div class="hist-order-id">${order.id}</div>
        <div class="hist-order-date">${order.date}</div>
      </div>
      <div class="hist-order-total">${fmt(order.total)}</div>
    </div>
    <div class="hist-order-buyer">
      <span>👤 ${order.buyer.nama}</span>
      <span>📍 ${order.buyer.kota}</span>
    </div>
    <div class="hist-items-list">
      ${order.items.map(item => buildHistItemRow(order.id, item)).join('')}
    </div>
    ${pendingRating > 0 ? `<div class="hist-rating-hint">⭐ ${pendingRating} produk menunggu ulasanmu</div>` : `<div class="hist-all-rated">✅ Semua produk sudah diulas!</div>`}
  </div>`;
}

/* ── BUILD HISTORY ITEM ROW ── */
function buildHistItemRow(orderId, item) {
  const hasRating = item.rating !== null;
  return `
  <div class="hist-item-row">
    <div class="hist-item-thumb">
      <img src="${item.img}" alt="${item.name}"
        onerror="this.style.display='none'; this.parentElement.textContent='${item.emoji}'">
    </div>
    <div class="hist-item-info">
      <div class="hist-item-name">${item.name}</div>
      <div class="hist-item-sub">${fmt(item.price)} × ${item.qty}</div>
      ${hasRating
        ? `<div class="hist-item-rating">
            ${renderStars(item.rating)}
            <span class="hist-rating-val">${item.rating}/5</span>
            ${item.comment ? `<div class="hist-item-comment">"${item.comment}"</div>` : ''}
           </div>`
        : `<button class="hist-rate-btn" onclick="openRatingModal('${orderId}','${item.id}','${item.name.replace(/'/g,"\\'")}','${item.emoji}')">
             ⭐ Beri Ulasan
           </button>`
      }
    </div>
  </div>`;
}

/* ── RENDER STAR DISPLAY ── */
function renderStars(n) {
  return Array.from({length:5}, (_,i) =>
    `<span class="hist-star ${i < n ? 'filled' : ''}">${i < n ? '★' : '☆'}</span>`
  ).join('');
}

/* ── OPEN RATING MODAL ── */
function openRatingModal(orderId, productId, productName, productEmoji) {
  currentRatingTarget = { orderId, productId };
  currentStarValue = 0;

  // find product info
  const order = purchaseHistory.find(o => o.id === orderId);
  const item  = order?.items.find(i => i.id === productId);

  document.getElementById('ratingProductInfo').innerHTML = `
    <div class="rating-prod-card">
      <div class="rating-prod-thumb">
        ${item?.img ? `<img src="${item.img}" alt="${productName}" onerror="this.parentElement.textContent='${productEmoji}'">` : productEmoji}
      </div>
      <div>
        <div class="rating-prod-name">${productName}</div>
        <div class="rating-prod-price">${item ? fmt(item.price) : ''}</div>
      </div>
    </div>`;

  // reset stars
  selectStar(0);
  document.getElementById('ratingComment').value = '';
  document.getElementById('ratingName').value = '';

  document.getElementById('ratingModal').classList.add('open');
  document.getElementById('ratingOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeRatingModal() {
  document.getElementById('ratingModal').classList.remove('open');
  document.getElementById('ratingOverlay').classList.remove('open');
  if (!document.getElementById('historyPanel').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

/* ── STAR PICKER ── */
function selectStar(n) {
  currentStarValue = n;
  const stars = document.querySelectorAll('#starPicker .star');
  stars.forEach((s, i) => {
    s.classList.toggle('active', i < n);
  });
  const labelEl = document.getElementById('ratingTextLabel');
  labelEl.textContent = n > 0 ? STAR_LABELS[n] : 'Pilih bintang di atas';
  labelEl.style.color = n > 0 ? 'var(--green)' : 'var(--muted)';
}

// Hover effect on stars
document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById('starPicker');
  if (!picker) return;
  picker.addEventListener('mouseover', e => {
    if (!e.target.classList.contains('star')) return;
    const v = parseInt(e.target.dataset.v);
    document.querySelectorAll('#starPicker .star').forEach((s, i) => {
      s.classList.toggle('hover', i < v);
    });
  });
  picker.addEventListener('mouseleave', () => {
    document.querySelectorAll('#starPicker .star').forEach(s => s.classList.remove('hover'));
    // restore active state
    document.querySelectorAll('#starPicker .star').forEach((s, i) => {
      s.classList.toggle('active', i < currentStarValue);
    });
  });
});

/* ── SUBMIT RATING ── */
function submitRating() {
  if (!currentRatingTarget) return;
  if (currentStarValue === 0) {
    showNotif('⚠️ Pilih rating bintang terlebih dahulu!');
    return;
  }

  const comment = document.getElementById('ratingComment').value.trim();
  const name    = document.getElementById('ratingName').value.trim() || 'Pembeli Anonim';

  const { orderId, productId } = currentRatingTarget;
  const order = purchaseHistory.find(o => o.id === orderId);
  if (!order) return;
  const item = order.items.find(i => i.id === productId);
  if (!item) return;

  item.rating       = currentStarValue;
  item.comment      = comment;
  item.reviewerName = name;

  closeRatingModal();
  renderHistoryPanel(); // re-render to reflect rating
  // Re-render product cards so rating updates show live
  if (typeof renderFeatured === 'function') renderFeatured();
  if (typeof currentCategory !== 'undefined' && currentCategory && typeof renderProducts === 'function') {
    renderProducts(currentProducts);
  }
  showNotif(`⭐ Ulasan kamu berhasil disimpan! (${currentStarValue}/5)`);
  currentRatingTarget = null;
}