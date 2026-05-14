import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const HASH_TO_ID: Record<string, string> = {
  "#grip": "grip",
  "#zichtbaarheid": "zichtbaarheid",
  "#kracht": "kracht",
};

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.title = "OpenRegio — De praktische toolkit voor lokale ondernemers";
    const scrollToHash = () => {
      const target = HASH_TO_ID[window.location.hash];
      if (target) {
        const el = document.getElementById(target);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const dashboardHref = user ? "/vandaag" : "/login";

  return (
    <div className="or-app" data-testid="page-home">
      {/* NAVIGATIE */}
      <nav className="or-nav-bar">
        <a className="or-nav-link or-actief" href="#top">Home</a>
        <a className="or-nav-link" href="#grip">Grip op Regels</a>
        <a className="or-nav-link" href="#zichtbaarheid">Lokale Zichtbaarheid</a>
        <a className="or-nav-link" href="#kracht">Lokale Kracht</a>
        <Link href={dashboardHref} className="or-nav-link">Mijn Regio</Link>
        {user ? (
          <Link href="/vandaag" className="or-nav-link or-btn" data-testid="link-naar-dashboard">
            Naar dashboard →
          </Link>
        ) : (
          <Link href="/login" className="or-nav-link or-btn" data-testid="link-inloggen">
            Inloggen →
          </Link>
        )}
      </nav>

      {/* HEADER */}
      <header className="or-header" id="top">
        <div className="or-logo-blok">
          <svg className="or-logo-pin" viewBox="0 0 58 68" fill="none" aria-hidden>
            <path d="M29 2C15.2 2 4 13.2 4 27C4 44 29 66 29 66C29 66 54 44 54 27C54 13.2 42.8 2 29 2Z" fill="#1B3F7A" stroke="#0f2546" strokeWidth="1.5"/>
            <circle cx="29" cy="27" r="10" fill="white" opacity=".25"/>
            <path d="M22 24C22 20.7 25.6 18 29 22C32.4 18 36 20.7 36 24C36 28 29 33 29 33C29 33 22 28 22 24Z" fill="white"/>
            <rect x="14" y="32" width="10" height="8" rx="2" fill="#2B7A3E" opacity=".7"/>
            <rect x="26" y="28" width="14" height="12" rx="2" fill="#2B7A3E" opacity=".7"/>
          </svg>
          <div className="or-logo-tekst">
            <h1><span className="or-open">OPEN</span><span className="or-regio">REGIO</span></h1>
            <div className="or-tagline">De praktische toolkit voor lokale ondernemers</div>
            <div className="or-subtitel">Grip op regels. Zichtbaarheid die werkt. Samen sterk in jouw regio.</div>
          </div>
        </div>

        <div className="or-header-rechts">
          <div className="or-waarde-item">
            <div className="or-waarde-icon">🤝</div>
            <div>
              <strong>Vertrouwen</strong>
              <br />
              <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--or-tekst-zacht)" }}>van mens tot mens</span>
            </div>
          </div>
          <div className="or-waarde-item">
            <div className="or-waarde-icon" style={{ background: "var(--or-groen-licht)", borderColor: "var(--or-groen)" }}>🛡️</div>
            <div>
              <strong>Vakmanschap</strong>
              <br />
              <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--or-tekst-zacht)" }}>is meesterschap</span>
            </div>
          </div>
          <div className="or-waarde-item">
            <div className="or-waarde-icon" style={{ background: "var(--or-oranje-licht)", borderColor: "var(--or-oranje)" }}>👥</div>
            <div>
              <strong>Sterke ondernemers,</strong>
              <br />
              <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--or-tekst-zacht)" }}>sterke regio's</span>
            </div>
          </div>
        </div>
      </header>

      {/* VIER GEZONDE PIJLERS — link naar /gezond/<slug> */}
      <section
        id="gezond-pijlers"
        data-testid="section-gezond-pijlers"
        style={{ background: "#f8faff", padding: "32px 24px" }}
      >
        <h2 style={{ textAlign: "center", margin: "0 0 8px", color: "#0f172a" }}>
          Vier pijlers voor gezond ondernemen
        </h2>
        <p style={{ textAlign: "center", color: "#475569", margin: "0 auto 20px", maxWidth: 640 }}>
          Een gezond bedrijf staat op vier benen. Bekijk per pijler wat OpenRegio voor je doet.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {[
            { slug: "financieel", label: "Financieel gezond" },
            { slug: "bestuurlijk", label: "Bestuurlijk gezond" },
            { slug: "mentaal", label: "Mentaal gezond" },
            { slug: "strategisch", label: "Strategisch gezond" },
          ].map((p) => (
            <Link
              key={p.slug}
              href={`/gezond/${p.slug}`}
              data-testid={`link-gezond-card-${p.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                className="hover-elevate"
                style={{
                  background: "#fff",
                  border: "1px solid #e8edf8",
                  borderRadius: 12,
                  padding: "18px 16px",
                  fontWeight: 700,
                  color: "#0f172a",
                  textAlign: "center",
                }}
              >
                {p.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* DRIE PIJLERS */}
      <section className="or-pijlers-wrap">
        <h2 className="or-pijlers-titel">OpenRegio helpt ondernemers groeien met drie pijlers</h2>

        <div className="or-pijlers-grid">
          {/* PIJLER 1 — GRIP OP REGELS */}
          <div className="or-pijler-kaart or-p1-kaart" id="grip">
            <div className="or-pijler-header">
              <div className="or-pijler-num or-num-blauw">1</div>
              <div className="or-pijler-titels">
                <h2>Grip op Regels</h2>
                <p>Voor ondernemers die duidelijkheid willen.</p>
              </div>
            </div>

            <div className="or-pijler-body">
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-blauw">📄</div>
                <div className="or-feature-tekst">
                  <strong>Brieven begrijpen</strong>
                  <span>Overheidsbrieven en besluiten helder uitgelegd.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-blauw">⚖️</div>
                <div className="or-feature-tekst">
                  <strong>Regels uitleggen</strong>
                  <span>Wat betekenen de regels voor jouw bedrijf?</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-blauw">🏛️</div>
                <div className="or-feature-tekst">
                  <strong>Vergunningen volgen</strong>
                  <span>Inzicht in aanvragen, status en verplichtingen.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-blauw">ℹ️</div>
                <div className="or-feature-tekst">
                  <strong>Informatie opvragen</strong>
                  <span>Wij helpen je de juiste informatie boven tafel te krijgen.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-blauw">→</div>
                <div className="or-feature-tekst">
                  <strong>Praktische vervolgstappen</strong>
                  <span>Duidelijk plan: wat kun je doen en wanneer?</span>
                </div>
              </div>
            </div>

            <div className="or-pijler-samenvatting or-sam-blauw">
              <span className="or-sam-icon">🎯</span>
              <span>KORT: Weet wat er speelt<br />en wat je moet doen.</span>
            </div>
          </div>

          {/* PIJLER 2 — LOKALE ZICHTBAARHEID */}
          <div className="or-pijler-kaart or-p2-kaart" id="zichtbaarheid">
            <div className="or-pijler-header">
              <div className="or-pijler-num or-num-groen">2</div>
              <div className="or-pijler-titels">
                <h2>Lokale Zichtbaarheid</h2>
                <p>Voor ondernemers die beter gevonden willen worden.</p>
              </div>
            </div>

            <div className="or-pijler-body">
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-groen">🌐</div>
                <div className="or-feature-tekst">
                  <strong>Website check</strong>
                  <span>Is jouw website sterk, snel en klantvriendelijk?</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-groen">🔍</div>
                <div className="or-feature-tekst">
                  <strong>Lokale vindbaarheid</strong>
                  <span>Beter gevonden worden in Google en AI-zoekmachines.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-groen">🏪</div>
                <div className="or-feature-tekst">
                  <strong>Google-profiel</strong>
                  <span>Je profiel optimaliseren voor meer vertrouwen en zichtbaarheid.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-groen">💻</div>
                <div className="or-feature-tekst">
                  <strong>Online basis op orde</strong>
                  <span>Techniek, inhoud, structuur en uitstraling verbeteren.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-groen">€</div>
                <div className="or-feature-tekst">
                  <strong>Minder afhankelijkheid</strong>
                  <span>Minder betalen aan advertenties en grote platforms.</span>
                </div>
              </div>
            </div>

            <div className="or-pijler-samenvatting or-sam-groen">
              <span className="or-sam-icon">🎯</span>
              <span>KORT: Zorg dat klanten<br />je lokaal blijven vinden.</span>
            </div>
          </div>

          {/* PIJLER 3 — LOKALE KRACHT */}
          <div className="or-pijler-kaart or-p3-kaart" id="kracht">
            <div className="or-pijler-header">
              <div className="or-pijler-num or-num-oranje">3</div>
              <div className="or-pijler-titels">
                <h2>Lokale Kracht</h2>
                <p>Voor ondernemers die sterker willen staan in hun regio.</p>
              </div>
            </div>

            <div className="or-pijler-body">
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-oranje">🤝</div>
                <div className="or-feature-tekst">
                  <strong>Samenwerken</strong>
                  <span>Verbind met andere ondernemers in jouw regio.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-oranje">📅</div>
                <div className="or-feature-tekst">
                  <strong>Lokale acties organiseren</strong>
                  <span>Events, workshops en buurtacties die werken.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-oranje">👤</div>
                <div className="or-feature-tekst">
                  <strong>Personeel & kennis delen</strong>
                  <span>Vind personeel, deel kennis en help elkaar verder.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-oranje">❤️</div>
                <div className="or-feature-tekst">
                  <strong>Klantenbinding</strong>
                  <span>Meer terugkerende klanten door persoonlijke aandacht en lokale betrokkenheid.</span>
                </div>
              </div>
              <div className="or-feature-item">
                <div className="or-feature-icon or-icon-oranje">⭐</div>
                <div className="or-feature-tekst">
                  <strong>Elkaar versterken</strong>
                  <span>Samen maken we de regio aantrekkelijker en sterker.</span>
                </div>
              </div>
            </div>

            <div className="or-pijler-samenvatting or-sam-oranje">
              <span className="or-sam-icon">🎯</span>
              <span>KORT: Samen maak je<br />de regio sterker.</span>
            </div>
          </div>
        </div>
      </section>

      {/* VOOR WIE + WAAROM */}
      <section className="or-onder-wrap">
        <div>
          <div className="or-page-sectie-titel">Voor wie?</div>
          <div className="or-sectie-sub">Voor elke lokale ondernemer:</div>
          <div className="or-sector-rij">
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">🍽️</div>
              <div className="or-sector-label">Horeca</div>
            </div>
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">🛍️</div>
              <div className="or-sector-label">Winkels</div>
            </div>
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">🔨</div>
              <div className="or-sector-label">Vakmensen</div>
            </div>
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">💼</div>
              <div className="or-sector-label">Diensten</div>
            </div>
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">🏥</div>
              <div className="or-sector-label">Zorg</div>
            </div>
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">🏆</div>
              <div className="or-sector-label">Sport</div>
            </div>
            <div className="or-sector-item">
              <div className="or-sector-icon-wrap">👤</div>
              <div className="or-sector-label">ZZP & MKB</div>
            </div>
          </div>
        </div>

        <div>
          <div className="or-page-sectie-titel">Waarom OpenRegio?</div>
          <div className="or-sectie-sub">Vijf goede redenen:</div>
          <div className="or-waarom-items">
            <div className="or-waarom-stap">
              <div className="or-waarom-check">✓</div>
              <div className="or-waarom-tekst">Meer overzicht</div>
            </div>
            <div className="or-pijl-rechts">→</div>
            <div className="or-waarom-stap">
              <div className="or-waarom-check">✓</div>
              <div className="or-waarom-tekst">Minder gedoe</div>
            </div>
            <div className="or-pijl-rechts">→</div>
            <div className="or-waarom-stap">
              <div className="or-waarom-check">✓</div>
              <div className="or-waarom-tekst">Praktische tools</div>
            </div>
            <div className="or-pijl-rechts">→</div>
            <div className="or-waarom-stap">
              <div className="or-waarom-check">✓</div>
              <div className="or-waarom-tekst">Regionale steun</div>
            </div>
            <div className="or-pijl-rechts">→</div>
            <div className="or-waarom-stap">
              <div className="or-waarom-check">✓</div>
              <div className="or-waarom-tekst">Toekomstbestendig</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA REGEL */}
      <section style={{ background: "white", padding: "32px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href={user ? "/vandaag" : "/register"}
            className="or-nav-link or-btn"
            style={{ marginLeft: 0, fontSize: "14px", padding: "10px 22px" }}
            data-testid="cta-start"
          >
            {user ? "Naar mijn dashboard →" : "Start gratis met OpenRegio →"}
          </Link>
          <Link
            href="/lidmaatschap"
            className="or-nav-link"
            style={{
              background: "white",
              color: "var(--or-blauw)",
              border: "2px solid var(--or-blauw)",
              padding: "8px 22px",
              borderRadius: "20px",
              fontSize: "14px",
            }}
            data-testid="cta-lidmaatschap"
          >
            Bekijk lidmaatschappen
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="or-footer-home">
        <div className="or-footer-logo">
          <div className="or-footer-logo-icon">🤝</div>
          <div className="or-footer-slogan">Sterke ondernemers. Sterke regio's.</div>
        </div>
        <div className="or-footer-midden">
          OpenRegio is jouw partner voor grip, zichtbaarheid<br />
          en lokale kracht. Alles op één plek.
        </div>
        <a className="or-footer-web" href="https://www.openregio.nl">
          <div className="or-footer-web-icon">🌐</div>
          www.openregio.nl
        </a>
      </footer>

      {/* Onder-strook met juridische links */}
      <div style={{ background: "var(--or-donkerblauw)", padding: "10px 40px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ fontSize: "12px", color: "rgba(255,255,255,.4)" }}>© 2026 OpenRegio</div>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <Link href="/privacy" className="or-footer-link">Privacy</Link>
          <Link href="/voorwaarden" className="or-footer-link">Voorwaarden</Link>
          <Link href="/disclaimer" className="or-footer-link">Disclaimer</Link>
          <Link href="/cookiebeleid" className="or-footer-link">Cookies</Link>
          <Link href="/blogs" className="or-footer-link">Blog</Link>
          <Link href="/lidmaatschap" className="or-footer-link">Lidmaatschap</Link>
        </div>
      </div>
    </div>
  );
}
