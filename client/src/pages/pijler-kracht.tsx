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
  { tekst: "✓ Profiel aangemaakt", af: true },
  { tekst: "→ Eerste connectie", af: false },
  { tekst: "→ Lokale actie", af: false },
  { tekst: "→ Vacature plaatsen", af: false },
  { tekst: "→ Klantentips lezen", af: false },
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
    icon: "🤝",
    titel: "Samenwerken",
    sub: "Verbind met andere ondernemers in jouw regio.",
    status: { label: "→ Aan de slag" },
    body: "Een sterk netwerk van lokale ondernemers maakt iedereen beter. Samen kun je kosten delen, klanten doorverwijzen en kennis uitwisselen. OpenRegio maakt het makkelijk om de juiste mensen in jouw regio te vinden.",
    stappen: [
      { tekst: "Profiel aangemaakt en sector ingevuld", af: true },
      { tekst: "Zoek ondernemers op sector of naam" },
      { tekst: "Stuur je eerste connectieverzoek" },
      { tekst: "Deel een tip of vraag in het netwerk" },
    ],
    voet: { primair: "👥 Netwerk bekijken →", secundair: "Connecties zoeken" },
    breed: true,
  },
  {
    icon: "📅",
    titel: "Lokale acties organiseren",
    sub: "Events, workshops en buurtacties die werken.",
    status: { label: "→ Aan de slag" },
    body: "Organiseer samen met andere ondernemers activiteiten die klanten naar jouw regio trekken. Van een gezamenlijke actiedag tot een kennisworkshop.",
    stappen: [
      { tekst: "Bekijk aankomende acties in jouw regio" },
      { tekst: "Meld je aan voor een actie" },
      { tekst: "Maak zelf een actie aan" },
    ],
    voet: { primair: "📅 Acties bekijken →", secundair: "+ Actie aanmaken" },
  },
  {
    icon: "👤",
    titel: "Personeel & kennis delen",
    sub: "Vind personeel, deel kennis en help elkaar verder.",
    status: { label: "→ Aan de slag" },
    body: "Zoek samen personeel, deel ervaringen met andere ondernemers en leer van elkaars kennis. Lokaal talent vinden gaat makkelijker samen.",
    stappen: [
      { tekst: "Bekijk openstaande vacatures in jouw regio" },
      { tekst: "Plaats een vacature voor jouw bedrijf" },
      { tekst: "Deel een tip in het kennisnetwerk" },
    ],
    voet: { primair: "💼 Vacatures →", secundair: "+ Plaatsen" },
  },
  {
    icon: "❤️",
    titel: "Klantenbinding",
    sub: "Meer terugkerende klanten door lokale betrokkenheid.",
    status: { label: "→ Aan de slag" },
    body: "Klanten die zich verbonden voelen met jouw bedrijf en de regio komen vaker terug. OpenRegio geeft je praktische tips voor klantenbinding die werken voor lokale ondernemers.",
    stappen: [
      { tekst: "Lees de klantenbinding tips voor jouw sector" },
      { tekst: "Maak een klantenprogramma aan" },
      { tekst: "Verbind klanten met lokale acties" },
    ],
    voet: { primair: "❤️ Tips bekijken →", secundair: "Klantenprogramma" },
  },
  {
    icon: "⭐",
    titel: "Elkaar versterken",
    sub: "Samen maken we de regio aantrekkelijker en sterker.",
    status: { label: "→ Aan de slag" },
    body: "Door samen te werken wordt jouw regio als geheel sterker en aantrekkelijker voor klanten van buiten. Een sterke regio is goed voor iedere ondernemer afzonderlijk.",
    stappen: [
      { tekst: "Bekijk de regio-score van jouw regio" },
      { tekst: "Draag bij aan een gezamenlijk initiatief" },
      { tekst: "Nodig een andere ondernemer uit" },
    ],
    voet: { primair: "⭐ Regio bekijken →", secundair: "Uitnodigen" },
  },
];

const NETWERK = [
  { initialen: "BV", kleur: "#2563a8", naam: "Bakkerij de Vries", sector: "🥐 Horeca", regio: "Centrum" },
  { initialen: "KS", kleur: "#2B7A3E", naam: "Kapsalon Stijl", sector: "✂️ Dienstverlening", regio: "Oost" },
  { initialen: "FW", kleur: "#E8890A", naam: "Fietsenwinkel Wout", sector: "🚲 Winkels", regio: "Noord", verbonden: true },
  { initialen: "ZP", kleur: "#7F77DD", naam: "ZorgPunt Utrecht", sector: "🏥 Zorg", regio: "West" },
  { initialen: "PT", kleur: "#D85A30", naam: "Sportschool PowerUp", sector: "🏋️ Sport", regio: "Zuid" },
];

const ACTIES = [
  {
    dag: "22", mnd: "MEI", datumClass: "or-pp-ad-groen",
    naam: "Workshop: Online zichtbaarheid", meta: "📍 Centrum · 14:00",
    type: "Workshop", typeClass: "or-pp-at-groen",
    deelnemers: [
      { i: "BV", k: "#2563a8" },
      { i: "KS", k: "#2B7A3E" },
      { i: "FW", k: "#E8890A" },
    ],
    deelTekst: "14 ondernemers aangemeld",
    knop: "Aanmelden →", aangemeld: false,
  },
  {
    dag: "28", mnd: "MEI", datumClass: "or-pp-ad-blauw",
    naam: "Ondernemers netwerk borrel", meta: "📍 Grand Café · 17:00",
    type: "Netwerk", typeClass: "or-pp-at-blauw",
    deelnemers: [
      { i: "ZP", k: "#7F77DD" },
      { i: "PT", k: "#D85A30" },
      { i: "+", k: "#2563a8" },
    ],
    deelTekst: "23 ondernemers aangemeld",
    knop: "✓ Aangemeld", aangemeld: true,
  },
  {
    dag: "3", mnd: "JUN", datumClass: "or-pp-ad-oranje",
    naam: "Buurtmarkt Lombok", meta: "📍 Lombok Plein · 10:00",
    type: "Event", typeClass: "or-pp-at-oranje",
    deelnemers: [
      { i: "KS", k: "#2B7A3E" },
      { i: "FW", k: "#E8890A" },
      { i: "+", k: "#2563a8" },
    ],
    deelTekst: "31 ondernemers aangemeld",
    knop: "Aanmelden →", aangemeld: false,
  },
];

export default function PijlerKrachtPage() {
  const [, setLocation] = useLocation();
  usePageMeta(
    "Lokale Kracht — OpenRegio",
    "Voor ondernemers die sterker willen staan in hun regio. Verbind met andere ondernemers, organiseer acties en bouw aan een loyale klantenbasis."
  );
  return (
    <div className="or-pp-page or-pp-kracht" data-testid="page-pijler-kracht">
      <div className="or-pp-hoofd">
        <div className="or-pp-breadcrumb">
          <Link href="/vandaag">Dashboard</Link>
          <span>›</span>
          <span>Lokale Kracht</span>
        </div>
        <div className="or-pp-hoofd-inner">
          <div className="or-pp-titels">
            <div className="or-pp-num">3</div>
            <div>
              <h1>Lokale Kracht</h1>
              <p className="or-pp-sub">Voor ondernemers die sterker willen staan in hun regio.</p>
            </div>
          </div>
          <div className="or-pp-waarden">
            <span className="or-pp-waarde-pill">🤝 Samenwerken</span>
            <span className="or-pp-waarde-pill">⭐ Sterke regio</span>
            <span className="or-pp-waarde-pill">❤️ Klantenbinding</span>
          </div>
        </div>
      </div>

      <div className="or-pp-samen">
        <div className="or-pp-samen-icon">🎯</div>
        <div>
          <div className="or-pp-samen-tekst">KORT: Samen maak je de regio sterker.</div>
          <div className="or-pp-samen-sub">Verbind met andere ondernemers, organiseer acties en bouw aan een loyale klantenbasis in jouw regio.</div>
        </div>
      </div>

      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">Jouw voortgang</div>
        <div className="or-pp-voort">
          <div>
            <div className="or-pp-voort-pct">35%</div>
            <div className="or-pp-voort-pct-label">voltooid</div>
          </div>
          <div className="or-pp-voort-balk-wrap">
            <div className="or-pp-voort-balk-outer">
              <div className="or-pp-voort-balk-inner" style={{ width: "35%" }} />
            </div>
            <div className="or-pp-voort-pills">
              {VOORTGANG_PILLS.map((p) => (
                <span key={p.tekst} className={`or-pp-pill ${p.af ? "or-pp-pill-af" : "or-pp-pill-open"}`}>{p.tekst}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">De vijf onderdelen van Lokale Kracht</div>
        <div className="or-pp-features">
          {FEATURES.map((f, i) => (
            <FeatureKaart key={i} feature={f} />
          ))}
        </div>
      </div>

      {/* NETWERK */}
      <div className="or-pp-sectie" style={{ marginTop: 24 }}>
        <div className="or-pp-sectie-titel">
          <span>👥 Ondernemers in jouw regio</span>
          <Link href="/network" className="or-pp-sectie-link">Bekijk heel netwerk →</Link>
        </div>
        <div className="or-pp-netwerk">
          {NETWERK.map((n) => (
            <div key={n.naam} className="or-pp-nk" data-testid={`netwerk-${n.initialen}`}>
              <div className="or-pp-nk-hoofd">
                <div className="or-pp-nk-avatar" style={{ background: n.kleur }}>{n.initialen}</div>
                <div>
                  <div className="or-pp-nk-naam">{n.naam}</div>
                  <div className="or-pp-nk-sector">{n.sector}</div>
                  <span className="or-pp-nk-regio">{n.regio}</span>
                </div>
              </div>
              <button type="button" className={`or-pp-nk-btn${n.verbonden ? " or-pp-verbonden" : ""}`}>
                {n.verbonden ? "✓ Verbonden" : "+ Connecten"}
              </button>
            </div>
          ))}
          <div className="or-pp-nk or-pp-nk-meer">
            <div className="or-pp-nk-meer-icon">👥</div>
            <div className="or-pp-nk-meer-titel">Meer ondernemers</div>
            <div className="or-pp-nk-meer-sub">12 ondernemers in jouw regio</div>
            <button
              type="button"
              className="or-pp-nk-btn"
              style={{ marginTop: 10 }}
              onClick={() => setLocation("/network")}
            >Alles bekijken →</button>
          </div>
        </div>
      </div>

      {/* ACTIES */}
      <div className="or-pp-sectie" style={{ marginTop: 24 }}>
        <div className="or-pp-sectie-titel">
          <span>📅 Aankomende acties in jouw regio</span>
          <Link href="/lokale-acties" className="or-pp-sectie-link">+ Actie aanmaken</Link>
        </div>
        <div className="or-pp-acties">
          {ACTIES.map((a) => (
            <div key={a.naam} className="or-pp-actie" data-testid={`actie-${a.dag}-${a.mnd}`}>
              <div className="or-pp-actie-hoofd">
                <div className={`or-pp-actie-datum ${a.datumClass}`}>
                  <div className="or-pp-ad-dag">{a.dag}</div>
                  <div className="or-pp-ad-mnd">{a.mnd}</div>
                </div>
                <div className="or-pp-actie-info">
                  <div className="or-pp-actie-naam">{a.naam}</div>
                  <div className="or-pp-actie-meta">{a.meta}</div>
                </div>
                <span className={`or-pp-actie-type ${a.typeClass}`}>{a.type}</span>
              </div>
              <div className="or-pp-actie-body">
                <div className="or-pp-actie-deeln">
                  <div className="or-pp-actie-avatars">
                    {a.deelnemers.map((d, i) => (
                      <div key={i} className="or-pp-actie-avatar" style={{ background: d.k }}>{d.i}</div>
                    ))}
                  </div>
                  <span>{a.deelTekst}</span>
                </div>
                <button type="button" className={`or-pp-actie-aanmelden${a.aangemeld ? " or-pp-aangemeld" : ""}`}>
                  {a.knop}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="or-pp-eind">
        <div className="or-pp-eind-icon">🎯</div>
        <div className="or-pp-eind-info">
          <div className="or-pp-eind-tekst">Samen maak je de regio sterker.</div>
          <div className="or-pp-eind-sub">Je hebt nog 4 stappen te gaan. Begin met je eerste connectie in jouw regio.</div>
        </div>
        <div className="or-pp-eind-knoppen">
          <button className="or-pp-eind-btn or-pp-eind-btn-wit" type="button" onClick={() => setLocation("/network")}>👥 Netwerk starten →</button>
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
