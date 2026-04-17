import { AlertTriangle, Scale, FileText, ShieldAlert, Globe } from "lucide-react";
import { PublicTopNav } from "@/components/PublicTopNav";

export default function DisclaimerPage() {
  return (
    <div className="openregio-public-page" data-testid="page-disclaimer">
      <PublicTopNav />
      <div className="openregio-public-content">
        <h1 className="openregio-public-title" data-testid="text-disclaimer-title">Disclaimer</h1>
        <p className="openregio-public-lead">
          Laatst bijgewerkt: {new Date().toLocaleDateString("nl-NL", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <section className="openregio-public-card">
          <h2><AlertTriangle className="w-4 h-4" style={{ color: "#1f5fae" }} /> Algemeen</h2>
          <p>
            De informatie op het OpenRegio-platform wordt met zorg samengesteld. Ondanks de constante zorg en aandacht die wij aan de inhoud besteden, is het mogelijk dat informatie onvolledig of onjuist is. Aan de op het platform verstrekte informatie kunnen geen rechten worden ontleend.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><Scale className="w-4 h-4" style={{ color: "#1f5fae" }} /> Aansprakelijkheid</h2>
          <p>
            OpenRegio is niet aansprakelijk voor schade die is ontstaan als gevolg van onjuistheid, onvolledigheid of onrechtmatigheid van de aangeboden informatie op het platform. Dit geldt voor directe, indirecte, incidentele, speciale of gevolgschade.
          </p>
          <p>
            OpenRegio is evenmin aansprakelijk voor schade die voortvloeit uit het gebruik van het platform, waaronder begrepen storingen, onderbrekingen of fouten in de elektronische toelevering van via het platform gevraagde diensten.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><FileText className="w-4 h-4" style={{ color: "#1f5fae" }} /> Intellectueel eigendom</h2>
          <p>
            Alle rechten van intellectueel eigendom met betrekking tot de inhoud van het OpenRegio-platform liggen bij OpenRegio, tenzij anders vermeld. Het is niet toegestaan informatie op dit platform te kopiëren, te downloaden of op enigerlei wijze openbaar te maken, te verspreiden of te verveelvoudigen zonder voorafgaande schriftelijke toestemming van OpenRegio.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><ShieldAlert className="w-4 h-4" style={{ color: "#1f5fae" }} /> RegioBot en AI-diensten</h2>
          <p>
            De RegioBot toont informatie op basis van openbare documenten en WOO-verzoeken. De output van RegioBot vormt geen juridisch advies. OpenRegio is niet aansprakelijk voor beslissingen die op basis van RegioBot-informatie worden genomen. Raadpleeg altijd een professional voor juridische of beleidsmatige beslissingen.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><Globe className="w-4 h-4" style={{ color: "#1f5fae" }} /> Links naar derden</h2>
          <p>
            Het platform kan verwijzingen of hyperlinks bevatten naar websites van derden. OpenRegio heeft geen invloed op de inhoud van die websites en is niet verantwoordelijk of aansprakelijk voor de daarop aangeboden informatie, producten of diensten.
          </p>
        </section>

        <section className="openregio-public-card">
          <h2><Scale className="w-4 h-4" style={{ color: "#1f5fae" }} /> Toepasselijk recht</h2>
          <p>
            Op deze disclaimer is Nederlands recht van toepassing. Geschillen voortvloeiend uit of in verband met deze disclaimer worden voorgelegd aan de bevoegde rechter in Nederland.
          </p>
        </section>

        <p style={{ fontSize: 13, color: "#64748b", marginTop: 24, textAlign: "center" }}>
          Heeft u vragen over deze disclaimer? Neem contact op via{" "}
          <a href="mailto:info@openregio.nl" style={{ color: "#1f5fae", fontWeight: 700 }}>info@openregio.nl</a>.
        </p>
      </div>
    </div>
  );
}
