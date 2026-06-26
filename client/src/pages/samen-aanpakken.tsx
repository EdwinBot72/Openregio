import { usePageTitle } from "@/hooks/usePageTitle";
import { FileText, Mail, Users, Lightbulb, ShieldCheck, Megaphone, Coffee, Search, Handshake } from "lucide-react";

interface Tip {
  icon: any;
  titel: string;
  intro: string;
  stappen: string[];
}

const TIPS: Tip[] = [
  {
    icon: Users,
    titel: "Begin klein, met een vaste kring",
    intro:
      "Een handvol ondernemers die elkaar vertrouwen weegt zwaarder dan honderd losse stemmen. Bouw eerst een rustige basis op.",
    stappen: [
      "Spreek 4–8 ondernemers uit jouw straat, winkelgebied of branche persoonlijk aan.",
      "Gebruik een besloten WhatsApp- of Signal-groep voor onderling overleg.",
      "Houd het laagdrempelig: een kop koffie op vrijdagochtend werkt beter dan een formele vergadering.",
    ],
  },
  {
    icon: Mail,
    titel: "Schrijf gezamenlijk, niet als individu",
    intro:
      "Eén brief met tien handtekeningen krijgt structureel meer aandacht bij een gemeente dan tien losse mails. Behandel het als zakelijk dossier.",
    stappen: [
      "Stel één feitelijke brief op (max. 1 A4) met concrete vraag, niet met klachten.",
      "Verwijs naar bestaand beleid, verordeningen of raadsbesluiten van de gemeente zelf.",
      "Onderteken met naam, bedrijf en KvK-nummer — dat geeft gewicht zonder politieke lading.",
      "Stuur kopie naar de hele raad (raadsgriffie heeft één e-mailadres) en niet alleen het college.",
    ],
  },
  {
    icon: FileText,
    titel: "Gebruik de officiële kanalen die er al zijn",
    intro:
      "Je hebt geen demonstratie nodig om gehoord te worden. De Wet open overheid, inspraakavonden en burgerinitiatieven zijn er juist voor.",
    stappen: [
      "Dien een Woo-verzoek in als een gemeente onduidelijk is over besluitvorming — werkt vaak beter dan publieke kritiek.",
      "Maak gebruik van de inspreekmogelijkheid bij raads- en commissievergaderingen (5 minuten per persoon, kosteloos).",
      "Verzamel handtekeningen voor een burgerinitiatief — afhankelijk van de gemeente vaak al vanaf 25–250 stemmen.",
    ],
  },
  {
    icon: Search,
    titel: "Werk met feiten en cijfers, niet met meningen",
    intro:
      "Een gemeente kan een mening wegwuiven; cijfers en juridische verwijzingen niet. Documenteer alles wat je beweert.",
    stappen: [
      "Verzamel concrete cases uit je eigen netwerk: omzetcijfers, vergunningstijden, inspectierapporten.",
      "Verwijs naar landelijke wetgeving (Algemene wet bestuursrecht, Dienstenwet, Mededingingswet).",
      "Vraag bij elk besluit om de onderliggende stukken — gemeentes zijn verplicht die te leveren.",
    ],
  },
  {
    icon: Lightbulb,
    titel: "Bied een alternatief aan",
    intro:
      "Wie alleen tegen iets is, krijgt zelden zijn zin. Wie een werkbaar alternatief aanreikt, wordt uitgenodigd aan tafel.",
    stappen: [
      "Beschrijf in 1 alinea hoe het volgens jullie anders kan, met de voordelen voor de gemeente erbij (kosten, draagvlak, uitvoerbaarheid).",
      "Verwijs naar gemeentes waar het al zo werkt — bestuurders kopiëren graag van elkaar.",
      "Bied aan om mee te denken in een werkgroep of pilot, zonder commerciële tegenprestatie.",
    ],
  },
  {
    icon: Coffee,
    titel: "Bouw informele relaties met raadsleden",
    intro:
      "Raadsleden zijn vaak gewone burgers met een dagbaan. Een persoonlijk gesprek doet meer dan tien e-mails.",
    stappen: [
      "Nodig een raadslid of fractievoorzitter uit voor een rondleiding in je bedrijf — kost hen een uur, raakt hen langer.",
      "Spreid het: niet alleen jouw eigen partij, juist breed politiek (ook coalitie).",
      "Houd contact los maar consistent — een kerstkaart, een uitnodiging voor een open dag, een felicitatie bij een mooi raadsbesluit.",
    ],
  },
  {
    icon: ShieldCheck,
    titel: "Bescherm jezelf juridisch en zakelijk",
    intro:
      "Hoe netter je het speelt, hoe minder een gemeente of toezichthouder iets tegen je kan beginnen. Documentatie is je schild.",
    stappen: [
      "Bewaar elke brief, e-mail en notitie van overleg in een centraal dossier — bij voorkeur op meerdere plekken.",
      "Schrijf nooit dingen die je niet ook hardop in de raadszaal zou zeggen.",
      "Laat een ondernemersjurist één keer over jullie kernbrief kijken — vaak betaalbaar of via een netwerkadvocaat.",
    ],
  },
  {
    icon: Megaphone,
    titel: "Vergroot bereik via je eigen klanten en netwerk",
    intro:
      "Je hoeft niet de straat op om zichtbaar te worden. Klanten, leveranciers en collega-ondernemers zijn je natuurlijke megafoon.",
    stappen: [
      "Hang een korte, feitelijke uitleg in je winkel of nieuwsbrief — geen oproep tot actie, gewoon: 'wij vragen de gemeente om X, dit is waarom'.",
      "Vraag tevreden klanten om de open brief mee te ondertekenen — als particulier, niet als bedrijf.",
      "Deel binnen lokale ondernemersverenigingen, branchegroepen en winkeliersverenigingen — zij hebben al lijnen naar de gemeente.",
    ],
  },
];

export default function SamenAanpakkenPage() {
  usePageTitle("Samen aanpakken — OpenRegio");

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-samen-aanpakken">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Handshake style={{ width: 24, height: 24, color: "#0891b2" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-samen-title">Samen aanpakken</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Slimme zakelijke druk via brieven, dossiers en netwerken — geen demonstraties, wel resultaat.
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e6ebf2",
          borderRadius: 14,
          padding: "22px 26px",
          marginBottom: 22,
        }}
        data-testid="intro-samen"
      >
        <p style={{ margin: 0, fontSize: 15, color: "#334155", lineHeight: 1.75 }}>
          De meeste verandering komt niet van protest, maar van <strong style={{ color: "#0b2240" }}>volhardende, goed gedocumenteerde verzoeken</strong> van een
          paar ondernemers die elkaar vinden. Hieronder acht concrete sporen die in praktijk werken — kies er één of twee om
          mee te beginnen, en doe ze samen met je vaste kring.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {TIPS.map((t, i) => {
          const Icon = t.icon;
          return (
            <article
              key={i}
              style={{
                background: "#fff",
                border: "1px solid #e6ebf2",
                borderRadius: 14,
                padding: "26px 28px",
              }}
              data-testid={`tip-card-${i}`}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#eef3fb",
                    color: "#1f5fae",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h2
                  style={{ fontSize: 18, fontWeight: 800, color: "#0b2240", margin: 0, lineHeight: 1.3 }}
                  data-testid={`tip-title-${i}`}
                >
                  {t.titel}
                </h2>
              </div>

              <p style={{ fontSize: 15, color: "#475569", margin: "0 0 14px", lineHeight: 1.7 }}>
                {t.intro}
              </p>

              <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc" }}>
                {t.stappen.map((s, j) => (
                  <li key={j} style={{ fontSize: 14.5, color: "#334155", lineHeight: 1.75, marginBottom: 6 }}>
                    {s}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", marginTop: 28, lineHeight: 1.6 }}>
        Deze pagina is bedoeld als algemene oriëntatie voor ondernemers en geen juridisch of politiek advies.
        Stem belangrijke stappen af met een ondernemersjurist of brancheorganisatie.
      </p>
    </div>
  </div>
  );
}
