/* ============================================================
   TOKO ANOMALI — produk.js
   Category page, product rendering, filter, sort, search
   ============================================================ */

let currentCategory = '';
let currentProducts = [];

/* ── OPEN CATEGORY ── */
function openCategory(type) {
  currentCategory = type;
  currentProducts = [...PRODUCTS[type]];

  document.getElementById('homePage').classList.add('hidden');
  document.getElementById('categoryPage').classList.remove('hidden');
  document.getElementById('catPageTitle').textContent = CATEGORY_LABELS[type];

  // reset filter pills
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.pill')[0]?.classList.add('active');
  document.querySelector('.sort-select').value = '';

  renderProducts(currentProducts);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── GO HOME ── */
function goHome() {
  document.getElementById('categoryPage').classList.add('hidden');
  document.getElementById('homePage').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── RENDER PRODUCTS ── */
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!list || list.length === 0) {
    grid.innerHTML = `
      <div class="no-results">
        <div class="nr-icon">🔍</div>
        <p>Tidak ada produk yang cocok dengan filter ini.</p>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => buildProductCard(p, i)).join('');
}

/* ── BUILD PRODUCT CARD ── */
function buildProductCard(p, i = 0) {
  const discount = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const isWishlisted = wishlist.includes(p.id);
  const badgeClass = { 'BEST': 'badge-best', 'NEW': 'badge-new', 'HOT': 'badge-hot', 'SALE': 'badge-sale' };

  return `
  <div class="product-card" style="animation-delay:${i * 0.04}s">
    <div class="pc-img">
      <img src="${p.img}" alt="${p.name}"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
      <div class="pc-img-fallback" style="display:none">${p.emoji}</div>
      ${p.badge ? `<span class="pc-badge ${badgeClass[p.badge] || ''}">${p.badge}</span>` : ''}
      <button class="pc-wish ${isWishlisted ? 'wishlisted' : ''}"
        onclick="toggleWishlist(this, '${p.id}')">${isWishlisted ? '❤️' : '♡'}</button>
    </div>
    <div class="pc-body">
      <div class="pc-name">${p.name}</div>
      <div class="pc-desc">${p.desc}</div>
      <div class="pc-price-row">
        <span class="pc-price">${fmt(p.price)}</span>
        ${p.orig ? `<span class="pc-orig">${fmt(p.orig)}</span>` : ''}
        ${discount > 0 ? `<span class="pc-discount">-${discount}%</span>` : ''}
      </div>
      <button class="pc-add-btn" id="addbtn-${p.id}" onclick="addToCart('${p.id}')">
        <span>+ KERANJANG</span>
      </button>
    </div>
  </div>`;
}

/* ── RENDER FEATURED (Home) ── */
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  grid.innerHTML = FEATURED.map((p, i) => buildProductCard(p, i)).join('');
}

/* ── FILTER BY PRICE ── */
function filterPrice(range, btn) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  const all = [...PRODUCTS[currentCategory]];
  let filtered = all;
  if (range === 'low')  filtered = all.filter(p => p.price < 200000);
  if (range === 'mid')  filtered = all.filter(p => p.price >= 200000 && p.price <= 500000);
  if (range === 'high') filtered = all.filter(p => p.price > 500000);

  currentProducts = filtered;
  renderProducts(filtered);
}

/* ── SORT ── */
function sortProducts(val) {
  let list = [...currentProducts];
  if (val === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (val === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (val === 'name')       list.sort((a, b) => a.name.localeCompare(b.name));
  renderProducts(list);
}

/* ── SEARCH ── */
function handleSearch(val) {
  const drop = document.getElementById('searchDropdown');
  if (val.length < 2) { drop.classList.remove('open'); return; }

  const q = val.toLowerCase();
  const results = [];

  Object.entries(PRODUCTS).forEach(([cat, prods]) => {
    prods.forEach(p => {
      if (p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)) {
        results.push({ ...p, cat });
      }
    });
  });

  if (results.length === 0) { drop.classList.remove('open'); return; }

  drop.innerHTML = results.slice(0, 7).map(p => `
    <div class="sdrop-item" onclick="selectSearch('${p.cat}', '${p.id}')">
      <span>${p.emoji}</span>
      <span>${p.name}</span>
      <span class="sdrop-cat">${CATEGORY_LABELS[p.cat].replace(/^[^a-zA-Z]+/, '')}</span>
    </div>
  `).join('');
  drop.classList.add('open');
}

function doSearch() {
  const val = document.getElementById('searchInput').value.toLowerCase();
  if (!val) return;

  // find first category match
  for (const [cat, prods] of Object.entries(PRODUCTS)) {
    const match = prods.find(p => p.name.toLowerCase().includes(val) || p.desc.toLowerCase().includes(val));
    if (match) { openCategory(cat); break; }
  }
  document.getElementById('searchDropdown').classList.remove('open');
}

function selectSearch(cat, id) {
  openCategory(cat);
  document.getElementById('searchInput').value = '';
  document.getElementById('searchDropdown').classList.remove('open');
}

/* ── WISHLIST ── (managed in wishlist.js) ── */

/* ── SCROLL TO CATEGORY ── */
function scrollToKategori() {
  document.getElementById('kategoriSection')?.scrollIntoView({ behavior: 'smooth' });
}

/* ── FORMAT RUPIAH ── */
function fmt(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', renderFeatured);

// Close search dropdown on outside click
document.addEventListener('click', e => {
  if (!document.querySelector('.nav-search')?.contains(e.target)) {
    document.getElementById('searchDropdown')?.classList.remove('open');
  }
});