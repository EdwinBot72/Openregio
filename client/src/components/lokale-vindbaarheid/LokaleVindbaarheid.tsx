import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Map, CheckSquare, Globe, ExternalLink, Landmark, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ZoektermenFinder from "./ZoektermenFinder";
import WebsiteChecklist from "./WebsiteChecklist";
import WebsiteTekstGenerator from "./WebsiteTekstGenerator";
import GemeenteRadar from "./GemeenteRadar";
import ConcurrentieCheck from "./ConcurrentieCheck";

export default function LokaleVindbaarheid() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Lokale vindbaarheid</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Alles wat je nodig hebt om als lokale ondernemer beter gevonden te worden in Google, Google Maps en
          AI-zoekmachines zoals ChatGPT en Perplexity. Van zoektermen tot websiteteksten en gemeentelijke kansen.
        </p>
      </div>

      <Tabs defaultValue="zoektermen">
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="zoektermen" className="flex items-center gap-1.5 text-xs" data-testid="tab-zoektermen">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Zoektermen</span>
          </TabsTrigger>
          <TabsTrigger value="tekst" className="flex items-center gap-1.5 text-xs" data-testid="tab-tekst">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Website tekst</span>
          </TabsTrigger>
          <TabsTrigger value="gemeente" className="flex items-center gap-1.5 text-xs" data-testid="tab-gemeente">
            <Map className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Gemeente radar</span>
          </TabsTrigger>
          <TabsTrigger value="concurrentie" className="flex items-center gap-1.5 text-xs" data-testid="tab-concurrentie">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Concurrentie-check</span>
          </TabsTrigger>
          <TabsTrigger value="updates" className="flex items-center gap-1.5 text-xs" data-testid="tab-gemeente-updates">
            <Landmark className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Gemeente-updates</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-1.5 text-xs" data-testid="tab-checklist">
            <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center gap-1.5 text-xs" data-testid="tab-scan">
            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Website scan</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab labels voor mobiel ── */}
        <div className="sm:hidden flex gap-1 mt-1 text-xs text-muted-foreground justify-around px-1">
          <span>Zoek</span>
          <span>Tekst</span>
          <span>Radar</span>
          <span>Concur.</span>
          <span>Updates</span>
          <span>Check</span>
          <span>Scan</span>
        </div>

        <TabsContent value="zoektermen">
          <ZoektermenFinder />
        </TabsContent>

        <TabsContent value="tekst">
          <WebsiteTekstGenerator />
        </TabsContent>

        <TabsContent value="gemeente">
          <GemeenteRadar />
        </TabsContent>

        <TabsContent value="concurrentie">
          <ConcurrentieCheck />
        </TabsContent>

        <TabsContent value="updates">
          <GemeenteUpdatesTab />
        </TabsContent>

        <TabsContent value="checklist">
          <WebsiteChecklist />
        </TabsContent>

        <TabsContent value="scan">
          <WebsiteScanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GemeenteUpdatesTab() {
  return (
    <div className="space-y-5 pt-4">
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Bekijk officiële publicaties en bekendmakingen van jouw gemeente — zoals vergunningen, bestemmingsplannen
          en beleidswijzigingen die relevant zijn voor jouw onderneming.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Landmark className="w-4 h-4" />
            Gemeente-updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Zoek op je eigen gemeente en zie direct de laatste officiële bekendmakingen van de overheid, opgehaald
            via overheid.nl.
          </p>
          <Link href="/kansen/gemeente-updates">
            <Button data-testid="button-open-gemeente-updates">
              <Landmark className="w-4 h-4 mr-2" />
              Open gemeente-updates
              <ExternalLink className="w-3.5 h-3.5 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function WebsiteScanTab() {
  const SCAN_ITEMS = [
    {
      titel: "Lokale SEO-score",
      omschrijving: "Controleert of je paginatitel, H1 en meta description je stad en beroep bevatten.",
    },
    {
      titel: "Google Bedrijfsprofiel koppeling",
      omschrijving: "Checkt of je website correct verwijst naar je Google Mijn Bedrijf profiel.",
    },
    {
      titel: "NAP-consistentie",
      omschrijving: "Naam, Adres en Telefoonnummer — controleert of deze overal exact gelijk zijn.",
    },
    {
      titel: "Mobiele laadsnelheid",
      omschrijving: "Meer dan 60% van lokale zoekopdrachten gebeurt op mobiel. Laadtijd onder de 3 seconden is cruciaal.",
    },
    {
      titel: "Schema markup (LocalBusiness)",
      omschrijving: "Checkt of gestructureerde data aanwezig is zodat Google je als lokaal bedrijf herkent.",
    },
    {
      titel: "HTTPS & veiligheidsheaders",
      omschrijving: "Google geeft voorkeur aan veilige websites — versleuteling en beveiligingsheaders zijn essentieel.",
    },
  ];

  return (
    <div className="space-y-5 pt-4">
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          De website-scan analyseert jouw website op alle factoren die lokale vindbaarheid bepalen. 
          Je krijgt direct een score en concrete verbeterpunten — specifiek voor jouw regio en beroep.
        </p>
      </div>

      {/* Wat wordt gescand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SCAN_ITEMS.map((item) => (
          <Card key={item.titel}>
            <CardContent className="pt-4 pb-4 space-y-1">
              <p className="text-sm font-medium">{item.titel}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.omschrijving}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CTA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start je website-scan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Voer je website-URL in en ontvang binnen 30 seconden een volledig rapport met lokale SEO-score,
            technische bevindingen en geprioriteerde verbeterpunten.
          </p>
          <Link href="/groei/website-check">
            <Button data-testid="button-start-scan">
              <Globe className="w-4 h-4 mr-2" />
              Open website-scan
              <ExternalLink className="w-3.5 h-3.5 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Snelle zelf-check */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Snelle zelf-check (30 seconden)</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Open je website en bekijk de paginatitel in de browsertab — staat je stad er in?</li>
            <li>Zoek in Google op <span className="font-mono bg-muted px-1 rounded text-xs">[jouw beroep] [jouw stad]</span> — verschijn jij?</li>
            <li>Controleer of je Google Bedrijfsprofiel volledig is ingevuld (naam, adres, openingstijden, foto's).</li>
            <li>Test je website op mobiel — laadt hij snel genoeg?</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
