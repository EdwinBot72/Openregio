import type { FlowSchema } from "../types";

export const controleVergunningBoeteFlow: FlowSchema = {
  id: "controle-vergunning-boete",
  title: "Controle, vergunning of boete",
  intro:
    "Een controleur is langs geweest, je vergunning is in gevaar, of je hebt een boete ontvangen. Beantwoord een paar vragen — je krijgt een risico-inschatting en een concept-bezwaar of bewijsverzoek.",
  icon: "shield",
  questions: [
    {
      id: "type",
      type: "select",
      label: "Wat is er gebeurd?",
      required: true,
      options: [
        { value: "controle_aangekondigd", label: "Controle aangekondigd" },
        { value: "controle_gehad", label: "Controle gehad — afwachten op rapport" },
        { value: "boete", label: "Boete ontvangen" },
        { value: "intrekking", label: "Vergunning ingetrokken of geweigerd" },
        { value: "waarschuwing", label: "Waarschuwing of voornemen" },
      ],
    },
    {
      id: "instantie",
      type: "text",
      label: "Welke instantie?",
      placeholder: "Bijv. Gemeente, Omgevingsdienst, Inspectie SZW",
      required: true,
    },
    {
      id: "bedrag",
      type: "select",
      label: "Bedrag (alleen bij boete of dwangsom)",
      options: [
        { value: "geen", label: "Niet van toepassing" },
        { value: "klein", label: "Onder €1.000" },
        { value: "midden", label: "€1.000 – €10.000" },
        { value: "groot", label: "Boven €10.000" },
      ],
    },
    {
      id: "termijn",
      type: "radio",
      label: "Welke reactietermijn heb je?",
      required: true,
      options: [
        { value: "kort", label: "Korter dan 14 dagen" },
        { value: "normaal", label: "2 tot 6 weken" },
        { value: "lang", label: "Langer dan 6 weken of geen termijn" },
      ],
    },
    {
      id: "bewijs",
      type: "radio",
      label: "Heeft de instantie het onderliggende bewijs of rapport gedeeld?",
      required: true,
      options: [
        { value: "ja", label: "Ja, ik heb het rapport / bewijs" },
        { value: "nee", label: "Nee, alleen de uitkomst / brief" },
      ],
    },
    {
      id: "kenmerk",
      type: "text",
      label: "Kenmerk of zaaknummer (optioneel)",
      placeholder: "Bijv. Z-2026-12345",
    },
  ],
  outputTitle: "Concept-bezwaar of bewijs-opvraag",
  outputTemplate: `Onderwerp: Reactie op {{type|maatregel}} (kenmerk: {{kenmerk|onbekend}})

Geachte heer/mevrouw,

Ik heb van {{instantie|uw organisatie}} bericht ontvangen over een {{type|maatregel}}. Hierbij reageer ik binnen de gestelde termijn.

1. Ontvangstbevestiging
Ik bevestig de ontvangst van uw bericht en heb dit zorgvuldig gelezen.

2. Verzoek om onderliggende stukken
Voor een goede beoordeling van mijn positie verzoek ik u om een afschrift van:
- het volledige inspectie- of controlerapport;
- de motivering en juridische grondslag;
- het mandaatbesluit of bevoegdheid van de behandelend ambtenaar.

3. Aankondiging vervolg
Op basis van uw reactie zal ik beoordelen of ik formeel bezwaar maak. Ik verzoek u rekening te houden met de wettelijke termijnen en mij hierover schriftelijk te informeren.

Met vriendelijke groet,
[Naam]
[Bedrijfsnaam]

— Concepttekst van OpenRegio. Bij financieel grote of juridisch complexe zaken: laat dit altijd nog door een specialist nakijken voordat je verzendt.`,
  scenarios: [
    {
      id: "hoog-intrekking",
      level: "hoog",
      riskLabel: "Hoog risico — vergunning in gevaar",
      when: [{ questionId: "type", equals: "intrekking" }],
      checks: [
        "Bezwaar indienen heeft meestal een termijn van 6 weken — start vandaag.",
        "Vraag direct het volledige dossier en mandaatbesluit op.",
        "Overweeg een voorlopige voorziening om effect uit te stellen.",
        "Schakel een jurist in: intrekking raakt direct je bedrijfsvoering.",
      ],
      nextStep:
        "Verstuur het concept-bezwaar deze week en bel ook met de behandelend ambtenaar. Bij twijfel altijd juridisch advies inwinnen.",
    },
    {
      id: "hoog-boete-groot",
      level: "hoog",
      riskLabel: "Hoog risico — financieel groot",
      when: [
        { questionId: "type", equals: "boete" },
        { questionId: "bedrag", in: ["midden", "groot"] },
      ],
      checks: [
        "Lees de boete-beschikking volledig en let op de bezwaartermijn.",
        "Vraag het inspectierapport op als je dat nog niet hebt.",
        "Bewaar al je bewijs (foto's, planningen, e-mails) op één plek.",
        "Overweeg juridisch advies — bezwaar is doorgaans gratis, te laat is te laat.",
      ],
      nextStep:
        "Stuur het concept-bezwaar binnen 6 weken en vraag tegelijk het rapport op. Bij bedragen boven €10.000 is juridische ondersteuning sterk aan te raden.",
    },
    {
      id: "hoog-kort-termijn",
      level: "hoog",
      riskLabel: "Hoog risico — korte termijn",
      when: [{ questionId: "termijn", equals: "kort" }],
      checks: [
        "Korte termijnen kun je niet 'inhalen' — agendeer vandaag.",
        "Een ontvangstbevestiging is geen bezwaar; dien apart bezwaar in als je dat wilt.",
        "Vraag schriftelijk om uitstel als je meer tijd nodig hebt.",
      ],
      nextStep:
        "Verstuur het concept vandaag en vraag bewust om verlenging als je meer tijd nodig hebt. Bij geen reactie geldt formeel de oorspronkelijke termijn.",
    },
    {
      id: "midden-boete-klein",
      level: "midden",
      riskLabel: "Let op — boete ontvangen",
      when: [
        { questionId: "type", equals: "boete" },
        { questionId: "bedrag", equals: "klein" },
      ],
      checks: [
        "Lees de motivering — soms is een 'mededeling' geen verwijtbaar gedrag.",
        "Bezwaar maken is gratis; betaling kan vaak worden uitgesteld.",
        "Verzamel je eigen feiten (datum, foto's, getuigen) voor de zaak.",
      ],
      nextStep:
        "Stuur het concept-bezwaar binnen de termijn. Ook bij kleine bedragen is een dossier waardevol bij eventuele herhaling.",
    },
    {
      id: "midden-controle-zonder-bewijs",
      level: "midden",
      riskLabel: "Let op — vraag het rapport op",
      when: [
        { questionId: "type", in: ["controle_gehad", "waarschuwing"] },
        { questionId: "bewijs", equals: "nee" },
      ],
      checks: [
        "Zonder rapport kun je niet goed reageren — vraag het direct op.",
        "Schrijf zelf op wat je tijdens de controle hebt gezien en gezegd.",
        "Houd communicatie schriftelijk vanaf nu.",
      ],
      nextStep:
        "Stuur het verzoek hieronder om het rapport en de motivering. Reageer pas inhoudelijk nadat je de stukken hebt ontvangen.",
    },
    {
      id: "laag-controle-aangekondigd",
      level: "laag",
      riskLabel: "Lage urgentie — voorbereiden",
      when: [{ questionId: "type", equals: "controle_aangekondigd" }],
      checks: [
        "Check welke documenten worden gevraagd en leg ze klaar.",
        "Een controle is geen sanctie — open en feitelijk antwoorden volstaat meestal.",
        "Maak na afloop zelf een korte notitie van wat er is besproken.",
      ],
      nextStep:
        "Bevestig de controle en vraag eventueel om een agenda. Hieronder vind je een neutrale conceptbevestiging.",
    },
  ],
  fallbackScenario: {
    level: "midden",
    riskLabel: "Onbekend risico — vul vragen aan",
    checks: ["Vul de vragen hierboven aan voor een nauwkeurige inschatting."],
    nextStep:
      "Beantwoord eerst de verplichte vragen. Daarna verschijnt hier een advies op maat.",
  },
};
