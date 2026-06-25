/* ============================================================
   ROST.coffee — interaction layer
   ============================================================ */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const inr = (n) => "₹" + n.toLocaleString("en-IN");
  /* Escape any string before it touches innerHTML — defends against
     stored/derived content ever carrying markup (XSS-safe rendering). */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  /* Accessible star row from a 0–5 rating. */
  const stars = (r) => {
    const full = Math.round(r);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  };

  /* Failsafe: always dismiss the loader, even if later init throws. */
  const hideLoader = () => { const l = document.getElementById("loader"); if (l) l.classList.add("is-done"); };
  setTimeout(hideLoader, 1500);
  window.addEventListener("load", () => setTimeout(hideLoader, 400));

  /* ---------- DATA ---------- */
  const PRODUCTS = [
    { id: "p1", name: "Signature Black", origin: "Chikmagalur, IN", cat: "signature", price: 449, was: 549, badge: "Bestseller", img: "assets/hero-bottle.png", desc: "The original. 16-hour steep, chocolate & cane sugar finish.", rating: 4.9, reviews: 842, size: "250 ml", caffeine: "180 mg", notes: ["Dark chocolate", "Cane sugar", "Smooth finish"] },
    { id: "p2", name: "Original", origin: "Coorg Estates, IN", cat: "signature", price: 399, was: 0, badge: "", img: "assets/product-original.png", desc: "Clean, balanced, endlessly drinkable. Our everyday hero.", rating: 4.7, reviews: 514, size: "250 ml", caffeine: "165 mg", notes: ["Balanced", "Nutty", "Low acidity"] },
    { id: "p3", name: "Madagascar Vanilla", origin: "Single Origin", cat: "flavoured", price: 469, was: 0, badge: "New", img: "assets/product-vanilla.png", desc: "Real bourbon vanilla folded into a slow cold steep.", rating: 4.8, reviews: 327, size: "250 ml", caffeine: "160 mg", notes: ["Bourbon vanilla", "Creamy", "Subtle sweetness"] },
    { id: "p4", name: "Dark Mocha", origin: "Araku Valley, IN", cat: "flavoured", price: 469, was: 0, badge: "", img: "assets/product-mocha.png", desc: "Single-origin cacao meets deep-roast cold brew.", rating: 4.6, reviews: 289, size: "250 ml", caffeine: "170 mg", notes: ["Single-origin cacao", "Deep roast", "Velvety"] },
    { id: "p5", name: "Founders' Case ×6", origin: "Mixed Selection", cat: "bundle", price: 2499, was: 2814, badge: "Save 11%", img: "assets/bundle-case6.png", desc: "Six bottles, our four expressions. The full ROST flight.", rating: 4.9, reviews: 196, size: "6 × 250 ml", caffeine: "Mixed", notes: ["All four expressions", "Best value", "Gift-ready"] },
    { id: "p6", name: "The Discovery Trio", origin: "3 × 250ml", cat: "bundle", price: 1199, was: 1317, badge: "Gift", img: "assets/bundle-trio3.png", desc: "One of each flavour. The perfect introduction.", rating: 4.8, reviews: 134, size: "3 × 250 ml", caffeine: "Mixed", notes: ["Three flavours", "Perfect intro", "Gift-ready"] },
  ];

  const REVIEWS = [
    { name: "Aarav M.", loc: "Bengaluru", rating: 5, text: "Genuinely the smoothest cold brew I've had in India. I drink it black now — never thought I would.", product: "Signature Black" },
    { name: "Priya N.", loc: "Mumbai", rating: 5, text: "The subscription is the best decision I made this year. Arrives fresh, on time, every single month.", product: "Founders' Case ×6" },
    { name: "Karthik R.", loc: "Hyderabad", rating: 5, text: "Madagascar Vanilla tastes like a dessert without the sugar crash. My whole office is hooked.", product: "Madagascar Vanilla" },
    { name: "Sneha D.", loc: "Pune", rating: 4, text: "Premium feel from the bottle to the last sip. Delivery was quick and the packaging is gorgeous.", product: "The Discovery Trio" },
  ];

  const FOUNDERS = [
    { initial: "R", name: "Rahul", role: "Brew & Product", bio: "The palate of the trio. Spent two years dialling in the steep ratio bottle by bottle until it was undeniable.", quote: "“If it isn't smooth enough to drink black, it isn't ROST.”" },
    { initial: "S", name: "Sam", role: "Brand & Design", bio: "Turned a flask recipe into a brand. Obsessed with the gap between ‘good enough’ and ‘perfect’.", quote: "“Luxury is just attention, repeated.”" },
    { initial: "A", name: "Anurag", role: "Ops & Growth", bio: "Built the supply chain from estate to doorstep. The reason every bottle arrives fresh and on time.", quote: "“We scale the care, never cut it.”" },
  ];

  const TIMELINE = [
    { year: "2021", t: "The bad cup", d: "Three friends summit Hatu Peak (11,152 ft) and drink the worst cold brew of their lives. The idea is born." },
    { year: "2022", t: "The kitchen lab", d: "Hundreds of test batches. The 16-hour cold steep in Himalayan spring water becomes the recipe." },
    { year: "2023", t: "First 100 bottles", d: "A soft launch to friends sells out in a weekend. ROST becomes real." },
    { year: "2024", t: "Going national", d: "Subscriptions, four expressions, and shipping across India. The climb continues." },
  ];

  const ORDERS = [
    { id: "RC-2611-8842", date: "11 Jun 2026", items: "Signature Black ×6", total: 2499, status: "shipped" },
    { id: "RC-2605-7731", date: "05 May 2026", items: "Madagascar Vanilla ×3", total: 1407, status: "delivered" },
    { id: "RC-2603-5520", date: "18 Mar 2026", items: "Founders' Case ×6", total: 2499, status: "delivered" },
  ];

  /* ---------- STATE ---------- */
  let cart = [];
  let user = null;

  /* ============================================================
     RENDERING
     ============================================================ */
  function cartQty(id) { const l = cart.find(i => i.id === id); return l ? l.qty : 0; }
  function ctaHTML(id) {
    const q = cartQty(id);
    if (!q) return `<button class="add-btn" data-add="${id}">Add <span class="plus">+</span></button>`;
    return `<div class="stepper" data-instep="${id}">
        <button data-dec="${id}" aria-label="Remove one">−</button>
        <span class="stepper-qty">${q}<small>in bag</small></span>
        <button data-inc="${id}" aria-label="Add one">+</button>
      </div>`;
  }
  function updateCardCtas() { $$("[data-cta]").forEach(el => { el.innerHTML = ctaHTML(el.dataset.cta); }); }

  function productCard(p) {
    const was = p.was ? `<small>${inr(p.was)}</small>` : "";
    const badge = p.badge ? `<span class="card-badge">${esc(p.badge)}</span>` : "";
    const rating = p.rating
      ? `<div class="card-rate"><span class="stars" aria-hidden="true">${stars(p.rating)}</span><span class="card-rate-meta">${p.rating} (${p.reviews})</span></div>`
      : "";
    return `
    <article class="card reveal" data-cat="${esc(p.cat)}">
      <div class="card-media">
        ${badge}
        <button class="card-fav" data-fav aria-label="Save">♡</button>
        <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" />
        <button class="card-quick" data-quick="${esc(p.id)}">Quick view</button>
      </div>
      <div class="card-body">
        <span class="card-origin">${esc(p.origin)}</span>
        <h3 class="card-name" data-quick="${esc(p.id)}">${esc(p.name)}</h3>
        ${rating}
        <p class="card-desc">${esc(p.desc)}</p>
        <div class="card-foot">
          <span class="card-price">${inr(p.price)} ${was}</span>
          <div class="card-cta" data-cta="${esc(p.id)}">${ctaHTML(p.id)}</div>
        </div>
      </div>
    </article>`;
  }

  $("#homeGrid").innerHTML = PRODUCTS.slice(0, 4).map(productCard).join("");

  /* ---------- CATALOG: filter + search + sort ---------- */
  const catalog = { filter: "all", query: "", sort: "featured" };
  const SORTERS = {
    "featured": null,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    "rating": (a, b) => (b.rating || 0) - (a.rating || 0),
    "name": (a, b) => a.name.localeCompare(b.name),
  };
  function renderCatalog() {
    const grid = $("#catalogGrid"), empty = $("#catalogEmpty"), count = $("#catalogCount");
    const q = catalog.query.trim().toLowerCase();
    let list = PRODUCTS.filter(p => catalog.filter === "all" || p.cat === catalog.filter);
    if (q) list = list.filter(p =>
      [p.name, p.origin, p.desc, ...(p.notes || [])].join(" ").toLowerCase().includes(q)
    );
    const sorter = SORTERS[catalog.sort];
    if (sorter) list = [...list].sort(sorter);

    grid.innerHTML = list.map(productCard).join("");
    $$("#catalogGrid .card").forEach(c => c.classList.add("in"));
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    count.textContent = list.length
      ? `${list.length} ${list.length === 1 ? "brew" : "brews"}${q ? ` for “${catalog.query.trim()}”` : ""}`
      : "";
    updateCardCtas();
  }
  renderCatalog();

  $("#reviewGrid").innerHTML = REVIEWS.map(r => `
    <article class="review reveal">
      <span class="stars" aria-label="${r.rating} out of 5">${stars(r.rating)}</span>
      <p class="review-text">${esc(r.text)}</p>
      <div class="review-by">
        <strong>${esc(r.name)}</strong>
        <span>${esc(r.loc)} · ${esc(r.product)}</span>
      </div>
    </article>`).join("");
  $("#rsStars").textContent = stars(5);

  $("#founderGrid").innerHTML = FOUNDERS.map(f => `
    <article class="founder reveal">
      <div class="founder-pic">${f.initial}</div>
      <h3>${f.name}</h3>
      <p class="role">${f.role}</p>
      <p>${f.bio}</p>
      <p class="fq">${f.quote}</p>
    </article>`).join("");

  $("#timeline").innerHTML = TIMELINE.map(t => `
    <div class="tl-item reveal">
      <span class="tl-year">${t.year}</span>
      <h3>${t.t}</h3>
      <p>${t.d}</p>
    </div>`).join("");

  $("#ordersList").innerHTML = ORDERS.map(o => `
    <div class="order reveal">
      <div>
        <div class="order-id">${o.id}</div>
        <div class="order-meta">${o.items} · ${o.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:18px">
        <span class="order-total">${inr(o.total)}</span>
        <span class="badge ${o.status}">${o.status.toUpperCase()}</span>
      </div>
    </div>`).join("");

  /* ============================================================
     ROUTING (single-page)
     ============================================================ */
  function go(page) {
    $$(".page").forEach(p => p.classList.toggle("is-active", p.id === "page-" + page));
    $$(".nav-link").forEach(l => l.classList.toggle("is-active", l.dataset.nav === page));
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (location.hash !== "#" + page) history.replaceState(null, "", "#" + page);
    closeMenu();
    requestAnimationFrame(observeReveals);
  }
  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); go(nav.dataset.nav); }
  });
  // Initial route is applied in INIT (after all sections are defined).

  /* ============================================================
     CART
     ============================================================ */
  const cartEl = $("#cart"), overlay = $("#overlay");
  const FREE_SHIP = 2999;
  const CART_KEY = "rost-cart";

  /* Persist only {id, qty}. On load we re-hydrate price/name/img from
     PRODUCTS, so tampered localStorage can never inject a fake price or
     markup into the cart. */
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart.map(i => ({ id: i.id, qty: i.qty }))));
    } catch (_) {}
  }
  function loadCart() {
    let raw;
    try { raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (_) { return; }
    if (!Array.isArray(raw)) return;
    const rebuilt = [];
    raw.forEach(entry => {
      if (!entry || typeof entry !== "object") return;
      const p = PRODUCTS.find(x => x.id === entry.id);
      const qty = Math.floor(Number(entry.qty));
      if (p && Number.isFinite(qty) && qty > 0 && !rebuilt.some(i => i.id === p.id)) {
        rebuilt.push({ ...p, qty: Math.min(qty, 99) });
      }
    });
    cart = rebuilt;
  }

  function openCart() { cartEl.classList.add("open"); overlay.classList.add("show"); cartEl.setAttribute("aria-hidden","false"); }
  function closeCart() { cartEl.classList.remove("open"); overlay.classList.remove("show"); cartEl.setAttribute("aria-hidden","true"); }

  function addToCart(id, btn) {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    if (btn) burstBeans(btn);
    const line = cart.find(i => i.id === id);
    if (line) line.qty = Math.min(line.qty + 1, 99); else cart.push({ ...p, qty: 1 });
    renderCart(); saveCart();
    bounceCount();
    toast(`${p.name} added to bag`);
  }
  function changeQty(id, d) {
    const line = cart.find(i => i.id === id); if (!line) return;
    line.qty = Math.min(line.qty + d, 99);
    if (line.qty <= 0) cart = cart.filter(i => i.id !== id);
    renderCart(); saveCart();
  }
  function renderCart() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
    const cc = $("#cartCount");
    cc.textContent = count;
    cc.classList.toggle("show", count > 0);
    cartEl.classList.toggle("empty", count === 0);
    $("#cartSubtotal").textContent = inr(subtotal);

    const pct = Math.min(100, (subtotal / FREE_SHIP) * 100);
    $("#shipFill").style.width = pct + "%";
    $("#shipMsg").textContent = subtotal >= FREE_SHIP
      ? "✦ You've unlocked free shipping"
      : `Add ${inr(FREE_SHIP - subtotal)} for free shipping`;

    $("#cartItems").innerHTML = cart.map(i => `
      <div class="cart-item">
        <img src="${esc(i.img)}" alt="${esc(i.name)}" />
        <div>
          <div class="ci-name">${esc(i.name)}</div>
          <div class="ci-price">${inr(i.price)}</div>
          <div class="qty">
            <button data-dec="${esc(i.id)}" aria-label="Remove one">−</button>
            <span>${i.qty}</span>
            <button data-inc="${esc(i.id)}" aria-label="Add one">+</button>
          </div>
          <button class="ci-remove" data-rm="${esc(i.id)}">Remove</button>
        </div>
        <strong>${inr(i.price * i.qty)}</strong>
      </div>`).join("");
    updateCardCtas();
  }
  function bounceCount() { const c = $("#cartCount"); c.classList.remove("bounce"); void c.offsetWidth; c.classList.add("bounce"); }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add, add); return; }
    const inc = e.target.closest("[data-inc]"); if (inc) return changeQty(inc.dataset.inc, 1);
    const dec = e.target.closest("[data-dec]"); if (dec) return changeQty(dec.dataset.dec, -1);
    const rm = e.target.closest("[data-rm]"); if (rm) { cart = cart.filter(i => i.id !== rm.dataset.rm); renderCart(); saveCart(); return; }
    const quick = e.target.closest("[data-quick]"); if (quick) { openQuick(quick.dataset.quick); return; }
    const fav = e.target.closest("[data-fav]"); if (fav) { fav.textContent = fav.textContent === "♡" ? "♥" : "♡"; fav.style.color = fav.textContent === "♥" ? "var(--copper)" : ""; }
  });
  $("#cartBtn").onclick = openCart;
  $("#cartClose").onclick = closeCart;
  overlay.onclick = () => { closeCart(); };
  $("#checkoutBtn").onclick = () => {
    if (!cart.length) return;
    if (!user) { closeCart(); openAuth(); toast("Sign in to complete checkout"); return; }
    toast(voucherClaimed ? "Order placed — ROST100 (10% off) applied ✦" : "Order placed — confirmation on its way ✦");
    cart = []; renderCart(); saveCart(); closeCart();
  };

  /* ============================================================
     FILTERS
     ============================================================ */
  $("#filterBar").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    $$(".chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    catalog.filter = chip.dataset.filter;
    renderCatalog();
  });

  const searchInput = $("#catalogSearch"), searchClear = $("#searchClear");
  searchInput.addEventListener("input", () => {
    catalog.query = searchInput.value;
    searchClear.hidden = !searchInput.value;
    renderCatalog();
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = ""; catalog.query = ""; searchClear.hidden = true;
    renderCatalog(); searchInput.focus();
  });
  $("#catalogSort").addEventListener("change", (e) => {
    catalog.sort = e.target.value;
    renderCatalog();
  });
  $("#catalogReset").addEventListener("click", () => {
    catalog.filter = "all"; catalog.query = ""; catalog.sort = "featured";
    searchInput.value = ""; searchClear.hidden = true;
    $("#catalogSort").value = "featured";
    $$(".chip").forEach(c => c.classList.toggle("is-active", c.dataset.filter === "all"));
    renderCatalog();
  });

  /* ============================================================
     QUICK VIEW
     ============================================================ */
  const quickModal = $("#quickModal");
  let lastFocus = null;
  function openQuick(id) {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    lastFocus = document.activeElement;
    $("#qvImg").src = p.img;
    $("#qvImg").alt = p.name;
    const badge = $("#qvBadge");
    badge.hidden = !p.badge;
    badge.textContent = p.badge || "";
    $("#qvOrigin").textContent = p.origin;
    $("#qvName").textContent = p.name;
    $("#qvDesc").textContent = p.desc;
    $("#qvStars").textContent = stars(p.rating || 0);
    $("#qvReviews").textContent = p.rating ? `${p.rating} · ${p.reviews} reviews` : "";
    $("#qvNotes").innerHTML = (p.notes || []).map(n => `<li>${esc(n)}</li>`).join("");
    $("#qvSpecs").innerHTML = `
      <div class="spec"><span class="k">Size</span><span class="v">${esc(p.size || "—")}</span></div>
      <div class="spec"><span class="k">Caffeine</span><span class="v">${esc(p.caffeine || "—")}</span></div>
      <div class="spec"><span class="k">Steep</span><span class="v">16 hours</span></div>`;
    $("#qvPrice").innerHTML = `${inr(p.price)} ${p.was ? `<small>${inr(p.was)}</small>` : ""}`;
    const cta = $("#qvCta");
    cta.dataset.cta = p.id;
    cta.innerHTML = ctaHTML(p.id);
    quickModal.classList.add("show");
    quickModal.setAttribute("aria-hidden", "false");
    $("#quickClose").focus();
  }
  function closeQuick() {
    quickModal.classList.remove("show");
    quickModal.setAttribute("aria-hidden", "true");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $("#quickClose").onclick = closeQuick;
  quickModal.addEventListener("click", (e) => { if (e.target === quickModal) closeQuick(); });

  /* ============================================================
     AUTH
     ============================================================ */
  const authModal = $("#authModal");
  function openAuth() { authModal.classList.add("show"); authModal.setAttribute("aria-hidden","false"); }
  function closeAuth() { authModal.classList.remove("show"); authModal.setAttribute("aria-hidden","true"); }
  $("#accountBtn").onclick = () => user ? go("account") : openAuth();
  $("#authClose").onclick = closeAuth;
  authModal.addEventListener("click", e => { if (e.target === authModal) closeAuth(); });
  $("#lockedSignIn").onclick = openAuth;

  $$(".auth-tab").forEach(tab => tab.onclick = () => {
    $$(".auth-tab").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    $$(".auth-form").forEach(f => f.classList.toggle("is-active", f.dataset.form === tab.dataset.auth));
  });

  function signIn(name, email, method) {
    user = { name, email, method };
    $("#accountName").textContent = name;
    $("#accountEmail").textContent = email;
    $("#avatarInitial").textContent = name[0].toUpperCase();
    $("#pName").textContent = name;
    $("#pEmail").textContent = email;
    $("#accLocked").hidden = true;
    $("#accUnlocked").hidden = false;
    $("#signOutBtn").hidden = false;
    closeAuth();
    centerBurst();
    toast(`Welcome, ${name.split(" ")[0]} ✦`);
  }
  function withLoader(form, cb) {
    const label = $(".btn-label", form);
    if (label) label.classList.add("loading");
    setTimeout(() => { if (label) label.classList.remove("loading"); cb(); }, 1100);
  }

  $("#emailForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = e.target.querySelector("input[type=email]").value;
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    withLoader(e.target, () => signIn(name, email, "email"));
  });

  let otpSent = false;
  $("#phoneForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!otpSent) {
      withLoader(form, () => {
        otpSent = true;
        $("#otpRow").hidden = false;
        $(".btn-label", form).textContent = "Verify & sign in";
        const code = Math.floor(100000 + Math.random() * 900000);
        toast(`Demo OTP: ${code}`);
      });
    } else {
      const phone = form.querySelector("input[type=tel]").value;
      withLoader(form, () => signIn("ROST Member", phone, "phone"));
    }
  });

  $$(".social-btn").forEach(b => b.onclick = () => {
    const which = b.dataset.social;
    const data = which === "google"
      ? { n: "Rahul Sharma", e: "rahul.shanu14@gmail.com" }
      : { n: "ROST Member", e: "member@icloud.com" };
    signIn(data.n, data.e, which);
  });

  $("#signOutBtn").onclick = () => {
    user = null;
    $("#accountName").textContent = "Guest";
    $("#accountEmail").textContent = "Not signed in";
    $("#avatarInitial").textContent = "R";
    $("#accLocked").hidden = false;
    $("#accUnlocked").hidden = true;
    $("#signOutBtn").hidden = true;
    toast("Signed out");
  };

  /* account tabs */
  $$(".acc-tab").forEach(tab => tab.onclick = () => {
    $$(".acc-tab").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    $$(".acc-panel").forEach(p => p.classList.toggle("is-active", p.dataset.panel === tab.dataset.tab));
  });

  /* ============================================================
     NEWSLETTER
     ============================================================ */
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    toast("You're in. Welcome to the inner circle ✦");
    e.target.reset();
  });

  /* ============================================================
     PINCODE DELIVERY CHECK
     ============================================================ */
  const pinInput = $("#pincodeInput"), pinMsg = $("#pincodeMsg");
  pinInput.addEventListener("input", () => {
    pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 6);
  });
  $("#pincodeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    if (!/^[1-9]\d{5}$/.test(pin)) {
      pinMsg.className = "pincode-msg err";
      pinMsg.textContent = "Enter a valid 6-digit Indian pincode.";
      return;
    }
    const eta = 2 + (Number(pin) % 3);
    pinMsg.className = "pincode-msg ok";
    pinMsg.textContent = `✦ Delivers to ${pin} in ${eta}–${eta + 1} days · COD available`;
  });

  /* ============================================================
     THEME
     ============================================================ */
  $("#themeToggle").onclick = () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("rost-theme", next); } catch (_) {}
  };
  try { const saved = localStorage.getItem("rost-theme"); if (saved) document.documentElement.dataset.theme = saved; } catch (_) {}

  /* ============================================================
     MENU
     ============================================================ */
  const burger = $("#burger"), navLinks = $("#navLinks");
  function closeMenu() { burger.classList.remove("open"); navLinks.classList.remove("open"); }
  burger.onclick = () => { burger.classList.toggle("open"); navLinks.classList.toggle("open"); };

  /* ============================================================
     TOASTS
     ============================================================ */
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    $("#toasts").appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 400); }, 2800);
  }

  /* ============================================================
     BEAN PARTICLES
     ============================================================ */
  function spawnBeans(x, y, n, spread) {
    for (let i = 0; i < n; i++) {
      const b = document.createElement("div");
      b.className = "bean";
      b.style.left = x + "px"; b.style.top = y + "px";
      document.body.appendChild(b);
      const ang = Math.random() * Math.PI * 2;
      const dist = spread * (0.4 + Math.random() * 0.8);
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - spread * 0.5;
      const rot = (Math.random() * 720 - 360) + "deg";
      b.animate([
        { transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy + 120}px) rotate(${rot})`, opacity: 0 }
      ], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => b.remove();
    }
  }
  function burstBeans(btn) { const r = btn.getBoundingClientRect(); spawnBeans(r.left + r.width / 2, r.top + r.height / 2, 12, 90); }
  function centerBurst() { spawnBeans(innerWidth / 2, innerHeight / 2, 24, 160); }
  function beanRain() {
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "bean";
        b.style.left = Math.random() * innerWidth + "px"; b.style.top = "-20px";
        document.body.appendChild(b);
        b.animate([
          { transform: "translateY(0) rotate(0)", opacity: 1 },
          { transform: `translateY(${innerHeight + 40}px) rotate(${Math.random()*720}deg)`, opacity: 0.9 }
        ], { duration: 2200 + Math.random() * 1500, easing: "cubic-bezier(.45,0,.55,1)" }).onfinish = () => b.remove();
      }, i * 18);
    }
  }

  /* ---------- Logo easter egg: 7 clicks in 2s ---------- */
  let clicks = [], lastBrand = $(".brand");
  lastBrand.addEventListener("click", () => {
    const now = Date.now();
    clicks = clicks.filter(t => now - t < 2000); clicks.push(now);
    if (clicks.length >= 7) { clicks = []; beanRain(); toast("☕ You found the rain. Respect."); }
  });

  /* ============================================================
     SCROLL: progress, nav hide, parallax
     ============================================================ */
  const nav = $("#nav"), progress = $("#scrollProgress"), heroBg = $("#heroBg");
  let lastY = 0;
  function onScroll() {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (y / h) * 100 + "%";
    nav.classList.toggle("scrolled", y > 30);
    if (y > lastY && y > 400) nav.classList.add("hide"); else nav.classList.remove("hide");
    lastY = y;
    if (heroBg && y < innerHeight) {
      heroBg.style.transform = `translateY(${y * 0.18}px)`;
      const img = heroBg.querySelector("img");
      if (img) img.style.transform = `translateY(-50%) scale(${1 + y * 0.0003})`;
    }
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ============================================================
     REVEAL ON SCROLL
     ============================================================ */
  let io;
  function observeReveals() {
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            const els = en.target;
            els.classList.add("in");
            if (els.querySelector && els.querySelector("[data-count]")) {}
            io.unobserve(els);
          }
        });
      }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    }
    $$(".reveal:not(.in)").forEach((el, i) => { el.style.transitionDelay = Math.min(i % 6 * 60, 320) + "ms"; io.observe(el); });
  }

  /* ============================================================
     COUNTERS
     ============================================================ */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      counterIO.unobserve(el);
      if (el.dataset.text) { el.textContent = el.dataset.text; return; }
      const target = +el.dataset.count, suffix = el.dataset.suffix || "";
      const dur = 1400; let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach(el => counterIO.observe(el));

  /* ============================================================
     CUSTOM CURSOR + MAGNETIC
     ============================================================ */
  const dot = $("#cursorDot"), ring = $("#cursorRing");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });
  (function ringLoop() {
    rx += (mx - rx) * 0.42; ry += (my - ry) * 0.42;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(ringLoop);
  })();
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, .card, .chip, input, label, .switch")) ring.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button, .card, .chip, input, label, .switch")) ring.classList.remove("is-hover");
  });
  /* magnetic buttons */
  $$(".magnetic").forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => { el.style.transform = ""; });
  });

  /* ============================================================
     VOUCHER (first visit)
     ============================================================ */
  const voucherEl = $("#voucherModal"), voucherCard = $("#voucherCard");
  let voucherClaimed = false;
  // Reward assembled at runtime (not present as a literal in markup/source).
  const reward = () => [82, 79, 83, 84, 49, 48, 48].map(c => String.fromCharCode(c)).join("");
  function showVoucher() { voucherEl.classList.add("show"); voucherEl.setAttribute("aria-hidden", "false"); }
  function dismissVoucher() {
    voucherEl.classList.remove("show"); voucherEl.setAttribute("aria-hidden", "true");
    try { localStorage.setItem("rost-voucher", "seen"); } catch (_) {}
  }
  $("#voucherForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const label = $(".btn-label", e.target);
    if (label) label.classList.add("loading");
    setTimeout(() => {
      if (label) label.classList.remove("loading");
      $("#voucherCode").textContent = reward();
      voucherCard.classList.add("is-flipped");
      voucherClaimed = true;
      try { localStorage.setItem("rost-voucher", "claimed"); } catch (_) {}
    }, 900);
  });
  $("#voucherCopy").onclick = () => {
    const code = reward();
    if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
    $("#voucherCopy").textContent = "Copied ✓";
    toast(`Code ${code} copied`);
  };
  $("#voucherProceed").onclick = () => { dismissVoucher(); toast("ROST100 saved — 10% off at checkout ✦"); };
  $("#voucherClose").onclick = dismissVoucher;
  $("#voucherSkip").onclick = dismissVoucher;
  voucherEl.addEventListener("click", (e) => { if (e.target === voucherEl) dismissVoucher(); });

  /* ============================================================
     CASUAL-INSPECTION DETERRENTS
     NOTE: these only deter casual users. Client-side HTML/CSS/JS and
     images are always retrievable by a determined visitor. Real
     secrecy requires a server (see README).
     ============================================================ */
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("dragstart", (e) => { if (e.target.tagName === "IMG") e.preventDefault(); });
  document.addEventListener("keydown", (e) => {
    const k = (e.key || "").toLowerCase();
    const devCombo =
      e.key === "F12" ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === "i" || k === "j" || k === "c")) ||
      ((e.ctrlKey || e.metaKey) && k === "u") ||
      (e.metaKey && e.altKey && (k === "i" || k === "j" || k === "c" || k === "u"));
    if (devCombo) { e.preventDefault(); e.stopPropagation(); return false; }
  });
  try {
    const s = "color:#d98a52;font:600 16px Manrope,sans-serif";
    console.log("%cROST.coffee", s);
    console.log("%cNothing to see here. Brewed with care.", "color:#a39a90");
  } catch (_) {}

  /* ============================================================
     KEYBOARD
     ============================================================ */
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeAuth(); closeMenu(); dismissVoucher(); closeQuick(); } });

  /* ============================================================
     INIT
     ============================================================ */
  const startPage = (location.hash || "#home").slice(1);
  if (["home","products","founders","account"].includes(startPage)) go(startPage);
  loadCart();
  renderCart();
  observeReveals();
  onScroll();
  hideLoader();
  try { voucherClaimed = localStorage.getItem("rost-voucher") === "claimed"; } catch (_) {}
  let voucherSeen = true;
  try { voucherSeen = !!localStorage.getItem("rost-voucher"); } catch (_) { voucherSeen = false; }
  if (!voucherSeen) setTimeout(showVoucher, 1500);
})();
