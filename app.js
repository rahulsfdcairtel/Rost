/* ============================================================
   ROST.coffee — interaction layer
   ============================================================ */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const inr = (n) => "₹" + n.toLocaleString("en-IN");

  /* ---------- DATA ---------- */
  const PRODUCTS = [
    { id: "p1", name: "Signature Black", origin: "Chikmagalur, IN", cat: "signature", price: 449, was: 549, badge: "Bestseller", img: "assets/hero-bottle.png", desc: "The original. 16-hour steep, chocolate & cane sugar finish." },
    { id: "p2", name: "Original", origin: "Coorg Estates, IN", cat: "signature", price: 399, was: 0, badge: "", img: "assets/product-original.png", desc: "Clean, balanced, endlessly drinkable. Our everyday hero." },
    { id: "p3", name: "Madagascar Vanilla", origin: "Single Origin", cat: "flavoured", price: 469, was: 0, badge: "New", img: "assets/product-vanilla.png", desc: "Real bourbon vanilla folded into a slow cold steep." },
    { id: "p4", name: "Dark Mocha", origin: "Araku Valley, IN", cat: "flavoured", price: 469, was: 0, badge: "", img: "assets/product-mocha.png", desc: "Single-origin cacao meets deep-roast cold brew." },
    { id: "p5", name: "Founders' Case ×6", origin: "Mixed Selection", cat: "bundle", price: 2499, was: 2814, badge: "Save 11%", img: "assets/product-original.png", desc: "Six bottles, our four expressions. The full ROST flight." },
    { id: "p6", name: "The Discovery Trio", origin: "3 × 250ml", cat: "bundle", price: 1199, was: 1317, badge: "Gift", img: "assets/product-mocha.png", desc: "One of each flavour. The perfect introduction." },
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
  function productCard(p) {
    const was = p.was ? `<small>${inr(p.was)}</small>` : "";
    const badge = p.badge ? `<span class="card-badge">${p.badge}</span>` : "";
    return `
    <article class="card reveal" data-cat="${p.cat}">
      <div class="card-media">
        ${badge}
        <button class="card-fav" data-fav aria-label="Save">♡</button>
        <img src="${p.img}" alt="${p.name}" loading="lazy" />
      </div>
      <div class="card-body">
        <span class="card-origin">${p.origin}</span>
        <h3 class="card-name">${p.name}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-foot">
          <span class="card-price">${inr(p.price)} ${was}</span>
          <button class="add-btn magnetic" data-add="${p.id}">Add <span>+</span></button>
        </div>
      </div>
    </article>`;
  }

  $("#homeGrid").innerHTML = PRODUCTS.slice(0, 4).map(productCard).join("");
  $("#catalogGrid").innerHTML = PRODUCTS.map(productCard).join("");

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
  const startPage = (location.hash || "#home").slice(1);
  if (["home","products","founders","account"].includes(startPage)) go(startPage);

  /* ============================================================
     CART
     ============================================================ */
  const cartEl = $("#cart"), overlay = $("#overlay");
  const FREE_SHIP = 2999;

  function openCart() { cartEl.classList.add("open"); overlay.classList.add("show"); cartEl.setAttribute("aria-hidden","false"); }
  function closeCart() { cartEl.classList.remove("open"); overlay.classList.remove("show"); cartEl.setAttribute("aria-hidden","true"); }

  function addToCart(id, btn) {
    const p = PRODUCTS.find(x => x.id === id); if (!p) return;
    const line = cart.find(i => i.id === id);
    if (line) line.qty++; else cart.push({ ...p, qty: 1 });
    renderCart();
    if (btn) burstBeans(btn);
    bounceCount();
    toast(`${p.name} added to bag`);
  }
  function changeQty(id, d) {
    const line = cart.find(i => i.id === id); if (!line) return;
    line.qty += d;
    if (line.qty <= 0) cart = cart.filter(i => i.id !== id);
    renderCart();
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
        <img src="${i.img}" alt="${i.name}" />
        <div>
          <div class="ci-name">${i.name}</div>
          <div class="ci-price">${inr(i.price)}</div>
          <div class="qty">
            <button data-dec="${i.id}">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.id}">+</button>
          </div>
          <button class="ci-remove" data-rm="${i.id}">Remove</button>
        </div>
        <strong>${inr(i.price * i.qty)}</strong>
      </div>`).join("");
  }
  function bounceCount() { const c = $("#cartCount"); c.classList.remove("bounce"); void c.offsetWidth; c.classList.add("bounce"); }

  document.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) { addToCart(add.dataset.add, add); return; }
    const inc = e.target.closest("[data-inc]"); if (inc) return changeQty(inc.dataset.inc, 1);
    const dec = e.target.closest("[data-dec]"); if (dec) return changeQty(dec.dataset.dec, -1);
    const rm = e.target.closest("[data-rm]"); if (rm) { cart = cart.filter(i => i.id !== rm.dataset.rm); renderCart(); return; }
    const fav = e.target.closest("[data-fav]"); if (fav) { fav.textContent = fav.textContent === "♡" ? "♥" : "♡"; fav.style.color = fav.textContent === "♥" ? "var(--copper)" : ""; }
  });
  $("#cartBtn").onclick = openCart;
  $("#cartClose").onclick = closeCart;
  overlay.onclick = () => { closeCart(); };
  $("#checkoutBtn").onclick = () => {
    if (!cart.length) return;
    if (!user) { closeCart(); openAuth(); toast("Sign in to complete checkout"); return; }
    toast("Order placed — confirmation on its way ✦");
    cart = []; renderCart(); closeCart();
  };

  /* ============================================================
     FILTERS
     ============================================================ */
  $("#filterBar").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip"); if (!chip) return;
    $$(".chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    const f = chip.dataset.filter;
    $$("#catalogGrid .card").forEach(card => {
      card.style.display = (f === "all" || card.dataset.cat === f) ? "" : "none";
    });
  });

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
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
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
     KEYBOARD
     ============================================================ */
  addEventListener("keydown", (e) => { if (e.key === "Escape") { closeCart(); closeAuth(); closeMenu(); } });

  /* ============================================================
     INIT
     ============================================================ */
  renderCart();
  observeReveals();
  onScroll();
  addEventListener("load", () => {
    setTimeout(() => $("#loader").classList.add("is-done"), 600);
  });
  // Fallback if load already fired
  setTimeout(() => $("#loader").classList.add("is-done"), 2200);
})();
