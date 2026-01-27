import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FileText, Users, AlertCircle, CreditCard, Ban } from "lucide-react";

export default function VoorwaardenPage() {
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
          <h1 className="font-accent text-4xl font-bold mb-4" data-testid="heading-terms">
            Algemene Voorwaarden
          </h1>
          <p className="text-muted-foreground text-lg">
            Laatste update: November 2024
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Definities
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-sm">
                In deze algemene voorwaarden wordt verstaan onder:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><strong>OpenRegio:</strong> OpenRegio Coöperatie U.A., gevestigd te Nederland</li>
                <li><strong>Platform:</strong> Het digitale platform toegankelijk via openregio.nl</li>
                <li><strong>Lid:</strong> Iedere natuurlijke persoon of rechtspersoon die een lidmaatschapsovereenkomst met OpenRegio heeft</li>
                <li><strong>Diensten:</strong> Alle door OpenRegio via het platform aangeboden diensten</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                2. Lidmaatschap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm">2.1 Typen lidmaatschap</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  OpenRegio biedt twee soorten lidmaatschappen:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Basic (€12,95/maand excl. BTW):</strong> Toegang tot netwerk, stemrecht, bedrijfsprofiel</li>
                  <li><strong>Pro (€24/maand excl. BTW):</strong> Alle Basic functies plus RegioBot AI, documentupload</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">2.2 Registratie</h3>
                <p className="text-sm text-muted-foreground">
                  Door een account aan te maken, ga je akkoord met deze voorwaarden. Je bent verantwoordelijk voor de 
                  juistheid van je gegevens en het geheimhouden van je inloggegevens.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">2.3 Coöperatief model</h3>
                <p className="text-sm text-muted-foreground">
                  Als lid ben je onderdeel van een coöperatie en heb je stemrecht over belangrijke platformbeslissingen.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                3. Betaling en opzegging
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm">3.1 Betalingsvoorwaarden</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Betaling geschiedt maandelijks via automatische incasso (Mollie)</li>
                  <li>Bij niet-betaling wordt de toegang opgeschort na 7 dagen</li>
                  <li>Prijzen zijn exclusief BTW (indien van toepassing)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">3.2 Opzeggen</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Je kunt je lidmaatschap op elk moment opzeggen</li>
                  <li>Opzegging geldt vanaf de eerstvolgende facturatieperiode</li>
                  <li>Reeds betaalde bedragen worden niet gerestitueerd</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">3.3 Wijziging tarieven</h3>
                <p className="text-sm text-muted-foreground">
                  OpenRegio behoudt zich het recht voor tarieven te wijzigen. Leden worden hiervan minimaal 30 dagen 
                  van tevoren op de hoogte gesteld.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                4. Gebruik van het platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm">4.1 Toegestaan gebruik</h3>
                <p className="text-sm text-muted-foreground">
                  Je mag het platform gebruiken voor zakelijke doeleinden binnen de kaders van de aangeboden diensten.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">4.2 Verboden gebruik</h3>
                <p className="text-sm text-muted-foreground mb-2">Het is niet toegestaan om:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Onjuiste of misleidende informatie te verstrekken</li>
                  <li>Inbreuk te maken op rechten van anderen</li>
                  <li>Illegale activiteiten te ondernemen</li>
                  <li>Het platform te misbruiken of te beschadigen</li>
                  <li>Spam of ongewenste communicatie te versturen</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-primary" />
                5. Aansprakelijkheid
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-sm">5.1 RegioBot AI</h3>
                <p className="text-sm text-muted-foreground">
                  RegioBot is een AI-assistent voor algemene ondersteuning. De juridische modus biedt <strong>GEEN juridisch advies</strong>. 
                  Voor formeel advies dien je altijd een advocaat te raadplegen. OpenRegio is niet aansprakelijk voor beslissingen 
                  genomen op basis van AI-gegenereerde content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">5.2 Platform beschikbaarheid</h3>
                <p className="text-sm text-muted-foreground">
                  OpenRegio streeft naar maximale beschikbaarheid, maar kan geen 100% uptime garanderen. We zijn niet 
                  aansprakelijk voor schade door technische storingen.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-sm">5.3 Content van leden</h3>
                <p className="text-sm text-muted-foreground">
                  Leden zijn zelf verantwoordelijk voor de content die ze op het platform plaatsen. OpenRegio is niet 
                  aansprakelijk voor content van derden.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                6. Intellectueel eigendom
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Alle intellectuele eigendomsrechten op het platform, waaronder het ontwerp, de software en de content, 
                berusten bij OpenRegio of haar licentiegevers. Je krijgt een beperkt gebruiksrecht voor de duur van je lidmaatschap.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                7. Wijzigingen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                OpenRegio behoudt zich het recht voor deze voorwaarden te wijzigen. Belangrijke wijzigingen worden minimaal 
                30 dagen van tevoren aangekondigd. Door het platform te blijven gebruiken na wijziging, ga je akkoord met de nieuwe voorwaarden.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                8. Toepasselijk recht
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden bij voorkeur in overleg opgelost. 
                Indien dit niet lukt, zijn de bevoegde rechters in Nederland bevoegd.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-4">
                Heb je vragen over deze voorwaarden? Neem contact met ons op:
              </p>
              <p className="text-sm">
                <strong>OpenRegio Coöperatie U.A.</strong><br />
                E-mail: <a href="mailto:info@openregio.nl" className="text-primary hover:underline">info@openregio.nl</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
