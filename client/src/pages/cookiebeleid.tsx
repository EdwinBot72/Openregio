import { Cookie, Shield, Settings, Clock, ToggleLeft } from "lucide-react";
import { PublicTopNav } from "@/components/PublicTopNav";

export default function CookiebeleidPage() {
  return (
    <div className="openregio-public-page" data-testid="page-cookiebeleid">
      <PublicTopNav />
      <div className="openregio-public-content">
        <h1 className="openregio-public-title" data-testid="text-cookiebeleid-title">Cookiebeleid</h1>
        <p className="openregio-public-lead">
          Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className="openregio-public-card">
          <h2><Cookie className="w-4 h-4" style={{ color: "#0b2240" }} /> Wat zijn cookies?</h2>
          <p>
            Cookies zijn kleine tekstbestanden die op je computer, tablet of telefoon worden opgeslagen wanneer je een website bezoekt. Ze helpen de website om je voorkeuren te onthouden en het platform goed te laten functioneren.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><Shield className="w-4 h-4" style={{ color: "#0b2240" }} /> Welke cookies gebruiken wij?</h2>

          <div className="openregio-soft-box">
            <h3>Noodzakelijke cookies</h3>
            <p>
              Deze cookies zijn essentieel voor het functioneren van het platform. Ze zorgen ervoor dat je kunt inloggen, navigeren en basisfuncties kunt gebruiken. Zonder deze cookies werkt het platform niet naar behoren.
            </p>
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: "#e8f0fe", color: "#0b2240" }}>
              Altijd actief
            </span>
          </div>

          <div className="openregio-soft-box">
            <h3>Functionele cookies</h3>
            <p>
              Deze cookies onthouden je voorkeuren zoals taalinstelling en thema (licht/donker modus). Ze verbeteren je gebruikservaring maar zijn niet strikt noodzakelijk.
            </p>
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: "#fef3e2", color: "#b5651d" }}>
              Optioneel
            </span>
          </div>

          <div className="openregio-soft-box">
            <h3>Sessie-cookies</h3>
            <p>
              Deze cookies bewaren je inlogstatus tijdens je bezoek. Ze worden automatisch verwijderd wanneer je de browser sluit of wanneer je sessie verloopt.
            </p>
            <span style={{ display: "inline-block", marginTop: 8, padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: "#e8f0fe", color: "#0b2240" }}>
              Altijd actief
            </span>
          </div>
        </section>

        <section className="openregio-public-card">
          <h2><ToggleLeft className="w-4 h-4" style={{ color: "#0b2240" }} /> Wat we niet gebruiken</h2>
          <p>
            OpenRegio gebruikt <strong>geen</strong> tracking cookies, advertentiecookies of analytische cookies van derden. Wij volgen je niet over andere websites en verkopen geen data aan adverteerders. Dit past bij onze kernwaarde: privacy en transparantie.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><Clock className="w-4 h-4" style={{ color: "#0b2240" }} /> Bewaartermijn</h2>
          <table className="w-full" style={{ fontSize: 14, marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e6ebf2" }}>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 800, color: "#0b2240" }}>Cookie type</th>
                <th style={{ textAlign: "left", padding: "8px 0", fontWeight: 800, color: "#0b2240" }}>Bewaartermijn</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px 0", color: "#374151" }}>Sessie-cookies</td>
                <td style={{ padding: "8px 0", color: "#374151" }}>Tot sluiten browser</td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "8px 0", color: "#374151" }}>Authenticatie (JWT)</td>
                <td style={{ padding: "8px 0", color: "#374151" }}>Maximaal 7 dagen</td>
              </tr>
              <tr>
                <td style={{ padding: "8px 0", color: "#374151" }}>Functionele cookies</td>
                <td style={{ padding: "8px 0", color: "#374151" }}>Maximaal 1 jaar</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="openregio-public-card">
          <h2><Settings className="w-4 h-4" style={{ color: "#0b2240" }} /> Cookies beheren</h2>
          <p>
            Je kunt cookies op elk moment verwijderen of blokkeren via de instellingen van je browser. Houd er rekening mee dat het blokkeren van noodzakelijke cookies ertoe kan leiden dat bepaalde functies van het platform niet meer werken.
          </p>
          <p>
            Meer informatie over het beheren van cookies vind je op de website van je browser of op{" "}
            <a href="https://www.consuwijzer.nl/telecom-post/internet/privacy/cookies-verwijderen" target="_blank" rel="noopener noreferrer" style={{ color: "#0b2240", fontWeight: 700 }}>Consuwijzer.nl</a>.
          </p>
        </section>

        <p style={{ fontSize: 13, color: "#64748b", marginTop: 24, textAlign: "center" }}>
          Heeft u vragen over ons cookiebeleid? Neem contact op via{" "}
          <a href="mailto:info@openregio.nl" style={{ color: "#0b2240", fontWeight: 700 }}>info@openregio.nl</a>.
        </p>
      </div>
    </div>
  );
}
