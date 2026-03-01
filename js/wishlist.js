/* ============================================================
   TOKO ANOMALI — wishlist.js
   Wishlist panel with checkbox-based cart selection
   ============================================================ */

// wishlist is array of product IDs (managed alongside wishlistItems for full data)
let wishlistItems = []; // array of full product objects

/* ── TOGGLE WISHLIST (called from product card) ── */
function toggleWishlist(btn, id) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    wishlistItems = wishlistItems.filter(p => p.id !== id);
    btn.innerHTML = '♡';
    btn.classList.remove('wishlisted');
    showNotif('💔 Dihapus dari wishlist');
  } else {
    wishlist.push(id);
    // find product
    let product = null;
    for (const prods of Object.values(PRODUCTS)) {
      const found = prods.find(p => p.id === id);
      if (found) { product = found; break; }
    }
    if (!product) product = FEATURED.find(p => p.id === id);
    if (product) wishlistItems.push({ ...product });
    btn.innerHTML = '❤️';
    btn.classList.add('wishlisted');
    showNotif('❤️ Ditambahkan ke wishlist!');
  }
  updateWishlistBadge();
}

/* ── UPDATE BADGE ── */
function updateWishlistBadge() {
  const cnt = wishlist.length;
  const badge = document.getElementById('wishlistCount');
  if (cnt > 0) {
    badge.textContent = cnt;
    badge.style.display = 'flex';
    badge.classList.add('green-badge');
    badge.classList.remove('');
  } else {
    badge.style.display = 'none';
  }
}

/* ── OPEN / CLOSE WISHLIST PANEL ── */
function openWishlistPanel() {
  renderWishlistPanel();
  document.getElementById('wishlistPanel').classList.add('open');
  document.getElementById('wishlistOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWishlistPanel() {
  document.getElementById('wishlistPanel').classList.remove('open');
  document.getElementById('wishlistOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── RENDER WISHLIST PANEL ── */
function renderWishlistPanel() {
  const itemsEl  = document.getElementById('wpItems');
  const footerEl = document.getElementById('wpFooter');
  const countEl  = document.getElementById('wpCount');

  countEl.textContent = `${wishlistItems.length} item`;

  if (wishlistItems.length === 0) {
    itemsEl.innerHTML = `
      <div class="cp-empty">
        <div class="cp-empty-icon">🤍</div>
        <p>Wishlist kamu masih kosong</p>
        <button onclick="closeWishlistPanel(); scrollToKategori()">Jelajahi Produk →</button>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'flex';

  itemsEl.innerHTML = `
    <div class="wl-select-bar">
      <label class="wl-check-all">
        <input type="checkbox" id="wlCheckAll" onchange="toggleCheckAll(this.checked)">
        <span>Pilih Semua</span>
      </label>
      <button class="wl-add-selected-btn" onclick="moveSelectedToCart()">
        🛒 Tambah ke Keranjang
      </button>
    </div>
    ${wishlistItems.map((item, i) => buildWishlistItem(item, i)).join('')}
  `;

  // sync check-all state
  syncCheckAll();
}

/* ── BUILD SINGLE WISHLIST ITEM ── */
function buildWishlistItem(item, i) {
  const inCart = cart.some(c => c.id === item.id);
  return `
  <div class="wl-item" id="wl-item-${item.id}">
    <label class="wl-checkbox-wrap">
      <input type="checkbox" class="wl-check" data-id="${item.id}" onchange="syncCheckAll()">
      <span class="wl-checkmark"></span>
    </label>
    <div class="cp-item-thumb">
      <img src="${item.img}" alt="${item.name}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
      <div class="cp-thumb-fallback" style="display:none">${item.emoji}</div>
    </div>
    <div class="cp-item-info" style="flex:1;min-width:0">
      <div class="cp-item-name">${item.name}</div>
      <div class="cp-item-price">${fmt(item.price)}</div>
      ${inCart ? '<div class="wl-in-cart-tag">✓ Di Keranjang</div>' : ''}
    </div>
    <div class="wl-item-actions">
      <button class="wl-cart-btn" onclick="addToCartFromWishlist('${item.id}')" title="Tambah ke keranjang">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      </button>
      <button class="cp-item-del" onclick="removeFromWishlist('${item.id}')" title="Hapus dari wishlist">🗑</button>
    </div>
  </div>`;
}

/* ── CHECKBOX LOGIC ── */
function syncCheckAll() {
  const all   = document.querySelectorAll('.wl-check');
  const chkAll = document.getElementById('wlCheckAll');
  if (!chkAll) return;
  const allChecked = [...all].every(c => c.checked);
  const someChecked = [...all].some(c => c.checked);
  chkAll.checked = allChecked;
  chkAll.indeterminate = someChecked && !allChecked;
}

function toggleCheckAll(checked) {
  document.querySelectorAll('.wl-check').forEach(c => c.checked = checked);
}

/* ── ADD SINGLE ITEM TO CART FROM WISHLIST ── */
function addToCartFromWishlist(id) {
  addToCart(id);
  renderWishlistPanel(); // refresh to show "Di Keranjang" tag
}

/* ── MOVE SELECTED ITEMS TO CART ── */
function moveSelectedToCart() {
  const checked = document.querySelectorAll('.wl-check:checked');
  if (checked.length === 0) {
    showNotif('⚠️ Pilih produk terlebih dahulu!');
    return;
  }
  checked.forEach(c => addToCart(c.dataset.id));
  renderWishlistPanel();
  showNotif(`🛒 ${checked.length} produk ditambahkan ke keranjang!`);
}

/* ── MOVE ALL TO CART ── */
function moveAllWishlistToCart() {
  if (wishlistItems.length === 0) return;
  wishlistItems.forEach(item => addToCart(item.id));
  showNotif(`🛒 Semua ${wishlistItems.length} produk dipindahkan ke keranjang!`);
  renderWishlistPanel();
}

/* ── REMOVE FROM WISHLIST ── */
function removeFromWishlist(id) {
  const name = wishlistItems.find(i => i.id === id)?.name || '';
  wishlist.splice(wishlist.indexOf(id), 1);
  wishlistItems = wishlistItems.filter(i => i.id !== id);

  // update card wish button if visible
  const btn = document.querySelector(`.pc-wish[onclick*="${id}"]`);
  if (btn) {
    btn.innerHTML = '♡';
    btn.classList.remove('wishlisted');
  }

  updateWishlistBadge();
  renderWishlistPanel();
  showNotif(`💔 ${name} dihapus dari wishlist`);
}