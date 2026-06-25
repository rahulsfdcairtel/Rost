# ROST.coffee

Ultra-luxury, futuristic single-page site for **ROST.coffee** — artisanal cold brew, slow-steeped at altitude, born on Hatu Peak (Himachal Pradesh, 11,152 ft). Pricing in INR (₹).

## Stack

Zero build step. Pure HTML, CSS and vanilla JavaScript — open `index.html` in any browser.

```
.
├─ index.html   # markup for every module
├─ styles.css   # design system, dark/light themes, responsive
├─ app.js       # routing, cart, auth, animations
└─ assets/      # original generated imagery
```

## Modules

- **Home** — cinematic parallax hero, marquee, "The ROST Method" with animated counters, 3-step process, featured grid, newsletter
- **Collection** — full catalog with category filters
- **Founders** — origin story, founder cards, principles, vertical timeline
- **Account** — Profile / Orders / Subscription / Settings, sign-in gated
- **Cart** — slide-in drawer with free-shipping progress bar
- **Auth** — Email + Phone-OTP (demo) + Google/Apple

## Interactions

Custom magnetic cursor, brewing loader, film-grain + aurora glow, scroll progress, glass nav, scroll-reveal, add-to-cart bean confetti, dark/light toggle (persisted), and a logo easter egg (click the logo 7× in 2s).

## Notes

Auth, cart and orders are simulated client-side (demo). See `ROST-coffee-HANDOFF_2.md` for the production roadmap (Next.js + Supabase + Razorpay + Resend + MSG91).

### On hiding source / the voucher code

The voucher code is no longer a literal in the markup — it's assembled at runtime only after the form is submitted, and casual deterrents are in place (right-click, DevTools shortcuts and view-source are blocked; images aren't draggable). **However, any client-side site's HTML, CSS, JS and images are downloaded to the visitor's browser and can always be retrieved by a determined user** (e.g. via the Network tab or by disabling JS). True secrecy is only possible server-side: issue voucher codes from a backend after capturing the lead, and serve images through a CDN with hotlink/referrer rules. That's part of the planned Supabase/Next.js backend.
