import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import LokaleVindbaarheid from "@/components/lokale-vindbaarheid/LokaleVindbaarheid";

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
  { tekst: "✓ Website check", af: true },
  { tekst: "✓ Google-profiel", af: true },
  { tekst: "✓ Vindbaarheid bekeken", af: true },
  { tekst: "✓ Checklist 8/10", af: true },
  { tekst: "→ Advertenties reduceren", af: false },
];

const SCORE_ONDERDELEN = [
  { label: "Laadsnelheid", pct: 55 },
  { label: "Mobiel", pct: 70 },
  { label: "Inhoud", pct: 90 },
  { label: "Google-profiel", pct: 85 },
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
    icon: "🌐",
    titel: "Website check",
    sub: "Is jouw website sterk, snel en klantvriendelijk?",
    status: { label: "✓ Score: 72/100", af: true },
    body: "OpenRegio analyseert je website op laadsnelheid, mobiele weergave, inhoud en technische kwaliteit. Je krijgt een concrete lijst met verbeterpunten — van makkelijk tot uitgebreid.",
    stappen: [
      { tekst: "Website ingevoerd en geanalyseerd", af: true },
      { tekst: "Verbeterpunten rapport ontvangen", af: true },
      { tekst: "Laadsnelheid verbeteren (nu 55%)" },
      { tekst: "Mobiele versie optimaliseren" },
    ],
    voet: { primair: "🌐 Rapport bekijken →", secundair: "🔄 Opnieuw analyseren" },
    breed: true,
  },
  {
    icon: "📍",
    titel: "Google-profiel",
    sub: "Maximaal profiteren van je Google-vermelding.",
    status: { label: "✓ Compleet", af: true },
    body: "Je Google-bedrijfsprofiel is kosteloos maar enorm krachtig. OpenRegio helpt je om alle onderdelen volledig in te vullen en bij te houden.",
    stappen: [
      { tekst: "Google-profiel volledig ingevuld", af: true },
      { tekst: "Foto's en openingstijden actueel", af: true },
      { tekst: "Wekelijks reviews monitoren" },
    ],
    voet: { primair: "📍 Profiel openen →", secundair: "Tips bekijken" },
  },
  {
    icon: "💻",
    titel: "Online basis op orde",
    sub: "10 essentiële punten voor elke ondernemer.",
    status: { label: "8 / 10 voltooid", af: true },
    body: "Een korte checklist met de basisdingen die elke ondernemer online geregeld moet hebben. Snel door te lopen en heel concreet.",
    stappen: [
      { tekst: "SSL certificaat actief (https://)", af: true },
      { tekst: "Contactpagina compleet met formulier", af: true },
      { tekst: "Laadtijd onder 3 seconden brengen" },
    ],
    voet: { primair: "💻 Checklist →", secundair: "Alle 10 items" },
  },
  {
    icon: "€",
    titel: "Minder afhankelijkheid van advertenties",
    sub: "Minder betalen aan advertenties en grote platforms.",
    status: { label: "→ Aan de slag" },
    body: "Veel ondernemers zijn te afhankelijk van Google Ads, Meta advertenties of Thuisbezorgd. OpenRegio helpt je om organisch gevonden te worden, zodat je minder hoeft te betalen aan platforms en meer winst overhoudt.",
    stappen: [
      { tekst: "Huidig advertentiebudget in kaart brengen" },
      { tekst: "Organische alternatieven verkennen" },
      { tekst: "Plan maken om advertentiekosten te halveren" },
      { tekst: "Eigen klantenbestand opbouwen" },
    ],
    voet: { primair: "€ Bespaarplan starten →", secundair: "Advertentiekosten berekenen" },
    breed: true,
  },
];

const CHECKLIST = [
  { tekst: "Website heeft SSL (https://)", cat: "Techniek", catClass: "or-pp-cat-tech", af: true },
  { tekst: "Contactpagina aanwezig", cat: "Inhoud", catClass: "or-pp-cat-inhoud", af: true },
  { tekst: "Openingstijden zichtbaar", cat: "Inhoud", catClass: "or-pp-cat-inhoud", af: true },
  { tekst: "Foto's van je zaak aanwezig", cat: "Design", catClass: "or-pp-cat-design", af: true },
  { tekst: "Google-profiel volledig ingevuld", cat: "Techniek", catClass: "or-pp-cat-tech", af: true },
  { tekst: "Website werkt op mobiel", cat: "Techniek", catClass: "or-pp-cat-tech", af: true },
  { tekst: "Reviews zichtbaar op website", cat: "Inhoud", catClass: "or-pp-cat-inhoud", af: true },
  { tekst: "Social media gekoppeld", cat: "Techniek", catClass: "or-pp-cat-tech", af: true },
  { tekst: "Laadtijd onder 3 seconden", cat: "Techniek", catClass: "or-pp-cat-tech", af: false },
  { tekst: "Menu of diensten online", cat: "Inhoud", catClass: "or-pp-cat-inhoud", af: false },
];

export default function PijlerZichtbaarheidPage() {
  const [, setLocation] = useLocation();
  usePageMeta(
    "Lokale Zichtbaarheid — OpenRegio",
    "Voor ondernemers die beter gevonden willen worden door lokale klanten. Website check, Google-profiel en vindbaarheid in jouw regio."
  );
  return (
    <div className="or-pp-page or-pp-zicht" data-testid="page-pijler-zichtbaarheid">
      <div className="or-pp-hoofd">
        <div className="or-pp-breadcrumb">
          <Link href="/vandaag">Dashboard</Link>
          <span>›</span>
          <span>Lokale Zichtbaarheid</span>
        </div>
        <div className="or-pp-hoofd-inner">
          <div className="or-pp-titels">
            <div className="or-pp-num">2</div>
            <div>
              <h1>Lokale Zichtbaarheid</h1>
              <p className="or-pp-sub">Voor ondernemers die beter gevonden willen worden door lokale klanten.</p>
            </div>
          </div>
          <div className="or-pp-waarden">
            <span className="or-pp-waarde-pill">🌐 Website</span>
            <span className="or-pp-waarde-pill">🔍 Vindbaarheid</span>
            <span className="or-pp-waarde-pill">📍 Google</span>
          </div>
        </div>
      </div>

      <div className="or-pp-samen">
        <div className="or-pp-samen-icon">🎯</div>
        <div>
          <div className="or-pp-samen-tekst">KORT: Zorg dat klanten je lokaal blijven vinden.</div>
          <div className="or-pp-samen-sub">Je website op orde, gevonden worden in Google en minder afhankelijk van dure advertenties.</div>
        </div>
      </div>

      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">Jouw voortgang</div>
        <div className="or-pp-voort">
          <div>
            <div className="or-pp-voort-pct">80%</div>
            <div className="or-pp-voort-pct-label">voltooid</div>
          </div>
          <div className="or-pp-voort-balk-wrap">
            <div className="or-pp-voort-balk-outer">
              <div className="or-pp-voort-balk-inner" style={{ width: "80%" }} />
            </div>
            <div className="or-pp-voort-pills">
              {VOORTGANG_PILLS.map((p) => (
                <span key={p.tekst} className={`or-pp-pill ${p.af ? "or-pp-pill-af" : "or-pp-pill-open"}`}>{p.tekst}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SCORE */}
      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">🌐 Jouw website score</div>
        <div className="or-pp-score">
          <div className="or-pp-score-cirkel">
            <div className="or-pp-score-getal">72</div>
            <div className="or-pp-score-max">/100</div>
          </div>
          <div className="or-pp-score-info">
            <div className="or-pp-score-titel">Goed — er is nog ruimte voor verbetering</div>
            <div className="or-pp-score-sub">Je website scoort 72 van de 100 punten. De laadsnelheid en mobiele weergave kunnen beter. Op inhoud en Google-profiel scoor je al uitstekend.</div>
            <div className="or-pp-score-onderdelen">
              {SCORE_ONDERDELEN.map((o) => (
                <div key={o.label} className="or-pp-score-item">
                  <span className="or-pp-score-item-label">{o.label}</span>
                  <div className="or-pp-score-balk">
                    <div className="or-pp-score-balk-fill" style={{ width: `${o.pct}%` }} />
                  </div>
                  <span className="or-pp-score-pct">{o.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <button
            className="or-pp-score-actie"
            type="button"
            data-testid="button-opnieuw-checken"
            onClick={() => setLocation("/groei/website-check")}
          >🔄 Opnieuw checken</button>
        </div>
      </div>

      {/* LOKALE VINDBAARHEID — INTERACTIEVE TOOL */}
      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">Lokale vindbaarheid</div>
        <LokaleVindbaarheid />
      </div>

      {/* FEATURES */}
      <div className="or-pp-sectie">
        <div className="or-pp-sectie-titel">De overige onderdelen van Lokale Zichtbaarheid</div>
        <div className="or-pp-features">
          {FEATURES.map((f, i) => (
            <FeatureKaart key={i} feature={f} />
          ))}
        </div>
      </div>

      {/* CHECKLIST */}
      <div className="or-pp-sectie" style={{ marginTop: 24 }}>
        <div className="or-pp-sectie-titel">
          <span>💻 Online basis checklist</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--or-pp)" }}>8 / 10 voltooid</span>
        </div>
        <div className="or-pp-checklist">
          {CHECKLIST.map((c) => (
            <div key={c.tekst} className={`or-pp-check ${c.af ? "or-pp-check-af" : ""}`} data-testid={`check-${c.tekst.slice(0, 20)}`}>
              <div className={`or-pp-check-box ${c.af ? "or-pp-cb-af" : "or-pp-cb-open"}`}>{c.af ? "✓" : ""}</div>
              <div className={`or-pp-check-tekst ${c.af ? "or-pp-ct-af" : ""}`}>{c.tekst}</div>
              <span className={`or-pp-check-cat ${c.catClass}`}>{c.cat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="or-pp-eind">
        <div className="or-pp-eind-icon">🎯</div>
        <div className="or-pp-eind-info">
          <div className="or-pp-eind-tekst">Zorg dat klanten je lokaal blijven vinden.</div>
          <div className="or-pp-eind-sub">Je bent bijna klaar — 80% voltooid. Verbeter de laadsnelheid en start het bespaarplan advertenties.</div>
        </div>
        <div className="or-pp-eind-knoppen">
          <button className="or-pp-eind-btn or-pp-eind-btn-wit" type="button" onClick={() => setLocation("/groei/zichtbaarheid")}>€ Bespaarplan starten →</button>
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
