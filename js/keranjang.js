/* ============================================================
   TOKO ANOMALI — keranjang.js
   Cart state, cart panel UI
   ============================================================ */

let cart = [];
let wishlist = [];

/* ── ADD TO CART ── */
function addToCart(id) {
  // find product in all categories
  let product = null;
  for (const prods of Object.values(PRODUCTS)) {
    const found = prods.find(p => p.id === id);
    if (found) { product = found; break; }
  }
  // also check FEATURED
  if (!product) product = FEATURED.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  animateAddBtn(id);
  updateCartBadge();
  showNotif(`✅ ${product.name} ditambahkan!`);
}

/* ── ANIMATE ADD BUTTON ── */
function animateAddBtn(id) {
  const btn = document.getElementById(`addbtn-${id}`);
  if (!btn) return;
  const span = btn.querySelector('span');
  const orig = span.textContent;
  btn.classList.add('added');
  span.textContent = '✓ DITAMBAHKAN';
  setTimeout(() => {
    btn.classList.remove('added');
    span.textContent = orig;
  }, 1600);
}

/* ── UPDATE BADGE ── */
function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = total;
  badge.style.display = total > 0 ? 'flex' : 'flex'; // always show for cart

  const fc = document.getElementById('floatingCart');
  const fl = document.getElementById('floatLabel');
  if (total > 0) {
    fc.style.display = 'flex';
    fl.textContent = `Keranjang (${total})`;
  } else {
    fc.style.display = 'none';
  }
}

/* ── OPEN / CLOSE CART ── */
function openCart() {
  renderCartPanel();
  document.getElementById('cartPanel').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartPanel').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── RENDER CART PANEL ── */
function renderCartPanel() {
  const itemsEl  = document.getElementById('cpItems');
  const footerEl = document.getElementById('cpFooter');
  const countEl  = document.getElementById('cpCount');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  countEl.textContent = `${totalQty} item`;

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cp-empty">
        <div class="cp-empty-icon">🛍️</div>
        <p>Keranjang kamu masih kosong</p>
        <button onclick="closeCart(); scrollToKategori()">Mulai Belanja →</button>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }

  footerEl.style.display = 'flex';

  itemsEl.innerHTML = cart.map((item, i) => `
    <div class="cp-item">
      <div class="cp-item-thumb">
        <img src="${item.img}" alt="${item.name}"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
        <div class="cp-thumb-fallback" style="display:none">${item.emoji}</div>
      </div>
      <div class="cp-item-info">
        <div class="cp-item-name">${item.name}</div>
        <div class="cp-item-price">${fmt(item.price * item.qty)}</div>
        <div class="cp-item-qty">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
      <button class="cp-item-del" onclick="removeFromCart(${i})" title="Hapus">🗑</button>
    </div>
  `).join('');

  updateCartTotals();
}

/* ── UPDATE TOTALS ── */
function updateCartTotals() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 100000 ? 0 : 15000;
  const total    = subtotal + shipping;

  document.getElementById('cpSubtotal').textContent = fmt(subtotal);
  document.getElementById('cpShipping').textContent = shipping === 0 ? 'GRATIS ✨' : fmt(shipping);
  document.getElementById('cpTotal').textContent    = fmt(total);

  const noteEl = document.getElementById('cpShippingNote');
  if (shipping === 0) {
    noteEl.textContent = '🎉 Kamu dapat gratis ongkir!';
    noteEl.style.display = 'block';
  } else {
    const sisa = 100000 - cart.reduce((s, i) => s + i.price * i.qty, 0);
    noteEl.textContent = `Tambah ${fmt(sisa)} lagi untuk gratis ongkir`;
    noteEl.style.display = 'block';
  }
}

/* ── CHANGE QTY ── */
function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCartBadge();
  renderCartPanel();
}

/* ── REMOVE ── */
function removeFromCart(index) {
  const name = cart[index].name;
  cart.splice(index, 1);
  updateCartBadge();
  renderCartPanel();
  showNotif(`🗑️ ${name} dihapus`);
}