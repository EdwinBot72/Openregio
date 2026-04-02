import { Link } from "wouter";
import { usePageTitle } from "@/hooks/usePageTitle";
import logoImg from "@assets/optimized/logo.webp";
import groupImg from "@assets/optimized/group.webp";
import streetImg from "@assets/optimized/street.webp";

const MOLLIE_BASIC_LINK = (import.meta.env.VITE_MOLLIE_BASIC_PAYMENT_LINK as string) || "https://payment-links.mollie.com/payment/FNnWr8uofpfEd6PJQMWHk";
const MOLLIE_PRO_LINK = (import.meta.env.VITE_MOLLIE_PRO_PAYMENT_LINK as string) || "https://payment-links.mollie.com/payment/nEdtEni7GkJG7rHHetyBs";

const pillars = [
  { title: "Zichtbaarheid", subtitle: "Beter gevonden worden", color: "bg-blue-50 text-blue-800 border-blue-100", symbol: "↗" },
  { title: "Regels & signalen", subtitle: "Zie wat impact heeft", color: "bg-orange-50 text-orange-800 border-orange-100", symbol: "⚖" },
  { title: "Samenwerking", subtitle: "Kansen in de regio", color: "bg-emerald-50 text-emerald-800 border-emerald-100", symbol: "◎" },
];

const basisFeatures = [
  "Profiel en aanwezigheid op het platform",
  "Basis zichtbaarheid in de regio",
  "Eerste signalen en updates",
  "Korte briefanalyse",
  "RegioBot basis",
];

const proFeatures = [
  "Alles van Basis",
  "Diepere zichtbaarheidsscans",
  "Regelgeving en WOO-inzichten",
  "Volledige briefanalyse",
  "RegioBot onbeperkt",
  "Dossiers bouwen en beheren",
];

export default function HomePage() {
  usePageTitle("OpenRegio – Lokale toolkit voor ondernemers");

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="OpenRegio" className="h-8 w-auto" />
            <div>
              <div className="text-sm font-black tracking-tight">OpenRegio</div>
              <div className="text-xs text-slate-400">Lokale toolkit voor ondernemers</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-slate-500 md:flex">
            <a href="#lidmaatschap" className="hover:text-slate-900 transition-colors">Lidmaatschap</a>
            <Link href="/login" className="hover:text-slate-900 transition-colors">Inloggen</Link>
          </nav>

          <Link
            href="/register"
            className="rounded-full bg-[#f28a1a] px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            data-testid="link-aanmelden-header"
          >
            Aanmelden
          </Link>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="bg-white py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
            <div>
              <span className="inline-block rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#1f5fae]">
                Voor Nederlandse ondernemers
              </span>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
                Meer zichtbaarheid. Sneller overzicht.{" "}
                <span className="text-[#1f5fae]">Sterker ondernemen in je regio.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-500">
                OpenRegio is een toolkit voor lokale ondernemers die beter gevonden willen worden,
                sneller overzicht willen en makkelijker willen samenwerken in hun regio.
              </p>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {pillars.map((item) => (
                  <div key={item.title} className={`rounded-2xl border p-4 ${item.color}`}>
                    <div className="mb-2 text-lg font-black">{item.symbol}</div>
                    <div className="text-xs font-black uppercase tracking-wide">{item.title}</div>
                    <div className="mt-1 text-xs opacity-80">{item.subtitle}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="rounded-full bg-[#f28a1a] px-6 py-4 text-center text-sm font-bold text-white transition hover:opacity-90"
                  data-testid="link-aanmelden-hero"
                >
                  Aanmelden en starten
                </Link>
                <a
                  href="#lidmaatschap"
                  className="rounded-full border border-slate-200 px-6 py-4 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Bekijk abonnementen
                </a>
              </div>

              <p className="mt-5 text-xs text-slate-400">
                Na aanmelden direct toegang tot de Basischeck en RegioBot
              </p>
            </div>

            <div className="relative">
              <img
                src={groupImg}
                alt="Lokale ondernemers samenwerking"
                className="h-[360px] w-full rounded-[28px] object-cover shadow-2xl"
                data-testid="img-hero"
              />
              <div className="absolute bottom-6 left-6 max-w-[240px] rounded-2xl bg-white/90 p-5 backdrop-blur">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#1f5fae]">Lokale focus</div>
                <div className="mt-2 text-xl font-black text-slate-900">Meer grip</div>
                <p className="mt-2 text-sm text-slate-500">Eén plek voor zichtbaarheid en overzicht.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Waarom (donker, met foto) ── */}
        <section className="bg-[#0b2240] py-20 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#f28a1a]">Waarom OpenRegio</span>
                <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                  Ondernemen is al druk genoeg.
                </h2>
                <p className="mt-5 text-base leading-8 text-white/65">
                  Regels, signalen en kansen zitten versnipperd in losse systemen en sites.
                  Met OpenRegio krijg je één plek waar zichtbaarheid, regionale ontwikkelingen,
                  openbare regels en ondernemerskansen samenkomen — zonder uitzoekwerk.
                </p>
                <Link
                  href="/register"
                  className="mt-8 inline-block rounded-full bg-[#f28a1a] px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                  data-testid="link-aanmelden-waarom"
                >
                  Aanmelden en starten
                </Link>
              </div>
              <div className="overflow-hidden rounded-[28px] border border-white/10">
                <img
                  src={streetImg}
                  alt="Lokale ondernemers in de regio"
                  className="h-[280px] w-full object-cover opacity-75"
                  data-testid="img-street"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Lidmaatschap / Pricing ── */}
        <section id="lidmaatschap" className="bg-white py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1f5fae]">Abonnementen</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                Kies wat past bij jouw fase
              </h2>
              <p className="mt-3 text-sm text-slate-400">Transparante tarieven. Maandelijks opzegbaar.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Basis */}
              <div className="rounded-[28px] border border-slate-100 bg-white p-7 shadow-sm">
                <h3 className="text-2xl font-black text-slate-900">Basis</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Voor ondernemers die zichtbaar willen zijn en sneller overzicht zoeken
                </p>
                <div className="mt-6 text-5xl font-black tracking-tight text-slate-900">
                  €19 <span className="text-sm font-medium text-slate-400">/maand</span>
                </div>
                <a
                  href={MOLLIE_BASIC_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block rounded-2xl border border-slate-200 py-3 text-center text-sm font-bold text-[#1f5fae] transition hover:bg-slate-50"
                  data-testid="link-basis-lid"
                >
                  Kies Basis
                </a>
                <ul className="mt-6 space-y-3">
                  {basisFeatures.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-600">
                      <span className="font-black text-[#1f5fae]">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro */}
              <div className="relative rounded-[28px] border-[1.5px] border-[#1f5fae] bg-white p-7 shadow-[0_8px_32px_rgba(31,95,174,.15)]">
                <div className="absolute -top-3 left-7 rounded-full bg-[#1f5fae] px-3 py-1 text-xs font-black text-white">
                  Aanbevolen
                </div>
                <h3 className="text-2xl font-black text-slate-900">Pro</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Voor ondernemers die actief informatievoordeel en meer grip willen
                </p>
                <div className="mt-6 text-5xl font-black tracking-tight text-slate-900">
                  €49 <span className="text-sm font-medium text-slate-400">/maand</span>
                </div>
                <a
                  href={MOLLIE_PRO_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block rounded-2xl bg-[#1f5fae] py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                  data-testid="link-pro-lid"
                >
                  Kies Pro
                </a>
                <ul className="mt-6 space-y-3">
                  {proFeatures.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-600">
                      <span className="font-black text-[#1f5fae]">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <section className="bg-slate-900 py-16 text-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-black tracking-tight md:text-4xl">
              Start vandaag. Zie sneller wat relevant is.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-white/70">
              OpenRegio helpt lokale ondernemers om slimmer te handelen en sterker te staan in hun regio.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-full bg-[#f28a1a] px-6 py-4 text-sm font-bold text-white transition hover:opacity-90"
                data-testid="link-aanmelden-footer"
              >
                Aanmelden en starten
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/20 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/10"
                data-testid="link-inloggen-footer"
              >
                Al lid? Inloggen
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-slate-100 bg-white py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <span className="text-sm text-slate-400">
              &copy; {new Date().getFullYear()} OpenRegio
            </span>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-slate-400 sm:justify-end">
              <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
              <Link href="/voorwaarden" className="hover:text-slate-700 transition-colors">Voorwaarden</Link>
              <Link href="/disclaimer" className="hover:text-slate-700 transition-colors">Disclaimer</Link>
              <Link href="/cookiebeleid" className="hover:text-slate-700 transition-colors">Cookiebeleid</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
