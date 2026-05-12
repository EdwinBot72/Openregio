import { useEffect } from "react";
import { Link, useLocation } from "wouter";

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const prevDesc = meta?.getAttribute("content") ?? null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
    return () => {
      document.title = prev;
      if (meta && prevDesc !== null) meta.setAttribute("content", prevDesc);
    };
  }, [title, description]);
}

const VOORTGANG_PILLS = [
  { tekst: "✓ Brief verwerkt", af: true },
  { tekst: "✓ Regels doorgelezen", af: true },
  { tekst: "✓ Vergunning aangevraagd", af: true },
  { tekst: "→ Status volgen", af: false },
  { tekst: "→ Vervolgstappen", af: false },
];

type Stap = { tekst: string; af?: boolean };
type Feature = {
  icon: string;
  titel: string;
  sub: string;
  status: { label: string; af?: boolean };
  body: string;
  stappen: Stap[];
  voet: { primair: string; secundair: string };
  breed?: boolean;
};

const FEATURES: Feature[] = [
  {
    icon: "📄",
    titel: "Brieven begrijpen",
    sub: "Overheidsbrieven en besluiten helder uitgelegd.",
    status: { label: "✓ Gedaan", af: true },
    body: "Upload een brief van de gemeente, belastingdienst of een andere overheidsinstantie en wij leggen in gewone taal uit wat er staat, wat het betekent voor jouw bedrijf en wat je moet doen.",
    stappen: [
      { tekst: "Brief van gemeente over terrasvergunning geüpload en uitgelegd", af: true },
      { tekst: "Brief belastingdienst BTW-aangifte begrepen", af: true },
      { tekst: "Nieuwe brief uploaden en uitleg ontvangen" },
      { tekst: "Brieven archief bekijken en beheren" },
    ],
    voet: { primair: "📄 Brief uploaden →", secundair: "Mijn brieven archief" },
    breed: true,
  },
  {
    icon: "⚖️",
    titel: "Regels uitleggen",
    sub: "Wat betekenen de regels voor jouw bedrijf?",
    status: { label: "✓ Gedaan", af: true },
    body: "Alle relevante regels voor jouw sector en regio, vertaald naar concrete actiepunten voor jouw bedrijf. Altijd bijgewerkt naar de laatste stand van zaken.",
    stappen: [
      { tekst: "Regels voor terrassen horeca gelezen", af: true },
      { tekst: "Hygiëneregels HACCP doorgenomen", af: true },
      { tekst: "Nieuwe regelgeving energietransitie bekijken" },
    ],
    voet: { primair: "⚖️ Regels bekijken →", secundair: "Zoek een regel" },
  },
  {
    icon: "🏛️",
    titel: "Vergunningen volgen",
    sub: "Inzicht in aanvragen, status en verplichtingen.",
    status: { label: "→ In behandeling" },
    body: "Houd al je vergunningaanvragen bij op één plek. Zie direct wat de status is en wat je nog moet aanleveren.",
    stappen: [
      { tekst: "Terrasvergunning aangevraagd", af: true },
      { tekst: "Status terrasvergunning volgen (in behandeling)" },
      { tekst: "Alcoholvergunning checken voor aanvraag" },
    ],
    voet: { primair: "🏛️ Vergunningen →", secundair: "+ Nieuwe aanvraag" },
  },
  {
    icon: "ℹ️",
    titel: "Informatie opvragen",
    sub: "Wij helpen je de juiste informatie boven tafel te krijgen.",
    status: { label: "→ Aan de slag" },
    body: "Soms is het lastig om de juiste informatie te vinden bij de gemeente of belastingdienst. OpenRegio helpt je met een WOO-verzoek of een gerichte vraag aan de juiste instantie.",
    stappen: [
      { tekst: "WOO-verzoek opstellen via OpenRegio" },
      { tekst: "Bezwaar indienen met hulp van OpenRegio" },
      { tekst: "Vraag stellen aan RegioBot" },
    ],
    voet: { primair: "ℹ️ Stel een vraag →", secundair: "WOO-verzoek" },
  },
  {
    icon: "→",
    titel: "Praktische vervolgstappen",
    sub: "Duidelijk plan: wat kun je doen en wanneer?",
    status: { label: "→ Aan de slag" },
    body: "Op basis van jouw situatie stelt OpenRegio een concreet stappenplan voor je op. Zo weet je altijd wat de volgende stap is en vergeet je niets.",
    stappen: [
      { tekst: "Stappenplan voor terrasvergunning doorlopen" },
      { tekst: "Deadline belastingaangifte inplannen" },
      { tekst: "Herinneringen instellen voor vergunningsverloop" },
    ],
    voet: { primair: "→ Mijn stappenplan", secundair: "Planning bekijken" },
  },
];

const VERGUNNINGEN = [
  {
    icon: "🏛️",
    iconClass: "or-pp-vi-oranje",
    naam: "Terrasvergunning",
    type: "Gemeente Utrecht",
    status: "⏳ In behandeling",
    statusClass: "or-pp-vp-oranje",
    datum: "📅 Aangevraagd: 2 mei 2025 · Verwacht: juni 2025",
  },
  {
    icon: "✅",
    iconClass: "or-pp-vi-groen",
    naam: "Exploitatievergunning",
    type: "Gemeente Utrecht",
    status: "✓ Verleend",
    statusClass: "or-pp-vp-groen",
    datum: "📅 Geldig t/m: 31 december 2026",
  },
  {
    icon: "🍺",
    iconClass: "or-pp-vi-blauw",
    naam: "Alcoholvergunning",
    type: "Gemeente Utrecht",
    status: "→ Nog niet aangevraagd",
    statusClass: "or-pp-vp-blauw",
    datum: "⚡ Nodig voor uitbreiden assortiment",
  },
];

export default function PijlerGripPage() {
  const [, setLocation] = useLocation();
  usePageMeta(
    "Grip op Regels — OpenRegio",
    "Voor ondernemers die duidelijkheid willen over regels en vergunningen. Brieven uitgelegd, regels vertaald en vergunningen altijd in beeld."
  );
  return (
    <div className="or-pp-page or-pp-grip" data-testid="page-pijler-grip">
      {/* PAGINAHOOFD */}
      <div className="or-pp-hoofd">
        <div className="or-pp-breadcrumb">
          <Link href="/vandaag">Dashboard</Link>
          <span>›</span>
          <span>Grip op Regels</span>
        </div>
        <div className="or-pp-hoofd-inner">
          <div className="or-pp-titels">
            <div className="or-pp-num">1</div>
            <div>
              <h1>Grip op Regels</h1>
              <p className="or-pp-sub">Voor ondernemers die duidelijkheid willen over regels en vergunningen.</p>
            </div>
          </div>
          <div className="or-pp-waarden">
            <span className="or-pp-waarde-pill">⚖️ Duidelijkheid</span>
            <span className="or-pp-waarde-pill">🏛️ Vergunningen</span>
            <span className="or-pp-waarde-pill">📄 Brieven</span>
          </div>
        </div>
      </div>

      {/* SAMENVATTING */}
      <div className="or-pp-samen">
        <div className="or-pp-samen-icon">🎯</div>
        <div>
          <div className="or-pp-samen-tekst">KORT: Weet wat er speelt en wat je moet doen.</div>
          <div className="or-pp-samen-sub">Overheidsbrieven helder uitgelegd, regels vertaald naar jouw sector en vergunningen altijd in beeld.</div>
        </div>
      </div>

      {/* VOORTGANG */}
      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">Jouw voortgang</div>
        <div className="or-pp-voort">
          <div>
            <div className="or-pp-voort-pct">60%</div>
            <div className="or-pp-voort-pct-label">voltooid</div>
          </div>
          <div className="or-pp-voort-balk-wrap">
            <div className="or-pp-voort-balk-outer">
              <div className="or-pp-voort-balk-inner" style={{ width: "60%" }} />
            </div>
            <div className="or-pp-voort-pills">
              {VOORTGANG_PILLS.map((p) => (
                <span key={p.tekst} className={`or-pp-pill ${p.af ? "or-pp-pill-af" : "or-pp-pill-open"}`}>{p.tekst}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">Vijf onderdelen van Grip op Regels</div>
        <div className="or-pp-features">
          {FEATURES.map((f, i) => (
            <FeatureKaart key={i} feature={f} />
          ))}
          <div className="or-pp-upload" data-testid="upload-brief">
            <div className="or-pp-upload-icon">📂</div>
            <div className="or-pp-upload-titel">Sleep hier je brief naartoe</div>
            <div className="or-pp-upload-sub">
              Of klik om een bestand te kiezen. PDF, Word of afbeelding.<br />
              Wij leggen in gewone taal uit wat de brief betekent voor jouw bedrijf.
            </div>
            <button
              className="or-pp-upload-btn"
              type="button"
              data-testid="button-bestand-kiezen"
              onClick={() => setLocation("/regels/documenten")}
            >📄 Bestand kiezen</button>
          </div>
        </div>
      </div>

      {/* VERGUNNINGEN */}
      <div className="or-pp-sectie" style={{ marginTop: 24 }}>
        <div className="or-pp-sectie-titel">
          <span>🏛️ Jouw vergunningen</span>
          <Link href="/regels/check" className="or-pp-sectie-link">+ Nieuwe aanvraag</Link>
        </div>
        <div className="or-pp-verg-grid">
          {VERGUNNINGEN.map((v) => (
            <div key={v.naam} className="or-pp-verg" data-testid={`verg-${v.naam}`}>
              <div className="or-pp-verg-hoofd">
                <div className={`or-pp-verg-icon ${v.iconClass}`}>{v.icon}</div>
                <div>
                  <div className="or-pp-verg-naam">{v.naam}</div>
                  <div className="or-pp-verg-type">{v.type}</div>
                </div>
              </div>
              <div className={`or-pp-verg-pill ${v.statusClass}`}>{v.status}</div>
              <div className="or-pp-verg-datum">{v.datum}</div>
            </div>
          ))}
        </div>
      </div>

      {/* EIND */}
      <div className="or-pp-eind">
        <div className="or-pp-eind-icon">🎯</div>
        <div className="or-pp-eind-info">
          <div className="or-pp-eind-tekst">Weet wat er speelt en wat je moet doen.</div>
          <div className="or-pp-eind-sub">Je bent goed op weg — 60% voltooid. Volg je terrasvergunning en doorloop de vervolgstappen.</div>
        </div>
        <div className="or-pp-eind-knoppen">
          <button className="or-pp-eind-btn or-pp-eind-btn-wit" type="button" onClick={() => setLocation("/regels/check")}>🏛️ Vergunning volgen →</button>
          <button className="or-pp-eind-btn or-pp-eind-btn-trans" type="button" onClick={() => setLocation("/vandaag")}>Terug naar dashboard</button>
        </div>
      </div>
    </div>
  );
}

function FeatureKaart({ feature }: { feature: Feature }) {
  return (
    <div className={`or-pp-fk${feature.breed ? " or-pp-fk-breed" : ""}`}>
      <div className="or-pp-fk-hoofd">
        <div className="or-pp-fk-icon">{feature.icon}</div>
        <div className="or-pp-fk-titels">
          <h3>{feature.titel}</h3>
          <p>{feature.sub}</p>
        </div>
        <span className={`or-pp-fk-status ${feature.status.af ? "or-pp-status-af" : "or-pp-status-open"}`}>{feature.status.label}</span>
      </div>
      <div className="or-pp-fk-body">
        <p>{feature.body}</p>
        <div className="or-pp-stappen">
          {feature.stappen.map((s, i) => (
            <div key={i} className="or-pp-stap">
              <div className={`or-pp-stap-check ${s.af ? "or-pp-sc-af" : "or-pp-sc-open"}`}>{s.af ? "✓" : ""}</div>
              <div className={`or-pp-stap-tekst ${s.af ? "or-pp-stap-af" : "or-pp-stap-open"}`}>{s.tekst}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="or-pp-fk-voet">
        <button className="or-pp-voet-btn or-pp-btn-vol" type="button">{feature.voet.primair}</button>
        <button className="or-pp-voet-btn or-pp-btn-wit" type="button">{feature.voet.secundair}</button>
      </div>
    </div>
  );
}
