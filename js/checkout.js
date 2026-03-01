/* ============================================================
   TOKO ANOMALI — checkout.js
   3-step checkout modal + WhatsApp sender
   ============================================================ */

const WA_NUMBER = '6288905021577'; // ← Ganti nomor WA toko kamu

/* ── OPEN / CLOSE MODAL ── */
function openCheckoutModal() {
  if (cart.length === 0) { showNotif('⚠️ Keranjang masih kosong!'); return; }
  closeCart();
  populateStep1();
  goStep(1);
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── STEP NAVIGATION ── */
function goStep(n) {
  if (n === 2) { /* validate nothing needed on step 1 */ }
  if (n === 3) {
    if (!validateStep2()) return;
    populateStep3();
  }

  [1,2,3].forEach(s => {
    document.getElementById(`step${s}`).classList.toggle('hidden', s !== n);
  });
}

/* ── STEP 1: ORDER REVIEW ── */
function populateStep1() {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 100000 ? 0 : 15000;
  const total    = subtotal + shipping;

  document.getElementById('cmoOrderList').innerHTML = cart.map(item => `
    <div class="cmo-order-item">
      <div class="cmo-item-img">
        <img src="${item.img}" alt="${item.name}"
          onerror="this.style.display='none'; this.parentElement.textContent='${item.emoji}'">
      </div>
      <div class="cmo-item-info">
        <strong>${item.name}</strong>
        <span>${fmt(item.price)} × ${item.qty}</span>
      </div>
      <div class="cmo-item-subtotal">${fmt(item.price * item.qty)}</div>
    </div>
  `).join('');

  document.getElementById('cmoSubtotal').textContent = fmt(subtotal);
  document.getElementById('cmoShipping').textContent = shipping === 0 ? 'GRATIS ✨' : fmt(shipping);
  document.getElementById('cmoTotal').textContent    = fmt(total);
}

/* ── STEP 2: VALIDATE FORM ── */
function validateStep2() {
  const fields = ['fNama', 'fPhone', 'fAlamat', 'fKota'];
  let valid = true;

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value.trim()) {
      el.classList.add('err');
      el.addEventListener('input', () => el.classList.remove('err'), { once: true });
      valid = false;
    }
  });

  if (!valid) {
    showNotif('⚠️ Mohon lengkapi semua field yang wajib diisi');
    return false;
  }

  // basic phone validation
  const phone = document.getElementById('fPhone').value.replace(/\D/g, '');
  if (phone.length < 9 || phone.length > 15) {
    document.getElementById('fPhone').classList.add('err');
    showNotif('⚠️ Nomor HP tidak valid');
    return false;
  }

  return true;
}

/* ── STEP 3: CONFIRM SUMMARY ── */
function populateStep3() {
  const nama    = document.getElementById('fNama').value.trim();
  const phone   = document.getElementById('fPhone').value.trim();
  const alamat  = document.getElementById('fAlamat').value.trim();
  const kota    = document.getElementById('fKota').value.trim();
  const kodepos = document.getElementById('fKodepos').value.trim();
  const catatan = document.getElementById('fCatatan').value.trim();

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 100000 ? 0 : 15000;
  const total    = subtotal + shipping;

  const rows = [
    ['Nama', nama],
    ['Nomor HP', phone],
    ['Alamat', alamat],
    ['Kota', kota + (kodepos ? ` – ${kodepos}` : '')],
    catatan ? ['Catatan', catatan] : null,
    ['Total Bayar', fmt(total)],
  ].filter(Boolean);

  document.getElementById('cmoConfirmSummary').innerHTML = rows.map(([lbl, val]) => `
    <div class="cmo-confirm-row">
      <span class="lbl">${lbl}</span>
      <span class="val">${val}</span>
    </div>
  `).join('') + `
    <div class="cmo-confirm-row" style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border)">
      <span class="lbl">Produk (${cart.length} item)</span>
      <span class="val">${cart.map(c => `${c.name} ×${c.qty}`).join(', ')}</span>
    </div>
  `;
}

/* ── SEND TO WHATSAPP ── */
function sendToWhatsApp() {
  const nama    = document.getElementById('fNama').value.trim();
  const phone   = document.getElementById('fPhone').value.trim();
  const alamat  = document.getElementById('fAlamat').value.trim();
  const kota    = document.getElementById('fKota').value.trim();
  const kodepos = document.getElementById('fKodepos').value.trim();
  const catatan = document.getElementById('fCatatan').value.trim();

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 100000 ? 0 : 15000;
  const total    = subtotal + shipping;

  let msg = `🛍️ *PESANAN BARU – TOKO ANOMALI*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  msg += `👤 *Data Pembeli*\n`;
  msg += `• Nama    : ${nama}\n`;
  msg += `• HP/WA   : ${phone}\n`;
  msg += `• Alamat  : ${alamat}\n`;
  msg += `• Kota    : ${kota}${kodepos ? ` (${kodepos})` : ''}\n`;
  if (catatan) msg += `• Catatan : ${catatan}\n`;

  msg += `\n📦 *Detail Pesanan*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;

  cart.forEach((item, idx) => {
    const itemTotal = item.price * item.qty;
    msg += `${idx + 1}. ${item.name}\n`;
    msg += `   ${fmt(item.price)} × ${item.qty} = *${fmt(itemTotal)}*\n\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 Subtotal : ${fmt(subtotal)}\n`;
  msg += `🚚 Ongkir   : ${shipping === 0 ? 'GRATIS ✨' : fmt(shipping)}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ *TOTAL BAYAR : ${fmt(total)}*\n\n`;
  msg += `Terima kasih sudah berbelanja di Toko Anomali! 🙏\nMohon konfirmasi pesanan ini, Admin kami akan segera memproses. 💚`;

  const url = `https://api.whatsapp.com/send?phone=${WA_NUMBER}&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');

  // Save to purchase history
  saveOrderToHistory({
    items: [...cart],
    subtotal,
    shipping,
    total,
    buyer: { nama, phone, alamat, kota, kodepos, catatan }
  });

  // Clear cart after checkout
  cart = [];
  updateCartBadge();
  closeCheckoutModal();
  showNotif('🎉 Pesanan berhasil dikirim ke WhatsApp!');
}

/* ── NEWSLETTER ── */
function subscribeNewsletter(e) {
  e.preventDefault();
  const email = e.target.querySelector('input').value;
  showNotif(`🎉 Email ${email} berhasil didaftarkan!`);
  e.target.reset();
}