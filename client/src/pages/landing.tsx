import { useState, useMemo } from "react";
import { Link } from "wouter";
import { 
  MapPin, 
  Wrench, 
  RefreshCw, 
  Handshake,
  Puzzle,
  FolderOpen,
  TrendingUp,
  ShieldCheck,
  Menu,
  X,
  Check,
  Banknote,
  Receipt,
  Phone,
  Zap,
  Wifi
} from "lucide-react";
import { REGIONS } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const BRAND = {
  purple: "#0b2240",
  purpleDark: "#174a8a",
};

const nav = [
  { label: "Home", href: "#top" },
  { label: "Voor wie", href: "#voorwie" },
  { label: "Pijlers", href: "#pijlers" },
  { label: "Werkwijze", href: "#werkwijze" },
  { label: "FAQ", href: "#faq" },
];

const audience = [
  {
    title: "Lokale ondernemers",
    text: "Je wil klanten, geen platformstress. Je wil bellen, afspreken, leveren.",
    icon: MapPin,
  },
  {
    title: "Vakmensen & diensten",
    text: "Je moet bereikbaar blijven. Ook als pin, cloud of apps haperen.",
    icon: Wrench,
  },
  {
    title: "Regio-netwerken",
    text: "Je wil dat werk, kennis en geld lokaal blijven rondgaan.",
    icon: RefreshCw,
  },
  {
    title: "Collectieven & coops",
    text: "Je wil structuur: afspraken, bewijs, en een systeem dat blijft staan.",
    icon: Handshake,
  },
];

const rebelBlokken = [
  {
    spanningLabel: "Jouw gegevens",
    title: "Jouw keuze, niet je plicht",
    spanning:
      "Er komt een digitale identiteit aan. Handig, zeggen ze. Maar wie heeft straks toegang tot jouw gegevens, en kun je nog nee zeggen?",
    antwoord:
      "Digitaal waar het kan, menselijk waar het moet. Het recht om niet álles te delen en zelf te kiezen wanneer je iets gebruikt is geen achterlijkheid — dat is vrijheid. Wij leggen uit wat mag en wat vrijwillig is.",
    cta: "Ken je privacyrechten",
    href: "#wordlid",
  },
  {
    spanningLabel: "Regels",
    title: "Kloppen ze wel?",
    spanning:
      "Een milieuzone, een vergunning, een nieuwe verplichting. Waarom raakt het de zzp'er met één bestelbus harder dan de vervuiler met een hele vloot?",
    antwoord:
      "Wij zijn niet tegen schoon. Wij zijn tegen onevenredig. Bij elke regel stellen we twee vragen: is dit proportioneel, en zijn de mensen die het raakt gehoord? Zo niet, dan is er een grond om iets te zeggen — netjes en op de wet.",
    cta: "Controleer een besluit",
    href: "#wordlid",
  },
  {
    spanningLabel: "Van angst naar grip",
    title: "Rust in plaats van angst",
    spanning:
      "Er wordt veel met angst geregeerd — voor oorlog, voor tekort, voor de ander. En angst maakt volgzaam.",
    antwoord:
      "Wij kiezen voor rust en helderheid. Wat is er écht aan de hand, wat mag de overheid wel en niet, en waar sta jij in je recht? Je hoeft niet boos te zijn om sterk te staan — je hoeft alleen te weten hoe het werkt.",
    cta: "Begrijp je situatie",
    href: "#wordlid",
  },
];

const pillars = [
  {
    title: "RegioMarkt",
    kicker: "Werk blijft in de regio",
    bullets: [
      "Gesloten netwerk waar ondernemers elkaar gericht doorverwijzen.",
      "Geen algoritmes. Geen advertenties.",
    ],
    tag: "Stabiele instroom",
    icon: Puzzle,
  },
  {
    title: "RegioBot",
    kicker: "WOO & regelgeving, zonder ruis",
    bullets: [
      "Document-gedreven inzicht in WOO-verzoeken, besluiten, mandaten.",
      "Geen meningen, alleen feiten.",
    ],
    tag: "Meer controle",
    icon: FolderOpen,
  },
  {
    title: "Zichtbaarheid",
    kicker: "Vindbaar waar het telt",
    bullets: [
      "Lokale basis op orde: Google-profiel, reviews.",
      "Regionale vindbaarheid.",
    ],
    tag: "Meer aanvragen",
    icon: TrendingUp,
  },
  {
    title: "Basischeck",
    kicker: "Betrouwbaar, ook als systemen falen",
    bullets: [
      "Check op cash, bereikbaarheid en offline werken.",
      "Je positie is gebaseerd op betrouwbaarheid.",
    ],
    tag: "Continuïteit",
    icon: ShieldCheck,
  },
];

const steps = [
  {
    n: "01",
    title: "Meld je aan",
    text: "Binnen 2 minuten. Geen gedoe, maandelijks opzegbaar.",
  },
  {
    n: "02",
    title: "Kies je regio & vakgebied",
    text: "Zodat zoeken en doorverwijzen meteen klopt.",
  },
  {
    n: "03",
    title: "Doe de Basischeck",
    text: "Je badges worden zichtbaar: cash, bonnen, offline, noodstroom.",
  },
  {
    n: "04",
    title: "Word vindbaar & doorverwijsbaar",
    text: "Korte lijnen. Minder afhankelijk. Meer grip.",
  },
];

const faqs = [
  {
    q: "Is OpenRegio een marktplaats?",
    a: "Nee. Dit is infrastructuur: netwerk + vindbaarheid + offline-proof + dossierhulp. Geen algoritme-feed.",
  },
  {
    q: "Moet ik 'socials' doen?",
    a: "Nee. Basis zichtbaarheid is genoeg: profiel, reviews, lokale signalen. Klaar.",
  },
  {
    q: "Wat is 'Basischeck' precies?",
    a: "Een set praktische checks (cash/bonnen/offline/noodstroom) die je als badges toont. Bewijs i.p.v. marketing.",
  },
  {
    q: "Kan ik maandelijks opzeggen?",
    a: "Ja. Geen jaarcontracten. Geen lock-in.",
  },
];

const PLANS = [
  {
    id: "basic",
    name: "Basis",
    price: "12,95",
    period: "/ maand excl. btw",
    desc: "Volwaardig lid: netwerk, stem mee, word weerbaar.",
    bullets: [
      "Profiel + regio + categorie",
      "Zichtbaar in RegioMarkt",
      "Stemrecht in de coöperatie",
      "Basischeck + weerbaarheidsbadges",
      "Maandelijks opzegbaar",
    ],
    cta: "Word Basis-lid",
  },
  {
    id: "pro",
    name: "Pro",
    price: "24",
    period: "/ maand excl. btw",
    highlight: true,
    desc: "Draag extra bij en krijg krachtige tools erbij.",
    bullets: [
      "Alles van Basis-lid",
      "RegioBot: WOO & regelgeving AI",
      "Brievenagent + Contractagent",
      "Prioriteit ondersteuning",
      "Bouw mee aan nieuwe features",
    ],
    cta: "Word Pro-bijdrager",
  },
];

const DEFAULT_CATEGORIES = [
  "Loodgieters & installateurs",
  "Elektriciens",
  "Fiets & mobiliteit",
  "Voedsel & bakkerijen",
  "Zorg & ondersteuning",
  "Onderhoud & reparatie",
  "Horeca",
  "Bouw & klus",
  "IT & web",
  "Schoonmaak",
  "Overig",
];

const BADGES = [
  { key: "cash", label: "Cash", icon: Banknote },
  { key: "bonnen", label: "Bonnenblok", icon: Receipt },
  { key: "telefoonlijst", label: "Telefoonlijst", icon: Phone },
  { key: "noodstroom", label: "Noodstroom", icon: Zap },
  { key: "offlineWerk", label: "Offline werk", icon: Wifi },
];

function cx(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, desc, align = "left" }: { eyebrow?: string; title: string; desc?: string; align?: "left" | "center" }) {
  return (
    <div className={cx("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <div className="mb-3 text-sm font-semibold tracking-wide text-white/70">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      {desc && <p className="mt-3 text-base text-white/70">{desc}</p>}
    </div>
  );
}

function LandingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

function LandingButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "secondary" }) {
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black";
  const primary = "bg-[#0b2240] text-white hover:opacity-90 focus:ring-[#0b2240]";
  const secondary = "border border-white/15 bg-white/5 text-white hover:bg-white/10 focus:ring-white/40";
  const cls = cx(base, variant === "primary" ? primary : secondary);

  return (
    <a href={href} className={cls}>
      {children}
    </a>
  );
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

function PricingSignup() {
  const [plan, setPlan] = useState("pro");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    region: REGIONS[0] || "",
    category: DEFAULT_CATEGORIES[0] || "",
    badges: {
      cash: false,
      bonnen: false,
      telefoonlijst: false,
      noodstroom: false,
      offlineWerk: false,
    } as Record<string, boolean>,
    note: "",
  });

  const payload = useMemo(() => {
    const badges = Object.entries(form.badges)
      .filter(([, v]) => v)
      .map(([k]) => k);

    return {
      plan,
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim(),
      phone: form.phone.trim(),
      region: form.region,
      category: form.category,
      badges,
      note: form.note.trim(),
      source: "openregio-homepage",
      createdAt: new Date().toISOString(),
    };
  }, [form, plan]);

  function update(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
    setOk(false);
    setErr("");
  }

  function toggleBadge(k: string) {
    setForm((p) => ({
      ...p,
      badges: { ...p.badges, [k]: !p.badges[k] },
    }));
    setOk(false);
    setErr("");
  }

  function validate() {
    if (!payload.name) return "Naam ontbreekt.";
    if (!isEmail(payload.email)) return "Vul een geldig e-mailadres in.";
    if (!payload.company) return "Bedrijfsnaam ontbreekt.";
    if (!payload.region) return "Kies je regio.";
    if (!payload.category) return "Kies je categorie.";
    if (!payload.plan) return "Kies Basis-lid of Pro-bijdrager.";
    return "";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk(false);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    try {
      await apiRequest("POST", "/api/lead", payload);
      setOk(true);
    } catch {
      const subject = encodeURIComponent(`OpenRegio inschrijving (${payload.plan})`);
      const body = encodeURIComponent(
        [
          "Nieuwe inschrijving:",
          `Pakket: ${payload.plan.toUpperCase()}`,
          `Naam: ${payload.name}`,
          `Email: ${payload.email}`,
          `Bedrijf: ${payload.company}`,
          `Telefoon: ${payload.phone || "-"}`,
          `Regio: ${payload.region}`,
          `Categorie: ${payload.category}`,
          `Badges: ${payload.badges.join(", ") || "-"}`,
          `Opmerking: ${payload.note || "-"}`,
          `Bron: ${payload.source}`,
          `Tijd: ${payload.createdAt}`,
        ].join("\n")
      );
      window.location.href = `mailto:info@openregio.nl?subject=${subject}&body=${body}`;
    } finally {
      setLoading(false);
    }
  }

  const selectedPlan = PLANS.find((p) => p.id === plan);

  return (
    <section id="wordlid" className="mx-auto max-w-6xl px-4 pb-12">
      <div
        className="rounded-3xl border border-white/10 p-8"
        style={{
          background: `linear-gradient(135deg, rgba(31,95,174,0.35) 0%, rgba(0,0,0,0.55) 55%, rgba(31,95,174,0.18) 100%)`,
        }}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white/80">Lid worden</div>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">
              Kies je pakket. Klaar.
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Basis-lid: volwaardig lid. Pro-bijdrager: extra tools erbij.
            </p>
          </div>

          <div className="mt-3 sm:mt-0 flex gap-2">
            <Badge>€12,95 Basis excl. BTW</Badge>
            <Badge>€24 Pro excl. BTW</Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {PLANS.map((p) => {
            const active = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                data-testid={`button-plan-${p.id}`}
                className={cx(
                  "text-left rounded-2xl border p-6 transition",
                  active
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-black/30 hover:bg-white/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white/80">
                      {p.name}
                      {p.highlight && (
                        <span
                          className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{ background: BRAND.purple }}
                        >
                          Aanrader
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-end gap-2">
                      <div className="text-3xl font-semibold">€{p.price}</div>
                      <div className="text-sm text-white/60">{p.period}</div>
                    </div>
                    <div className="mt-2 text-sm text-white/70">{p.desc}</div>
                  </div>

                  <div
                    className={cx(
                      "mt-1 h-5 w-5 rounded-full border flex items-center justify-center",
                      active ? "border-white/40" : "border-white/15"
                    )}
                    style={active ? { background: BRAND.purple } : {}}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <div className="text-xs font-semibold text-white/70">Naam</div>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                placeholder="Voornaam Achternaam"
                data-testid="input-name"
              />
            </label>

            <label className="grid gap-2">
              <div className="text-xs font-semibold text-white/70">E-mail</div>
              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                placeholder="naam@bedrijf.nl"
                data-testid="input-email"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <div className="text-xs font-semibold text-white/70">Bedrijfsnaam</div>
              <input
                value={form.company}
                onChange={(e) => update("company", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                placeholder="Jouw bedrijf"
                data-testid="input-company"
              />
            </label>

            <label className="grid gap-2">
              <div className="text-xs font-semibold text-white/70">Telefoon (optioneel)</div>
              <input
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                placeholder="06..."
                data-testid="input-phone"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <div className="text-xs font-semibold text-white/70">Regio</div>
              <select
                value={form.region}
                onChange={(e) => update("region", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                data-testid="select-region"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="bg-black">
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <div className="text-xs font-semibold text-white/70">Categorie</div>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                data-testid="select-category"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-black">
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-sm font-semibold">Badges (Basischeck)</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {BADGES.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.key}
                    type="button"
                    onClick={() => toggleBadge(b.key)}
                    data-testid={`badge-${b.key}`}
                    className={cx(
                      "rounded-full border px-3 py-1 text-xs transition flex items-center gap-1.5",
                      form.badges[b.key]
                        ? "border-white/30 bg-white/10 text-white"
                        : "border-white/10 bg-black/30 text-white/70 hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {b.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-white/60">
              Dit is zichtbaar op je profiel. Proof {">"} praat.
            </div>
          </div>

          <label className="grid gap-2">
            <div className="text-xs font-semibold text-white/70">Opmerking (optioneel)</div>
            <textarea
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
              placeholder="Bijv. 'Ik wil als eerste in regio Haarlem' / 'Ik wil node starten'"
              data-testid="input-note"
            />
          </label>

          {err && (
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-red-200" data-testid="text-error">
              {err}
            </div>
          )}
          {ok && (
            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-[#f28a1a]/20" data-testid="text-success">
              Nice. Inschrijving is binnen. We pakken 'm op.
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-white/60">
              Gekozen pakket:{" "}
              <span className="font-semibold text-white/80">
                {selectedPlan?.name} (€{selectedPlan?.price})
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className={cx(
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition",
                "border border-white/10 bg-white/10 hover:bg-white/15",
                loading && "opacity-60"
              )}
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.04)` }}
            >
              {loading ? "Bezig..." : `${selectedPlan?.cta} \u2192`}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      id="top"
      className="min-h-screen bg-black text-white"
      style={{
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(31,95,174,0.28), transparent 55%), radial-gradient(900px 500px at 90% 20%, rgba(31,95,174,0.18), transparent 60%), linear-gradient(180deg, #07070B 0%, #000 100%)",
      }}
    >
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <div
              className="h-9 w-9 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.purpleDark} 100%)`,
              }}
            />
            <div className="leading-tight">
              <div className="text-sm font-semibold">OpenRegio</div>
              <div className="text-xs text-white/60">lokaal - offline-proof - menselijk</div>
            </div>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {nav.map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="text-sm text-white/70 hover:text-white"
              >
                {i.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link href="/login">
              <span className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition border border-white/15 bg-white/5 text-white hover:bg-white/10">
                Inloggen
              </span>
            </Link>
            <LandingButton href="#wordlid">Word lid</LandingButton>
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur">
            <nav className="flex flex-col p-4 gap-3">
              {nav.map((i) => (
                <a
                  key={i.href}
                  href={i.href}
                  className="text-sm text-white/70 hover:text-white py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {i.label}
                </a>
              ))}
              <div className="flex gap-2 pt-3 border-t border-white/10">
                <Link href="/login">
                  <span className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition border border-white/15 bg-white/5 text-white hover:bg-white/10">
                    Inloggen
                  </span>
                </Link>
                <LandingButton href="#wordlid">Word lid</LandingButton>
              </div>
            </nav>
          </div>
        )}
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:pt-16">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Wij maken het systeem zichtbaar voor jou.
            </h1>

            <p className="mt-4 max-w-xl text-base text-white/70">
              Digitale ID, milieuzones, nieuwe regels — er komt veel op je af, en veel mensen
              zijn bang. Begrijpelijk. Maar een bang mens tekent alles en vraagt niets.
            </p>

            <p className="mt-3 max-w-xl text-base text-white/70">
              Wij helpen je het om te draaien: weet wat er speelt, begrijp of het eigenlijk wel
              mág, en kom in actie met je rechten in de hand.
            </p>

            <p className="mt-4 max-w-xl text-base font-semibold" style={{ color: "#f28a1a" }}>
              Je vecht niet tégen het systeem. Je houdt het systeem aan zijn eigen regels.
            </p>

            <p className="mt-3 max-w-xl text-sm text-white/60">
              Geen complot, geen bangmakerij. Wel je rechten, de wet en de vraag: is dit
              proportioneel — en wie heeft hierover beslist?
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <LandingButton href="#wordlid">Begin vandaag</LandingButton>
              <LandingButton href="#pijlers" variant="secondary">
                Bekijk wat OpenRegio doet
              </LandingButton>
            </div>
          </div>

          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl"
              style={{
                background: `radial-gradient(circle at 30% 20%, ${BRAND.purple} 0%, transparent 55%)`,
              }}
            />
            <LandingCard className="relative overflow-hidden p-0">
              <div className="grid gap-0 lg:grid-cols-1">
                <div className="relative h-64 w-full sm:h-80">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
                    alt="Lokale ondernemers aan tafel"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="text-sm font-semibold">Offline-proof ondernemen</div>
                    <div className="mt-1 text-sm text-white/70">
                      Cash - Bonnen - Telefoonlijst - Noodstroom
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs text-white/60">Waarom</div>
                    <div className="mt-1 font-semibold">Minder afhankelijk</div>
                    <div className="mt-1 text-sm text-white/70">
                      Je eigen netwerk blijft werken, ook als platforms falen.
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="text-xs text-white/60">Resultaat</div>
                    <div className="mt-1 font-semibold">Meer grip</div>
                    <div className="mt-1 text-sm text-white/70">
                      Duidelijke afspraken, bewijs en korte lijnen.
                    </div>
                  </div>
                </div>
              </div>
            </LandingCard>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-8 text-center">
          <p className="mx-auto max-w-3xl text-xl font-semibold sm:text-2xl">
            Moed is niet de afwezigheid van angst. Het is je rechten kennen ondanks de angst.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-2">
        <div className="grid gap-4 lg:grid-cols-3">
          {rebelBlokken.map((b) => (
            <LandingCard key={b.title} className="flex flex-col">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#f28a1a" }}>
                {b.spanningLabel}
              </div>
              <div className="mt-2 text-lg font-semibold">{b.title}</div>
              <p className="mt-2 text-sm text-white/60">{b.spanning}</p>
              <p className="mt-3 text-sm text-white/80">{b.antwoord}</p>
              <div className="mt-auto pt-4">
                <a href={b.href} className="text-sm font-semibold text-white hover:opacity-90">
                  {b.cta} →
                </a>
              </div>
            </LandingCard>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-6 sm:grid-cols-2">
          <div>
            <div className="text-sm font-semibold" style={{ color: "#1a6b3a" }}>Wel</div>
            <p className="mt-1 text-sm text-white/70">
              Kritisch, onafhankelijk, aan de kant van de ondernemer en de burger. Gebouwd op
              de Grondwet, het EVRM, de privacywet en het beginsel dat de overheid haar eigen
              regels moet volgen.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#b3261e" }}>Niet</div>
            <p className="mt-1 text-sm text-white/70">
              Een complotkanaal. We roepen niet dat "ze" liegen of dat alles in scène staat.
              We doen iets sterkers: we vragen bewijs, en we houden de overheid aan de wet.
            </p>
          </div>
        </div>
      </section>

      <section id="voorwie" className="mx-auto max-w-6xl px-4 pt-14 pb-8">
        <SectionTitle
          eyebrow="Voor wie is dit?"
          title="Voor mensen die klaar zijn met ruis"
          desc="Geen algoritmes. Geen advertentie-spam. Gewoon: lokaal ondernemen dat werkt."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((a) => {
            const Icon = a.icon;
            return (
              <LandingCard key={a.title}>
                <Icon className="w-8 h-8 text-[#0b2240]" />
                <div className="mt-3 text-lg font-semibold">{a.title}</div>
                <div className="mt-2 text-sm text-white/70">{a.text}</div>
              </LandingCard>
            );
          })}
        </div>
      </section>

      <section id="pijlers" className="mx-auto max-w-6xl px-4 pt-10 pb-8">
        <SectionTitle
          eyebrow="Wat je krijgt"
          title="Vier pijlers. Een systeem."
          desc="Dit is de kern. Compact, bruikbaar, en meteen toepasbaar."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <LandingCard key={p.title} className="relative overflow-hidden">
                <div
                  className="absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-2xl"
                  style={{ background: BRAND.purple }}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-white/80">{p.kicker}</div>
                    <div className="mt-1 text-2xl font-semibold">{p.title}</div>
                  </div>
                  <Icon className="w-8 h-8 text-[#0b2240]" />
                </div>

                <ul className="mt-4 space-y-2 text-sm text-white/70">
                  {p.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-white/50" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between">
                  <Badge>{p.tag}</Badge>
                  <a href="#wordlid" className="text-sm font-semibold text-white hover:opacity-90">
                    Start →
                  </a>
                </div>
              </LandingCard>
            );
          })}
        </div>
      </section>

      <section id="werkwijze" className="mx-auto max-w-6xl px-4 pt-10 pb-8">
        <SectionTitle
          eyebrow="Zo werkt het"
          title="Simpel. In 4 stappen."
          desc="Geen onboarding-hel. Gewoon starten."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {steps.map((s) => (
            <LandingCard key={s.n}>
              <div className="text-xs font-semibold text-white/60">{s.n}</div>
              <div className="mt-2 text-lg font-semibold">{s.title}</div>
              <div className="mt-2 text-sm text-white/70">{s.text}</div>
            </LandingCard>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 pt-10 pb-8">
        <SectionTitle
          eyebrow="Veelgestelde vragen"
          title="FAQ"
          desc="Kort en bondig."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {faqs.map((f) => (
            <LandingCard key={f.q}>
              <div className="text-sm font-semibold">{f.q}</div>
              <div className="mt-2 text-sm text-white/70">{f.a}</div>
            </LandingCard>
          ))}
        </div>
      </section>

      <PricingSignup />

      <footer className="border-t border-white/10 mt-8">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.purple} 0%, ${BRAND.purpleDark} 100%)`,
                }}
              />
              <div className="text-sm font-semibold">OpenRegio</div>
            </div>
            <div className="text-xs text-white/60">
              Lokaal ondernemen. Offline-proof. Menselijk contact.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
