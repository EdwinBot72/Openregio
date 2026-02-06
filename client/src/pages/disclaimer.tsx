import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, AlertTriangle, Scale, FileText, ShieldAlert, Globe } from "lucide-react";

export default function DisclaimerPage() {
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
          <h1 className="font-black text-3xl mb-2" data-testid="text-disclaimer-title">Disclaimer</h1>
          <p style={{ color: "#5b677a" }}>Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="space-y-8" style={{ lineHeight: 1.8 }}>
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Algemeen</h2>
            </div>
            <p style={{ color: "#374151" }}>
              De informatie op het OpenRegio-platform wordt met zorg samengesteld. Ondanks de constante zorg en aandacht die wij aan de inhoud besteden, is het mogelijk dat informatie onvolledig of onjuist is. Aan de op het platform verstrekte informatie kunnen geen rechten worden ontleend.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Aansprakelijkheid</h2>
            </div>
            <p style={{ color: "#374151" }}>
              OpenRegio is niet aansprakelijk voor schade die is ontstaan als gevolg van onjuistheid, onvolledigheid of onrechtmatigheid van de aangeboden informatie op het platform. Dit geldt voor directe, indirecte, incidentele, speciale of gevolgschade.
            </p>
            <p style={{ color: "#374151", marginTop: "8px" }}>
              OpenRegio is evenmin aansprakelijk voor schade die voortvloeit uit het gebruik van het platform, waaronder begrepen storingen, onderbrekingen of fouten in de elektronische toelevering van via het platform gevraagde diensten.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Intellectueel eigendom</h2>
            </div>
            <p style={{ color: "#374151" }}>
              Alle rechten van intellectueel eigendom met betrekking tot de inhoud van het OpenRegio-platform liggen bij OpenRegio, tenzij anders vermeld. Het is niet toegestaan informatie op dit platform te kopiëren, te downloaden of op enigerlei wijze openbaar te maken, te verspreiden of te verveelvoudigen zonder voorafgaande schriftelijke toestemming van OpenRegio.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">RegioBot en AI-diensten</h2>
            </div>
            <p style={{ color: "#374151" }}>
              De RegioBot toont informatie op basis van openbare documenten en WOO-verzoeken. De output van RegioBot vormt geen juridisch advies. OpenRegio is niet aansprakelijk voor beslissingen die op basis van RegioBot-informatie worden genomen. Raadpleeg altijd een professional voor juridische of beleidsmatige beslissingen.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Links naar derden</h2>
            </div>
            <p style={{ color: "#374151" }}>
              Het platform kan verwijzingen of hyperlinks bevatten naar websites van derden. OpenRegio heeft geen invloed op de inhoud van die websites en is niet verantwoordelijk of aansprakelijk voor de daarop aangeboden informatie, producten of diensten.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5" style={{ color: "#1f5fae" }} />
              <h2 className="font-bold text-xl">Toepasselijk recht</h2>
            </div>
            <p style={{ color: "#374151" }}>
              Op deze disclaimer is Nederlands recht van toepassing. Geschillen voortvloeiend uit of in verband met deze disclaimer worden voorgelegd aan de bevoegde rechter in Nederland.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6" style={{ borderTop: "1px solid #e6ebf2" }}>
          <p style={{ fontSize: "13px", color: "#5b677a" }}>
            Heeft u vragen over deze disclaimer? Neem contact op via{" "}
            <a href="mailto:info@openregio.nl" style={{ color: "#1f5fae" }}>info@openregio.nl</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
