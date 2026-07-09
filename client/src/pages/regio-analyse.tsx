import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, BarChart3, AlertTriangle, TrendingUp, RotateCcw, MapPin, Eye, Users, Shield, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "openregio_regioanalyse_v1";
const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

type SavedState = {
  answers: (number | null)[];
  currentQ: number;
  step: "intro" | "scan" | "result";
  savedAt: number;
};

function loadSaved(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (Date.now() - parsed.savedAt > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveState(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const QUESTIONS = [
  {
    domain: "zichtbaarheid",
    domainLabel: "Zichtbaarheid",
    question: "Sta je correct op Google/Maps met consistente NAW-gegevens?",
    tooltip: "NAW = Naam, Adres, Woonplaats. Consistent betekent: overal hetzelfde.",
    inverted: false,
  },
  {
    domain: "zichtbaarheid",
    domainLabel: "Zichtbaarheid",
    question: "Kom je naar voren bij zoekopdrachten als \"regio + jouw dienst\"?",
    tooltip: "Bijvoorbeeld: 'loodgieter Achterhoek' of 'bakker Veluwe'.",
    inverted: false,
  },
  {
    domain: "netwerk",
    domainLabel: "Netwerk & doorverwijzing",
    question: "Krijg je structureel werk via andere ondernemers in je regio?",
    tooltip: "Niet incidenteel, maar regelmatig doorverwijzingen.",
    inverted: false,
  },
  {
    domain: "netwerk",
    domainLabel: "Netwerk & doorverwijzing",
    question: "Verwijs jij zelf structureel werk door naar andere lokale ondernemers?",
    tooltip: "Actief doorverwijzen als je iets niet zelf doet.",
    inverted: false,
  },
  {
    domain: "instroom",
    domainLabel: "Afhankelijkheid & instroom",
    question: "Komt meer dan 50% van je leads via één kanaal of platform?",
    tooltip: "Bijvoorbeeld: alleen via Google, alleen via een marktplaats, of alleen via één opdrachtgever.",
    inverted: true,
  },
  {
    domain: "instroom",
    domainLabel: "Afhankelijkheid & instroom",
    question: "Heb je een eigen vaste instroom van klanten, partners of herhaalwerk?",
    tooltip: "Klanten die terugkomen, vaste samenwerkingen, abonnementen.",
    inverted: false,
  },
  {
    domain: "basis",
    domainLabel: "Back to Basic / continuïteit",
    question: "Kun je doordraaien bij een digitale storing? (bereikbaarheid, betaling, planning)",
    tooltip: "Stel: internet valt uit, pin doet het niet, je agenda is offline.",
    inverted: false,
  },
  {
    domain: "basis",
    domainLabel: "Back to Basic / continuïteit",
    question: "Heb je je basis juridisch en administratief op orde? (factuur, KvK, btw, voorwaarden)",
    tooltip: "Denk aan: correcte facturen, inschrijving KvK, algemene voorwaarden.",
    inverted: false,
  },
];

const ANSWER_OPTIONS = [
  { label: "Ja", value: 2, color: "#22c55e" },
  { label: "Soms", value: 1, color: "#f28a1a" },
  { label: "Nee", value: 0, color: "#ef4444" },
];

type DomainKey = "zichtbaarheid" | "netwerk" | "instroom" | "basis";

interface DomainResult {
  key: DomainKey;
  label: string;
  score: number;
  max: number;
  percentage: number;
}

interface BlockerOrLeverage {
  domain: DomainKey;
  label: string;
  message: string;
  action: string;
  pillar: string;
  pillarIcon: typeof Eye;
}

const DOMAIN_CONFIG: Record<DomainKey, { label: string; pillar: string; pillarIcon: typeof Eye }> = {
  zichtbaarheid: { label: "Zichtbaarheid", pillar: "Zichtbaarheid", pillarIcon: Eye },
  netwerk: { label: "Netwerk & doorverwijzing", pillar: "RegioMarkt", pillarIcon: Users },
  instroom: { label: "Afhankelijkheid & instroom", pillar: "RegioMarkt", pillarIcon: MapPin },
  basis: { label: "Back to Basic", pillar: "Back to Basic", pillarIcon: Shield },
};

const BLOCKER_MESSAGES: Record<DomainKey, { message: string; action: string }> = {
  zichtbaarheid: {
    message: "Je bent onvoldoende vindbaar in je regio. Klanten en ondernemers vinden je niet.",
    action: "Zorg dat je NAW-gegevens overal consistent zijn en optimaliseer voor regionale zoekopdrachten.",
  },
  netwerk: {
    message: "Geen structurele doorverwijzing. Werk lekt weg uit je regio.",
    action: "Bouw vaste doorverwijsafspraken op met ondernemers in je regio.",
  },
  instroom: {
    message: "Te afhankelijk van één kanaal. Je instroom is fragiel.",
    action: "Diversifieer je leadbronnen en bouw aan eigen vaste klantrelaties.",
  },
  basis: {
    message: "Geen fallback bij uitval. Paniek als systemen wegvallen.",
    action: "Richt een offline werkwijze in voor bereikbaarheid, betaling en planning.",
  },
};

const LEVERAGE_MESSAGES: Record<DomainKey, { message: string; action: string }> = {
  zichtbaarheid: {
    message: "Je zichtbaarheid is sterk. Dit is je hefboom om regionaal op te schalen.",
    action: "Gebruik je vindbaarheid als basis voor regionale samenwerkingsstructuur.",
  },
  netwerk: {
    message: "Je netwerk is actief. Doorverwijzingen leveren direct omzet op.",
    action: "Formaliseer je doorverwijsafspraken voor structureel resultaat.",
  },
  instroom: {
    message: "Je instroom is stabiel en divers. Dat geeft je onderhandelingskracht.",
    action: "Gebruik je stabiele basis om nieuwe samenwerkingen aan te gaan.",
  },
  basis: {
    message: "Je basis staat. Je kunt doordraaien als anderen vastlopen.",
    action: "Bied je betrouwbaarheid aan als waarde in samenwerkingen.",
  },
};

function calculateResults(answers: (number | null)[]) {
  const domains: Record<DomainKey, number[]> = {
    zichtbaarheid: [],
    netwerk: [],
    instroom: [],
    basis: [],
  };

  QUESTIONS.forEach((q, i) => {
    const val = answers[i];
    if (val === null) return;
    const score = q.inverted ? (2 - val) : val;
    domains[q.domain as DomainKey].push(score);
  });

  const domainResults: DomainResult[] = (Object.keys(domains) as DomainKey[]).map((key) => {
    const scores = domains[key];
    const total = scores.reduce((a, b) => a + b, 0);
    const max = scores.length * 2;
    return {
      key,
      label: DOMAIN_CONFIG[key].label,
      score: total,
      max,
      percentage: max > 0 ? Math.round((total / max) * 100) : 0,
    };
  });

  const totalScore = domainResults.reduce((a, d) => a + d.score, 0);
  const totalMax = domainResults.reduce((a, d) => a + d.max, 0);
  const overallScore = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

  const sorted = [...domainResults].sort((a, b) => a.percentage - b.percentage);

  const blockers: BlockerOrLeverage[] = sorted
    .filter((d) => d.percentage < 75)
    .slice(0, 3)
    .map((d) => ({
      domain: d.key,
      label: d.label,
      ...BLOCKER_MESSAGES[d.key],
      pillar: DOMAIN_CONFIG[d.key].pillar,
      pillarIcon: DOMAIN_CONFIG[d.key].pillarIcon,
    }));

  const leverage: BlockerOrLeverage[] = [...domainResults]
    .sort((a, b) => b.percentage - a.percentage)
    .filter((d) => d.percentage >= 50)
    .slice(0, 2)
    .map((d) => ({
      domain: d.key,
      label: d.label,
      ...LEVERAGE_MESSAGES[d.key],
      pillar: DOMAIN_CONFIG[d.key].pillar,
      pillarIcon: DOMAIN_CONFIG[d.key].pillarIcon,
    }));

  return { overallScore, domainResults, blockers, leverage };
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f28a1a" : "#ef4444";

  return (
    <div className="relative w-[140px] h-[140px] mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e6ebf2" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-black text-3xl" style={{ color }} data-testid="text-score-value">{score}</span>
        <span className="text-xs" style={{ color: "#5b677a" }}>van 100</span>
      </div>
    </div>
  );
}

export default function RegioAnalysePage() {
  const [step, setStep] = useState<"intro" | "scan" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setAnswers(saved.answers);
      setCurrentQ(saved.currentQ);
      setStep(saved.step);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState({ answers, currentQ, step, savedAt: Date.now() });
  }, [answers, currentQ, step, loaded]);

  const handleAnswer = (value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = value;
      return next;
    });
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentQ((q) => Math.min(q + 1, QUESTIONS.length - 1));
      }, 250);
    }
  };

  const allAnswered = answers.every((a) => a !== null);
  const results = allAnswered ? calculateResults(answers) : null;

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const restart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStep("intro");
    setCurrentQ(0);
    setAnswers(Array(QUESTIONS.length).fill(null));
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "OpenRegio Regio-analyse", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen" style={{ background: "#f5f7fb", color: "#0f172a" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ background: "rgba(255,255,255,.92)", borderColor: "#e6ebf2" }}>
        <div className="max-w-[1120px] mx-auto px-4 h-16 flex items-center justify-between gap-2 flex-wrap">
          <Link href="/" className="font-black text-lg" style={{ color: "#0b2240" }} data-testid="link-home-logo">
            OpenRegio
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Terug naar home
            </Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-4 py-10">
        {step === "intro" && (
          <div className="text-center" data-testid="section-intro">
            <div
              className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(31,95,174,.10)", color: "#0b2240", border: "1px solid rgba(31,95,174,.18)" }}
            >
              <BarChart3 className="w-8 h-8" />
            </div>
            <h1 className="font-black text-3xl mb-2" style={{ letterSpacing: "-0.4px" }} data-testid="text-intro-title">
              Regio-analyse
            </h1>
            <p className="mb-1" style={{ color: "#5b677a", fontSize: "17px", maxWidth: "52ch", margin: "0 auto 6px" }} data-testid="text-intro-subtitle">
              Korte scan: wat blokkeert groei, waar zit je leverage.
            </p>
            <p style={{ color: "#8896a8", fontSize: "14px", marginBottom: "24px" }}>
              8 vragen &middot; &plusmn; 3 minuten &middot; direct resultaat
            </p>

            <button
              onClick={() => setStep("scan")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-black text-white text-base"
              style={{ background: "#0b2240", boxShadow: "0 14px 40px rgba(31,95,174,.25)" }}
              data-testid="button-start-scan"
            >
              Start scan <ArrowRight className="w-4 h-4" />
            </button>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: Eye, label: "Zichtbaarheid", hint: "Ben je vindbaar?" },
                { icon: Users, label: "Netwerk", hint: "Krijg je doorverwijzingen?" },
                { icon: MapPin, label: "Instroom", hint: "Hoe divers zijn je leads?" },
                { icon: Shield, label: "Basis", hint: "Kun je offline doordraaien?" },
              ].map((d, i) => (
                <div
                  key={i}
                  className="rounded-[14px] p-3 text-left"
                  style={{ background: "#fff", border: "1px solid #e6ebf2", boxShadow: "0 4px 12px rgba(15,23,42,.04)" }}
                  data-testid={`card-domain-${i}`}
                >
                  <d.icon className="w-5 h-5 mb-1.5" style={{ color: "#0b2240" }} />
                  <div className="font-bold text-sm">{d.label}</div>
                  <div style={{ color: "#8896a8", fontSize: "12px" }}>{d.hint}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "scan" && (
          <div data-testid="section-scan">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold" style={{ color: "#5b677a" }}>
                  Vraag {currentQ + 1} van {QUESTIONS.length}
                </span>
                <span className="text-xs" style={{ color: "#8896a8" }}>
                  {question.domainLabel}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "#e6ebf2" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progress}%`, background: "#0b2240", transition: "width 0.3s ease" }}
                  data-testid="progress-bar"
                />
              </div>
            </div>

            <div
              className="rounded-[22px] p-6"
              style={{ background: "#fff", border: "1px solid #e6ebf2", boxShadow: "0 8px 22px rgba(15,23,42,.06)" }}
              data-testid="card-question"
            >
              <h2 className="font-bold text-xl mb-2" data-testid="text-question">
                {question.question}
              </h2>
              <p className="mb-5" style={{ color: "#8896a8", fontSize: "13px" }} data-testid="text-question-tooltip">
                {question.tooltip}
              </p>

              <div className="grid grid-cols-3 gap-3">
                {ANSWER_OPTIONS.map((opt) => {
                  const isSelected = answers[currentQ] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="rounded-[14px] py-4 font-bold text-base"
                      style={{
                        background: isSelected ? opt.color : "#f5f7fb",
                        color: isSelected ? "#fff" : "#0f172a",
                        border: `2px solid ${isSelected ? opt.color : "#e6ebf2"}`,
                        transition: "all 0.15s ease",
                      }}
                      data-testid={`button-answer-${opt.label.toLowerCase()}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
              <button
                onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
                disabled={currentQ === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-sm"
                style={{
                  background: currentQ === 0 ? "#e6ebf2" : "#fff",
                  color: currentQ === 0 ? "#a0aec0" : "#0f172a",
                  border: "1px solid #e6ebf2",
                }}
                data-testid="button-prev-question"
              >
                <ArrowLeft className="w-4 h-4" /> Vorige
              </button>

              {currentQ < QUESTIONS.length - 1 ? (
                <button
                  onClick={() => answers[currentQ] !== null && setCurrentQ(currentQ + 1)}
                  disabled={answers[currentQ] === null}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full font-bold text-sm text-white"
                  style={{
                    background: answers[currentQ] !== null ? "#0b2240" : "#a0aec0",
                  }}
                  data-testid="button-next-question"
                >
                  Volgende <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => allAnswered && setStep("result")}
                  disabled={!allAnswered}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-full font-black text-sm text-white"
                  style={{
                    background: allAnswered ? "#f28a1a" : "#a0aec0",
                    boxShadow: allAnswered ? "0 14px 40px rgba(242,138,26,.25)" : "none",
                  }}
                  data-testid="button-show-result"
                >
                  Bekijk resultaat <BarChart3 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 mt-4">
              {QUESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: i === currentQ
                      ? "#0b2240"
                      : answers[i] !== null
                        ? "#22c55e"
                        : "#d1d5db",
                    transition: "background 0.2s",
                  }}
                  data-testid={`dot-question-${i}`}
                />
              ))}
            </div>
          </div>
        )}

        {step === "result" && results && (
          <div data-testid="section-result">
            <div className="text-center mb-6">
              <h1 className="font-black text-2xl mb-1" data-testid="text-result-title">Jouw Regio-score</h1>
              <p style={{ color: "#5b677a", fontSize: "15px" }}>Op basis van 8 vragen over 4 domeinen</p>
            </div>

            <div
              className="rounded-[22px] p-6 mb-4"
              style={{ background: "#fff", border: "1px solid #e6ebf2", boxShadow: "0 8px 22px rgba(15,23,42,.06)" }}
              data-testid="card-score"
            >
              <ScoreRing score={results.overallScore} />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                {results.domainResults.map((d) => {
                  const barColor = d.percentage >= 70 ? "#22c55e" : d.percentage >= 40 ? "#f28a1a" : "#ef4444";
                  return (
                    <div key={d.key} className="text-center" data-testid={`domain-score-${d.key}`}>
                      <div className="text-xs font-bold mb-1" style={{ color: "#5b677a" }}>{d.label}</div>
                      <div className="h-2 rounded-full overflow-hidden mx-auto" style={{ background: "#e6ebf2", maxWidth: "80px" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${d.percentage}%`, background: barColor, transition: "width 0.8s ease" }}
                        />
                      </div>
                      <div className="text-xs font-black mt-0.5" style={{ color: barColor }}>{d.percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {results.blockers.length > 0 && (
              <div className="mb-4" data-testid="section-blockers">
                <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" style={{ color: "#ef4444" }} />
                  Blokkades
                </h2>
                <div className="space-y-2.5">
                  {results.blockers.map((b, i) => (
                    <div
                      key={i}
                      className="rounded-[18px] p-4"
                      style={{ background: "#fff", border: "1px solid #fecaca", boxShadow: "0 4px 12px rgba(239,68,68,.06)" }}
                      data-testid={`card-blocker-${i}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(239,68,68,.10)", color: "#ef4444" }}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: "#ef4444" }}>{b.label}</div>
                          <p className="text-sm mt-0.5" style={{ color: "#374151" }}>{b.message}</p>
                          <p className="text-xs mt-1.5 font-bold" style={{ color: "#0b2240" }}>
                            Actie: {b.action}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(31,95,174,.08)", color: "#0b2240" }}>
                            <b.pillarIcon className="w-3 h-3" /> {b.pillar}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.leverage.length > 0 && (
              <div className="mb-4" data-testid="section-leverage">
                <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: "#22c55e" }} />
                  Leverage
                </h2>
                <div className="space-y-2.5">
                  {results.leverage.map((l, i) => (
                    <div
                      key={i}
                      className="rounded-[18px] p-4"
                      style={{ background: "#fff", border: "1px solid #bbf7d0", boxShadow: "0 4px 12px rgba(34,197,94,.06)" }}
                      data-testid={`card-leverage-${i}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(34,197,94,.10)", color: "#22c55e" }}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm" style={{ color: "#22c55e" }}>{l.label}</div>
                          <p className="text-sm mt-0.5" style={{ color: "#374151" }}>{l.message}</p>
                          <p className="text-xs mt-1.5 font-bold" style={{ color: "#0b2240" }}>
                            Actie: {l.action}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(34,197,94,.08)", color: "#22c55e" }}>
                            <l.pillarIcon className="w-3 h-3" /> {l.pillar}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="rounded-[22px] p-5 mb-4"
              style={{
                background: "linear-gradient(135deg, #0e3f86, #0b2240)",
                color: "#fff",
                boxShadow: "0 16px 40px rgba(15,23,42,.10)",
              }}
              data-testid="card-pillar-cta"
            >
              <h3 className="font-bold text-lg mb-1">Activeer je regio-structuur</h3>
              <p style={{ color: "rgba(255,255,255,.80)", fontSize: "14px", marginBottom: "14px" }}>
                Op basis van jouw scan passen deze modules bij je situatie:
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "RegioMarkt", hint: "Doorverwijzing & afspraken", slug: "regiomarkt" },
                  { label: "Zichtbaarheid", hint: "NAW, reviews, vindbaarheid", slug: "zichtbaarheid" },
                  { label: "Back to Basic", hint: "Fallback & continuiteit", slug: "backtobasic" },
                  { label: "RegioBot", hint: "Regels & mandaten", slug: "regiobot" },
                ].map((mod, i) => (
                  <a
                    key={i}
                    href={`/#${mod.slug}`}
                    className="rounded-[14px] p-3 block"
                    style={{ background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}
                    data-testid={`link-pillar-${mod.slug}`}
                  >
                    <div className="font-bold text-sm">{mod.label}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,.70)" }}>{mod.hint}</div>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm"
                style={{ background: "#fff", border: "1px solid #e6ebf2", color: "#0f172a" }}
                data-testid="button-restart"
              >
                <RotateCcw className="w-4 h-4" /> Opnieuw scannen
              </button>
              <button
                onClick={shareLink}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm"
                style={{ background: "#fff", border: "1px solid #e6ebf2", color: "#0f172a" }}
                data-testid="button-share"
              >
                <Share2 className="w-4 h-4" /> Deel link
              </button>
              <a
                href="/#member"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-black text-sm text-white"
                style={{ background: "#f28a1a", boxShadow: "0 14px 40px rgba(242,138,26,.25)" }}
                data-testid="link-word-lid"
              >
                Word lid van OpenRegio
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="py-6 mt-8 border-t" style={{ borderColor: "#e6ebf2" }}>
        <div className="max-w-[1120px] mx-auto px-4 flex items-center justify-between gap-2 flex-wrap">
          <span style={{ color: "#8896a8", fontSize: "13px" }}>
            &copy; {new Date().getFullYear()} OpenRegio
          </span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs" style={{ color: "#8896a8" }} data-testid="link-footer-privacy">Privacy</Link>
            <Link href="/disclaimer" className="text-xs" style={{ color: "#8896a8" }} data-testid="link-footer-disclaimer">Disclaimer</Link>
            <Link href="/voorwaarden" className="text-xs" style={{ color: "#8896a8" }} data-testid="link-footer-voorwaarden">Voorwaarden</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}