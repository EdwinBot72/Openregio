import { Shield, Lock, Database, Eye, Mail, Cookie, Server, Trash2, ShieldCheck } from "lucide-react";
import { PublicTopNav } from "@/components/PublicTopNav";

export default function PrivacyPage() {
  return (
    <div className="openregio-public-page" data-testid="page-privacy">
      <PublicTopNav />
      <div className="openregio-public-content">
        <h1 className="openregio-public-title" data-testid="heading-privacy">Privacyverklaring</h1>
        <p className="openregio-public-lead">Laatste update: November 2024</p>

        <section className="openregio-public-card" style={{ background: "#eff5fc", border: "1px solid #cfe0f5" }}>
          <h2><ShieldCheck className="w-4 h-4" style={{ color: "#1f5fae" }} /> Privacy-first platform</h2>
          <p><strong>OpenRegio is gebouwd met privacy als uitgangspunt:</strong></p>
          <ul>
            <li><strong>Geen trackers</strong> – We gebruiken geen Google Analytics, Meta pixel of andere tracking</li>
            <li><strong>Geen data-verkoop</strong> – We verkopen of verhandelen jouw gegevens nooit</li>
            <li><strong>Alleen functionele cookies</strong> – Uitsluitend voor inloggen, geen marketing</li>
            <li><strong>Lokale hosting</strong> – Fonts en scripts worden lokaal gehost, niet via Big Tech CDN's</li>
            <li><strong>Jouw documenten zijn privé</strong> – RegioBot gesprekken en uploads zijn alleen voor jou zichtbaar</li>
          </ul>
        </section>

        <section className="openregio-public-card">
          <h2><Shield className="w-4 h-4" style={{ color: "#1f5fae" }} /> Jouw privacy is belangrijk</h2>
          <p>OpenRegio Coöperatie U.A. respecteert de privacy van alle gebruikers van het platform en draagt zorg voor een zorgvuldige verwerking van persoonsgegevens. Deze privacyverklaring legt uit welke gegevens we verzamelen en hoe we deze gebruiken.</p>
        </section>

        <section className="openregio-public-card">
          <h2><Database className="w-4 h-4" style={{ color: "#1f5fae" }} /> Welke gegevens verzamelen we?</h2>
          <p>We verzamelen alleen wat strikt noodzakelijk is:</p>
          <h3>Accountgegevens</h3>
          <ul>
            <li>Voor- en achternaam</li>
            <li>E-mailadres</li>
            <li>Bedrijfsnaam en -informatie</li>
            <li>Lidmaatschapsplan (Basic of Pro)</li>
          </ul>
          <h3>Bedrijfsprofielgegevens (openbaar)</h3>
          <ul>
            <li>Bedrijfsbeschrijving</li>
            <li>Categorie en diensten</li>
            <li>Publieke contactinformatie (optioneel)</li>
          </ul>
          <h3>RegioBot data (alleen Pro, privé)</h3>
          <ul>
            <li>Gesprekken en vragen</li>
            <li>Geüploade documenten</li>
          </ul>
          <div className="openregio-soft-box">
            <p><strong>Wat we NIET verzamelen:</strong></p>
            <ul>
              <li>BSN of identiteitsbewijs</li>
              <li>Privéadres (tenzij zakelijk)</li>
              <li>Geboortedatum</li>
              <li>Browsegedrag op externe websites</li>
            </ul>
          </div>
        </section>

        <section className="openregio-public-card">
          <h2><Eye className="w-4 h-4" style={{ color: "#1f5fae" }} /> Hoe gebruiken we jouw gegevens?</h2>
          <p>We gebruiken jouw gegevens uitsluitend voor:</p>
          <ul>
            <li><strong>Toegang tot platform</strong> – Inloggen en je account beheren</li>
            <li><strong>Facturatie</strong> – Verwerken van betalingen via Mollie</li>
            <li><strong>Dienstverlening</strong> – RegioBot, netwerk, stemrecht</li>
            <li><strong>Support</strong> – Je helpen bij vragen</li>
          </ul>
          <div className="openregio-soft-box">
            <p><strong>Wat we NIET doen met je data:</strong></p>
            <ul>
              <li>Verkopen aan derden</li>
              <li>Gebruiken voor advertenties</li>
              <li>Delen met Big Tech bedrijven</li>
              <li>Profileren voor marketing</li>
            </ul>
          </div>
        </section>

        <section className="openregio-public-card">
          <h2><Server className="w-4 h-4" style={{ color: "#1f5fae" }} /> Met wie delen we gegevens?</h2>
          <p>We delen alleen gegevens met partijen die strikt noodzakelijk zijn:</p>
          <ul>
            <li><strong>Mollie</strong> – Betalingsverwerking (alleen factuurgegevens)</li>
            <li><strong>Neon (hosting)</strong> – Database opslag (versleuteld)</li>
            <li><strong>Replit (hosting)</strong> – Applicatie hosting</li>
            <li><strong>OpenAI</strong> – AI-gesprekken RegioBot (Pro-leden)</li>
          </ul>
          <p>Al deze partijen zijn gebonden aan verwerkersovereenkomsten en mogen jouw gegevens niet voor eigen doeleinden gebruiken.</p>
        </section>

        <section className="openregio-public-card">
          <h2><Trash2 className="w-4 h-4" style={{ color: "#1f5fae" }} /> Bewaartermijnen</h2>
          <ul>
            <li><strong>Accountgegevens</strong> – Tot opzegging + wettelijke bewaartermijn (max 7 jaar voor facturen)</li>
            <li><strong>RegioBot gesprekken</strong> – Automatisch verwijderd na 12 maanden</li>
            <li><strong>Geüploade documenten</strong> – Automatisch verwijderd na 12 maanden, of eerder op verzoek</li>
            <li><strong>Sessiedata</strong> – 24 uur na laatste activiteit</li>
          </ul>
        </section>

        <section className="openregio-public-card">
          <h2><Cookie className="w-4 h-4" style={{ color: "#1f5fae" }} /> Cookies</h2>
          <p>We gebruiken <strong>uitsluitend functionele cookies</strong>:</p>
          <ul>
            <li><strong>Sessiecookie</strong> – Houdt je inlogstatus bij (httpOnly, secure)</li>
          </ul>
          <div className="openregio-soft-box">
            <p><strong>Wat we NIET gebruiken:</strong></p>
            <ul>
              <li>Tracking cookies</li>
              <li>Marketing cookies</li>
              <li>Cookies van derden (geen Google, Facebook, etc.)</li>
              <li>Analytics cookies</li>
            </ul>
            <p>Daarom heb je geen cookie-pop-up nodig - we gebruiken simpelweg geen onnodige cookies.</p>
          </div>
        </section>

        <section className="openregio-public-card">
          <h2><Lock className="w-4 h-4" style={{ color: "#1f5fae" }} /> Hoe beschermen we jouw gegevens?</h2>
          <p>We nemen de beveiliging van jouw gegevens serieus:</p>
          <ul>
            <li>Versleutelde verbindingen (HTTPS/TLS)</li>
            <li>Security headers (HSTS, CSP, X-Frame-Options)</li>
            <li>Wachtwoorden versleuteld opgeslagen (bcrypt)</li>
            <li>Secure cookies (httpOnly, sameSite strict)</li>
            <li>Geüploade bestanden met willekeurige bestandsnamen</li>
            <li>Beperkte toegang - alleen wat nodig is</li>
          </ul>
        </section>

        <section className="openregio-public-card">
          <h2><Shield className="w-4 h-4" style={{ color: "#1f5fae" }} /> Jouw rechten (AVG)</h2>
          <p>Onder de AVG (Algemene Verordening Gegevensbescherming) heb je de volgende rechten:</p>
          <ul>
            <li><strong>Recht op inzage:</strong> Je kunt opvragen welke gegevens we van je hebben</li>
            <li><strong>Recht op correctie:</strong> Je kunt onjuiste gegevens laten aanpassen</li>
            <li><strong>Recht op verwijdering:</strong> Je kunt je account en gegevens laten verwijderen</li>
            <li><strong>Recht op dataportabiliteit:</strong> Je kunt een kopie van je gegevens opvragen</li>
            <li><strong>Recht van bezwaar:</strong> Je kunt bezwaar maken tegen bepaalde verwerkingen</li>
          </ul>
          <p>Je kunt deze rechten uitoefenen door contact met ons op te nemen via onderstaande contactgegevens.</p>
        </section>

        <section className="openregio-public-card">
          <h2><Mail className="w-4 h-4" style={{ color: "#1f5fae" }} /> Contact</h2>
          <p>Heb je vragen over deze privacyverklaring of wil je gebruik maken van je rechten? Neem dan contact met ons op:</p>
          <p>
            <strong>OpenRegio Coöperatie U.A.</strong><br />
            E-mail: <a href="mailto:privacy@openregio.nl" style={{ color: "#1f5fae", fontWeight: 700 }}>privacy@openregio.nl</a>
          </p>
        </section>

        <section className="openregio-public-card" style={{ background: "#f4f6fb" }}>
          <p>Deze privacyverklaring kan van tijd tot tijd worden aangepast. We raden je aan deze pagina regelmatig te raadplegen. De laatste update staat bovenaan deze pagina vermeld.</p>
        </section>
      </div>
    </div>
  );
}
