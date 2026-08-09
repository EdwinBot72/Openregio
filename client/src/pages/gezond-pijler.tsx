import { Link, useRoute, Redirect } from "wouter";
import { Banknote, ShieldCheck, Handshake, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PublicTopNav } from "@/components/PublicTopNav";
import { usePageTitle } from "@/hooks/usePageTitle";

type ActionItem = {
  title: string;
  text: string;
};

type ModuleLink = {
  href: string;
  label: string;
  description: string;
};

type Pijler = {
  slug: string;
  Icon: LucideIcon;
  eyebrow: string;
  title: string;
  intro: string;
  lead: string;
  acties: ActionItem[];
  modules: ModuleLink[];
};

const PIJLERS: Record<string, Pijler> = {
  financieel: {
    slug: "financieel",
    Icon: Banknote,
    eyebrow: "Pijler 1 — Financieel gezond",
    title: "Financieel gezond ondernemen",
    intro:
      "Vind opdrachten en kansen in je regio voordat ze elders weglopen.",
    lead:
      "Financieel gezond betekent dat er regelmatig nieuw werk binnenkomt en dat je geen kansen mist die nét om de hoek liggen. OpenRegio brengt opdrachten en lokale signalen samen, zodat je niet hoeft te speuren maar kunt kiezen.",
    acties: [
      {
        title: "Bekijk de aanbestedingen en opdrachten in jouw regio",
        text: "Filter op gemeente en branche en zie meteen wat past bij wat jij doet — zonder eindeloze TenderNed-zoektocht.",
      },
      {
        title: "Houd grip op je verplichtingen en risico's",
        text: "Zie in één oogopslag welke regels, termijnen en verplichtingen spelen — zodat je niets mist en niet verrast wordt.",
      },
      {
        title: "Volg kansen-signalen uit je buurt",
        text: "Nieuwe opdrachten, samenwerkingen en marktbewegingen in je eigen regio, dagelijks bijgewerkt.",
      },
    ],
    modules: [
      { href: "/kansen/opdrachten", label: "Opdrachten & aanbestedingen", description: "Lokale en landelijke aanbestedingen op één plek." },
      { href: "/regels/updates", label: "Regels & verplichtingen", description: "Wat er verandert en wat het voor jou betekent." },
      { href: "/kansen/in-de-buurt", label: "Kansen in de buurt", description: "Wat speelt er nu rond jouw vestiging?" },
    ],
  },
  bestuurlijk: {
    slug: "bestuurlijk",
    Icon: ShieldCheck,
    eyebrow: "Pijler 2 — Bestuurlijk gezond",
    title: "Bestuurlijk gezond ondernemen",
    intro:
      "Begrijp gemeentebrieven en regels — en zet WOO-verzoeken in zonder juridische kennis.",
    lead:
      "Bestuurlijk gezond betekent dat je weet wat de gemeente, provincie of het Rijk van je vraagt en dat je daar zelf actie op kunt ondernemen. OpenRegio vertaalt regels en brieven naar gewone taal en helpt je in een paar klikken een stap te zetten.",
    acties: [
      {
        title: "Stel een vraag aan RegioBot",
        text: "Krijg uitleg over een regel, een vergunning of een gemeentebrief — in normale taal, met bron erbij.",
      },
      {
        title: "Doorloop de hulp-engine voor jouw situatie",
        text: "Beantwoord een paar vragen en krijg een concreet plan: welke regel, welk loket, welke stap.",
      },
      {
        title: "Dien zelf een WOO-verzoek in",
        text: "Gebruik de WOO-wizard om in een paar minuten een net verzoek bij de juiste gemeente neer te leggen.",
      },
    ],
    modules: [
      { href: "/regiobot", label: "RegioBot", description: "Stel je vraag over regels en beleid." },
      { href: "/regels/help", label: "Hulp bij regels", description: "Stap-voor-stap hulp bij jouw situatie." },
      { href: "/regiobot", label: "RegioBot", description: "Vraag openbare documenten op bij de gemeente." },
    ],
  },
  mentaal: {
    slug: "mentaal",
    Icon: Handshake,
    eyebrow: "Pijler 3 — Mentaal gezond",
    title: "Mentaal gezond ondernemen",
    intro:
      "Sta er niet alleen voor: deel signalen en pak zaken samen met andere ondernemers aan.",
    lead:
      "Mentaal gezond betekent dat je niet in je eentje staat te worstelen met dezelfde gemeente, dezelfde regel of dezelfde marktontwikkeling. OpenRegio brengt ondernemers in dezelfde regio bij elkaar, zodat je sneller kunt sparren en sterker kunt staan.",
    acties: [
      {
        title: "Sluit je aan bij Samen Aanpakken",
        text: "Pak een dossier of signaal samen op met andere ondernemers uit jouw regio.",
      },
      {
        title: "Ontmoet je RegioCrew",
        text: "Zie wie er actief zijn rond jouw vestigingsplaats en branche, en leg laagdrempelig contact.",
      },
      {
        title: "Deel je signaal of vraag in de community",
        text: "Een korte vraag, een tip of een waarschuwing — andere ondernemers reageren en denken mee.",
      },
    ],
    modules: [
      { href: "/vandaag/samen", label: "Samen Aanpakken", description: "Werk samen aan dossiers in jouw regio." },
      { href: "/regiocrew", label: "RegioCrew", description: "Vind ondernemers bij jou in de buurt." },
      { href: "/community", label: "Community", description: "Stel je vraag aan de community." },
    ],
  },
  strategisch: {
    slug: "strategisch",
    Icon: TrendingUp,
    eyebrow: "Pijler 4 — Strategisch gezond",
    title: "Strategisch gezond ondernemen",
    intro:
      "Weet wat er in je regio speelt — en welke ondernemers het raakt — voordat het je raakt.",
    lead:
      "Strategisch gezond betekent dat je niet wordt overvallen door beleid of marktverschuivingen. OpenRegio levert dagelijks context bij wat er in je regio speelt, zodat je vooruit kunt kijken in plaats van achter het nieuws aan te lopen.",
    acties: [
      {
        title: "Volg dagelijkse updates en signalen",
        text: "De belangrijkste regio- en beleidsbewegingen, kort samengevat en op jouw situatie gefilterd.",
      },
      {
        title: "Lees achtergrondblogs met context",
        text: "Geen losse koppen, maar duiding: wat betekent dit voor ondernemers in jouw regio?",
      },
      {
        title: "Gebruik de regio-analyse voor je vestigingsplaats",
        text: "Zie in één scherm wat er bestuurlijk en economisch speelt rond jouw locatie.",
      },
    ],
    modules: [
      { href: "/vandaag/updates", label: "Vandaag — updates", description: "De belangrijkste signalen van vandaag." },
      { href: "/blogs", label: "Blogs met context", description: "Achtergrond bij beleid en marktverschuivingen." },
      { href: "/regio-analyse", label: "Regio-analyse", description: "Wat speelt er rond jouw vestigingsplaats?" },
    ],
  },
};

export const PIJLER_SLUGS = Object.keys(PIJLERS);

export default function GezondPijlerPage() {
  const [, params] = useRoute("/gezond/:slug");
  const slug = params?.slug ?? "";
  const pijler = PIJLERS[slug];

  if (!pijler) {
    return <Redirect to="/" />;
  }

  return <PijlerView pijler={pijler} />;
}

function PijlerView({ pijler }: { pijler: Pijler }) {
  const { Icon, title, eyebrow, intro, lead, acties, modules } = pijler;
  usePageTitle(`${title} — OpenRegio`);

  return (
    <div className="openregio-public-page" data-testid={`page-pijler-${pijler.slug}`}>
      <PublicTopNav />
      <div className="openregio-public-content">
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#f28a1a",
            textTransform: "uppercase",
            letterSpacing: ".6px",
            marginBottom: 8,
          }}
          data-testid="text-pijler-eyebrow"
        >
          {eyebrow}
        </div>
        <h1
          className="openregio-public-title"
          style={{ display: "flex", alignItems: "center", gap: 14 }}
          data-testid="text-pijler-title"
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(242,138,26,0.12)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-hidden
          >
            <Icon style={{ width: 22, height: 22, color: "#f28a1a" }} />
          </span>
          {title}
        </h1>
        <p className="openregio-public-lead" data-testid="text-pijler-intro">
          {intro}
        </p>

        <section className="openregio-public-card" data-testid="section-pijler-uitleg">
          <h2>Wat bedoelen we hiermee?</h2>
          <p>{lead}</p>
        </section>

        <section className="openregio-public-card" data-testid="section-pijler-acties">
          <h2>Drie concrete acties die je kunt zetten</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {acties.map((a, i) => (
              <li
                key={a.title}
                data-testid={`item-actie-${i}`}
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <CheckCircle2
                  style={{ width: 20, height: 20, color: "#0b2240", flexShrink: 0, marginTop: 2 }}
                  aria-hidden
                />
                <div>
                  <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{a.title}</div>
                  <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>{a.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="openregio-public-card" data-testid="section-pijler-modules">
          <h2>Direct naar de juiste tool</h2>
          <p style={{ marginBottom: 16 }}>
            Deze onderdelen van OpenRegio horen bij deze pijler. Log in om ze te gebruiken — of word lid om alles te ontgrendelen.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {modules.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                data-testid={`link-module-${m.href.replace(/\//g, "-")}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="hover-elevate"
                  style={{
                    border: "1px solid #e8edf8",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    background: "#fff",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{m.description}</div>
                  </div>
                  <ArrowRight style={{ width: 18, height: 18, color: "#0b2240", flexShrink: 0 }} aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          className="openregio-public-card"
          data-testid="section-pijler-andere-pijlers"
          style={{ background: "#f8faff" }}
        >
          <h2>De andere pijlers</h2>
          <p style={{ marginBottom: 16 }}>
            Een gezond bedrijf staat op vier benen. Bekijk ook de andere pijlers van gezond ondernemen.
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {Object.values(PIJLERS)
              .filter((p) => p.slug !== pijler.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={`/gezond/${p.slug}`}
                  data-testid={`link-andere-pijler-${p.slug}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="hover-elevate"
                    style={{
                      border: "1px solid #e8edf8",
                      borderRadius: 12,
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#fff",
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: "rgba(242,138,26,0.12)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    >
                      <p.Icon style={{ width: 16, height: 16, color: "#f28a1a" }} />
                    </span>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>{p.title}</span>
                    <ArrowRight style={{ width: 16, height: 16, color: "#0b2240", marginLeft: "auto" }} aria-hidden />
                  </div>
                </Link>
              ))}
          </div>
        </section>

        <p style={{ fontSize: 13, color: "#64748b", marginTop: 24, textAlign: "center" }}>
          Klaar om te beginnen?{" "}
          <Link href="/lidmaatschap" style={{ color: "#0b2240", fontWeight: 700 }} data-testid="link-naar-lidmaatschap">
            Bekijk het lidmaatschap
          </Link>{" "}
          of{" "}
          <Link href="/login" style={{ color: "#0b2240", fontWeight: 700 }} data-testid="link-naar-login">
            log in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
