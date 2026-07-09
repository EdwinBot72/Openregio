import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BEROEP_DATA, BEROEP_CATEGORIEEN, type Beroep, type BeroepCategorie } from "@shared/seo-data";
import { Copy, Check, Globe, Star, MessageSquare, HelpCircle, BookOpen } from "lucide-react";

interface WebsiteTekst {
  h1: string;
  tagline: string;
  intro: string;
  overOns: string;
  diensten: { naam: string; tekst: string }[];
  faq: { vraag: string; antwoord: string }[];
  googleProfiel: string;
}

const CATEGORIE_TEMPLATES: Record<BeroepCategorie, {
  usp: string[];
  sloganSuffix: string;
  dienstSuffix: string;
  overOnsKern: string;
  introZin: string;
}> = {
  bouw: {
    usp: ["vakkundige uitvoering", "erkend vakbedrijf", "transparante prijzen", "lokale kennis van {stad}"],
    sloganSuffix: "vakwerk in uw regio",
    dienstSuffix: "Wij werken in {stad} en omgeving met gecertificeerde vakmensen en kwalitatieve materialen.",
    overOnsKern: "Als {beroep}sbedrijf in {stad} kennen wij de lokale bouwstijlen, gemeentelijke regels en materiaalvoorkeur als geen ander. Jarenlange ervaring in de buurt betekent dat buren ons aanbevelen.",
    introZin: "Op zoek naar een betrouwbare {beroep} in {stad}? Wij leveren vakwerk met oog voor detail — van kleine reparaties tot complete verbouwingen.",
  },
  technisch: {
    usp: ["24/7 beschikbaar", "erkend installateur", "spoed binnen 2 uur", "vaste prijzen"],
    sloganSuffix: "erkend en snel in uw regio",
    dienstSuffix: "Actief in {stad} en omgeving — ook buiten kantooruren bereikbaar voor spoed.",
    overOnsKern: "Als erkend installateur in {stad} zijn wij gecertificeerd voor alle werkzaamheden aan elektra, gas en water. Veiligheid staat bij ons voorop — wij werken altijd met keuringen en garanties.",
    introZin: "Storing of lekkage in {stad}? Onze erkende vakmensen staan voor u klaar — ook bij spoed reageren wij snel.",
  },
  mobiliteit: {
    usp: ["snelle service", "eerlijke prijzen", "vakkundig personeel", "gratis keuring"],
    sloganSuffix: "snel en eerlijk in {stad}",
    dienstSuffix: "Wij helpen klanten in {stad} en de wijde omgeving met persoonlijk advies en scherpe tarieven.",
    overOnsKern: "Wij zijn al jaren een vertrouwd adres in {stad} voor alles op het gebied van mobiliteit. Onze monteurs kennen hun vak en behandelen uw voertuig als het hunne.",
    introZin: "Zoek je een vakkundige {beroep} in {stad}? Wij staan klaar voor al uw wensen — snel, eerlijk en persoonlijk.",
  },
  zorg: {
    usp: ["persoonlijke aanpak", "direct toegankelijk", "vergoed door zorgverzekering", "uitgebreide ervaring"],
    sloganSuffix: "persoonlijke zorg in uw buurt",
    dienstSuffix: "Wij behandelen patiënten uit {stad} en omgeving met persoonlijke aandacht en professionele kennis.",
    overOnsKern: "In onze praktijk in {stad} staat de patiënt altijd centraal. Wij nemen de tijd voor een uitgebreid intakegesprek en stellen een persoonlijk behandelplan op. Onze behandelingen worden vergoed door de meeste zorgverzekeraars.",
    introZin: "Op zoek naar een {beroep} in {stad}? Wij bieden persoonlijke begeleiding en professionele behandelingen — direct toegankelijk, zonder lange wachttijden.",
  },
  verzorging: {
    usp: ["ervaren vakmensen", "online afspraken", "breed dienstenaanbod", "voor jong en oud"],
    sloganSuffix: "voor jouw beste look in {stad}",
    dienstSuffix: "Wij verwelkomen klanten uit {stad} en de omliggende wijken in onze salon.",
    overOnsKern: "Onze salon in {stad} staat bekend om de persoonlijke aanpak en kwalitatief hoogstaande behandelingen. Wij werken met professionele producten en bijgeschoolde stylisten die de nieuwste technieken beheersen.",
    introZin: "Klaar voor een nieuwe look? Onze {beroep} in {stad} combineert vakmanschap met een warm welkom — voor iedereen die het beste verdient.",
  },
  horeca: {
    usp: ["verse ingrediënten", "lokale smaken", "persoonlijk ontvangst", "vaste klanten welkom"],
    sloganSuffix: "smaak van {stad}",
    dienstSuffix: "Wij bedienen gasten uit {stad} en omgeving met verse producten en een hartelijke ontvangst.",
    overOnsKern: "Als {beroep} in {stad} zijn wij trots op onze ambachtelijke werkwijze en lokale inkoop. Elke dag opnieuw werken wij met de beste ingrediënten om onze gasten een onvergetelijke ervaring te bieden.",
    introZin: "Welkom bij uw favoriete {beroep} in {stad}! Wij bieden verse kwaliteit en een persoonlijk tintje dat grote ketens simpelweg niet kunnen bieden.",
  },
  voedsel: {
    usp: ["ambachtelijk product", "lokale herkomst", "vakkennis", "persoonlijk advies"],
    sloganSuffix: "ambacht in {stad}",
    dienstSuffix: "Wij leveren aan klanten in {stad} — kom langs voor persoonlijk advies en een proefje.",
    overOnsKern: "Als ambachtelijke {beroep} in {stad} werken wij met zorg voor de herkomst van onze producten. Wij kennen onze leveranciers persoonlijk en staan voor kwaliteit die je proeft.",
    introZin: "Ontdek het verschil van een echte ambachtelijke {beroep} in {stad} — eerlijk product, vakkundige bereiding en persoonlijk advies.",
  },
  zakelijk: {
    usp: ["helder advies", "vaste contactpersoon", "transparante tarieven", "kennis van lokale markt"],
    sloganSuffix: "helder advies voor ondernemers in {stad}",
    dienstSuffix: "Wij adviseren ondernemers en particulieren in {stad} en omgeving — persoonlijk, betrokken en resultaatgericht.",
    overOnsKern: "Als {beroep} in {stad} kennen wij de lokale markt en regelgeving. Wij bieden heldere adviezen zonder juridisch jargon, met oog voor uw specifieke situatie en doelstellingen.",
    introZin: "Zoek je een betrouwbare {beroep} in {stad}? Wij bieden persoonlijk en transparant advies — zodat u weet waar u aan toe bent.",
  },
  tuin: {
    usp: ["seizoensgebonden expertise", "gratis ontwerpsuggestie", "eigen materiaal", "jarenlange ervaring"],
    sloganSuffix: "groene expertise in {stad}",
    dienstSuffix: "Wij werken voor particulieren en bedrijven in {stad} en de omgeving.",
    overOnsKern: "Als {beroep} in {stad} halen wij het maximale uit elke tuin. Wij combineren gevoel voor stijl met praktische kennis van de lokale bodemgesteldheid en klimaatcondities.",
    introZin: "Droom jij van een prachtige tuin in {stad}? Ons vakkundige team combineert creativiteit met technisch inzicht voor een resultaat dat écht bij jou past.",
  },
  schoonmaak: {
    usp: ["betrouwbaar en gecertificeerd", "flexibele planning", "vaste medewerkers", "eigen materiaal"],
    sloganSuffix: "uw betrouwbare schoonmaakpartner in {stad}",
    dienstSuffix: "Wij bedienen particulieren en bedrijven in {stad} en de omliggende gemeenten.",
    overOnsKern: "Als schoonmaakbedrijf in {stad} begrijpen wij dat vertrouwen centraal staat. Al onze medewerkers zijn gescreend, werken met vaste routes en kennen uw pand of woning op hun duimpje.",
    introZin: "Op zoek naar een betrouwbaar schoonmaakbedrijf in {stad}? Wij leveren consistente kwaliteit — elke keer weer, zonder verrassingen.",
  },
};

const DIENSTEN_PER_CATEGORIE: Record<BeroepCategorie, { naam: string; tekst: string }[]> = {
  bouw: [
    { naam: "Renovatie & verbouw", tekst: "Complete renovaties van badkamer, keuken of volledige woning. Wij begeleiden het gehele project van ontwerp tot oplevering." },
    { naam: "Onderhoud & reparatie", tekst: "Snel en vakkundig onderhoud aan uw woning. Kleine reparaties pakken wij dezelfde dag aan." },
    { naam: "Nieuwbouw", tekst: "Van fundering tot dak — wij realiseren nieuwbouwprojecten in {stad} en omgeving met oog voor duurzaamheid." },
    { naam: "Verduurzaming", tekst: "Isolatie, HR-glas en energiebesparende maatregelen. Wij adviseren en installeren conform de laatste normen." },
  ],
  technisch: [
    { naam: "Spoed & storingsdienst", tekst: "24/7 bereikbaar voor spoedgevallen in {stad}. Gemiddelde responstijd: 2 uur." },
    { naam: "Installatie & montage", tekst: "Vakkundige installatie van nieuwe systemen — gasleidingen, elektra, sanitair — met keuringsrapport." },
    { naam: "Onderhoud & revisie", tekst: "Periodiek onderhoud verlengt de levensduur van uw installaties en voorkomt storingen." },
    { naam: "Advies & offerte", tekst: "Gratis eerste inspectie en heldere offerte — geen verborgen kosten." },
  ],
  mobiliteit: [
    { naam: "Reparatie & revisie", tekst: "Alle merken en modellen. Snelle diagnose en transparante prijzen voor elk onderdeel." },
    { naam: "Periodiek onderhoud", tekst: "Beurt, APK, banden en ruitenwissers — wij zorgen dat u veilig de weg op kunt." },
    { naam: "Spoedservice", tekst: "Pech onderweg in {stad}? Wij halen u op of komen ter plaatse." },
    { naam: "Advies & inspectie", tekst: "Tweedehands auto keuren of advies bij aanschaf? Onze specialisten kijken met u mee." },
  ],
  zorg: [
    { naam: "Intake & diagnose", tekst: "Uitgebreid intakegesprek en nauwkeurige diagnose vormen de basis van ons behandeltraject." },
    { naam: "Behandeling", tekst: "Individuele behandelingen op maat, afgestemd op uw klachten en doelstellingen." },
    { naam: "Preventie & coaching", tekst: "Voorkomen is beter dan genezen. Wij adviseren over leefstijl, houding en beweging." },
    { naam: "Groepstherapie", tekst: "Kleine groepen voor specifieke klachten — betaalbaar en sociaal." },
  ],
  verzorging: [
    { naam: "Standaard behandeling", tekst: "Vakkundige uitvoering door onze ervaren specialisten. Online afspraak of bel direct." },
    { naam: "Speciale technieken", tekst: "De nieuwste technieken, uitgevoerd door bijgeschoolde medewerkers. Vraag naar ons actuele aanbod." },
    { naam: "Kinder- & gezinsbehandeling", tekst: "Speciaal aanbod voor kinderen en gezinnen — geduldige aanpak in een ontspannen sfeer." },
    { naam: "Abonnement & loyaliteitskorting", tekst: "Vaste klanten profiteren van ons loyaliteitsprogramma en voorrangsplanning." },
  ],
  horeca: [
    { naam: "Dagelijks assortiment", tekst: "Verse bereiding elke dag — kom langs voor ons actuele aanbod in {stad}." },
    { naam: "Bestelling op maat", tekst: "Voor feestjes, jubilea of bedrijfsbijeenkomsten — wij verzorgen alles naar wens." },
    { naam: "Bezorging & afhalen", tekst: "Bestellen en afhalen op een tijdstip dat u uitkomt. Bezorging in {stad} mogelijk op afspraak." },
    { naam: "Catering & events", tekst: "Wij verzorgen catering voor kleine en grote evenementen in {stad} en omgeving." },
  ],
  voedsel: [
    { naam: "Standaard assortiment", tekst: "Dagvers aanbod van ambachtelijke kwaliteit — vers bereid en direct leverbaar." },
    { naam: "Speciale bestellingen", tekst: "Feestbestellingen, BBQ-pakketten en seizoensspecialiteiten op aanvraag." },
    { naam: "Advies & beleving", tekst: "Niet zeker wat u zoekt? Onze medewerkers geven u graag persoonlijk advies en een proefje." },
    { naam: "Bezorging", tekst: "Bezorging aan huis mogelijk in {stad} en omgeving. Neem contact op voor de voorwaarden." },
  ],
  zakelijk: [
    { naam: "Consult & advies", tekst: "Helder advies zonder jargon. Wij nemen de tijd om uw situatie volledig te begrijpen." },
    { naam: "Jaarlijkse werkzaamheden", tekst: "Van jaarrekening tot aangifte — wij zorgen voor tijdige en correcte afhandeling." },
    { naam: "Startende ondernemers", tekst: "Speciale begeleiding voor starters in {stad} — van inschrijving KvK tot eerste factuur." },
    { naam: "Begeleiding & planning", tekst: "Proactief advies bij groei, overname of bijzondere situaties." },
  ],
  tuin: [
    { naam: "Tuinontwerp", tekst: "Van schets tot beplantingsplan — wij ontwerpen een tuin die bij u en uw woning past." },
    { naam: "Aanleg & bestrating", tekst: "Volledige tuinaanleg, terras, oprit en beplanting — wij realiseren uw droomtuin in {stad}." },
    { naam: "Seizoensonderhoud", tekst: "Maaien, snoeien, bladeren opruimen — wij houden uw tuin het hele jaar door op orde." },
    { naam: "Groenonderhoud bedrijven", tekst: "Betrouwbare partner voor bedrijfstuinen, gemeenschappelijke tuinen en VvE-groen in {stad}." },
  ],
  schoonmaak: [
    { naam: "Reguliere schoonmaak", tekst: "Wekelijks, tweewekelijks of maandelijks — wij reinigen uw ruimte grondig en discreet." },
    { naam: "Eindschoonmaak & oplevering", tekst: "Verhuizen? Wij leveren een spic en span woning af conform de norm van uw verhuurder." },
    { naam: "Kantoor & bedrijfsruimte", tekst: "Professionele kantoorschoonmaak in {stad} — ook in de avond of vroege ochtend." },
    { naam: "Ramen & gevels", tekst: "Glasheldere ramen en gevels van appartementen, kantoren en woningen in {stad}." },
  ],
};

function genereerTekst(beroep: Beroep, stad: string, wijk: string): WebsiteTekst {
  const data = BEROEP_DATA[beroep];
  const cat = data.categorie;
  const tmpl = CATEGORIE_TEMPLATES[cat];
  const locatie = wijk ? `${stad} ${wijk}` : stad;

  const fill = (s: string) =>
    s.replace(/{beroep}/g, data.label.toLowerCase())
      .replace(/{stad}/g, locatie)
      .replace(/{wijk}/g, wijk || stad);

  const h1 = `${data.label} in ${locatie} — ${fill(tmpl.sloganSuffix)}`;
  const tagline = `Uw ${data.label.toLowerCase()} in ${stad}. ${fill(tmpl.dienstSuffix)}`;

  const intro = `${fill(tmpl.introZin)}\n\n` +
    `Onze voordelen: ${tmpl.usp.map(fill).join(", ")}.\n\n` +
    `${fill(tmpl.dienstSuffix)}`;

  const overOns = `${fill(tmpl.overOnsKern)}\n\n` +
    `Wij zijn trots op onze klantbeoordelingen en staan bekend als een betrouwbare ${data.label.toLowerCase()} in ${locatie}. ` +
    `Neem gerust contact op voor een vrijblijvend gesprek of offerte.`;

  const diensten = DIENSTEN_PER_CATEGORIE[cat].map((d) => ({
    naam: d.naam,
    tekst: fill(d.tekst),
  }));

  const faq = data.zoekvragen.map((vraag, i) => {
    const gevuldeVraag = fill(
      vraag.replace(/{beroep}/g, data.label.toLowerCase()).replace(/{stad}/g, locatie)
    ).replace(/\?$/, "");

    const antwoorden = [
      `Als ${data.label.toLowerCase()} in ${locatie} bieden wij transparante tarieven. Neem contact op voor een gratis offerte op maat.`,
      `Ja, wij zijn actief in ${locatie} en omgeving. Bel ons voor een afspraak of stel uw vraag via het contactformulier.`,
      `Wij werken met gecertificeerde vakmensen en hanteren eerlijke, vaste tarieven. Bel voor een vrijblijvend gesprek.`,
    ];

    return {
      vraag: gevuldeVraag.charAt(0).toUpperCase() + gevuldeVraag.slice(1) + "?",
      antwoord: antwoorden[i % antwoorden.length],
    };
  });

  const primaireTermen = data.primaireTermen.map(fill);
  const googleProfiel =
    `${data.label} in ${locatie}. ${fill(tmpl.dienstSuffix)} ` +
    `Wij bieden: ${primaireTermen.slice(0, 3).join(", ")}. ` +
    `${tmpl.usp.slice(0, 3).map(fill).join(" — ")}. ` +
    `Bel ons voor een afspraak of bezoek onze website voor actuele openingstijden en tarieven. ` +
    `Actief in ${locatie} en omgeving.`;

  return { h1, tagline, intro, overOns, diensten, faq, googleProfiel };
}

const SECTIES = [
  { key: "h1", label: "H1 + Tagline", icon: Globe },
  { key: "intro", label: "Homepage intro", icon: BookOpen },
  { key: "overOns", label: "Over ons tekst", icon: Star },
  { key: "diensten", label: "Diensten", icon: MessageSquare },
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "googleProfiel", label: "Google Bedrijfsprofiel", icon: Globe },
] as const;

export default function WebsiteTekstGenerator() {
  const [beroep, setBeroep] = useState<Beroep | "">("");
  const [stad, setStad] = useState("");
  const [wijk, setWijk] = useState("");
  const [tekst, setTekst] = useState<WebsiteTekst | null>(null);
  const [gekopieerd, setGekopieerd] = useState<string | null>(null);

  function genereer() {
    if (!beroep || !stad.trim()) return;
    setTekst(genereerTekst(beroep, stad.trim(), wijk.trim()));
  }

  function kopieer(inhoud: string, key: string) {
    navigator.clipboard.writeText(inhoud).then(() => {
      setGekopieerd(key);
      setTimeout(() => setGekopieerd(null), 1800);
    });
  }

  return (
    <div className="space-y-5 pt-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Genereer professionele website-teksten die lokaal scoren in Google en AI-zoekmachines.
        De teksten zijn geschreven met jouw beroep en locatie als kern — klaar om te plakken in je website.
      </p>

      {/* Input */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-40">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Jouw beroep</p>
          <Select value={beroep} onValueChange={(v) => setBeroep(v as Beroep)}>
            <SelectTrigger data-testid="tekst-beroep">
              <SelectValue placeholder="Kies beroep..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BEROEP_CATEGORIEEN).map(([catKey, cat]) => (
                <SelectGroup key={catKey}>
                  <SelectLabel>{cat.label}</SelectLabel>
                  {cat.beroepen.map((b) => (
                    <SelectItem key={b} value={b}>{BEROEP_DATA[b].label}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-32">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Stad</p>
          <Input
            placeholder="bijv. Haarlem"
            value={stad}
            onChange={(e) => setStad(e.target.value)}
            data-testid="tekst-stad"
          />
        </div>
        <div className="w-36">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Wijk (optioneel)</p>
          <Input
            placeholder="bijv. Noord"
            value={wijk}
            onChange={(e) => setWijk(e.target.value)}
            data-testid="tekst-wijk"
          />
        </div>
        <Button onClick={genereer} disabled={!beroep || !stad.trim()} data-testid="button-genereer-tekst">
          Genereer teksten
        </Button>
      </div>

      {/* Resultaat */}
      {tekst && (
        <div className="space-y-4">
          {/* H1 + Tagline */}
          <TekstBlok
            titel="H1-koptekst"
            icon={Globe}
            id="h1"
            gekopieerd={gekopieerd}
            onKopieer={kopieer}
            inhoud={tekst.h1}
            uitleg="Gebruik dit als je H1-tag op de homepage. Bevat beroep + stad voor directe lokale SEO-waarde."
          />
          <TekstBlok
            titel="Tagline / ondertitel"
            icon={Globe}
            id="tagline"
            gekopieerd={gekopieerd}
            onKopieer={kopieer}
            inhoud={tekst.tagline}
            uitleg="Zet dit direct onder de H1 — versterkt de lokale relevantie voor bezoekers en zoekmachines."
          />
          <TekstBlok
            titel="Homepage introductie"
            icon={BookOpen}
            id="intro"
            gekopieerd={gekopieerd}
            onKopieer={kopieer}
            inhoud={tekst.intro}
            uitleg="Eerste alinea van je homepage. Bevat locatiesleutelwoorden en je voordelen."
          />
          <TekstBlok
            titel="Over ons tekst"
            icon={Star}
            id="overons"
            gekopieerd={gekopieerd}
            onKopieer={kopieer}
            inhoud={tekst.overOns}
            uitleg="Gebruik op je Over ons-pagina. Lokale toon + vertrouwen opbouwen."
          />

          {/* Diensten */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">Diensten-teksten</CardTitle>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => kopieer(
                    tekst.diensten.map((d) => `## ${d.naam}\n${d.tekst}`).join("\n\n"),
                    "diensten"
                  )}
                  title="Kopieer alle diensten"
                >
                  {gekopieerd === "diensten" ? <Check className="w-3.5 h-3.5 text-[#f28a1a]" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Gebruik per dienst als aparte sectie op je diensten-pagina.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {tekst.diensten.map((d, i) => (
                <div key={i} className="bg-muted rounded-md p-3 space-y-1">
                  <p className="text-sm font-medium">{d.naam}</p>
                  <p className="text-sm text-muted-foreground">{d.tekst}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">FAQ-sectie</CardTitle>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => kopieer(
                    tekst.faq.map((f) => `V: ${f.vraag}\nA: ${f.antwoord}`).join("\n\n"),
                    "faq"
                  )}
                  title="Kopieer FAQ"
                >
                  {gekopieerd === "faq" ? <Check className="w-3.5 h-3.5 text-[#f28a1a]" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Zet een FAQ op je website — Google toont deze als rich snippet in de zoekresultaten.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {tekst.faq.map((f, i) => (
                <div key={i} className="bg-muted rounded-md p-3 space-y-1">
                  <p className="text-sm font-medium">{f.vraag}</p>
                  <p className="text-sm text-muted-foreground">{f.antwoord}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <TekstBlok
            titel="Google Bedrijfsprofiel omschrijving"
            icon={Globe}
            id="google"
            gekopieerd={gekopieerd}
            onKopieer={kopieer}
            inhoud={tekst.googleProfiel}
            uitleg="Kopieer dit naar je Google Mijn Bedrijf profiel onder 'Beschrijving'. Max 750 tekens — keyword-rijk voor lokale zoekopdrachten."
          />

          <div className="bg-muted/50 border border-border rounded-md p-4 space-y-1">
            <p className="text-xs font-medium">Personaliseer de teksten</p>
            <p className="text-xs text-muted-foreground">
              Voeg toe: je bedrijfsnaam, specifieke specialiteiten, exacte adres, openingstijden en klantreviews. 
              Hoe persoonlijker de tekst, hoe beter Google je onderscheidt van concurrenten.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TekstBlok({ titel, icon: Icon, id, gekopieerd, onKopieer, inhoud, uitleg }: {
  titel: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  gekopieerd: string | null;
  onKopieer: (inhoud: string, id: string) => void;
  inhoud: string;
  uitleg: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">{titel}</CardTitle>
          </div>
          <Button size="icon" variant="ghost" onClick={() => onKopieer(inhoud, id)} title="Kopieer">
            {gekopieerd === id
              ? <Check className="w-3.5 h-3.5 text-[#f28a1a]" />
              : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{uitleg}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm bg-muted rounded-md px-3 py-2 whitespace-pre-wrap leading-relaxed">{inhoud}</p>
      </CardContent>
    </Card>
  );
}
