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

/* ── GET PRODUCT RATING SUMMARY ── */
function getProductRating(productId) {
  const reviews = [];
  for (const order of purchaseHistory || []) {
    for (const item of order.items) {
      if (item.id === productId && item.rating !== null) {
        reviews.push(item.rating);
      }
    }
  }
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((a, b) => a + b, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

/* ── RENDER MINI STARS ── */
function renderMiniStars(avg) {
  return Array.from({ length: 5 }, (_, i) => {
    const full = i + 1 <= Math.floor(avg);
    const half = !full && i < avg;
    return `<span class="pc-star ${full ? 'full' : half ? 'half' : ''}">${full || half ? '★' : '☆'}</span>`;
  }).join('');
}

/* ── BUILD PRODUCT CARD ── */
function buildProductCard(p, i = 0) {
  const discount = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
  const isWishlisted = wishlist.includes(p.id);
  const badgeClass = { 'BEST': 'badge-best', 'NEW': 'badge-new', 'HOT': 'badge-hot', 'SALE': 'badge-sale' };
  const ratingData = getProductRating(p.id);

  // Static seed rating per product (for visual display before reviews)
  const seedRatings = {
    'g1':4.8,'g2':4.7,'g3':4.6,'g4':4.5,'g5':4.9,'g6':4.4,'g7':4.7,'g8':4.9,
    'g9':4.3,'g10':4.2,'g11':4.9,'g12':4.1,'g13':4.6,'g14':4.8,'g15':4.7,
    'g16':4.9,'g17':4.5,'g18':4.8,'g19':4.3,'g20':4.2,'g21':4.7,'g22':4.4,'g23':4.5,
    'b1':4.7,'b2':4.6,'b3':4.8,'b4':4.5,'b5':4.9,'b6':4.4,'b7':4.6,'b8':4.7,
    'b9':4.3,'b10':4.8,'b11':4.5,'b12':4.6,'b13':4.4,'b14':4.7,'b15':4.9,
    'b16':4.6,'b17':4.5,'b18':4.3,'b19':4.7,'b20':4.8,'b21':4.6,'b22':4.4,'b23':4.5,
    'f1':4.6,'f2':4.7,'f3':4.5,'f4':4.8,'f5':4.6,'f6':4.4,'f7':4.9,'f8':4.7,
    'f9':4.5,'f10':4.6,'f11':4.3,'f12':4.8,'f13':4.7,'f14':4.5,'f15':4.6,
    'f16':4.4,'f17':4.7,'f18':4.8,'f19':4.5,'f20':4.6,'f21':4.3,'f22':4.7,'f23':4.5,
    'e1':4.8,'e2':4.7,'e3':4.6,'e4':4.9,'e5':4.5,'e6':4.4,'e7':4.7,'e8':4.8,
    'e9':4.3,'e10':4.6,'e11':4.8,'e12':4.5,'e13':4.7,'e14':4.6,'e15':4.4,
    'e16':4.9,'e17':4.7,'e18':4.5,'e19':4.6,'e20':4.8,'e21':4.4,'e22':4.7,'e23':4.5,
  };
  const seedCounts = { 'g1':312,'g2':198,'g3':241,'g4':175,'g5':89,'g6':143,'g7':207,'g8':412,
    'g9':56,'g10':88,'g11':34,'g12':102,'g13':178,'g14':267,'g15':321,'g16':156,
    'g17':94,'g18':189,'g19':231,'g20':147,'g21':378,'g22':72,'g23':118,
    'b1':289,'b2':156,'b3':347,'b4':201,'b5':422,'b6':133,'b7':267,'b8':178,
    'b9':92,'b10':311,'b11':189,'b12':244,'b13':167,'b14':298,'b15':401,
    'b16':213,'b17':156,'b18':89,'b19':334,'b20':278,'b21':192,'b22':143,'b23':267,
    'f1':178,'f2':234,'f3':156,'f4':289,'f5':201,'f6':133,'f7':312,'f8':267,
    'f9':189,'f10':221,'f11':98,'f12':345,'f13':278,'f14':167,'f15':234,
    'f16':143,'f17':298,'f18':312,'f19':189,'f20':256,'f21':112,'f22':334,'f23':201,
    'e1':423,'e2':312,'e3':267,'e4':489,'e5':198,'e6':156,'e7':334,'e8':412,
    'e9':89,'e10':245,'e11':378,'e12':201,'e13':289,'e14':234,'e15':167,
    'e16':512,'e17':345,'e18':189,'e19':278,'e20':423,'e21':156,'e22':312,'e23':234 };

  const displayRating = ratingData
    ? { avg: ratingData.avg, count: ratingData.count }
    : { avg: seedRatings[p.id] || 4.5, count: seedCounts[p.id] || 100 };

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
      <div class="pc-rating-row">
        <div class="pc-stars">${renderMiniStars(displayRating.avg)}</div>
        <span class="pc-rating-num">${displayRating.avg}</span>
        <span class="pc-rating-count">(${displayRating.count > 999 ? (displayRating.count/1000).toFixed(1)+'rb' : displayRating.count})</span>
      </div>
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