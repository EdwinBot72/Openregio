import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Cookie, Shield, Settings, Clock, ToggleLeft } from "lucide-react";

export default function CookiebeleidPage() {
  return (
    <div className="min-h-screen" style={{ background: "#f5f7fb", color: "#0f172a" }}>
      <nav className="sticky top-0 z-50 backdrop-blur-lg border-b" style={{ background: "rgba(255,255,255,.92)", borderColor: "#e6ebf2" }}>
        <div className="max-w-[1120px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-black text-lg" style={{ color: "#1f5fae" }} data-testid="link-home-logo">
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

      <div className="max-w-[800px] mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-black text-3xl mb-2" data-testid="text-cookiebeleid-title">Cookiebeleid</h1>
          <p style={{ color: "#5b677a" }}>Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="space-y-8" style={{ lineHeight: 1.8 }}>
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Cookie className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Wat zijn cookies?</h2>
            </div>
            <p style={{ color: "#374151" }}>
              Cookies zijn kleine tekstbestanden die op je computer, tablet of telefoon worden opgeslagen wanneer je een website bezoekt. Ze helpen de website om je voorkeuren te onthouden en het platform goed te laten functioneren.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Welke cookies gebruiken wij?</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #e6ebf2" }}>
                <h3 className="font-bold mb-1">Noodzakelijke cookies</h3>
                <p style={{ color: "#374151", fontSize: "14px" }}>
                  Deze cookies zijn essentieel voor het functioneren van het platform. Ze zorgen ervoor dat je kunt inloggen, navigeren en basisfuncties kunt gebruiken. Zonder deze cookies werkt het platform niet naar behoren.
                </p>
                <div className="mt-2 inline-block px-2 py-1 rounded-md text-xs font-bold" style={{ background: "#e8f0fe", color: "#1f5fae" }}>
                  Altijd actief
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #e6ebf2" }}>
                <h3 className="font-bold mb-1">Functionele cookies</h3>
                <p style={{ color: "#374151", fontSize: "14px" }}>
                  Deze cookies onthouden je voorkeuren zoals taalinstelling en thema (licht/donker modus). Ze verbeteren je gebruikservaring maar zijn niet strikt noodzakelijk.
                </p>
                <div className="mt-2 inline-block px-2 py-1 rounded-md text-xs font-bold" style={{ background: "#fef3e2", color: "#b5651d" }}>
                  Optioneel
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #e6ebf2" }}>
                <h3 className="font-bold mb-1">Sessie-cookies</h3>
                <p style={{ color: "#374151", fontSize: "14px" }}>
                  Deze cookies bewaren je inlogstatus tijdens je bezoek. Ze worden automatisch verwijderd wanneer je de browser sluit of wanneer je sessie verloopt.
                </p>
                <div className="mt-2 inline-block px-2 py-1 rounded-md text-xs font-bold" style={{ background: "#e8f0fe", color: "#1f5fae" }}>
                  Altijd actief
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ToggleLeft className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Wat we niet gebruiken</h2>
            </div>
            <p style={{ color: "#374151" }}>
              OpenRegio gebruikt <strong>geen</strong> tracking cookies, advertentiecookies of analytische cookies van derden. Wij volgen je niet over andere websites en verkopen geen data aan adverteerders. Dit past bij onze kernwaarde: privacy en transparantie.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Bewaartermijn</h2>
            </div>
            <div className="rounded-xl p-4" style={{ background: "#fff", border: "1px solid #e6ebf2" }}>
              <table className="w-full" style={{ fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e6ebf2" }}>
                    <th className="text-left py-2 font-bold">Cookie type</th>
                    <th className="text-left py-2 font-bold">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td className="py-2" style={{ color: "#374151" }}>Sessie-cookies</td>
                    <td className="py-2" style={{ color: "#374151" }}>Tot sluiten browser</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td className="py-2" style={{ color: "#374151" }}>Authenticatie (JWT)</td>
                    <td className="py-2" style={{ color: "#374151" }}>Maximaal 7 dagen</td>
                  </tr>
                  <tr>
                    <td className="py-2" style={{ color: "#374151" }}>Functionele cookies</td>
                    <td className="py-2" style={{ color: "#374151" }}>Maximaal 1 jaar</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Cookies beheren</h2>
            </div>
            <p style={{ color: "#374151" }}>
              Je kunt cookies op elk moment verwijderen of blokkeren via de instellingen van je browser. Houd er rekening mee dat het blokkeren van noodzakelijke cookies ertoe kan leiden dat bepaalde functies van het platform niet meer werken.
            </p>
            <p style={{ color: "#374151", marginTop: "8px" }}>
              Meer informatie over het beheren van cookies vind je op de website van je browser of op{" "}
              <a href="https://www.consuwijzer.nl/telecom-post/internet/privacy/cookies-verwijderen" target="_blank" rel="noopener noreferrer" style={{ color: "#1f5fae", textDecoration: "underline" }}>Consuwijzer.nl</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid #e6ebf2" }}>
          <p style={{ fontSize: "13px", color: "#5b677a" }}>
            Heeft u vragen over ons cookiebeleid? Neem contact op via{" "}
            <a href="mailto:info@openregio.nl" style={{ color: "#1f5fae" }}>info@openregio.nl</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
