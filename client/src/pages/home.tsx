import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowRight, ArrowUp, ArrowDown, Minus,
  Globe, Gavel, TrendingUp, Star,
  ChevronRight, Lock, Zap, AlertTriangle,
  CheckCircle2, Info,
  Check, ChevronDown, ChevronUp,
  FileText, Eye, Users, MapPin, Mail,
  RotateCcw, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { IntelSignaal } from "@shared/schema";

import groepImg        from "@assets/ChatGPT_Image_16_mrt_2026,_14_46_04_1773671702074.png";
import luchtfotoImg    from "@assets/ChatGPT_Image_16_mrt_2026,_17_09_39_1773677423650.png";
import winkelstraatImg from "@assets/5dab2418-3038-4262-b4a0-233a5081e835_1773671805585.png";
import regelgevingImg  from "@assets/856951b8-160c-43ab-ae38-c328cb362aa4_1773678418402.png";

const MOLLIE_BASIS = (import.meta.env.VITE_MOLLIE_BASIC_PAYMENT_LINK as string)
  || "https://payment-links.mollie.com/payment/FNnWr8uofpfEd6PJQMWHk";
const MOLLIE_PRO   = (import.meta.env.VITE_MOLLIE_PRO_PAYMENT_LINK as string)
  || "https://payment-links.mollie.com/payment/nEdtEni7GkJG7rHHetyBs";

// ─── Design tokens (dashboard) ───────────────────────────────────────────────
const BLAUW  = "#1f5fae";
const ORANJE = "#f28a1a";
const CARD   = "rounded-[28px] border border-[#e4dfd2] bg-white shadow-sm";
const INNER  = "rounded-2xl border border-[#ede8df] bg-[#fafaf8]";

// ─── Score berekening ─────────────────────────────────────────────────────────
function berekenScore(
  profielPct: number,
  signaalCount: number,
  kansBenut: number,
  heeftWebsite: boolean,
): { totaal: number; vindbaarheid: number; regelgeving: number; kansen: number } {
  const vindbaarheid = Math.min(100, Math.round((profielPct * 0.6) + (heeftWebsite ? 30 : 0) + 10));
  const regelgeving  = Math.min(100, Math.round(100 - Math.min(signaalCount * 8, 60) + 20));
  const kansen       = Math.min(100, Math.round(20 + (kansBenut * 25)));
  const totaal       = Math.round((vindbaarheid * 0.4) + (regelgeving * 0.35) + (kansen * 0.25));
  return { totaal, vindbaarheid, regelgeving, kansen };
}

// ─── Score ring SVG ──────────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, color }: { score: number; size?: number; color: string }) {
  const r    = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(score / 100, 1));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e4dfd2" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x={size/2} y={size/2 - 4} textAnchor="middle" dominantBaseline="middle"
        fontSize="24" fontWeight="700" fill="#0f172a">{score}</text>
      <text x={size/2} y={size/2 + 18} textAnchor="middle" fontSize="10" fill="#94a3b8">/100</text>
    </svg>
  );
}

// ─── Mini score bar ──────────────────────────────────────────────────────────
function ScoreBar({ label, score, color, icon: Icon, href, actie }: {
  label: string; score: number; color: string;
  icon: typeof Globe; href: string; actie: string;
}) {
  const kleur = score >= 75 ? "#059669" : score >= 55 ? "#d97706" : "#dc2626";
  return (
    <Link href={href}>
      <div className={`${INNER} p-4 cursor-pointer transition-colors`} data-testid={`score-bar-${label.toLowerCase()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className="text-sm font-semibold text-slate-900">{label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black" style={{ color: kleur }}>{score}</span>
            <span className="text-xs text-slate-400">/100</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: kleur }} />
        </div>
        <p className="text-xs text-slate-500">{actie}</p>
      </div>
    </Link>
  );
}

// ─── Trend badge ─────────────────────────────────────────────────────────────
function Trend({ delta }: { delta: number }) {
  if (delta > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
      <ArrowUp className="w-3 h-3" />+{delta} t.o.v. vorige maand
    </span>
  );
  if (delta < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
      <ArrowDown className="w-3 h-3" />{delta} t.o.v. vorige maand
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" />Gelijk aan vorige maand
    </span>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD — voor ingelogde gebruikers
// ════════════════════════════════════════════════════════════════════════════
function OndernemerscorePage() {
  const { user } = useAuth();

  const { data: bedrijfsprofiel, isLoading: profielLoading } = useQuery<{
    naam?: string; beschrijving?: string; website?: string;
    telefoon?: string; adres?: string; kvkNummer?: string;
  } | null>({ queryKey: ["/api/business-profile/me"], enabled: !!user });

  const { data: intelSignalen = [], isLoading: signaalLoading } = useQuery<IntelSignaal[]>({
    queryKey: ["/api/intel/signalen"], enabled: !!user,
  });

  const isLoading = profielLoading || signaalLoading;
  const isPro = user?.plan === "pro";

  type Veld = "naam" | "beschrijving" | "website" | "telefoon" | "adres" | "kvkNummer";
  const velden: Veld[] = ["naam", "beschrijving", "website", "telefoon", "adres", "kvkNummer"];
  const ingevuld   = bedrijfsprofiel ? velden.filter(v => !!(bedrijfsprofiel as Record<string, unknown>)[v]).length : 0;
  const profielPct = Math.round((ingevuld / velden.length) * 100);
  const heeftWebsite = !!bedrijfsprofiel?.website;

  const kansSignalen   = intelSignalen.filter(s => s.categorie === "subsidies" || s.categorie === "financieel");
  const urgentSignalen = intelSignalen.filter(s => s.urgentie === "hoog");

  const scores = berekenScore(profielPct, urgentSignalen.length, 0, heeftWebsite);

  const maand = new Date().toLocaleDateString("nl-NL", { month: "long", year: "numeric" });

  const topActie = (() => {
    if (scores.vindbaarheid < scores.regelgeving && scores.vindbaarheid < scores.kansen) {
      return {
        label: "Verbeter je vindbaarheid",
        desc: heeftWebsite
          ? "Je website staat er, maar je Google-profiel mist informatie. Dat kost je klanten."
          : "Je hebt nog geen website ingevuld. Dit is de snelste manier om meer klanten te krijgen.",
        href: "/tools/website-scan",
        cta: "Start website-scan",
        icon: Globe,
      };
    }
    if (scores.regelgeving < 60) {
      return {
        label: "Check je regelgeving-signalen",
        desc: `Er zijn ${urgentSignalen.length} urgente signalen die jouw zaak kunnen raken. Bekijk ze nu.`,
        href: "/intel",
        cta: "Bekijk signalen",
        icon: Gavel,
      };
    }
    return {
      label: "Benut lokale kansen",
      desc: `Er zijn ${kansSignalen.length} subsidies en kansen beschikbaar in jouw regio die je nog niet benut.`,
      href: "/kansen-in-de-buurt",
      cta: "Bekijk kansen",
      icon: TrendingUp,
    };
  })();

  const scoreKleur = scores.totaal >= 75 ? "#059669" : scores.totaal >= 55 ? "#d97706" : "#dc2626";
  const scoreLabel = scores.totaal >= 75 ? "Goed"    : scores.totaal >= 55 ? "Matig"   : "Kwetsbaar";

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <Skeleton className="h-48 w-full rounded-[28px]" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-[28px]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── HERO SCORE KAART ── */}
      <section className={CARD} data-testid="section-score-hero">
        <div className="p-7 pb-0">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4" style={{ color: ORANJE }} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Jouw Ondernemerscore</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-1" style={{ letterSpacing: "-0.5px" }}>
                {maand}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge variant="secondary" className="text-[10px]">
                  {isPro ? "Pro-bijdrager" : "Basis-lid"}
                </Badge>
                <Trend delta={+3} />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                Elke maand bereken we jouw score op drie assen — vindbaarheid, regelgeving en kansen. Zo zie je precies waar je groeit en wat je kunt verbeteren.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ScoreRing score={scores.totaal} size={130} color={scoreKleur} />
              <span className="text-sm font-black px-3 py-1 rounded-full" style={{ background: `${scoreKleur}15`, color: scoreKleur }}>
                {scoreLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Drie sub-scores */}
        <div className="grid grid-cols-3 divide-x divide-[#ede8df] border-t border-[#ede8df] mt-6">
          {[
            { label: "Vindbaarheid", score: scores.vindbaarheid, color: BLAUW },
            { label: "Regelgeving",  score: scores.regelgeving,  color: "#dc2626" },
            { label: "Kansen",       score: scores.kansen,       color: "#059669" },
          ].map(({ label, score, color }) => {
            const k = score >= 75 ? "#059669" : score >= 55 ? "#d97706" : "#dc2626";
            return (
              <div key={label} className="p-5 text-center" data-testid={`subscore-${label.toLowerCase()}`}>
                <div className="text-xl font-black mb-0.5" style={{ color: k }}>{score}</div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: k }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── TOPACTIE ── */}
      <section data-testid="section-topactie">
        <Link href={topActie.href}>
          <div className="rounded-[28px] p-5 flex items-center gap-4 cursor-pointer hover:opacity-95 transition-opacity"
            style={{ background: `linear-gradient(135deg, #0b2240, ${BLAUW})` }}>
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <topActie.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-0.5" style={{ color: "rgba(255,255,255,.55)" }}>
                Actie met meeste impact deze maand
              </p>
              <p className="text-sm font-black text-white">{topActie.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,.6)" }}>{topActie.desc}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 text-white text-sm font-bold">
              {topActie.cta} <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* ── SCORE DETAILS ── */}
      <section data-testid="section-score-details">
        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${BLAUW}15` }}>
              <Info className="w-3.5 h-3.5" style={{ color: BLAUW }} />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Zo is jouw score opgebouwd</h2>
          </div>
          <div className="space-y-3">
            <ScoreBar
              label="Vindbaarheid" score={scores.vindbaarheid} color={BLAUW} icon={Globe}
              href="/tools/website-scan"
              actie={heeftWebsite
                ? `Website ingevuld · Profiel ${profielPct}% compleet · ${100 - profielPct}% te verbeteren`
                : "Geen website ingevuld → vul deze in voor direct scorevoordeel"}
            />
            <ScoreBar
              label="Regelgeving" score={scores.regelgeving} color="#dc2626" icon={Gavel}
              href="/intel"
              actie={urgentSignalen.length > 0
                ? `${urgentSignalen.length} urgente signalen open — check ze om je score te verhogen`
                : "Geen urgente signalen · Je bent up-to-date"}
            />
            <ScoreBar
              label="Kansen" score={scores.kansen} color="#059669" icon={TrendingUp}
              href="/kansen-in-de-buurt"
              actie={`${kansSignalen.length} kansen beschikbaar · Benutte kansen verhogen je score`}
            />
          </div>
        </div>
      </section>

      {/* ── HISTORISCHE TREND (Pro locked) ── */}
      <section data-testid="section-score-history">
        <div className={`${CARD} p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50">
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Score over de afgelopen 6 maanden</h2>
            </div>
            {!isPro && <Badge variant="secondary" className="text-[10px]">Pro</Badge>}
          </div>

          {isPro ? (
            <div className="flex items-end gap-2 h-20">
              {[52, 55, 58, 61, 59, scores.totaal].map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="rounded-lg w-full" style={{ height: `${(s / 100) * 72}px`, background: i === 5 ? BLAUW : "#e4dfd2" }} />
                  <span className="text-[9px] text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-end gap-2 h-20 blur-sm pointer-events-none select-none">
                {[52, 55, 58, 61, 59, scores.totaal].map((s, i) => (
                  <div key={i} className="flex-1 rounded-lg bg-slate-200" style={{ height: `${(s / 100) * 72}px` }} />
                ))}
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Lock className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-semibold text-slate-600">Score-geschiedenis beschikbaar in Pro</p>
                <Link href="/lidmaatschap">
                  <button className="text-xs font-bold px-3 py-1.5 rounded-xl text-white" style={{ background: ORANJE }} data-testid="button-upgrade-pro">
                    Upgrade naar Pro
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── VERBETERPUNTEN ── */}
      <section data-testid="section-score-tips">
        <div className={`${CARD} p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Zo verhoog je jouw score</h2>
          </div>
          <div className="space-y-3">
            {[
              ...(!heeftWebsite ? [{
                icon: Globe, color: BLAUW, bg: "#E6F1FB",
                actie: "Website toevoegen aan profiel",
                impact: "+12 punten",
                href: "/bedrijfsprofiel",
              }] : []),
              ...(profielPct < 100 ? [{
                icon: CheckCircle2, color: "#059669", bg: "#EAF3DE",
                actie: `Profiel aanvullen (${ingevuld}/${velden.length} velden)`,
                impact: `+${Math.round((velden.length - ingevuld) * 2)} punten`,
                href: "/bedrijfsprofiel",
              }] : []),
              ...(urgentSignalen.length > 0 ? [{
                icon: AlertTriangle, color: "#dc2626", bg: "#FCEBEB",
                actie: `${urgentSignalen.length} urgente signalen afhandelen`,
                impact: `+${urgentSignalen.length * 8} punten`,
                href: "/intel",
              }] : []),
              ...(kansSignalen.length > 0 ? [{
                icon: TrendingUp, color: "#d97706", bg: "#FAEEDA",
                actie: `${kansSignalen.length} openstaande kansen bekijken`,
                impact: "+15 punten",
                href: "/kansen-in-de-buurt",
              }] : []),
              {
                icon: Star, color: ORANJE, bg: "#FEF3E9",
                actie: "Pro: volledige score-inzichten + historisch overzicht",
                impact: "Alle details zichtbaar",
                href: "/lidmaatschap",
              },
            ].map(({ icon: Icon, color, bg, actie, impact, href }, i) => (
              <Link href={href} key={i}>
                <div className={`${INNER} flex items-center gap-3 p-4 cursor-pointer hover:border-slate-300 transition-colors`} data-testid={`tip-${i}`}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{actie}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                      {impact}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOLGENDE SCORE ── */}
      <div className={`${INNER} p-4 flex items-center gap-3`} data-testid="section-next-score">
        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Star className="w-4 h-4 text-slate-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-700">Volgende score-update</p>
          <p className="text-xs text-slate-400">Elke 1e van de maand berekenen we jouw nieuwe score automatisch.</p>
        </div>
      </div>

    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MARKETING PAGE — voor niet-ingelogde bezoekers
// ════════════════════════════════════════════════════════════════════════════
const SCAN_MSGS = [
  "Jouw regio in kaart brengen…",
  "Lokale signalen analyseren…",
  "Regelgeving controleren…",
  "Kansen en risico's inventariseren…",
  "Rapport samenstellen…",
];

function computeScore(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return Math.min(95, Math.max(48, 58 + (Math.abs(h) % 28)));
}

const TICKER = [
  "Nieuwe APV-regels terrassen Haarlem per 1 april",
  "Subsidie verduurzaming MKB Noord-Holland — tot €8.000",
  "Aanbesteding gemeente Alkmaar — schoonmaakdiensten",
  "Btw-drempel verhoogd naar €20.000",
  "Omgevingsvergunning Wormer gewijzigd",
  "Hygiëne-eisen horeca aangescherpt landelijk",
];

type WizardStep = "input" | "scanning" | "rapport";

function MarketingPage() {
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
  const [antwoord, setAntwoord] = useState("");
  const [showFull, setShowFull] = useState(false);
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
    scanRef.current = setInterval(() => {
      p += Math.random() * 3 + 1;
      if (p >= 92) p = 92;
      setProgress(Math.round(p));
    }, 80);

    let mi = 0;
    msgRef.current = setInterval(() => {
      mi = (mi + 1) % SCAN_MSGS.length;
      setMsgIdx(mi);
    }, 750);

    try {
      const res = await fetch("/api/regiobot/buurman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beroep: beroep.trim(), stad: stad.trim() }),
      });
      const data = await res.json();
      setAntwoord(data.antwoord || "Analyse voltooid.");
      setScore(computeScore(stad + beroep));
    } catch {
      setAntwoord("Kon geen verbinding maken. Probeer het later opnieuw.");
      setScore(computeScore(stad + beroep));
    } finally {
      if (scanRef.current) clearInterval(scanRef.current);
      if (msgRef.current)  clearInterval(msgRef.current);
      setProgress(100);
      setTimeout(() => setStep("rapport"), 500);
    }
  };

  const resetWizard = () => {
    setStep("input"); setBeroep(""); setStad("");
    setProgress(0); setMsgIdx(0); setAntwoord(""); setShowFull(false);
  };

  const scoreColor = score >= 75 ? "#059669" : score >= 60 ? "#d97706" : "#dc2626";
  const scoreLabel = score >= 75 ? "Goed" : score >= 60 ? "Matig" : "Kwetsbaar";
  const today = new Date().toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,900;1,400&family=DM+Serif+Display&display=swap');
        .serif { font-family: 'DM Serif Display', Georgia, serif; }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:.4} }
        .anim-up { animation: fadeUp .55s ease both; }
        .d1 { animation-delay:.1s } .d2 { animation-delay:.2s }
        .ticker-track { animation: ticker 28s linear infinite; }
        .hover-lift { transition: transform .18s ease, box-shadow .18s ease; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,.1); }
      `}</style>

      {/* ══ NAV ══ */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100" style={{ boxShadow: "0 1px 0 #e8ecf2" }} data-testid="nav-main">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2" data-testid="link-home-logo">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ background: "#1a56db" }}>OR</div>
            <span className="font-black text-slate-900 text-lg tracking-tight">Open<span style={{ color: "#1a56db" }}>Regio</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-0.5 text-sm font-medium text-slate-500">
            {["#probleem","#oplossing","#basischeck","#prijzen"].map((href, i) => (
              <a key={href} href={href} className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-50 transition-colors" data-testid={`link-nav-${["probleem","oplossing","basischeck","prijzen"][i]}`}>
                {["Probleem","Oplossing","Basischeck","Prijzen"][i]}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <button className="hidden sm:block px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors" data-testid="button-nav-login">Inloggen</button>
            </Link>
            <a href="#basischeck" data-testid="button-nav-basischeck">
              <button className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: "#1a56db" }}>
                Check wat je mist
              </button>
            </a>
          </div>
        </div>
      </header>

      {/* ══ TICKER ══ */}
      <div className="overflow-hidden py-2.5" style={{ background: "#0f172a" }} data-testid="ticker-bar">
        <div className="ticker-track flex whitespace-nowrap" style={{ width: "max-content" }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 px-8 text-xs font-medium" style={{ color: "#94a3b8" }}>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1a56db" }} />
              {t}
            </span>
          ))}
        </div>
      </div>

      <main>
        {/* ══ HERO ══ */}
        <section className="py-20 md:py-28 overflow-hidden" style={{ background: "#f8faff" }} data-testid="section-hero">
          <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-14 items-center">
            <div className="anim-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: "rgba(26,86,219,.1)", color: "#1a56db" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#1a56db", animation: "pulse-dot 2s ease-in-out infinite" }} />
                Voor winkels en horecazaken
              </div>
              <h1 className="serif leading-tight mb-5 text-slate-900" style={{ fontSize: "clamp(30px, 4vw, 52px)", lineHeight: 1.1 }} data-testid="text-hero-title">
                Weet jij welke regels er&nbsp;gelden<br />voor <span style={{ color: "#1a56db" }}>jouw zaak?</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed mb-3" style={{ maxWidth: "44ch" }}>
                De meeste winkel- en horecaondernemers niet — totdat de boete al binnen is.
              </p>
              <p className="text-base text-slate-500 leading-relaxed mb-8" style={{ maxWidth: "44ch" }}>
                OpenRegio waarschuwt je <strong className="text-slate-700">vóórdat</strong> het misgaat: nieuwe regels, gewijzigde vergunningen, gemeentebrieven in gewone taal.
              </p>
              <div className="flex flex-wrap gap-3 mb-7">
                <a href="#basischeck">
                  <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "#1a56db" }} data-testid="button-hero-cta">
                    Check wat jij nu mist <ArrowRight className="w-4 h-4" />
                  </button>
                </a>
                <a href="#oplossing">
                  <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-white transition-colors" data-testid="button-hero-hoe">
                    Hoe werkt het?
                  </button>
                </a>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                De Basischeck is altijd gratis — geen account nodig
              </p>
            </div>
            <div className="relative anim-up d2">
              <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(0,0,0,.14)" }}>
                <img src={groepImg} alt="Ondernemers met OpenRegio" className="w-full object-cover" style={{ height: "380px", objectPosition: "center top" }} data-testid="img-hero" />
              </div>
              <div className="absolute -left-5 bottom-16 bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3" style={{ boxShadow: "0 8px 32px rgba(0,0,0,.13)", maxWidth: "220px" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fef2f2" }}>
                  <AlertTriangle className="w-4 h-4" style={{ color: "#dc2626" }} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 leading-tight">Nieuw signaal</p>
                  <p className="text-xs text-slate-400 mt-0.5">Terrasregel gewijzigd</p>
                </div>
              </div>
              <div className="absolute -right-4 top-10 bg-white rounded-2xl px-4 py-3 text-center" style={{ boxShadow: "0 8px 32px rgba(0,0,0,.12)" }}>
                <p className="text-2xl font-black" style={{ color: "#059669" }}>€ 0</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">boetes dit jaar</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ SOCIAL PROOF ══ */}
        <div className="border-y border-slate-100 py-5" data-testid="section-social-proof">
          <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-center gap-x-12 gap-y-3">
            {[
              { n: "2.400+", l: "Ondernemers actief" },
              { n: "€19/mnd", l: "Startprijs — geen jaarcontract" },
              { n: "20%", l: "Affiliate op elke doorverwijzing" },
              { n: "Dagelijks", l: "Signalen bijgewerkt" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-xl font-black text-slate-900">{n}</div>
                <div className="text-xs text-slate-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ PROBLEEM ══ */}
        <section id="probleem" className="py-24" data-testid="section-probleem">
          <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-14 items-center">
            <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,.1)" }}>
              <img src={regelgevingImg} alt="Regelgeving voor ondernemers" className="w-full object-cover" style={{ height: "420px" }} loading="lazy" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Herkenbaar?</span>
              <h2 className="serif mt-3 mb-6 text-slate-900" style={{ fontSize: "clamp(24px, 3vw, 38px)", lineHeight: 1.2 }} data-testid="text-probleem-title">
                Een brief van de gemeente.<br />Je begrijpt hem niet.
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Een terrasvergunning die stilletjes gewijzigd is. Een hygiëne-eis die je niet kende. Een milieuzone die ook voor jouw bestelbus geldt. Kleine winkels en horecazaken worden dagelijks verrast door regels die ze nooit hebben zien aankomen.
              </p>
              <div className="space-y-4">
                {[
                  { icon: AlertTriangle, color: "#dc2626", bg: "#fef2f2", text: "Regelgeving verandert vaker dan je denkt — je mist het omdat niemand het je vertelt" },
                  { icon: FileText,      color: "#d97706", bg: "#fffbeb", text: "Overheidsbrieven zijn geschreven door juristen, niet voor ondernemers" },
                  { icon: Eye,           color: "#7c3aed", bg: "#f5f3ff", text: "Tegen de tijd dat je het ontdekt, is de boete of sluiting al een feit" },
                ].map(({ icon: Icon, color, bg, text }, i) => (
                  <div key={i} className="flex items-start gap-4 rounded-2xl p-4" style={{ background: bg }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "white" }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed pt-1.5">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ BANNER ══ */}
        <div className="relative overflow-hidden" style={{ height: "280px" }} data-testid="banner-winkelstraat">
          <img src={winkelstraatImg} alt="Nederlandse winkelstraat" className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(10,20,60,.6)" }}>
            <div className="text-center text-white px-6">
              <p className="serif text-3xl md:text-4xl mb-3" style={{ lineHeight: 1.2 }}>
                "Stop met missen wat de gemeente al weet."
              </p>
              <p className="text-base" style={{ color: "rgba(255,255,255,.65)" }}>OpenRegio vertaalt overheidsinformatie naar actie voor jouw zaak</p>
            </div>
          </div>
        </div>

        {/* ══ OPLOSSING ══ */}
        <section id="oplossing" className="py-24" style={{ background: "#f8faff" }} data-testid="section-oplossing">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Wat OpenRegio doet</span>
              <h2 className="serif mt-3 text-slate-900" style={{ fontSize: "clamp(24px, 3vw, 38px)" }} data-testid="text-oplossing-title">
                Eén platform. Drie beschermingen.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: "01", icon: AlertTriangle, color: "#dc2626", bg: "#fef2f2", title: "Waarschuwingen vóórdat het misgaat", desc: "Je krijgt een melding zodra er iets verandert dat jouw type zaak raakt — terrasregels, hygiëne-eisen, vergunningen. Vóór de controle, niet erna." },
                { num: "02", icon: FileText, color: "#1a56db", bg: "#eff6ff", title: "Begrijp elke brief van de gemeente", desc: "Upload een gemeentebrief. RegioBot legt uit wat er staat, wat je moet doen, en welke deadline er geldt. In gewone taal." },
                { num: "03", icon: Eye, color: "#059669", bg: "#f0fdf4", title: "Zie hoe jouw zaak gevonden wordt", desc: "Automatische scan van je online aanwezigheid: Google-profiel, openingstijden, beoordelingen. Wat mist er, en wat kost je dat aan klanten?" },
              ].map(({ num, icon: Icon, color, bg, title, desc }) => (
                <div key={num} className="bg-white rounded-3xl p-7 border border-slate-100 hover-lift" style={{ boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: bg }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <span className="text-xs font-black text-slate-200">{num}</span>
                  </div>
                  <h3 className="font-black text-slate-900 mb-3" style={{ fontSize: "15px", lineHeight: 1.35 }}>{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BASISCHECK WIZARD ══ */}
        <section id="basischeck" style={{ background: step === "rapport" ? "#f8faff" : "#0f172a" }} data-testid="section-basischeck">
          {step === "input" && (
            <div className="py-24 px-5">
              <div className="max-w-xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.7)" }}>
                  <Sparkles className="w-3.5 h-3.5" /> Gratis Basischeck
                </div>
                <h2 className="serif text-white mb-3" style={{ fontSize: "clamp(26px, 3.5vw, 44px)", lineHeight: 1.15 }} data-testid="text-basischeck-title">
                  Check nu wat jij<br />nu mist.
                </h2>
                <p className="mb-10 text-base" style={{ color: "rgba(255,255,255,.55)" }}>
                  Vul je beroep en stad in. Binnen 30 seconden een concreet rapport.
                </p>
                <div className="space-y-3 text-left mb-5">
                  <input type="text" placeholder="Je beroep (bijv. café, kapper, slager, boekwinkel)" value={beroep} onChange={e => setBeroep(e.target.value)} data-testid="input-beroep"
                    className="w-full px-5 py-4 rounded-2xl text-slate-900 text-sm font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,.18)" }} />
                  <input type="text" placeholder="Je stad of gemeente" value={stad} onChange={e => setStad(e.target.value)} onKeyDown={e => e.key === "Enter" && startScan()} data-testid="input-stad"
                    className="w-full px-5 py-4 rounded-2xl text-slate-900 text-sm font-medium placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ background: "#fff", border: "none", boxShadow: "0 2px 16px rgba(0,0,0,.18)" }} />
                </div>
                <button onClick={startScan} disabled={!beroep.trim() || !stad.trim()} data-testid="button-start-scan"
                  className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-30"
                  style={{ background: "#1a56db", color: "#fff" }}>
                  Start de analyse <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,.3)" }}>Geen account nodig · Geen creditcard · Geen verplichtingen</p>
              </div>
            </div>
          )}

          {step === "scanning" && (
            <div className="py-24 px-5 flex items-center justify-center min-h-80" data-testid="section-scanning">
              <div className="max-w-sm mx-auto text-center w-full">
                <div className="w-20 h-20 rounded-full mx-auto mb-8 flex items-center justify-center relative" style={{ background: "rgba(255,255,255,.08)" }}>
                  <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(26,86,219,.25)" }} />
                  <Sparkles className="w-9 h-9 text-white" />
                </div>
                <p key={msgIdx} className="font-bold text-white text-lg mb-2" style={{ animation: "fadeUp .4s ease both" }} data-testid="text-scan-msg">{SCAN_MSGS[msgIdx]}</p>
                <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,.4)" }}>{beroep} · {stad}</p>
                <div className="rounded-full h-1.5 mb-2 overflow-hidden" style={{ background: "rgba(255,255,255,.1)" }}>
                  <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #1a56db, #06b6d4)" }} data-testid="progress-bar" />
                </div>
                <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,.35)" }}>{progress}%</p>
              </div>
            </div>
          )}

          {step === "rapport" && (
            <div className="py-16 px-5" data-testid="section-rapport">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl overflow-hidden mb-5" style={{ boxShadow: "0 4px 32px rgba(0,0,0,.09)" }}>
                  <div className="px-7 py-6 flex flex-wrap items-start justify-between gap-4" style={{ background: "#0f172a" }}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 opacity-40 text-white" />
                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,.4)" }}>Regio Rapport</span>
                      </div>
                      <h3 className="font-black text-white text-xl" data-testid="text-rapport-heading">{beroep} · {stad}</h3>
                      <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,.35)" }}>{today}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4" style={{ borderColor: scoreColor, background: `${scoreColor}20` }}>
                        <span className="font-black text-white" style={{ fontSize: "30px", lineHeight: 1 }} data-testid="text-rapport-score">{score}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,.4)" }}>/100</span>
                      </div>
                      <span className="text-xs font-black mt-2 px-3 py-0.5 rounded-full" style={{ background: `${scoreColor}25`, color: scoreColor }} data-testid="text-rapport-label">{scoreLabel}</span>
                    </div>
                  </div>
                  <div className="px-7 py-10 text-center border-t border-slate-100" data-testid="section-login-prompt">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#eff6ff" }}>
                      <Lock className="w-6 h-6" style={{ color: "#1a56db" }} />
                    </div>
                    <p className="font-black text-slate-900 text-lg mb-1">Log in om je volledige rapport te zien</p>
                    <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">Je analyse staat klaar. Maak een gratis account aan of log in.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
                      <Link href="/register"><button className="px-6 py-3 rounded-xl text-sm font-black text-white" style={{ background: "#1a56db" }} data-testid="button-rapport-register">Account aanmaken</button></Link>
                      <Link href="/login"><button className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors" data-testid="button-rapport-login">Inloggen</button></Link>
                    </div>
                    <button onClick={resetWizard} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mx-auto" data-testid="button-rapport-opnieuw">
                      <RotateCcw className="w-3.5 h-3.5" /> Doe de check opnieuw
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ══ HOE HET WERKT ══ */}
        <section className="py-24 bg-white border-t border-slate-100" data-testid="section-hoe-werkt">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>In vier stappen</span>
              <h2 className="serif mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.8vw, 36px)" }}>Zo werkt OpenRegio</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { n: "1", title: "Start de Basischeck", desc: "Vul je beroep en stad in. Geen account nodig. In 30 seconden zie je wat je mist." },
                { n: "2", title: "Ontvang signalen", desc: "Zodra een regel verandert die jou raakt, krijg je een melding. Vóór de gemeentebrief." },
                { n: "3", title: "Begrijp elke brief", desc: "Upload gemeentebrieven. RegioBot legt uit wat je moet doen — in gewone taal." },
                { n: "4", title: "Verdien terug", desc: "Vertel het door. Voor elke ondernemer die jij aanmeldt ontvang je 20% recurring commissie." },
              ].map(({ n, title, desc }) => (
                <div key={n} className="bg-white rounded-2xl p-6 border border-slate-100 hover-lift" style={{ boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 font-black text-sm text-white" style={{ background: "#1a56db" }}>{n}</div>
                  <h3 className="font-black text-slate-900 mb-2" style={{ fontSize: "14px" }}>{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ VOOR WIE ══ */}
        <section className="py-24" style={{ background: "#f8faff" }} data-testid="section-voor-wie">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-14 items-center mb-16">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Voor wie</span>
                <h2 className="serif mt-3 mb-5 text-slate-900" style={{ fontSize: "clamp(22px, 2.8vw, 36px)" }}>
                  Gemaakt voor winkels<br />en horecazaken.
                </h2>
                <p className="text-slate-500 leading-relaxed mb-7">
                  Jij hebt geen tijd om elk overheidsbericht bij te houden. Je hebt een zaak te runnen. OpenRegio doet het uitzoekwerk voor je — en waarschuwt je alleen als er iets is dat écht actie vereist.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Winkeleigenaar", sub: "Retail & detailhandel", letter: "W" },
                    { label: "Horeca", sub: "Café, restaurant, bar", letter: "H" },
                    { label: "Persoonlijke zorg", sub: "Kapper, schoonheid", letter: "P" },
                    { label: "Vakman", sub: "Installatie, bouw", letter: "V" },
                  ].map(({ label, sub, letter }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: "#1a56db" }}>{letter}</div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{label}</p>
                        <p className="text-xs text-slate-400">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 16px 48px rgba(0,0,0,.1)" }}>
                <img src={luchtfotoImg} alt="Nederlandse regio" className="w-full object-cover" style={{ height: "400px" }} loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section className="py-24 bg-white border-t border-slate-100" data-testid="section-testimonials">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Ervaringen</span>
              <h2 className="serif mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.8vw, 36px)" }}>Wat ondernemers zeggen</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: "Marco Verhoeven", role: "Cafébeheerder, Haarlem", avatar: "MV", color: "#1a56db", quote: "De terrasvergunning van mijn buurman was verlopen en hij wist het niet. Dankzij OpenRegio wist ik het wél — van mijzelf. Dat bespaarde me een boete van €1.200." },
                { name: "Lena Brouwer", role: "Kapper, Alkmaar", avatar: "LB", color: "#059669", quote: "Ik kreeg een brief over nieuwe hygiëne-eisen. Ik snapte er niks van. RegioBot legde in drie zinnen uit wat ik moest doen. Geweldig." },
                { name: "David Pieters", role: "Slager, Zaandam", avatar: "DP", color: "#7c3aed", quote: "Voor €19 per maand weet ik zeker dat ik niks mis. Dat is minder dan één boete. De rekensommetje is makkelijk." },
              ].map(({ name, role, avatar, color, quote }) => (
                <div key={name} className="bg-white rounded-3xl p-7 border border-slate-100 hover-lift" style={{ boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4" fill="#f59e0b" style={{ color: "#f59e0b" }} />)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">"{quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: color }}>{avatar}</div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{name}</p>
                      <p className="text-xs text-slate-400">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ AFFILIATE ══ */}
        <section className="py-24" style={{ background: "#0f172a" }} data-testid="section-affiliate">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Affiliate programma</span>
            <h2 className="serif mt-3 mb-4 text-white" style={{ fontSize: "clamp(24px, 3vw, 40px)" }}>Vertel het door.<br />Verdien mee.</h2>
            <p className="mb-12" style={{ color: "rgba(255,255,255,.55)", fontSize: "16px", maxWidth: "40ch", margin: "0 auto 3rem" }}>
              Ken jij andere winkel- of horecaondernemers? Voor elke klant die jij aanmeldt ontvang je 20% terugkerende commissie — elke maand opnieuw.
            </p>
            <div className="grid sm:grid-cols-3 gap-5 mb-10">
              {[
                { num: "€3,80", label: "Per Basis-klant per maand", sub: "20% van €19" },
                { num: "€11,80", label: "Per Pro-klant per maand", sub: "20% van €59" },
                { num: "5 klanten", label: "= Jouw abonnement terug", sub: "Basis-plan volledig terugverdiend" },
              ].map(({ num, label, sub }) => (
                <div key={label} className="rounded-2xl p-6 text-center" style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}>
                  <div className="text-2xl font-black text-white mb-1">{num}</div>
                  <div className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,.7)" }}>{label}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,.35)" }}>{sub}</div>
                </div>
              ))}
            </div>
            <Link href="/register">
              <button className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity" style={{ background: "#1a56db", color: "#fff" }} data-testid="button-affiliate-register">
                Word lid en start met verdienen <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>

        {/* ══ PRIJZEN ══ */}
        <section id="prijzen" className="py-24 bg-white" data-testid="section-prijzen">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Transparante prijzen</span>
              <h2 className="serif mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.8vw, 36px)" }} data-testid="text-prijzen-title">Kies jouw plan</h2>
              <p className="text-slate-400 mt-2 text-sm">Maandelijks opzegbaar. Geen verborgen kosten.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-white rounded-3xl p-8 border border-slate-100" style={{ boxShadow: "0 2px 12px rgba(0,0,0,.05)" }} data-testid="card-plan-basis">
                <h3 className="font-black text-slate-900 text-xl mb-1">Basis-lid</h3>
                <p className="text-slate-400 text-xs mb-6">Volwaardig lid van OpenRegio</p>
                <div className="mb-7" style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1.5px", color: "#0f172a" }}>
                  €19 <span className="text-slate-400 font-medium" style={{ fontSize: "14px" }}>excl. btw / maand</span>
                </div>
                <a href={MOLLIE_BASIS} target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-xl text-center text-sm font-bold mb-7 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors" style={{ color: "#1a56db" }} data-testid="button-kies-basis">
                  Kies Basis-lid
                </a>
                <ul className="space-y-3">
                  {[[true,"Regelgeving-signalen voor jouw branche"],[true,"Brief-analyse via RegioBot"],[true,"Basischeck onbeperkt"],[true,"20% affiliate commissie"],[false,"Volledige WOO-bibliotheek"],[false,"Prioriteit ondersteuning"]].map(([inc, txt], i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 ${inc ? "" : "opacity-20"}`} style={{ color: inc ? "#1a56db" : "#94a3b8" }} />
                      <span className={`text-sm ${inc ? "text-slate-600" : "text-slate-300 line-through"}`}>{txt as string}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-3xl p-8 relative" style={{ border: "2px solid #1a56db", boxShadow: "0 8px 40px rgba(26,86,219,.18)" }} data-testid="card-plan-pro">
                <div className="absolute -top-3.5 left-8 px-3 py-1 rounded-full text-xs font-black text-white" style={{ background: "#1a56db" }}>Meest gekozen</div>
                <h3 className="font-black text-slate-900 text-xl mb-1">Pro-bijdrager</h3>
                <p className="text-slate-400 text-xs mb-6">Krachtige tools voor serieuze ondernemers</p>
                <div className="mb-7" style={{ fontSize: "38px", fontWeight: 900, letterSpacing: "-1.5px", color: "#0f172a" }}>
                  €59 <span className="text-slate-400 font-medium" style={{ fontSize: "14px" }}>excl. btw / maand</span>
                </div>
                <a href={MOLLIE_PRO} target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-xl text-center text-sm font-black mb-7 text-white hover:opacity-90 transition-opacity" style={{ background: "#1a56db" }} data-testid="button-kies-pro">
                  Kies Pro-bijdrager
                </a>
                <ul className="space-y-3">
                  {["Alles van Basis-lid","Onbeperkte RegioBot AI","Volledige WOO-bibliotheek","Printbare rapporten & PDF-export","20% affiliate = €11,80/klant/mnd","Prioriteit ondersteuning"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1a56db" }} />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-center mt-8 text-sm text-slate-400">
              Twijfel je nog?{" "}
              <a href="#basischeck" className="font-bold underline" style={{ color: "#1a56db" }}>Start de gratis Basischeck</a>{" "}
              en zie direct wat je mist.
            </p>
          </div>
        </section>

        {/* ══ FAQ ══ */}
        <section className="py-24 border-t border-slate-100" style={{ background: "#f8faff" }} data-testid="section-faq">
          <div className="max-w-2xl mx-auto px-5">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1a56db" }}>Vragen</span>
              <h2 className="serif mt-3 text-slate-900" style={{ fontSize: "clamp(22px, 2.6vw, 34px)" }}>Veelgestelde vragen</h2>
            </div>
            <div className="space-y-2">
              {[
                { q: "Is de Basischeck echt gratis?", a: "Ja, de Basischeck is altijd gratis — geen account nodig, geen creditcard. Je vult beroep en stad in en krijgt binnen 30 seconden een rapport. Een lidmaatschap begint pas bij €19/maand." },
                { q: "Wat is het verschil tussen Basis en Pro?", a: "Basis is voor ondernemers die doorlopend gewaarschuwd willen worden over regelgeving en brieven kunnen uploaden. Pro is voor wie ook de volledige WOO-bibliotheek, uitgebreide analyses en prioriteitsondersteuning wil." },
                { q: "Hoe werkt het affiliate-programma?", a: "Voor elke ondernemer die jij aanmeldt via jouw persoonlijke link ontvang je 20% van hun maandelijkse abonnement — elke maand opnieuw, zo lang zij lid blijven." },
                { q: "Is dit juridisch advies?", a: "Nee. OpenRegio helpt je signaleren, brieven begrijpen en actie ondernemen. Voor juridisch advies verwijzen we je door naar een specialist." },
                { q: "Kan ik opzeggen wanneer ik wil?", a: "Ja. Maandelijks opzegbaar, geen bindende termijn, geen opzeggingskosten. Je behoudt toegang tot het einde van je betaalde periode." },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 overflow-hidden bg-white" data-testid={`faq-item-${i}`}>
                  <button className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)} data-testid={`faq-toggle-${i}`}>
                    <span className="font-black text-slate-800 text-sm pr-4">{item.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-slate-400" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />}
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 border-t border-slate-50" data-testid={`faq-answer-${i}`}>
                      <p className="text-slate-500 text-sm leading-relaxed pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ EIND-CTA ══ */}
        <section className="py-28 relative overflow-hidden" style={{ background: "#0f172a" }} data-testid="section-cta">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${winkelstraatImg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="relative max-w-2xl mx-auto px-5 text-center">
            <h2 className="serif text-white mb-4" style={{ fontSize: "clamp(26px, 3.5vw, 46px)", lineHeight: 1.15 }}>
              Wacht niet tot de<br />boete al binnen is.
            </h2>
            <p className="mb-10 text-lg" style={{ color: "rgba(255,255,255,.55)", maxWidth: "38ch", margin: "0 auto 2.5rem" }}>
              Check nu gratis wat jij mist — in 30 seconden.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#basischeck" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-opacity" style={{ background: "#1a56db", color: "#fff" }} data-testid="button-cta-basischeck">
                Start de gratis Basischeck <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold text-sm border transition-colors" style={{ borderColor: "rgba(255,255,255,.25)", color: "rgba(255,255,255,.8)" }} data-testid="button-cta-register">
                Direct aanmelden
              </Link>
            </div>
            <div className="mt-10 pt-7 flex flex-wrap justify-center gap-6 border-t text-sm" style={{ borderColor: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.35)" }}>
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Nederland</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> info@openregio.nl</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 2.400+ leden</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-slate-100 bg-white" data-testid="footer-main">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-black text-xs" style={{ background: "#1a56db" }}>OR</div>
            <span className="text-sm text-slate-400">Grip op regelgeving voor lokale ondernemers</span>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-slate-400">
            {[["#basischeck","Basischeck"],["#prijzen","Prijzen"],["#probleem","Over ons"]].map(([h,l]) => (
              <a key={h} href={h} className="hover:text-slate-700 transition-colors">{l}</a>
            ))}
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <Link href="/voorwaarden" className="hover:text-slate-700 transition-colors">Voorwaarden</Link>
          </nav>
          <div className="text-xs text-slate-300">© {new Date().getFullYear()} OpenRegio</div>
        </div>
      </footer>

      {showCookie && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white" style={{ boxShadow: "0 -4px 24px rgba(0,0,0,.08)" }} data-testid="banner-cookie">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500" style={{ maxWidth: "520px" }}>
              Wij gebruiken cookies om je ervaring te verbeteren. Lees ons{" "}
              <Link href="/cookiebeleid" className="underline text-slate-700">cookiebeleid</Link>.
            </p>
            <div className="flex gap-2">
              <button onClick={() => acceptCookie(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors" data-testid="button-cookie-weigeren">Weigeren</button>
              <button onClick={() => acceptCookie(true)} className="px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity" style={{ background: "#1a56db" }} data-testid="button-cookie-accepteren">Accepteren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SMART ROUTER — ingelogd = dashboard, uitgelogd = marketing
// ════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  usePageTitle("OpenRegio — grip op regelgeving voor winkel & horeca");
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-4 pb-8 p-6">
        <Skeleton className="h-48 w-full rounded-[28px]" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-[28px]" />)}
        </div>
      </div>
    );
  }

  return isAuthenticated ? <OndernemerscorePage /> : <MarketingPage />;
}
