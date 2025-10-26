/* Gagkit Retro Shop — cart + details + Stripe + email fallback */
const PRODUCTS = [
  {
    id: "mental-breakdown",
    name: "Mental Breakdown Kit",
    price: 34.00,
    image: "assets/mental-breakdown.jpg",
    badge: "Featured",
    blurb: "When adulting hits too hard. Discreet packaging. Optional anonymous sender.",
    contents: [
      "Stress ball",
      "Tissues",
      "Chocolate bar",
      "Tea bag",
      "Affirmation card",
      "Funny note card"
    ]
  },
  {
    id: "office-meltdown",
    name: "Office Meltdown Kit",
    price: 29.00,
    image: "assets/p2.jpg",
    badge: "Work-Safe",
    blurb: "For meeting survivors everywhere.",
    contents: [
      "Mini coffee pack",
      "Sticker: 'I survived another meeting'",
      "Desk stress toy",
      "Mini trophy",
      "Snack mix"
    ]
  },
  {
    id: "breakup-survival",
    name: "Breakup Survival Kit",
    price: 28.00,
    image: "assets/p3.jpg",
    badge: "Sassy",
    blurb: "Because you're hotter than your ex.",
    contents: [
      "Chocolate bar",
      "Candle (travel size)",
      "Face mask",
      "Peppermints",
      "Encouragement card"
    ]
  },
  {
    id: "adulting-starter",
    name: "Adulting Starter Pack",
    price: 25.00,
    image: "assets/p4.jpg",
    badge: "Relatable",
    blurb: "For rent due, deadlines, and the dishes.",
    contents: [
      "Instant noodles",
      "Energy drink packet",
      "Sticky notes",
      "Pencil & eraser",
      "Mini checklist"
    ]
  },
  {
    id: "birthday-breakdown",
    name: "Birthday Breakdown Kit",
    price: 27.00,
    image: "assets/p5.jpg",
    badge: "Party Pick",
    blurb: "Another trip around the sun—bring confetti.",
    contents: [
      "Confetti popper",
      "Mini cake candle",
      "Birthday card",
      "Candy",
      "Party horn"
    ]
  },
  {
    id: "bad-day-fix",
    name: "Bad Day Fix Kit",
    price: 24.00,
    image: "assets/p6.jpg",
    badge: "Comfort",
    blurb: "Tiny comforts, big smiles.",
    contents: [
      "Mini candle",
      "Affirmation card",
      "Herbal tea",
      "Stress toy",
      "Sweet treat"
    ]
  }
];

const TAX_RATE = 0.07;
const SHIPPING_FLAT = 5.99;

const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
const money = n=>`$${n.toFixed(2)}`;

function loadCart(){ try{ return JSON.parse(localStorage.getItem('cart')||'[]') }catch{ return [] }}
function saveCart(items){ localStorage.setItem('cart', JSON.stringify(items||[])); updateCartCount(); }
function cartSubtotal(items){ return items.reduce((s,it)=>s+it.price*it.qty,0) }
function updateCartCount(){
  const items = loadCart();
  const count = items.reduce((n,it)=>n+it.qty,0);
  const el = document.querySelector('[data-cart-count]');
  if(el) el.textContent = count;
}

function addToCart(id, qty=1){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  const cart = loadCart();
  const i = cart.findIndex(c=>c.id===id);
  if(i>-1) cart[i].qty += qty; else cart.push({id:p.id, name:p.name, price:p.price, image:p.image, qty});
  saveCart(cart); openCart(); renderCart();
}
function removeFromCart(id){ saveCart(loadCart().filter(x=>x.id!==id)); renderCart(); }

function renderProducts(){
  const grid = document.getElementById('productGrid'); if(!grid) return;
  grid.innerHTML = PRODUCTS.map(p=>`
    <article class="card" aria-label="${p.name}">
      <img src="${p.image}" alt="${p.name}">
      <div class="card__body">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:.5rem">
          <h3 style="margin:0">${p.name}</h3>
          <span class="badge">${p.badge}</span>
        </div>
        <p class="muted">${p.blurb}</p>
        <details>
          <summary>What's inside</summary>
          <ul>
            ${p.contents.map(c=>`<li>${c}</li>`).join('')}
          </ul>
        </details>
        <div class="card__actions">
          <span class="price">${money(p.price)}</span>
          <div class="qty">
            <label class="tiny" for="qty-${p.id}" style="display:none">Qty</label>
            <input id="qty-${p.id}" type="number" min="1" value="1" inputmode="numeric">
            <button class="btn" data-add data-id="${p.id}">Add</button>
          </div>
        </div>
        <button class="btn btn--ghost" data-more data-id="${p.id}">View details</button>
      </div>
    </article>
  `).join('');
  grid.addEventListener('click', e=>{
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){
      const id = addBtn.dataset.id;
      const qty = parseInt(document.getElementById(`qty-${id}`).value||'1',10);
      addToCart(id, Math.max(1, qty));
      return;
    }
    const moreBtn = e.target.closest('[data-more]');
    if(moreBtn){
      openDialog(moreBtn.dataset.id);
    }
  });
}

function openDialog(id){
  const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
  $('#dlgImage').src = p.image;
  $('#dlgTitle').textContent = p.name;
  $('#dlgBlurb').textContent = p.blurb;
  $('#dlgList').innerHTML = p.contents.map(c=>`<li>${c}</li>`).join('');
  $('#dlgPrice').textContent = money(p.price);
  $('#dlgAdd').onclick = ()=>{ addToCart(p.id, 1); $('#productDialog').close(); };
  $('#productDialog').showModal();
}
$$('[data-dialog-close]').forEach(b=>b.addEventListener('click', ()=>$('#productDialog').close()));

function renderCart(){
  const wrap = document.querySelector('[data-cart-items]');
  const subtotalEl = document.querySelector('[data-cart-subtotal]');
  if(!wrap || !subtotalEl) return;
  const items = loadCart();
  if(items.length===0){ wrap.innerHTML = `<p class="muted">Your cart is empty.</p>`; subtotalEl.textContent = money(0); return; }
  wrap.innerHTML = items.map(it=>`
    <div class="cart-item">
      <img src="${it.image}" alt="" aria-hidden="true">
      <div><strong>${it.name}</strong><div class="muted tiny">${money(it.price)} × ${it.qty}</div></div>
      <button class="icon" aria-label="Remove" data-remove="${it.id}">✕</button>
    </div>
  `).join('');
  wrap.addEventListener('click', e=>{ const b=e.target.closest('[data-remove]'); if(b) removeFromCart(b.dataset.remove) });
  subtotalEl.textContent = money(cartSubtotal(items));
}

function openCart(){ const c=$('[data-cart]'); const bd=$('[data-cart-backdrop]'); c.setAttribute('aria-hidden','false'); bd.hidden=false }
function closeCart(){ const c=$('[data-cart]'); const bd=$('[data-cart-backdrop]'); c.setAttribute('aria-hidden','true'); bd.hidden=true }
function setupCartControls(){
  $('[data-open-cart]')?.addEventListener('click', openCart);
  document.querySelector('.cart__header .icon')?.addEventListener('click', closeCart);
  $('[data-cart-backdrop]')?.addEventListener('click', closeCart);
}

function renderCheckout(){
  const sum = $('#orderSummary'); const cartJson = $('#cartJson'); const totalsJson = $('#totalsJson');
  if(!sum) return;
  const items = loadCart();
  if(items.length===0){ sum.innerHTML = `<p class="muted">Your cart is empty. <a href="index.html">Go shop →</a></p>`; return; }
  const subtotal = cartSubtotal(items); const tax=subtotal*TAX_RATE; const shipping = items.length?SHIPPING_FLAT:0; const total=subtotal+tax+shipping;
  sum.innerHTML = `
    <div class="cart__row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div>
    <div class="cart__row"><span>Tax</span><strong>${money(tax)}</strong></div>
    <div class="cart__row"><span>Shipping</span><strong>${money(shipping)}</strong></div>
    <div class="cart__row"><span>Total</span><strong>${money(total)}</strong></div>
    <ul style="margin-top:.6rem;list-style:none;padding:0">
      ${items.map(it=>`<li><span>${it.name} × ${it.qty}</span> — <strong>${money(it.price*it.qty)}</strong></li>`).join('')}
    </ul>
  `;
  if(cartJson) cartJson.value = JSON.stringify(items);
  if(totalsJson) totalsJson.value = JSON.stringify({subtotal, tax, shipping, total});
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderProducts(); setupCartControls(); renderCart(); updateCartCount(); renderCheckout();
});
