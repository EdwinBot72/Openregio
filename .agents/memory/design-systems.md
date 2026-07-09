---
name: OpenRegio dual design systems
description: Two parallel CSS "skins" exist for public vs authenticated pages; how they were unified.
---

The app has two scoped CSS systems: `openregio.css` (`.openregio-page`, public pages — light bg #f4f6fb, Plus Jakarta Sans, colors #0b2240/#1f5fae/#f28a1a) and `openregio-mockup.css` (`.or-app`, authenticated shell in `OpenRegioShell.tsx` — originally a dark navy sidebar/topbar theme with Nunito Sans).

**Why:** the authenticated shell was prototyped separately from the public marketing pages and never re-aligned, so logged-in users saw a different color scheme/font than logged-out visitors.

**How to apply:** when touching `OpenRegioShell.tsx` or `openregio-mockup.css`, keep the `.or-app` CSS variables aligned with the public palette (light `--or-bg`, `--or-donkerblauw` as accent/text only, blue `#1f5fae`/orange `#f28a1a`) rather than reintroducing a dark sidebar. The `.or-topbar`/`.or-footer-home`/`.or-content-footer` classes in that file are currently unused (grep before assuming they render) — only `.or-sidebar`, `.or-content`, and the nav/stat/card classes are wired into the real shell.
