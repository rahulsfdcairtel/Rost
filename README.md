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
