import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Database, Eye, Mail } from "lucide-react";

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
                <h3 className="font-semibold mb-2">Bedrijfsprofielgegevens:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Bedrijfsbeschrijving</li>
                  <li>Categorie en diensten</li>
                  <li>Publieke contactinformatie</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Gebruiksgegevens:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>IP-adres en browserinformatie</li>
                  <li>Activiteit op het platform</li>
                  <li>RegioBot gesprekken (alleen Pro-leden)</li>
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
                We gebruiken jouw gegevens voor de volgende doeleinden:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Het leveren van onze platformdiensten</li>
                <li>Beheer van jouw account en lidmaatschap</li>
                <li>Verwerking van betalingen via Mollie</li>
                <li>Communicatie over belangrijke updates</li>
                <li>Verbetering van onze diensten</li>
                <li>Naleving van wettelijke verplichtingen</li>
              </ul>
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
                <li>Versleutelde verbindingen (HTTPS/SSL)</li>
                <li>Veilige opslag in geautoriseerde datacenters</li>
                <li>Wachtwoorden worden versleuteld opgeslagen (bcrypt)</li>
                <li>Beperkte toegang tot persoonsgegevens</li>
                <li>Regelmatige beveiligingsupdates</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Jouw rechten
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
