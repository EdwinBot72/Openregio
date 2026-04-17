import { FileText, Users, AlertCircle, CreditCard, Ban } from "lucide-react";
import { PublicTopNav } from "@/components/PublicTopNav";

export default function VoorwaardenPage() {
  return (
    <div className="openregio-public-page" data-testid="page-voorwaarden">
      <PublicTopNav />
      <div className="openregio-public-content">
        <h1 className="openregio-public-title" data-testid="heading-terms">Algemene Voorwaarden</h1>
        <p className="openregio-public-lead">Laatste update: November 2024</p>

        <section className="openregio-public-card">
          <h2><FileText className="w-4 h-4" style={{ color: "#1f5fae" }} /> 1. Definities</h2>
          <p>In deze algemene voorwaarden wordt verstaan onder:</p>
          <ul>
            <li><strong>OpenRegio:</strong> OpenRegio Coöperatie U.A., gevestigd te Nederland</li>
            <li><strong>Platform:</strong> Het digitale platform toegankelijk via openregio.nl</li>
            <li><strong>Lid:</strong> Iedere natuurlijke persoon of rechtspersoon die een lidmaatschapsovereenkomst met OpenRegio heeft</li>
            <li><strong>Diensten:</strong> Alle door OpenRegio via het platform aangeboden diensten</li>
          </ul>
        </section>

        <section className="openregio-public-card">
          <h2><Users className="w-4 h-4" style={{ color: "#1f5fae" }} /> 2. Lidmaatschap</h2>
          <h3>2.1 Typen lidmaatschap</h3>
          <p>OpenRegio biedt twee soorten lidmaatschappen:</p>
          <ul>
            <li><strong>Basis (€19/maand excl. BTW):</strong> Toegang tot netwerk, stemrecht, bedrijfsprofiel</li>
            <li><strong>Pro (€59/maand excl. BTW):</strong> Alle Basis functies plus RegioBot AI, documentupload</li>
          </ul>
          <h3>2.2 Registratie</h3>
          <p>Door een account aan te maken, ga je akkoord met deze voorwaarden. Je bent verantwoordelijk voor de juistheid van je gegevens en het geheimhouden van je inloggegevens.</p>
          <h3>2.3 Coöperatief model</h3>
          <p>Als lid ben je onderdeel van een coöperatie en heb je stemrecht over belangrijke platformbeslissingen.</p>
        </section>

        <section className="openregio-public-card">
          <h2><CreditCard className="w-4 h-4" style={{ color: "#1f5fae" }} /> 3. Betaling en opzegging</h2>
          <h3>3.1 Betalingsvoorwaarden</h3>
          <ul>
            <li>Betaling geschiedt maandelijks via automatische incasso (Mollie)</li>
            <li>Bij niet-betaling wordt de toegang opgeschort na 7 dagen</li>
            <li>Prijzen zijn exclusief BTW (indien van toepassing)</li>
          </ul>
          <h3>3.2 Opzeggen</h3>
          <ul>
            <li>Je kunt je lidmaatschap op elk moment opzeggen</li>
            <li>Opzegging geldt vanaf de eerstvolgende facturatieperiode</li>
            <li>Reeds betaalde bedragen worden niet gerestitueerd</li>
          </ul>
          <h3>3.3 Wijziging tarieven</h3>
          <p>OpenRegio behoudt zich het recht voor tarieven te wijzigen. Leden worden hiervan minimaal 30 dagen van tevoren op de hoogte gesteld.</p>
        </section>

        <section className="openregio-public-card">
          <h2><AlertCircle className="w-4 h-4" style={{ color: "#1f5fae" }} /> 4. Gebruik van het platform</h2>
          <h3>4.1 Toegestaan gebruik</h3>
          <p>Je mag het platform gebruiken voor zakelijke doeleinden binnen de kaders van de aangeboden diensten.</p>
          <h3>4.2 Verboden gebruik</h3>
          <p>Het is niet toegestaan om:</p>
          <ul>
            <li>Onjuiste of misleidende informatie te verstrekken</li>
            <li>Inbreuk te maken op rechten van anderen</li>
            <li>Illegale activiteiten te ondernemen</li>
            <li>Het platform te misbruiken of te beschadigen</li>
            <li>Spam of ongewenste communicatie te versturen</li>
          </ul>
        </section>

        <section className="openregio-public-card">
          <h2><Ban className="w-4 h-4" style={{ color: "#1f5fae" }} /> 5. Aansprakelijkheid</h2>
          <h3>5.1 RegioBot AI</h3>
          <p>RegioBot is een AI-assistent voor algemene ondersteuning. De juridische modus biedt <strong>GEEN juridisch advies</strong>. Voor formeel advies dien je altijd een advocaat te raadplegen. OpenRegio is niet aansprakelijk voor beslissingen genomen op basis van AI-gegenereerde content.</p>
          <h3>5.2 Platform beschikbaarheid</h3>
          <p>OpenRegio streeft naar maximale beschikbaarheid, maar kan geen 100% uptime garanderen. We zijn niet aansprakelijk voor schade door technische storingen.</p>
          <h3>5.3 Content van leden</h3>
          <p>Leden zijn zelf verantwoordelijk voor de content die ze op het platform plaatsen. OpenRegio is niet aansprakelijk voor content van derden.</p>
        </section>

        <section className="openregio-public-card">
          <h2><FileText className="w-4 h-4" style={{ color: "#1f5fae" }} /> 6. Intellectueel eigendom</h2>
          <p>Alle intellectuele eigendomsrechten op het platform, waaronder het ontwerp, de software en de content, berusten bij OpenRegio of haar licentiegevers. Je krijgt een beperkt gebruiksrecht voor de duur van je lidmaatschap.</p>
        </section>

        <section className="openregio-public-card">
          <h2><AlertCircle className="w-4 h-4" style={{ color: "#1f5fae" }} /> 7. Wijzigingen</h2>
          <p>OpenRegio behoudt zich het recht voor deze voorwaarden te wijzigen. Belangrijke wijzigingen worden minimaal 30 dagen van tevoren aangekondigd. Door het platform te blijven gebruiken na wijziging, ga je akkoord met de nieuwe voorwaarden.</p>
        </section>

        <section className="openregio-public-card">
          <h2><FileText className="w-4 h-4" style={{ color: "#1f5fae" }} /> 8. Toepasselijk recht</h2>
          <p>Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden bij voorkeur in overleg opgelost. Indien dit niet lukt, zijn de bevoegde rechters in Nederland bevoegd.</p>
        </section>

        <section className="openregio-public-card" style={{ background: "#f4f6fb" }}>
          <p>Heb je vragen over deze voorwaarden? Neem contact met ons op:</p>
          <p>
            <strong>OpenRegio Coöperatie U.A.</strong><br />
            E-mail: <a href="mailto:info@openregio.nl" style={{ color: "#1f5fae", fontWeight: 700 }}>info@openregio.nl</a>
          </p>
        </section>
      </div>
    </div>
  );
}
