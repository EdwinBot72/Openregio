import { useState, useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import {
  Check,
  Banknote,
  ShieldCheck,
  Handshake,
  TrendingUp,
  Heart,
  GraduationCap,
  Lightbulb,
  Trophy,
  Sparkles,
  MapPin,
  Bell,
  ChevronRight,
  ArrowRight,
  Search,
  FileText,
  Bot,
  Lock,
  Newspaper,
} from "lucide-react";
import type { Blog } from "@shared/schema";

import groepImg         from "@assets/ChatGPT_Image_16_mrt_2026,_14_46_04_1773671702074.png";
import groupWebp        from "@assets/optimized/group.webp";
import streetWebp       from "@assets/optimized/street.webp";

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

/* OpenRegio palet — gelijk aan vandaag.tsx */
const C = {
  donker: "#0b2240",
  blauw: "#1f5fae",
  oranje: "#f28a1a",
  oranjeDiep: "#c2410c",
  donkerTintBg: "#eef2f9",
  blauwTintBg: "#eaf2ff",
  blauwTintBgZacht: "#f5f9ff",
  oranjeTintBg: "#fff2e0",
  border: "#e6ebf2",
  tekst: "#475569",
  tekstZacht: "#64748b",
  tekstHeelZacht: "#94a3b8",
};

function computeScore(beroep: string, stad: string): number {
  const seed = beroep + stad;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return Math.min(94, Math.max(50, 62 + (Math.abs(h) % 32)));
}

const MAX = "1200px";
const centered = { maxWidth: MAX, margin: "0 auto" };

/* SectieKop — leidend tint-icoon, zelfde patroon als vandaag.tsx */
function SectieKop({
  icon: Icon,
  tint = "blauw",
  eyebrow,
  titel,
  subtitel,
  rechts,
}: {
  icon: typeof Bell;
  tint?: "blauw" | "donker" | "oranje";
  eyebrow?: string;
  titel: string;
  subtitel?: string;
  rechts?: React.ReactNode;
}) {
  const tintBg = tint === "donker" ? C.donkerTintBg : tint === "oranje" ? C.oranjeTintBg : C.blauwTintBg;
  const tintFg = tint === "donker" ? C.donker : tint === "oranje" ? C.oranjeDiep : C.blauw;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: "1 1 280px" }}>
        <span aria-hidden style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 14, background: tintBg, color: tintFg, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon className="h-5 w-5" />
        </span>
        <div style={{ minWidth: 0 }}>
          {eyebrow && (
            <div style={{ fontSize: 11, fontWeight: 700, color: C.oranje, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 4 }}>
              {eyebrow}
            </div>
          )}
          <h2 className="sec-h-lg" style={{ fontSize: 26, fontWeight: 800, color: C.donker, margin: 0, letterSpacing: "-.4px", lineHeight: 1.15 }}>
            {titel}
          </h2>
          {subtitel && (
            <p style={{ fontSize: 13, color: C.tekstZacht, margin: "6px 0 0", lineHeight: 1.6, maxWidth: "60ch" }}>
              {subtitel}
            </p>
          )}
        </div>
      </div>
      {rechts && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{rechts}</div>}
    </div>
  );
}

export default function HomePage() {
  usePageTitle("OpenRegio — Meer klanten. Slimmer werken. Beter geregeld.");

  const { user } = useAuth();

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

  /* Lokale verbinding — 6 inspiratie-tegels.
     CTA gaat naar /vandaag voor ingelogde leden, anders naar Pro-lidmaatschap. */
  const lokaleActieHref = user ? "/vandaag" : "/lidmaatschap?plan=pro";

  const lokaleVerbindingTegels: Array<{
    icon: typeof Bell;
    tint: "blauw" | "donker" | "oranje";
    titel: string;
    desc: string;
  }> = [
    { icon: Heart,         tint: "oranje", titel: "Ouderenavond bij de pizzeria",     desc: "Nodig de bewoners van een verzorgingstehuis uit voor een gezellige avond — warme pasta, warme verhalen." },
    { icon: GraduationCap, tint: "blauw",  titel: "Studentenactie",                   desc: "Geef studenten in jouw stad een passende korting of proefdag. Zij worden je klanten van morgen." },
    { icon: Lightbulb,     tint: "oranje", titel: "Workshop organiseren",             desc: "Deel jouw vakkennis met de buurt. Eén avond per kwartaal, vol nieuwe gezichten en gesprekken." },
    { icon: Trophy,        tint: "blauw",  titel: "Samenwerken met de sportclub",     desc: "Sponsor de jeugd, lever de catering of bied korting aan leden. Lokale loyaliteit begint hier." },
    { icon: Sparkles,      tint: "donker", titel: "Nagelstyliste bij verzorgingshuis",desc: "Eens per maand langs in een verzorgingshuis. Kleine gebaren, grote glimlachen — en dankbare ambassadeurs." },
    { icon: MapPin,        tint: "donker", titel: "Buurtactie opzetten",              desc: "Van zwerfafval-rondje tot kerstboom-actie — laat zien dat jouw zaak deel is van de straat." },
  ];

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
        .pc-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,.08); }
        .blog-img { transition: transform .3s ease; }
        .blog-card:hover .blog-img { transform: scale(1.04); }

        /* Trendy accent-onderlijn op hover voor inspiratie-tegels */
        .or-tile { position: relative; transition: transform .18s, box-shadow .18s; }
        .or-tile::before {
          content: ""; position: absolute; left: 0; right: 0; bottom: 0;
          height: 3px; background: var(--or-accent, #1f5fae);
          border-radius: 0 0 18px 18px;
          transform: scaleX(0); transform-origin: left center;
          transition: transform .35s cubic-bezier(.2,.8,.2,1);
        }
        .or-tile:hover::before, .or-tile:focus-visible::before { transform: scaleX(1); }
        .or-tile:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(15,23,42,.08); }

        /* Responsive grids */
        .rg-2 { display: grid; grid-template-columns: 1fr 1fr; }
        .rg-3 { display: grid; grid-template-columns: repeat(3,1fr); }
        .rg-4 { display: grid; grid-template-columns: repeat(4,1fr); }

        .rg-split-img { overflow: hidden; position: relative; min-height: 300px; }
        .rg-split-img img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; position: absolute; inset: 0; }

        @media (max-width: 1024px) {
          .rg-3 { grid-template-columns: repeat(2,1fr) !important; }
        }

        @media (max-width: 900px) {
          .nav-links { display: none !important; }
          .nav-row { padding: 0 18px !important; }
          .nav-cta { padding: 8px 14px !important; font-size: 12px !important; }
          .nav-login { padding: 7px 10px !important; }
        }

        @media (max-width: 768px) {
          .rg-2, .rg-4 { grid-template-columns: 1fr !important; }
          .rg-3 { grid-template-columns: 1fr !important; }
          .rg-split-img { min-height: 220px; }

          .home-hero-left { padding: 32px 18px 28px 18px !important; }
          .home-hero-title { font-size: 30px !important; letter-spacing: -.6px !important; }
          .home-hero-sub { font-size: 14px !important; }
          .home-hero-img-wrap { min-height: 260px; }
          .home-hero-floats { display: none !important; }

          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid > div { border-right: none !important; border-bottom: 1px solid #f0f4ff; }
          .stats-grid > div:nth-child(odd) { border-right: 1px solid #f0f4ff !important; }
          .stats-grid > div:nth-last-child(-n+2) { border-bottom: none; }

          .sec-pad { padding: 44px 18px !important; }
          .sec-h-xl { font-size: 24px !important; letter-spacing: -.3px !important; }
          .sec-h-lg { font-size: 22px !important; letter-spacing: -.3px !important; }

          .regiobot-panel { padding: 36px 22px !important; }
          .bc-card { padding: 24px 20px !important; border-radius: 20px !important; }
          .bc-card-title { font-size: 20px !important; }
          .affiliate-row { padding: 36px 18px !important; gap: 24px !important; }
          .cta-final { padding: 56px 20px !important; }
          .cta-final-title { font-size: 26px !important; }
          .cta-final-sub { font-size: 14px !important; }
          .footer-row { flex-direction: column; align-items: flex-start !important; text-align: left; padding: 20px 18px !important; }
          .ticker-text { padding: 0 18px !important; font-size: 10px !important; }
        }

        @media (max-width: 480px) {
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
          <Link href="/" style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-.4px", color: C.blauw, textDecoration: "none" }} data-testid="link-home-logo">
            Open<span style={{ color: C.donker }}>Regio</span>
          </Link>
          <div className="nav-links" style={{ display: "flex", gap: "4px" }}>
            {[["gezond-pijlers","Wat we doen"],["bc-section","Basischeck"],["prijzen","Prijzen"]].map(([id,label]) => (
              <button key={id} onClick={() => scrollTo(id)} data-testid={`link-nav-${id}`}
                style={{ padding: "7px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: C.tekstZacht, cursor: "pointer", border: "none", background: "none" }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f0f4ff"; (e.currentTarget as HTMLButtonElement).style.color = C.blauw; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = C.tekstZacht; }}
              >{label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/login">
              <button className="nav-login" style={{ padding: "7px 16px", fontSize: "13px", fontWeight: 600, color: C.tekstZacht, background: "none", border: "none", cursor: "pointer" }} data-testid="button-nav-login">
                Inloggen
              </button>
            </Link>
            <button onClick={() => scrollTo("bc-section")} data-testid="button-nav-basischeck" className="nav-cta"
              style={{ background: C.blauw, color: "#fff", border: "none", borderRadius: "24px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              Gratis check starten
            </button>
          </div>
        </div>
      </nav>

      {/* ══ TICKER ══ */}
      <div style={{ overflow: "hidden", background: C.donker, padding: "10px 0" }} data-testid="ticker-bar">
        <div className="tick-track" style={{ display: "flex", width: "max-content" }}>
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="ticker-text" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0 28px", fontSize: "11px", fontWeight: 500, color: "#7ea8d4", whiteSpace: "nowrap" }}>
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: C.oranje, flexShrink: 0, display: "inline-block" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ══ HERO ══ */}
      <div style={{ background: "#fff" }} data-testid="section-hero">
        <div className="rg-2" style={{ ...centered, minHeight: "480px" }}>
          <div className="fu home-hero-left" style={{ padding: "56px 40px 56px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: C.blauwTintBg, color: C.blauw, fontSize: "11px", fontWeight: 700, padding: "5px 13px", borderRadius: "20px", marginBottom: "20px", width: "fit-content" }}>
              <span className="badge-dot" style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.blauw, display: "inline-block" }} />
              Voor lokale ondernemers in jouw regio
            </div>
            <h1 className="home-hero-title" data-testid="text-hero-title" style={{ fontSize: "38px", fontWeight: 800, lineHeight: 1.12, letterSpacing: "-1.2px", marginBottom: "16px" }}>
              Weer <em style={{ fontStyle: "normal", color: C.blauw }}>gezond</em> ondernemen<br />in jouw regio.
            </h1>
            <p className="home-hero-sub" style={{ fontSize: "15px", color: C.tekstZacht, lineHeight: 1.7, marginBottom: "26px", maxWidth: "40ch" }}>
              Regels, kansen en lokale verbinding — overzichtelijk bij elkaar. Zodat je weer toekomt aan je vak in plaats van aan het systeem eromheen.
            </p>
            <div className="fu d1" style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <button onClick={() => scrollTo("gezond-pijlers")} data-testid="button-hero-cta"
                style={{ background: C.blauw, color: "#fff", border: "none", borderRadius: "24px", padding: "12px 22px", fontSize: "14px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Zo werkt gezond ondernemen
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link href="/regiobot" data-testid="button-hero-regiobot"
                style={{ background: C.blauwTintBg, color: C.blauw, border: "none", borderRadius: "24px", padding: "12px 22px", fontSize: "14px", fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Bot className="h-4 w-4" />
                Praat met RegioBot
              </Link>
            </div>
            <div className="fu d2" style={{ fontSize: "12px", color: C.tekstHeelZacht, display: "flex", alignItems: "center", gap: "6px" }}>
              <Check style={{ width: "14px", height: "14px", color: "#10b981" }} />
              Geen jurist. Geen consultant. Gewoon eerlijk en praktisch.
            </div>
          </div>
          <div className="fu d2 home-hero-img-wrap" style={{ position: "relative", overflow: "hidden" }}>
            <img src={groupWebp} alt="Lokale ondernemers" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} data-testid="img-hero" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(255,255,255,.12), transparent 40%)" }} />
            <div className="home-hero-floats" style={{ position: "absolute", bottom: "24px", left: "24px", background: "#fff", borderRadius: "16px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 8px 28px rgba(15,23,42,.14)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: C.blauwTintBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.blauw }}>
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.donker }}>RegioBot staat klaar</div>
                <div style={{ fontSize: "10px", color: C.tekstHeelZacht, marginTop: "1px" }}>Jouw slimme buurman 24/7</div>
              </div>
            </div>
            <div className="home-hero-floats" style={{ position: "absolute", top: "24px", right: "24px", background: C.donker, borderRadius: "16px", padding: "12px 16px", boxShadow: "0 8px 24px rgba(15,23,42,.18)" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: C.oranje, letterSpacing: "-.5px" }}>20</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,.55)", marginTop: "1px" }}>ondernemers actief</div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STATS strip ══ */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.blauwTintBgZacht }} data-testid="section-stats">
        <div className="rg-4 stats-grid" style={{ ...centered }}>
          {[
            { n: "20", l: "Ondernemers actief" },
            { n: "€19/mnd", l: "Startprijs — geen jaarcontract" },
            { n: "20%", l: "Affiliate op elke doorverwijzing" },
            { n: "Dagelijks", l: "Nieuwe signalen & inzichten" },
          ].map(({ n, l }, i) => (
            <div key={i} style={{ padding: "16px 24px", textAlign: "center", borderRight: i < 3 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ fontSize: "20px", fontWeight: 800, color: C.blauw, letterSpacing: "-.5px" }}>{n}</div>
              <div style={{ fontSize: "11px", color: C.tekstHeelZacht, marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ VIER PIJLERS GEZOND ONDERNEMEN ══ */}
      <div id="gezond-pijlers" style={{ background: "#f8faff" }} data-testid="section-pijlers">
        <div data-testid="section-gezond" className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <SectieKop
            icon={ShieldCheck}
            tint="blauw"
            eyebrow="Vier pijlers"
            titel="Wat houdt gezond ondernemen in?"
            subtitel="Een gezond bedrijf staat op vier benen. OpenRegio helpt je op alle vier tegelijk — zonder dat het er een vijfde takenlijst bij wordt."
          />
          <div className="rg-4 stats-grid" style={{ gap: "16px" }}>
            {[
              { Icon: Banknote,    title: "Financieel gezond",  text: "Vind opdrachten, subsidies en kansen in je regio voordat ze elders weglopen.", href: "/gezond/financieel" },
              { Icon: ShieldCheck, title: "Bestuurlijk gezond", text: "Begrijp gemeentebrieven en zet WOO-verzoeken in zonder juridische kennis.",  href: "/gezond/bestuurlijk" },
              { Icon: Handshake,   title: "Mentaal gezond",     text: "Sta er niet alleen voor: deel signalen en pak zaken samen met andere ondernemers aan.", href: "/gezond/mentaal" },
              { Icon: TrendingUp,  title: "Strategisch gezond", text: "Weet wat er in je regio speelt — en welke ondernemers het raakt — voordat het je raakt.", href: "/gezond/strategisch" },
            ].map(({ Icon, title, text, href }) => (
              <Link key={title} href={href} data-testid={`gezond-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="pc-hover" style={{ borderRadius: "20px", border: `1px solid ${C.border}`, background: "#fff", padding: "22px", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: C.oranjeTintBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "14px" }}>
                    <Icon style={{ width: "20px", height: "20px", color: C.oranjeDiep }} />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: C.donker, marginBottom: "8px", letterSpacing: "-.2px" }}>{title}</div>
                  <div style={{ fontSize: "13px", color: C.tekstZacht, lineHeight: 1.6, flex: 1 }}>{text}</div>
                  <div style={{ marginTop: "14px", fontSize: "12px", fontWeight: 700, color: C.blauw, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Bekijk pijler
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ marginTop: "24px", background: "#fff", border: `1px solid ${C.border}`, borderRadius: "20px", padding: "22px 26px" }}>
            <div style={{ fontSize: "15px", fontWeight: 800, color: C.donker, marginBottom: "8px", letterSpacing: "-.2px" }}>Wat bedoelen wij met gezond ondernemen?</div>
            <p style={{ fontSize: "13px", color: C.tekst, lineHeight: 1.7, margin: 0 }}>
              Gezond ondernemen betekent dat je bedrijf werkt — niet dat het je opslokt. Eén plek voor regels, kansen, andere ondernemers en context. Geen losse tools, geen extra abonnementen.
            </p>
          </div>
        </div>
      </div>

      {/* ══ LOKALE VERBINDING (nieuw) ══ */}
      <div style={{ background: "#fff" }} data-testid="section-lokale-verbinding">
        <div className="sec-pad" style={{ ...centered, padding: "72px 28px" }}>
          <SectieKop
            icon={Heart}
            tint="oranje"
            eyebrow="Lokale verbinding"
            titel="Voor ondernemers die meer echte klanten en relaties willen"
            subtitel="Klanten komen niet vanzelf. Ze komen langs als je iets toevoegt aan jouw straat, jouw wijk, jouw stad. Hier zes manieren waarop andere ondernemers dat doen — en hoe jij dat ook kunt."
          />
          <div className="rg-3" style={{ gap: 16 }}>
            {lokaleVerbindingTegels.map((tegel, i) => {
              const tintBg =
                tegel.tint === "donker" ? C.donkerTintBg :
                tegel.tint === "oranje" ? C.oranjeTintBg : C.blauwTintBg;
              const tintFg =
                tegel.tint === "donker" ? C.donker :
                tegel.tint === "oranje" ? C.oranjeDiep : C.blauw;
              const slug = tegel.titel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
              return (
                <div
                  key={i}
                  className="or-tile"
                  data-testid={`lokale-tegel-${slug}`}
                  style={{
                    background: "#fff",
                    border: `1px solid ${C.border}`,
                    borderRadius: 18,
                    padding: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    ["--or-accent" as string]: tintFg,
                  } as CSSProperties}
                >
                  <span aria-hidden style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 14, background: tintBg, color: tintFg, alignItems: "center", justifyContent: "center" }}>
                    <tegel.icon className="h-5 w-5" />
                  </span>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.donker, letterSpacing: "-.2px", lineHeight: 1.3 }}>
                    {tegel.titel}
                  </div>
                  <div style={{ fontSize: 13, color: C.tekstZacht, lineHeight: 1.6 }}>
                    {tegel.desc}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", background: C.blauwTintBgZacht, border: `1px solid ${C.border}`, borderRadius: 20, padding: "20px 24px" }}>
            <div style={{ minWidth: 0, flex: "1 1 280px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.donker, letterSpacing: "-.2px", marginBottom: 4 }}>
                Klaar om jouw eigen lokale actie te starten?
              </div>
              <div style={{ fontSize: 13, color: C.tekstZacht, lineHeight: 1.6 }}>
                Pro-leden plannen acties, nodigen partners uit en delen ze met de buurt — direct vanuit OpenRegio.
              </div>
            </div>
            <Link
              href={lokaleActieHref}
              data-testid="button-start-lokale-actie"
              style={{
                background: C.oranje,
                color: "#1b1307",
                borderRadius: 999,
                padding: "12px 22px",
                fontSize: 14,
                fontWeight: 800,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              Start lokale actie
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ══ ACTUEEL & INZICHTEN (blogs) ══ */}
      {visibleBlogs.length > 0 && (
        <div style={{ background: "#f8faff" }} data-testid="section-blogs">
          <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
            <SectieKop
              icon={Newspaper}
              tint="blauw"
              eyebrow="Actueel & Inzichten"
              titel="Laatste nieuws voor lokale ondernemers"
              rechts={
                <Link
                  href="/blogs"
                  aria-label="Bekijk alle artikelen"
                  data-testid="link-all-blogs"
                  className="hover-elevate"
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 999, background: "transparent", color: C.blauw, border: `1px solid ${C.border}`, textDecoration: "none" }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              }
            />
            <div className="rg-3" style={{ gap: "16px" }}>
              {visibleBlogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} style={{ textDecoration: "none" }} data-testid={`card-blog-${blog.id}`}>
                  <div className="blog-card pc-hover" style={{ borderRadius: "20px", overflow: "hidden", border: `1px solid ${C.border}`, background: "#fff", height: "100%" }}>
                    <div style={{ height: "180px", overflow: "hidden", background: C.blauwTintBg, position: "relative" }}>
                      {blog.featuredImage ? (
                        <img
                          className="blog-img"
                          src={blog.featuredImage}
                          alt={blog.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          data-testid={`img-blog-${blog.id}`}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #eef2ff 0%, #e0e8ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: C.blauw }}>
                          <FileText className="h-8 w-8" style={{ opacity: 0.45 }} />
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "18px" }}>
                      <div style={{ fontSize: "11px", color: C.tekstHeelZacht, marginBottom: "8px" }}>
                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : ""}
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: C.donker, marginBottom: "8px", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {blog.title}
                      </div>
                      {blog.excerpt && (
                        <div style={{ fontSize: "12px", color: C.tekstZacht, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "12px" }}>
                          {blog.excerpt}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", fontWeight: 700, color: C.blauw, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Lees meer
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ REGIOBOT SPLIT (vereenvoudigd) ══ */}
      <div style={{ background: "#fff" }} data-testid="section-regiobot">
        <div className="rg-2" style={{ ...centered, minHeight: "420px" }}>
          <div className="rg-split-img">
            <img src={streetWebp} alt="RegioBot AI" />
          </div>
          <div className="regiobot-panel" style={{ padding: "56px 48px", display: "flex", flexDirection: "column", justifyContent: "center", background: C.donker }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "11px", fontWeight: 700, color: C.oranje, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: "12px" }}>
              <Bot className="h-3.5 w-3.5" />
              Maak kennis met RegioBot
            </div>
            <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-.4px", marginBottom: "16px" }}>
              Jouw slimme buurman die alles weet over ondernemen in jouw regio.
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,.6)", lineHeight: 1.7, marginBottom: "22px" }}>
              RegioBot kent jouw gemeente, jouw branche en de regels die voor jou gelden. Stel elke vraag — hij antwoordt in gewone taal.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {[
                "Upload een gemeentebrief — RegioBot legt uit wat je moet doen",
                "Vraag welke regels gelden voor jouw branche en gemeente",
                "Ontdek subsidies en kansen die voor jou beschikbaar zijn",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "rgba(255,255,255,.78)", lineHeight: 1.55 }}>
                  <span style={{ width: "20px", height: "20px", borderRadius: "6px", background: "rgba(242,138,26,.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: C.oranje, flexShrink: 0, marginTop: "1px" }}>
                    <Check className="h-3 w-3" />
                  </span>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/regiobot" data-testid="button-regiobot-stuur"
                style={{ background: C.blauw, color: "#fff", borderRadius: 24, padding: "11px 20px", fontSize: 13, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Stel RegioBot een vraag
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={() => scrollTo("bc-section")}
                style={{ background: "transparent", color: "rgba(255,255,255,.85)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 24, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Doe eerst de Basischeck
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ BASISCHECK ══ */}
      <div id="bc-section" style={{ background: "#f0f4ff" }} data-testid="section-basischeck">
        <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "11px", fontWeight: 700, color: C.oranje, textTransform: "uppercase", letterSpacing: ".6px" }}>
              <Search className="h-3.5 w-3.5" />
              Gratis bedrijfscheck
            </div>
            <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: C.donker, letterSpacing: "-.5px", marginTop: "8px" }} data-testid="text-basischeck-title">
              Hoe gezond is jouw bedrijf online?
            </div>
            <div style={{ fontSize: "13px", color: C.tekstZacht, lineHeight: 1.7, marginTop: "6px" }}>Vul in — in 30 seconden zie je wat je mist.</div>
          </div>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div className="bc-card" style={{ background: C.donker, borderRadius: "24px", padding: "36px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(242,138,26,.2)", color: C.oranje, fontSize: "10px", fontWeight: 700, padding: "4px 12px", borderRadius: "20px", marginBottom: "16px" }}>
                <Sparkles className="h-3 w-3" />
                Altijd gratis · Geen account nodig
              </div>

              {step === "input" && (
                <>
                  <div className="bc-card-title" style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "8px", letterSpacing: "-.3px" }} data-testid="text-basischeck-card-title">Check nu wat jij mist.</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,.5)", marginBottom: "24px" }}>Vul je beroep en stad in. Binnen 30 seconden een concreet rapport.</div>
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
                    style={{ width: "100%", background: C.oranje, color: "#1b1307", border: "none", borderRadius: "12px", padding: "14px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: (!beroep.trim() || !stad.trim()) ? 0.3 : 1 }}
                  >
                    Start de gratis check
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,.3)", textAlign: "center", marginTop: "10px" }}>Geen account · Geen creditcard · Geen verplichtingen</p>
                </>
              )}

              {step === "scanning" && (
                <div style={{ textAlign: "center", padding: "12px 0" }} data-testid="section-scanning">
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "rgba(255,255,255,.78)", marginBottom: "14px" }} data-testid="text-scan-msg">{SCAN_MSGS[msgIdx]}</p>
                  <div style={{ background: "rgba(255,255,255,.08)", borderRadius: "4px", height: "4px", overflow: "hidden", marginBottom: "6px" }}>
                    <div style={{ height: "4px", background: C.blauw, borderRadius: "4px", width: `${progress}%`, transition: "width .08s linear" }} data-testid="progress-bar" />
                  </div>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,.35)" }}>{progress}%</p>
                </div>
              )}

              {step === "rapport" && (
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,.55)", paddingTop: "8px" }}>
                  Analyse klaar voor <strong style={{ color: "#fff" }}>{beroep} · {stad}</strong>
                </div>
              )}
            </div>

            {step === "rapport" && (
              <div style={{ background: "#fff", borderRadius: "20px", overflow: "hidden", marginTop: "16px", border: `1px solid ${C.border}` }} data-testid="section-rapport">
                <div style={{ background: C.donker, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }} data-testid="text-rapport-heading">Bedrijfscheck — {beroep} in {stad}</div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,.4)", marginTop: "2px" }}>{today}</div>
                  </div>
                  <div style={{ width: "52px", height: "52px", borderRadius: "50%", border: `3px solid ${C.blauw}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(31,95,174,.2)" }}>
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
                      <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: dot, flexShrink: 0, marginTop: "5px", display: "inline-block" }} />
                      {text}
                    </div>
                  ))}
                  {[
                    `Welke 3 AI-tools besparen een ${beroep} in ${stad} de meeste tijd?`,
                    `Subsidies en groeikansen voor ${beroep} in ${stad} — bedragen en deadlines`,
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "12px", background: "#f8fafc", border: "1px dashed #e2e8f0", marginBottom: "6px" }} data-testid={`locked-item-${i}`}>
                      <Lock className="h-3.5 w-3.5" style={{ color: C.tekstHeelZacht, flexShrink: 0 }} />
                      <span style={{ fontSize: "11px", color: "#cbd5e1", filter: "blur(3px)", flex: 1, userSelect: "none" }}>{t}</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, background: C.blauwTintBg, color: C.blauw, padding: "2px 8px", borderRadius: "10px", flexShrink: 0 }}>Pro</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
                  <a href={MOLLIE_BASIS} target="_blank" rel="noopener noreferrer">
                    <button style={{ width: "100%", background: C.oranje, color: "#1b1307", border: "none", borderRadius: "14px", padding: "14px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }} data-testid="button-rapport-upgrade">
                      Ontgrendel volledig rapport — vanaf €19/mnd
                    </button>
                  </a>
                  <button onClick={resetScan} style={{ width: "100%", textAlign: "center", fontSize: "11px", color: C.tekstHeelZacht, marginTop: "10px", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }} data-testid="button-rapport-opnieuw">
                    Doe de check opnieuw
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ AFFILIATE ══ */}
      <div style={{ background: C.donker }} data-testid="section-affiliate">
        <div className="rg-2 affiliate-row" style={{ ...centered, padding: "48px 28px", gap: "40px", alignItems: "center" }}>
          <div>
            <h2 className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: "#fff", letterSpacing: "-.4px", marginBottom: "8px", lineHeight: 1.2 }}>
              Ken je andere ondernemers?<br />Verdien mee.
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,.55)", lineHeight: 1.7 }}>
              Voor elke ondernemer die jij aanmeldt ontvang je 20% van hun maandelijks abonnement — elke maand opnieuw, zo lang zij lid blijven.
            </p>
          </div>
          <div className="rg-3" style={{ gap: "10px" }}>
            {[
              { n: "€3,80",     l: "per Basis-klant\n/maand" },
              { n: "€11,80",    l: "per Pro-klant\n/maand" },
              { n: "5 klanten", l: "= abonnement\nterug" },
            ].map(({ n, l }) => (
              <div key={n} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "16px", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff" }}>{n}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,.45)", marginTop: "4px", lineHeight: 1.4, whiteSpace: "pre-line" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ PRIJZEN ══ */}
      <div id="prijzen" style={{ background: "#fff" }} data-testid="section-prijzen">
        <div className="sec-pad" style={{ ...centered, padding: "64px 28px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.oranje, textTransform: "uppercase", letterSpacing: ".6px" }}>Transparante prijzen</div>
            <div className="sec-h-xl" style={{ fontSize: "30px", fontWeight: 800, color: C.donker, letterSpacing: "-.5px", marginTop: "6px" }} data-testid="text-prijzen-title">Kies jouw plan</div>
            <div style={{ fontSize: "14px", color: C.tekstZacht, marginTop: "6px" }}>Maandelijks opzegbaar · Geen verborgen kosten · De Basischeck is altijd gratis</div>
          </div>
          <div className="rg-2" style={{ gap: "16px", maxWidth: "640px", margin: "28px auto 0" }}>
            <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: "24px", padding: "28px" }} data-testid="card-plan-basis">
              <div style={{ fontSize: "17px", fontWeight: 800, color: C.donker, marginBottom: "2px" }}>Basis-lid</div>
              <div style={{ fontSize: "11px", color: C.tekstHeelZacht, marginBottom: "16px" }}>Alle essentials voor gezond ondernemen</div>
              <div style={{ fontSize: "36px", fontWeight: 800, color: C.donker, letterSpacing: "-1px", marginBottom: "4px" }}>
                €19<sub style={{ fontSize: "12px", fontWeight: 400, color: C.tekstHeelZacht, letterSpacing: 0 }}> excl. btw/mnd</sub>
              </div>
              <a href={MOLLIE_BASIS} target="_blank" rel="noopener noreferrer">
                <button style={{ width: "100%", padding: "12px", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none", margin: "16px 0", fontFamily: "inherit", background: C.blauwTintBg, color: C.blauw }} data-testid="button-kies-basis">
                  Kies Basis-lid
                </button>
              </a>
              {["Vindbaarheidscheck & tips","Regelgeving in gewone taal","Brief-analyse via RegioBot","20% affiliate commissie"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: C.tekst, marginBottom: "7px", lineHeight: 1.55 }}>
                  <Check className="h-3.5 w-3.5" style={{ color: C.blauw, flexShrink: 0, marginTop: 2 }} />
                  {f}
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", border: `2px solid ${C.blauw}`, borderRadius: "24px", padding: "28px", boxShadow: "0 10px 40px rgba(31,95,174,.16)", position: "relative" }} data-testid="card-plan-pro">
              <div style={{ position: "absolute", top: "-13px", left: "20px", background: C.blauw, color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 12px", borderRadius: "10px" }}>Meest gekozen</div>
              <div style={{ fontSize: "17px", fontWeight: 800, color: C.donker, marginBottom: "2px" }}>Pro-bijdrager</div>
              <div style={{ fontSize: "11px", color: C.tekstHeelZacht, marginBottom: "16px" }}>Alles voor serieuze groei</div>
              <div style={{ fontSize: "36px", fontWeight: 800, color: C.donker, letterSpacing: "-1px", marginBottom: "4px" }}>
                €59<sub style={{ fontSize: "12px", fontWeight: 400, color: C.tekstHeelZacht, letterSpacing: 0 }}> excl. btw/mnd</sub>
              </div>
              <a href={MOLLIE_PRO} target="_blank" rel="noopener noreferrer">
                <button style={{ width: "100%", padding: "12px", borderRadius: "14px", fontSize: "13px", fontWeight: 700, cursor: "pointer", border: "none", margin: "16px 0", fontFamily: "inherit", background: C.blauw, color: "#fff" }} data-testid="button-kies-pro">
                  Kies Pro-bijdrager
                </button>
              </a>
              {["Alles van Basis-lid","Onbeperkte RegioBot AI","Volledige WOO-bibliotheek","20% affiliate = €11,80/klant/mnd","Prioriteit ondersteuning"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", color: C.tekst, marginBottom: "7px", lineHeight: 1.55 }}>
                  <Check className="h-3.5 w-3.5" style={{ color: C.blauw, flexShrink: 0, marginTop: 2 }} />
                  {f}
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
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.oranje, textTransform: "uppercase", letterSpacing: ".6px" }}>Vragen</div>
              <div className="sec-h-lg" style={{ fontSize: "26px", fontWeight: 800, color: C.donker, marginTop: "6px", letterSpacing: "-.5px" }}>Veelgestelde vragen</div>
            </div>
            {[
              { q: "Is de Basischeck echt gratis?", a: "Ja — altijd gratis, geen account, geen creditcard. Een lidmaatschap begint bij €19/maand voor doorlopende inzichten." },
              { q: "Wat doet RegioBot precies?", a: "RegioBot is jouw AI-assistent die alles weet over ondernemen in jouw regio. Upload een gemeentebrief, stel een vraag over regelgeving of ontdek subsidies — hij geeft altijd een antwoord in gewone taal." },
              { q: "Geven jullie juridisch advies?", a: "Nee. We leggen uit wat regelgeving betekent voor jouw situatie, in gewone taal. Als je een jurist nodig hebt, verwijzen we je door naar de juiste partij." },
              { q: "Hoe werkt het affiliate-programma?", a: "Voor elke ondernemer die jij aanmeldt via jouw link ontvang je 20% recurring commissie. 5 Basis-klanten = jouw abonnement volledig terug." },
              { q: "Kan ik opzeggen wanneer ik wil?", a: "Ja. Maandelijks opzegbaar, geen binding, geen opzeggingskosten." },
            ].map((item, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", marginBottom: "8px", border: `1px solid ${C.border}` }} data-testid={`faq-item-${i}`}>
                <button
                  type="button"
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", fontSize: "13px", fontWeight: 700, color: C.donker, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", textAlign: "left" }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  {item.q}
                  <span style={{ fontSize: "18px", color: C.tekstHeelZacht, transition: "transform .2s", transform: openFaq === i ? "rotate(45deg)" : "none", display: "inline-block" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ fontSize: "12px", color: C.tekstZacht, padding: "0 20px 16px", lineHeight: 1.75, borderTop: "1px solid #f8fafc" }} data-testid={`faq-answer-${i}`}>
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
          <div className="cta-final-sub" style={{ fontSize: "15px", color: "rgba(255,255,255,.6)", marginBottom: "32px", maxWidth: "40ch", marginLeft: "auto", marginRight: "auto" }}>
            Start vandaag gratis. Geen verplichtingen — gewoon praktische hulp voor jouw bedrijf.
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("bc-section")} style={{ background: C.blauw, color: "#fff", border: "none", borderRadius: "24px", padding: "14px 26px", fontSize: "15px", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }} data-testid="button-cta-basischeck">
              Start de gratis check
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link href="/register">
              <button style={{ padding: "13px 26px", fontSize: "15px", fontWeight: 700, border: "1px solid rgba(255,255,255,.3)", color: "rgba(255,255,255,.85)", background: "transparent", borderRadius: "24px", cursor: "pointer" }} data-testid="button-cta-register">
                Direct aanmelden
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: `1px solid ${C.border}` }} data-testid="footer-main">
        <div className="footer-row" style={{ ...centered, padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px", fontWeight: 800, letterSpacing: "-.3px", color: C.blauw }}>
              Open<span style={{ color: C.donker }}>Regio</span>
            </span>
            <span style={{ fontSize: "12px", color: C.tekstHeelZacht }}>Meer klanten. Slimmer werken. Beter geregeld.</span>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[["gezond-pijlers","Wat we doen"],["bc-section","Basischeck"],["prijzen","Prijzen"]].map(([id,label]) => (
              <button key={id} type="button" onClick={() => scrollTo(id)}
                style={{ fontSize: "12px", color: C.tekstHeelZacht, cursor: "pointer", background: "none", border: "none", padding: 0, fontFamily: "inherit" }}
                onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.color = C.blauw; }}
                onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.color = C.tekstHeelZacht; }}
              >{label}</button>
            ))}
            <Link href="/privacy" style={{ fontSize: "12px", color: C.tekstHeelZacht, textDecoration: "none" }}>Privacy</Link>
            <Link href="/voorwaarden" style={{ fontSize: "12px", color: C.tekstHeelZacht, textDecoration: "none" }}>Voorwaarden</Link>
          </div>
          <div style={{ fontSize: "11px", color: "#cbd5e1" }}>© {new Date().getFullYear()} OpenRegio</div>
        </div>
      </footer>

      {/* ══ COOKIE BANNER ══ */}
      {showCookie && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, borderTop: "1px solid #e2e8f0", background: "#fff", boxShadow: "0 -4px 24px rgba(0,0,0,.08)" }} data-testid="banner-cookie">
          <div style={{ maxWidth: MAX, margin: "0 auto", padding: "14px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <p style={{ fontSize: "13px", color: C.tekstZacht, maxWidth: "520px" }}>
              Wij gebruiken cookies om je ervaring te verbeteren. Lees ons{" "}
              <Link href="/cookiebeleid" style={{ textDecoration: "underline", color: C.donker }}>cookiebeleid</Link>.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => acceptCookie(false)} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, color: C.tekstZacht, background: "none", border: "1px solid #e2e8f0", cursor: "pointer" }} data-testid="button-cookie-weigeren">Weigeren</button>
              <button onClick={() => acceptCookie(true)} style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 700, color: "#fff", background: C.blauw, border: "none", cursor: "pointer" }} data-testid="button-cookie-accepteren">Accepteren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
