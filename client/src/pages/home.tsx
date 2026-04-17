import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "wouter";
import { Check } from "lucide-react";
import type { Blog } from "@shared/schema";

import groepImg         from "@assets/ChatGPT_Image_16_mrt_2026,_14_46_04_1773671702074.png";
import winkelstraatImg  from "@assets/5dab2418-3038-4262-b4a0-233a5081e835_1773671805585.png";
import groupWebp        from "@assets/optimized/group.webp";
import streetWebp       from "@assets/optimized/street.webp";
import regelgevingWebp  from "@assets/optimized/regelgeving-hero.webp";
import websiteScanWebp  from "@assets/optimized/website-scan-hero.webp";

const MOLLIE_BASIS = (import.meta.env.VITE_MOLLIE_BASIC_PAYMENT_LINK as string)
  || "https://payment-links.mollie.com/payment/FNnWr8uofpfEd6PJQMWHk";
const MOLLIE_PRO   = (import.meta.env.VITE_MOLLIE_PRO_PAYMENT_LINK as string)
  || "https://payment-links.mollie.com/payment/nEdtEni7GkJG7rHHetyBs";

const TICKER = [
  "Meer klanten via betere online vindbaarheid",
  "Subsidie verduurzaming MKB — tot €8.000",
  "Nieuwe APV-regels terrassen Haarlem per 1 april",
  "AI-tools die jou uren per week besparen",
  "Omgevingsvergunning Wormer gewijzigd",
  "Hygiëne-eisen horeca aangescherpt landelijk",
];

const SCAN_MSGS = [
  "Jouw zaak in kaart brengen…",
  "Online vindbaarheid analyseren…",
  "RegioBot analyseert je branche…",
  "Regelgeving controleren…",
  "Rapport samenstellen…",
];

type WizardStep = "input" | "scanning" | "rapport";

function computeScore(beroep: string, stad: string): number {
  const seed = beroep + stad;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return Math.min(94, Math.max(50, 62 + (Math.abs(h) % 32)));
}

const MAX = "1280px";
const centered = { maxWidth: MAX, margin: "0 auto" };

export default function HomePage() {
  usePageTitle("OpenRegio — Meer klanten. Slimmer werken. Beter geregeld.");

  const { data: blogs = [] } = useQuery<Blog[]>({
    queryKey: ["/api/blogs/public"],
  });

  const { data: tickerSignalen = [] } = useQuery<{ id: string; titel: string; regio: string }[]>({
    queryKey: ["/api/intel/signalen/public"],
    staleTime: 5 * 60 * 1000,
  });
  const tickerItems = tickerSignalen.length > 0
    ? tickerSignalen.map((s) => s.titel)
    : TICKER;

  const [showCookie, setShowCookie] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setShowCookie(true);
  }, []);
  const acceptCookie = (v: boolean) => {
    localStorage.setItem("cookie_consent", v ? "accepted" : "rejected");
    setShowCookie(false);
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [step, setStep]         = useState<WizardStep>("input");
  const [beroep, setBeroep]     = useState("");
  const [stad, setStad]         = useState("");
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx]     = useState(0);
  const [score, setScore]       = useState(0);
  const scanRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (scanRef.current) clearInterval(scanRef.current);
    if (msgRef.current)  clearInterval(msgRef.current);
  }, []);

  const startScan = async () => {
    if (!beroep.trim() || !stad.trim()) return;
    setStep("scanning");
    setProgress(0);
    setMsgIdx(0);

    let p = 0;
    let mi = 0;
    scanRef.current = setInterval(() => {
      p += 1.8;
      const capped = Math.min(p, 98);
      setProgress(Math.round(capped));
      const nm = Math.min(Math.floor(p / 20), SCAN_MSGS.length - 1);
      if (nm !== mi) { mi = nm; setMsgIdx(nm); }
      if (p >= 100) {
        if (scanRef.current) clearInterval(scanRef.current);
        setProgress(100);
        setScore(computeScore(beroep.trim(), stad.trim()));
        setTimeout(() => setStep("rapport"), 300);
      }
    }, 55);
  };

  const resetScan = () => {
    setStep("input"); setBeroep(""); setStad("");
    setProgress(0); setMsgIdx(0); setScore(0);
  };

  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const visibleBlogs = blogs.slice(0, 3);

  return (
    <div
      className="min-h-screen bg-white text-slate-900"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.3} }
        .fu  { animation: fadeUp .6s ease both; }
        .d1  { animation-delay: .1s; }
        .d2  { animation-delay: .2s; }
        .tick-track { animation: ticker 30s linear infinite; }
        .badge-dot  { animation: pulse 2s ease-in-out infinite; }
        .pc-hover   { transition: transform .18s, box-shadow .18s; }
        .pc-hover:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(0,0,0,.09); }
        .blog-img { transition: transform .3s ease; }
        .blog-card:hover .blog-img { transform: scale(1.04); }

        /* Responsive grids */
        .rg-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .rg-3 { display: grid; grid-template-columns: repeat(3,1fr); }
        .rg-4 { display: grid; grid-template-columns: repeat(4,1fr); }
        .rg-2-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }

        .rg-split-img { overflow: hidden; position: relative; min-height: 300px; }
        .rg-split-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; position: absolute; inset: 0; }

        /* Tablet: 3-kolom pijlers/blogs naar 2 kolommen */
        @media (max-width: 1024px) {
          .rg-3 { grid-template-columns: repeat(2,1fr) !important; }
        }

        /* Tablet en kleiner */
        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .nav-row { padding: 0 18px !important; }
          .nav-cta { padding: 8px 14px !important; font-size: 12px !important; }
          .nav-login { padding: 7px 10px !important; }
        }

        /* Mobiel */
        @media (max-width: 768px) {
          .rg-2, .rg-4 { grid-template-columns: 1fr !important; }
          .rg-3 { grid-template-columns: 1fr !important; }
          .rg-2-inner { grid-template-columns: 1fr 1fr; }
          .rg-split-img { min-height: 220px; }

          /* Hero */
          .home-hero-left { padding: 32px 18px 28px 18px !important; }
          .home-hero-title { font-size: 30px !important; letter-spacing: -.6px !important; }
          .home-hero-sub { font-size: 14px !important; }
          .home-hero-img-wrap { min-height: 260px; }
          .home-hero-floats { display: none !important; }

          /* Stats: 2 kolommen op mobiel i.p.v. 1 */
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid #f0f4ff; }
          .stats-grid > div:nth-child(odd) { border-right: 1px solid #f0f4ff !important; }
          .stats-grid > div:nth-last-child(-n+2) { border-bottom: none; }

          /* Section paddings */
          .sec-pad { padding: 40px 18px !important; }
          .sec-h-xl { font-size: 24px !important; letter-spacing: -.3px !important; }
          .sec-h-lg { font-size: 22px !important; letter-spacing: -.3px !important; }

          /* RegioBot split donker paneel */
          .regiobot-panel { padding: 36px 22px !important; }

          /* Basischeck card */
          .bc-card { padding: 24px 20px !important; border-radius: 20px !important; }
          .bc-card-title { font-size: 20px !important; }

          /* Aanbod split linker paneel */
          .aanbod-left { padding: 36px 20px !important; }

          /* Affiliate */
          .affiliate-row { padding: 36px 18px !important; gap: 24px !important; }

          /* Final CTA */
          .cta-final { padding: 56px 20px !important; }
          .cta-final-title { font-size: 26px !important; }
          .cta-final-sub { font-size: 14px !important; }

          /* Footer stack */
          .footer-row { flex-direction: column; align-items: flex-start !important; text-align: left; padding: 20px 18px !important; }

          /* Ticker iets compacter */
          .ticker-text { padding: 0 18px !important; font-size: 10px !important; }
        }

        @media (max-width: 480px) {
          .rg-2-inner { grid-template-columns: 1fr; }
          .home-hero-title { font-size: 26px !important; }
          .stats-grid { grid-template-columns: 1fr !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid #f0f4ff; }
          .stats-grid > div:last-child { border-bottom: none; }
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav
        style={{
          background: "#fff",
          borderBottom: "1px solid #f0f4ff",
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 0 #e8edf8",
        }}
        data-testid="nav-main"
      >
        <div className="nav-row" style={{ ...centered, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: "62px" }}>
          <Link href="/" style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-.4px", color: "#1f5fae", textDecoration: "none" }} data-testid="link-home-logo">
            Open<span style={{ color: "#0f172a" }}>Regio</span>
          </Link>
          <div className="nav-links" style={{ display: "flex", gap: "4px" }}>
            {[["pijlers","Wat we doen"],["bc-section","Basischeck"],["prijzen","Prijzen"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} data-testid={`link-nav-${id}`}
                style={{ padding: "7px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: "#64748b", cursor: "pointer", border: "none", background: "none" }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f0f4ff"; (e.currentTarget as HTMLButtonElement).style.color = "#1f5fae"; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; }}
              >{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login">
              <button className="nav-login" style={{ padding: "7px 16px", fontSize: "13px", fontWeight: 600, color: "#64748b", background: "none", border: "none", cursor: "pointer" }} data-testid="button-nav-login">
                Inloggen
              </button>
            </Link>
            <button onClick={() => scrollTo("bc-section")} data-testid="button-nav-basischeck" className="nav-cta"
              style={{ background: "#1f5fae", color: "#fff", border: "none", borderRadius: "24px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Gratis check starten
            </button>
          </div>
        </div>
      </nav>

      {/* ══ TICKER ══ */}
      <div style={{ overflow: "hidden", background: "#0b2240", padding: "10px 0" }} data-testid="ticker-bar">
        <div className="tick-track" style={{ display: "flex", width: "max-content" }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="ticker-text" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0 28px", fontSize: "11px", fontWeight: 500, color: "#7ea8d4", whiteSpace: "nowrap" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f28a1a", flexShrink: 0, display: "inline-block" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══ HERO ══ */}
      <div style={{ background: "#fff" }} data-testid="section-hero">
        <div className="rg-2" style={{ ...centered, minHeight: "500px" }}>
          <div className="fu home-hero-left" style={{ padding: "56px 40px 56px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "#eef2ff", color: "#1f5fae", fontSize: "11px", fontWeight: 700, padding: "5px 13px", borderRadius: "20px", marginBottom: "20px", width: "fit-content" }}>
              <span className="badge-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1f5fae", display: "inline-block" }} />
              Voor lokale ondernemers die willen groeien
            </div>
            <h1 className="home-hero-title" data-testid="text-hero-title" style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-1.2px", marginBottom: "16px" }}>
              Meer klanten.<br />Slimmer werken.<br /><em style={{ fontStyle: "normal", color: "#1f5fae" }}>Beter geregeld.</em>
            </h1>
            <p className="home-hero-sub" style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.75, marginBottom: "28px", maxWidth: "40ch" }}>
              OpenRegio helpt jou als lokale ondernemer groeien — met praktisch advies over vindbaarheid, AI-tools en grip op de regels.
            </p>
            <div className="fu d1" style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button onClick={() => scrollTo("bc-section")} data-testid="button-hero-cta"
                style={{ background: "#1f5fae", color: "#fff", border: "none", borderRadius: "24px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Start de gratis check →
              </button>
              <button onClick={() => scrollTo("pijlers")} data-testid="button-hero-hoe"
                style={{ background: "#f0f4ff", color: "#1f5fae", border: "none", borderRadius: "24px", padding: "12px 22px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
                Hoe werkt het?
              </button>
            </div>
            <div className="fu d2" style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
              <Check style={{ width: "14px", height: "14px", color: "#10b981" }} />
              Geen jurist. Geen consultant. Gewoon eerlijk en praktisch.
            </div>
          </div>
          <div className="fu d2 home-hero-img-wrap" style={{ position: "relative", overflow: "hidden" }}>
            <img src={groupWebp} alt="Lokale ondernemers" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} data-testid="img-hero" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,.12), transparent 40%)" }} />
            <div className="home-hero-floats" style={{ position: "absolute", bottom: "24px", left: "24px", background: "#fff", borderRadius: "18px", padding: "13px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 8px 32px rgba(0,0,0,.14)" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1f5fae" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>RegioBot staat klaar</div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>Jouw slimme buurman 24/7</div>
              </div>
            </div>
            <div className="home-hero-floats" style={{ position: "absolute", top: "24px", right: "24px", background: "#0b2240", borderRadius: "18px", padding: "12px 16px", boxShadow: "0 8px 28px rgba(0,0,0,.2)" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#f28a1a", letterSpacing: "-.5px" }}>20</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,.55)", marginTop: "1px" }}>ondernemers actief</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STATS ══ */}
      <div style={{ borderTop: "1px solid #f0f4ff", borderBottom: "1px solid #f0f4ff", background: "#fafbff" }} data-testid="section-stats">
        <div className="rg-4 stats-grid" style={{ ...centered }}>
          {[
            { n: "20", l: "Ondernemers actief" },
            { n: "€19/mnd", l: "Startprijs — geen jaarcontract" },
            { n: "20%", l: "Affiliate op elke doorverwijzing" },
            { n: "Dagelijks", l: "Nieuwe signalen & inzichten" },
          ].map(({ n, l }, i) => (
            <div key={i} style={{ padding: "18px 24px", textAlign: "center", borderRight: i < 3 ? "1px solid #f0f4ff" : "none" }}>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "#1f5fae", letterSpacing: "-.5px" }}>{n}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ DRIE PIJLERS ══ */}
      <div id="pijlers" style={{ background: "#fff" }} data-testid="section-pijlers">
        <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "8px" }}>Drie pijlers</div>
          <div className="sec-h-xl" style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", letterSpacing: "-.5px", marginBottom: "8px" }}>Alles wat jij als lokale ondernemer nodig hebt.</div>
          <div style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, maxWidth: "46ch", marginBottom: "32px" }}>Niet één ding. Het complete plaatje — in gewone taal, zonder overbodige complexiteit.</div>
          <div className="rg-3" style={{ gap: "16px" }}>
            {[
              { num: "01", img: groupWebp, pos: "top center", title: "Meer klanten & beter vindbaar", desc: "Google-profiel, website, lokale SEO. We checken wat er beter kan en geven je concrete stappen." },
              { num: "02", img: websiteScanWebp, pos: "center", title: "Slimmer werken met AI & tools", desc: "Welke AI-tools besparen jou tijd? Kleine SaaS-oplossingen die echt werken voor een lokaal bedrijf." },
              { num: "03", img: regelgevingWebp, pos: "center", title: "Grip op regels — zonder jurist", desc: "Regelgeving in gewone taal. Gemeentebrieven uitgelegd. RegioBot legt het uit als een buurman." },
            ].map(({ num, img, pos, title, desc }) => (
              <div key={num} className="pc-hover" style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #f0f4ff" }} data-testid={`pijler-card-${num}`}>
                <img src={img} alt={title} style={{ width: "100%", height: "160px", objectFit: "cover", objectPosition: pos, display: "block" }} />
                <div style={{ padding: "18px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#cbd5e1", marginBottom: "8px" }}>{num}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "6px", lineHeight: 1.35 }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6 }}>{desc}</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 700, color: "#1f5fae", marginTop: "10px" }}>Meer info →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ACTUEEL & INZICHTEN (blogs) ══ */}
      {visibleBlogs.length > 0 && (
        <div style={{ background: "#f8faff" }} data-testid="section-blogs">
          <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "8px" }}>Actueel & Inzichten</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
              <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", letterSpacing: "-.4px" }}>Laatste nieuws voor lokale ondernemers</div>
              <Link href="/blogs" style={{ fontSize: "13px", fontWeight: 700, color: "#1f5fae", textDecoration: "none" }} data-testid="link-all-blogs">
                Alle artikelen →
              </Link>
            </div>
            <div className="rg-3" style={{ gap: "16px" }}>
              {visibleBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }} data-testid={`card-blog-${blog.id}`}>
                  <div className="blog-card pc-hover" style={{ borderRadius: "20px", overflow: "hidden", border: "1px solid #e8edf8", background: "#fff", height: "100%" }}>
                    <div style={{ height: "180px", overflow: "hidden", background: "#f0f4ff", position: "relative" }}>
                      {blog.featuredImage ? (
                        <img
                          className="blog-img"
                          src={blog.featuredImage}
                          alt={blog.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          data-testid={`img-blog-${blog.id}`}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #eef2ff 0%, #e0e8ff 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1f5fae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "18px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "8px" }}>
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {blog.title}
                      </div>
                      {blog.excerpt && (
                        <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>
                          {blog.excerpt}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#1f5fae" }}>Lees meer →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ REGIOBOT SPLIT ══ */}
      <div style={{ background: "#fff" }} data-testid="section-regiobot">
        <div className="rg-2" style={{ ...centered, minHeight: "460px" }}>
          <div className="rg-split-img">
            <img src={streetWebp} alt="RegioBot AI" />
          </div>
          <div className="regiobot-panel" style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center", background: "#0b2240" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "12px" }}>Maak kennis met RegioBot</div>
            <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-.4px", marginBottom: "16px" }}>Jouw slimme buurman die alles weet over ondernemen in jouw regio.</div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,.55)", lineHeight: 1.75, marginBottom: "24px" }}>RegioBot is de AI-assistent van OpenRegio. Hij kent jouw gemeente, jouw branche en de regels die voor jou gelden. Stel elke vraag — hij antwoordt in gewone taal.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {[
                "Upload een gemeentebrief — RegioBot legt uit wat je moet doen",
                "Vraag welke regels er gelden voor jouw branche en gemeente",
                "Ontdek subsidies en kansen die voor jou beschikbaar zijn",
                "Geen juridisch jargon — gewoon duidelijke antwoorden",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,.75)", lineHeight: 1.55 }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "rgba(242,138,26,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#f28a1a", flexShrink: 0, marginTop: "1px" }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "16px" }}>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: "12px 12px 12px 4px", padding: "10px 13px", fontSize: "11px", color: "rgba(255,255,255,.8)", lineHeight: 1.6, marginBottom: "8px", maxWidth: "85%" }}>
                Hoi! Ik ben RegioBot. Stel me een vraag over regelgeving, subsidies of jouw bedrijf. Ik ken jouw regio.
              </div>
              <div style={{ background: "#1f5fae", borderRadius: "12px 12px 4px 12px", padding: "10px 13px", fontSize: "11px", color: "#fff", lineHeight: 1.6, marginBottom: "8px", marginLeft: "auto", maxWidth: "85%" }}>
                Welke terrasregels gelden er voor mijn café in Haarlem?
              </div>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: "12px 12px 12px 4px", padding: "10px 13px", fontSize: "11px", color: "rgba(255,255,255,.8)", lineHeight: 1.6, marginBottom: "8px", maxWidth: "85%" }}>
                In Haarlem is de APV voor terrassen per 1 april gewijzigd. Jouw terras mag tot 23:00 open blijven i.p.v. 22:00. Wil je de aanvraagstappen zien?
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <Link href="/vandaag" style={{ flex: 1, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "10px", padding: "9px 12px", fontSize: "11px", color: "rgba(255,255,255,.4)", textDecoration: "none", display: "flex", alignItems: "center" }}>
                  Stel RegioBot een vraag…
                </Link>
                <Link href="/vandaag">
                  <button style={{ background: "#1f5fae", border: "none", borderRadius: "10px", padding: "9px 14px", color: "#fff", fontSize: "11px", fontWeight: 600, cursor: "pointer" }} data-testid="button-regiobot-stuur">
                    Stuur ↗
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BASISCHECK ══ */}
      <div id="bc-section" style={{ background: "#f0f4ff" }} data-testid="section-basischeck">
        <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px", display: "inline-block" }}>Gratis bedrijfscheck</div>
            <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", letterSpacing: "-.5px", marginTop: "6px" }} data-testid="text-basischeck-title">Hoe gezond is jouw bedrijf online?</div>
            <div style={{ fontSize: "13px", color: "#64748b", lineHeight: 1.7, display: "block", marginTop: "4px" }}>Vul in — in 30 seconden zie je wat je mist.</div>
          </div>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div className="bc-card" style={{ background: "#0b2240", borderRadius: "24px", padding: "36px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(242,138,26,.2)", color: "#f28a1a", fontSize: "10px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", marginBottom: "16px" }}>
                ✦ Altijd gratis · Geen account nodig
              </div>

              {step === "input" && (
                <>
                  <div className="bc-card-title" style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-.3px" }} data-testid="text-basischeck-card-title">Check nu wat jij mist.</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,.45)", marginBottom: "24px" }}>Vul je beroep en stad in. Binnen 30 seconden een concreet rapport.</div>
                  <input
                    placeholder="Wat doe je? (bijv. café, kapper, loodgieter)"
                    value={beroep}
                    onChange={e => setBeroep(e.target.value)}
                    data-testid="input-beroep"
                    style={{ width: "100%", background: "#152b4e", border: "1px solid rgba(255,255,255,.1)", borderRadius: "12px", padding: "13px 16px", fontSize: "13px", color: "#fff", marginBottom: "10px", fontFamily: "inherit", outline: "none" }}
                  />
                  <input
                    placeholder="In welke stad of gemeente?"
                    value={stad}
                    onChange={e => setStad(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && startScan()}
                    data-testid="input-stad"
                    style={{ width: "100%", background: "#152b4e", border: "1px solid rgba(255,255,255,.1)", borderRadius: "12px", padding: "13px 16px", fontSize: "13px", color: "#fff", marginBottom: "10px", fontFamily: "inherit", outline: "none" }}
                  />
                  <button
                    onClick={startScan}
                    disabled={!beroep.trim() || !stad.trim()}
                    data-testid="button-start-scan"
                    style={{ width: "100%", background: "#f28a1a", color: "#1b1307", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", opacity: (!beroep.trim() || !stad.trim()) ? 0.3 : 1 }}
                  >
                    Start de gratis check →
                  </button>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,.25)", textAlign: "center", marginTop: "10px" }}>Geen account · Geen creditcard · Geen verplichtingen</p>
                </>
              )}

              {step === "scanning" && (
                <div style={{ textAlign: "center", padding: "12px 0" }} data-testid="section-scanning">
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,.75)", marginBottom: "14px" }} data-testid="text-scan-msg">{SCAN_MSGS[msgIdx]}</p>
                  <div style={{ background: "rgba(255,255,255,.08)", borderRadius: "4px", height: "4px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ height: "4px", background: "#1f5fae", borderRadius: "4px", width: `${progress}%`, transition: "width .08s linear" }} data-testid="progress-bar" />
                  </div>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)" }}>{progress}%</p>
                </div>
              )}

              {step === "rapport" && (
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", paddingTop: "8px" }}>
                  Analyse klaar voor <strong style={{ color: "#fff" }}>{beroep} · {stad}</strong>
                </div>
              )}
            </div>

            {step === "rapport" && (
              <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", marginTop: "16px" }} data-testid="section-rapport">
                <div style={{ background: "#0b2240", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }} data-testid="text-rapport-heading">Bedrijfscheck — {beroep} in {stad}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,.35)", marginTop: "2px" }}>{today}</div>
                  </div>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", border: "3px solid #1f5fae", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(31,95,174,.2)" }}>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", lineHeight: 1 }} data-testid="text-rapport-score">{score}</div>
                    <div style={{ fontSize: "8px", color: "rgba(255,255,255,.4)" }}>/100</div>
                  </div>
                </div>
                <div style={{ padding: "16px 20px" }}>
                  {[
                    { bg: "#f0fdf4", dot: "#059669", text: `Lokale netwerken en kansen aanwezig in ${stad}` },
                    { bg: "#fffbeb", dot: "#d97706", text: `Online aanwezigheid van ${beroep} kan sterker` },
                    { bg: "#fef2f2", dot: "#dc2626", text: `Regelgeving-signalen voor ${beroep} gemist afgelopen kwartaal` },
                  ].map(({ bg, dot, text }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", padding: "10px 12px", borderRadius: "12px", marginBottom: "7px", fontSize: "12px", color: "#334155", lineHeight: 1.55, background: bg }} data-testid={`bevinding-${i}`}>
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: dot, flexShrink: 0, marginTop: "3px", display: "inline-block" }} />
                      {text}
                    </div>
                  ))}
                  {[
                    `Welke 3 AI-tools besparen een ${beroep} in ${stad} de meeste tijd?`,
                    `Subsidies en groeikansen voor ${beroep} in ${stad} — bedragen en deadlines`,
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "12px", background: "#f8fafc", border: "1px dashed #e2e8f0", marginBottom: "6px" }} data-testid={`locked-item-${i}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      <span style={{ fontSize: "11px", color: "#cbd5e1", filter: "blur(3px)", flex: 1, userSelect: "none" }}>{t}</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, background: "#eef2ff", color: "#1f5fae", padding: "2px 8px", borderRadius: "10px", flexShrink: 0 }}>Pro</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                  <a href={MOLLIE_BASIS} target="_blank" rel="noopener noreferrer">
                    <button style={{ width: "100%", background: "#f28a1a", color: "#1b1307", border: "none", borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }} data-testid="button-rapport-upgrade">
                      Ontgrendel volledig rapport — vanaf €19/mnd
                    </button>
                  </a>
                  <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "10px", cursor: "pointer" }} onClick={resetScan} data-testid="button-rapport-opnieuw">
                    ↩ Doe de check opnieuw
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ AANBOD SPLIT ══ */}
      <div style={{ background: "#fff" }} data-testid="section-aanbod">
        <div className="rg-2" style={{ ...centered, minHeight: "400px" }}>
          <div className="aanbod-left" style={{ padding: "56px 40px", background: "#fafbff", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px" }}>Wat je krijgt</div>
            <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", letterSpacing: "-.5px", marginTop: "6px", marginBottom: "0", lineHeight: 1.2 }}>Geen beloftes.<br />Concrete tools.</div>
            <div className="rg-2-inner">
              {[
                { bg: "#eef2ff", title: "Website-scan", desc: "Hoe vindbaar ben jij op Google? We checken het voor je.", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f5fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
                { bg: "#fef3e9", title: "Brief analyse", desc: "Upload een gemeentebrief. RegioBot legt het uit.", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f28a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
                { bg: "#eef2ff", title: "RegioBot AI", desc: "Stel elke vraag over regelgeving of jouw regio.", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1f5fae" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
                { bg: "#f0fdf4", title: "Kansen & subsidies", desc: "Lokale subsidies en aanbestedingen op één plek.", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
              ].map(({ bg, icon, title, desc }) => (
                <div key={title} style={{ background: "#fff", border: "1px solid #e8edf8", borderRadius: "16px", padding: "16px" }} data-testid={`aanbod-card-${title.toLowerCase().replace(/\s/g,"-")}`}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "10px", background: bg }}>{icon}</div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{title}</div>
                  <div style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.55 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ overflow: "hidden", position: "relative" }}>
            <img src={winkelstraatImg} alt="Ondernemer aan het werk" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", position: "absolute", inset: 0 }} data-testid="img-aanbod" />
          </div>
        </div>
      </div>

      {/* ══ AFFILIATE ══ */}
      <div style={{ background: "#0b2240" }} data-testid="section-affiliate">
        <div className="rg-2 affiliate-row" style={{ ...centered, padding: "48px 28px", gap: "40px", alignItems: "center" }}>
          <div>
            <h2 className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#fff", letterSpacing: "-.4px", marginBottom: "8px", lineHeight: 1.2 }}>Ken je andere ondernemers?<br />Verdien mee.</h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>Voor elke ondernemer die jij aanmeldt ontvang je 20% van hun maandelijks abonnement — elke maand opnieuw, zo lang zij lid blijven.</p>
          </div>
          <div className="rg-3" style={{ gap: "10px" }}>
            {[
              { n: "€3,80", l: "per Basis-klant\n/maand" },
              { n: "€11,80", l: "per Pro-klant\n/maand" },
              { n: "5 klanten", l: "= abonnement\nterug" },
            ].map(({ n, l }) => (
              <div key={n} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{n}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,.4)", marginTop: "4px", lineHeight: 1.4, whiteSpace: "pre-line" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ PRIJZEN ══ */}
      <div id="prijzen" style={{ background: "#fff" }} data-testid="section-prijzen">
        <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px", display: "inline-block" }}>Transparante prijzen</div>
            <div className="sec-h-xl" style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", letterSpacing: "-.5px", marginTop: "6px" }} data-testid="text-prijzen-title">Kies jouw plan</div>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "4px" }}>Maandelijks opzegbaar · Geen verborgen kosten · De Basischeck is altijd gratis</div>
          </div>
          <div className="rg-2" style={{ gap: "16px", maxWidth: "640px", margin: "28px auto 0" }}>
            <div style={{ background: "#fff", border: "1px solid #e8edf8", borderRadius: "24px", padding: "28px" }} data-testid="card-plan-basis">
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>Basis-lid</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "16px" }}>Alle essentials voor gezond ondernemen</div>
              <div style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", marginBottom: "4px" }}>
                €19<sub style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8", letterSpacing: 0 }}> excl. btw/mnd</sub>
              </div>
              <a href={MOLLIE_BASIS} target="_blank" rel="noopener noreferrer">
                <button style={{ width: "100%", padding: "12px", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none", margin: "16px 0", fontFamily: "inherit", background: "#f0f4ff", color: "#1f5fae" }} data-testid="button-kies-basis">
                  Kies Basis-lid
                </button>
              </a>
              {["Vindbaarheidscheck & tips","Regelgeving in gewone taal","Brief-analyse via RegioBot","20% affiliate commissie"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#475569", marginBottom: "7px", lineHeight: 1.5 }}>
                  <span style={{ color: "#1f5fae", fontSize: "13px", flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#475569", marginBottom: "7px", lineHeight: 1.5, opacity: 0.3, textDecoration: "line-through" }}>
                <span style={{ flexShrink: 0 }}>✕</span>Volledige WOO-bibliotheek
              </div>
            </div>
            <div style={{ background: "#fff", border: "2px solid #1f5fae", borderRadius: "24px", padding: "28px", boxShadow: "0 10px 40px rgba(31,95,174,.16)", position: "relative" }} data-testid="card-plan-pro">
              <div style={{ position: "absolute", top: "-13px", left: "20px", background: "#1f5fae", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 12px", borderRadius: "10px" }}>Meest gekozen</div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "2px" }}>Pro-bijdrager</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "16px" }}>Alles voor serieuze groei</div>
              <div style={{ fontSize: "36px", fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", marginBottom: "4px" }}>
                €59<sub style={{ fontSize: "12px", fontWeight: 400, color: "#94a3b8", letterSpacing: 0 }}> excl. btw/mnd</sub>
              </div>
              <a href={MOLLIE_PRO} target="_blank" rel="noopener noreferrer">
                <button style={{ width: "100%", padding: "12px", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none", margin: "16px 0", fontFamily: "inherit", background: "#1f5fae", color: "#fff" }} data-testid="button-kies-pro">
                  Kies Pro-bijdrager
                </button>
              </a>
              {["Alles van Basis-lid","Onbeperkte RegioBot AI","Volledige WOO-bibliotheek","20% affiliate = €11,80/klant/mnd","Prioriteit ondersteuning"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: "#475569", marginBottom: "7px", lineHeight: 1.5 }}>
                  <span style={{ color: "#1f5fae", fontSize: "13px", flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ FAQ ══ */}
      <div style={{ background: "#f0f4ff" }} data-testid="section-faq">
        <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <div style={{ maxWidth: "620px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#f28a1a", textTransform: "uppercase", letterSpacing: ".6px", display: "inline-block" }}>Vragen</div>
              <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#0f172a", marginTop: "6px", letterSpacing: "-.5px" }}>Veelgestelde vragen</div>
            </div>
            {[
              { q: "Is de Basischeck echt gratis?", a: "Ja — altijd gratis, geen account, geen creditcard. Een lidmaatschap begint bij €19/maand voor doorlopende inzichten." },
              { q: "Wat doet RegioBot precies?", a: "RegioBot is jouw AI-assistent die alles weet over ondernemen in jouw regio. Upload een gemeentebrief, stel een vraag over regelgeving of ontdek subsidies — hij geeft altijd een antwoord in gewone taal." },
              { q: "Geven jullie juridisch advies?", a: "Nee. We leggen uit wat regelgeving betekent voor jouw situatie, in gewone taal. Als je een jurist nodig hebt, verwijzen we je door naar de juiste partij." },
              { q: "Hoe werkt het affiliate-programma?", a: "Voor elke ondernemer die jij aanmeldt via jouw link ontvang je 20% recurring commissie. 5 Basis-klanten = jouw abonnement volledig terug." },
              { q: "Kan ik opzeggen wanneer ik wil?", a: "Ja. Maandelijks opzegbaar, geen binding, geen opzeggingskosten." },
            ].map((item, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", marginBottom: "8px", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }} data-testid={`faq-item-${i}`}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", fontSize: "13px", fontWeight: 700, color: "#0f172a", cursor: "pointer" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  {item.q}
                  <span style={{ fontSize: "18px", color: "#94a3b8", transition: "transform .2s", transform: openFaq === i ? "rotate(45deg)" : "none", display: "inline-block" }}>+</span>
                </div>
                {openFaq === i && (
                  <div style={{ fontSize: "12px", color: "#64748b", padding: "0 20px 16px", lineHeight: 1.75, borderTop: "1px solid #f8fafc" }} data-testid={`faq-answer-${i}`}>
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FINAL CTA ══ */}
      <div className="cta-final" style={{ position: "relative", overflow: "hidden", padding: "72px 28px", textAlign: "center" }} data-testid="section-cta">
        <img src={groepImg} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} alt="" />
        <div style={{ position: "absolute", inset: 0, background: "rgba(11,34,64,.85)" }} />
        <div style={{ position: "relative", ...centered }}>
          <div className="cta-final-title" style={{ fontSize: "34px", fontWeight: 800, color: "#fff", letterSpacing: "-.5px", marginBottom: "12px", lineHeight: 1.2 }}>Klaar om te groeien?</div>
          <div className="cta-final-sub" style={{ fontSize: "15px", color: "rgba(255,255,255,.55)", marginBottom: "32px", maxWidth: "40ch", marginLeft: "auto", marginRight: "auto" }}>
            Start vandaag gratis. Geen verplichtingen — gewoon praktische hulp voor jouw bedrijf.
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("bc-section")} style={{ background: "#1f5fae", color: "#fff", border: "none", borderRadius: "24px", padding: "14px 28px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }} data-testid="button-cta-basischeck">
              Start de gratis check →
            </button>
            <Link href="/register">
              <button style={{ padding: "13px 26px", fontSize: "15px", fontWeight: 700, border: "1px solid rgba(255,255,255,.25)", color: "rgba(255,255,255,.8)", background: "transparent", borderRadius: "24px", cursor: "pointer" }} data-testid="button-cta-register">
                Direct aanmelden
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: "1px solid #f0f4ff" }} data-testid="footer-main">
        <div className="footer-row" style={{ ...centered, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-.3px", color: "#1f5fae" }}>Open<span style={{ color: "#0f172a" }}>Regio</span></span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>Meer klanten. Slimmer werken. Beter geregeld.</span>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[["pijlers","Wat we doen"],["bc-section","Basischeck"],["prijzen","Prijzen"]].map(([id,label]) => (
              <span key={id} onClick={() => scrollTo(id)} style={{ fontSize: "12px", color: "#94a3b8", cursor: "pointer" }}
                onMouseOver={e => { (e.currentTarget as HTMLSpanElement).style.color = "#1f5fae"; }}
                onMouseOut={e => { (e.currentTarget as HTMLSpanElement).style.color = "#94a3b8"; }}
              >{label}</span>
            ))}
            <Link href="/privacy" style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "none" }}>Privacy</Link>
            <Link href="/voorwaarden" style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "none" }}>Voorwaarden</Link>
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1" }}>© {new Date().getFullYear()} OpenRegio</div>
        </div>
      </footer>

      {/* ══ COOKIE BANNER ══ */}
      {showCookie && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -4px 24px rgba(0,0,0,.08)" }} data-testid="banner-cookie">
          <div style={{ maxWidth: MAX, margin: "0 auto", padding: "14px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "520px" }}>
              Wij gebruiken cookies om je ervaring te verbeteren. Lees ons{" "}
              <Link href="/cookiebeleid" style={{ textDecoration: "underline", color: "#0f172a" }}>cookiebeleid</Link>.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => acceptCookie(false)} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: "#64748b", background: "none", border: "1px solid #e2e8f0", cursor: "pointer" }} data-testid="button-cookie-weigeren">Weigeren</button>
              <button onClick={() => acceptCookie(true)} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#fff", background: "#1f5fae", border: "none", cursor: "pointer" }} data-testid="button-cookie-accepteren">Accepteren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
