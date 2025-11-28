import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Database, Eye, Mail, Cookie, Server, Trash2, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary" 
            data-testid="link-home-logo"
          >
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

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="font-accent text-4xl font-bold mb-4" data-testid="heading-privacy">
            Privacyverklaring
          </h1>
          <p className="text-muted-foreground text-lg">
            Laatste update: November 2024
          </p>
        </div>

        <div className="space-y-6">
          {/* Privacy-first boodschap */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Privacy-first platform
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="font-medium">
                OpenRegio is gebouwd met privacy als uitgangspunt:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Geen trackers</strong> - We gebruiken geen Google Analytics, Meta pixel of andere tracking</li>
                <li><strong>Geen data-verkoop</strong> - We verkopen of verhandelen jouw gegevens nooit</li>
                <li><strong>Alleen functionele cookies</strong> - Uitsluitend voor inloggen, geen marketing</li>
                <li><strong>Lokale hosting</strong> - Fonts en scripts worden lokaal gehost, niet via Big Tech CDN's</li>
                <li><strong>Jouw documenten zijn privé</strong> - RegioBot gesprekken en uploads zijn alleen voor jou zichtbaar</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Jouw privacy is belangrijk
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p>
                OpenRegio Coöperatie U.A. respecteert de privacy van alle gebruikers van het platform en draagt zorg voor een zorgvuldige verwerking van persoonsgegevens. 
                Deze privacyverklaring legt uit welke gegevens we verzamelen en hoe we deze gebruiken.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Welke gegevens verzamelen we?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We verzamelen alleen wat strikt noodzakelijk is:
              </p>
              <div>
                <h3 className="font-semibold mb-2">Accountgegevens:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Voor- en achternaam</li>
                  <li>E-mailadres</li>
                  <li>Bedrijfsnaam en -informatie</li>
                  <li>Lidmaatschapsplan (Basic of Pro)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bedrijfsprofielgegevens (openbaar):</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Bedrijfsbeschrijving</li>
                  <li>Categorie en diensten</li>
                  <li>Publieke contactinformatie (optioneel)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">RegioBot data (alleen Pro, privé):</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Gesprekken en vragen</li>
                  <li>Geüploade documenten</li>
                </ul>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm font-medium">Wat we NIET verzamelen:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>BSN of identiteitsbewijs</li>
                  <li>Privéadres (tenzij zakelijk)</li>
                  <li>Geboortedatum</li>
                  <li>Browsegedrag op externe websites</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Hoe gebruiken we jouw gegevens?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                We gebruiken jouw gegevens uitsluitend voor:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Toegang tot platform</strong> - Inloggen en je account beheren</li>
                <li><strong>Facturatie</strong> - Verwerken van betalingen via Mollie</li>
                <li><strong>Dienstverlening</strong> - RegioBot, netwerk, stemrecht</li>
                <li><strong>Support</strong> - Je helpen bij vragen</li>
              </ul>
              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <p className="text-sm font-medium">Wat we NIET doen met je data:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Verkopen aan derden</li>
                  <li>Gebruiken voor advertenties</li>
                  <li>Delen met Big Tech bedrijven</li>
                  <li>Profileren voor marketing</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Met wie delen we gegevens?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We delen alleen gegevens met partijen die strikt noodzakelijk zijn:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Mollie</strong> - Betalingsverwerking (alleen factuurgegevens)</li>
                <li><strong>Neon (hosting)</strong> - Database opslag (versleuteld)</li>
                <li><strong>Replit (hosting)</strong> - Applicatie hosting</li>
                <li><strong>OpenAI</strong> - AI-gesprekken RegioBot (Pro-leden)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Al deze partijen zijn gebonden aan verwerkersovereenkomsten en mogen jouw gegevens niet voor eigen doeleinden gebruiken.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-primary" />
                Bewaartermijnen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Accountgegevens</strong> - Tot opzegging + wettelijke bewaartermijn (max 7 jaar voor facturen)</li>
                <li><strong>RegioBot gesprekken</strong> - Automatisch verwijderd na 12 maanden</li>
                <li><strong>Geüploade documenten</strong> - Automatisch verwijderd na 12 maanden, of eerder op verzoek</li>
                <li><strong>Sessiedata</strong> - 24 uur na laatste activiteit</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We gebruiken <strong>uitsluitend functionele cookies</strong>:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Sessiecookie</strong> - Houdt je inlogstatus bij (httpOnly, secure)</li>
              </ul>
              <div className="bg-muted/30 p-4 rounded-lg mt-4">
                <p className="text-sm font-medium">Wat we NIET gebruiken:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Tracking cookies</li>
                  <li>Marketing cookies</li>
                  <li>Cookies van derden (geen Google, Facebook, etc.)</li>
                  <li>Analytics cookies</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">
                  Daarom heb je geen cookie-pop-up nodig - we gebruiken simpelweg geen onnodige cookies.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Hoe beschermen we jouw gegevens?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                We nemen de beveiliging van jouw gegevens serieus:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Versleutelde verbindingen (HTTPS/TLS)</li>
                <li>Security headers (HSTS, CSP, X-Frame-Options)</li>
                <li>Wachtwoorden versleuteld opgeslagen (bcrypt)</li>
                <li>Secure cookies (httpOnly, sameSite strict)</li>
                <li>Geüploade bestanden met willekeurige bestandsnamen</li>
                <li>Beperkte toegang - alleen wat nodig is</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Jouw rechten (AVG)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Onder de AVG (Algemene Verordening Gegevensbescherming) heb je de volgende rechten:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li><strong>Recht op inzage:</strong> Je kunt opvragen welke gegevens we van je hebben</li>
                <li><strong>Recht op correctie:</strong> Je kunt onjuiste gegevens laten aanpassen</li>
                <li><strong>Recht op verwijdering:</strong> Je kunt je account en gegevens laten verwijderen</li>
                <li><strong>Recht op dataportabiliteit:</strong> Je kunt een kopie van je gegevens opvragen</li>
                <li><strong>Recht van bezwaar:</strong> Je kunt bezwaar maken tegen bepaalde verwerkingen</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                Je kunt deze rechten uitoefenen door contact met ons op te nemen via onderstaande contactgegevens.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Heb je vragen over deze privacyverklaring of wil je gebruik maken van je rechten? 
                Neem dan contact met ons op:
              </p>
              <div className="text-sm">
                <p><strong>OpenRegio Coöperatie U.A.</strong></p>
                <p className="text-muted-foreground">
                  E-mail: <a href="mailto:privacy@openregio.nl" className="text-primary hover:underline">privacy@openregio.nl</a>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Deze privacyverklaring kan van tijd tot tijd worden aangepast. We raden je aan deze pagina regelmatig te raadplegen. 
                De laatste update staat bovenaan deze pagina vermeld.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
