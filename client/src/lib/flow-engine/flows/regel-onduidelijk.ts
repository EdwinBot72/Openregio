import type { FlowSchema } from "../types";

export const regelOnduidelijkFlow: FlowSchema = {
  id: "regel-onduidelijk",
  title: "Regel of besluit niet duidelijk",
  intro:
    "Een regel, besluit of beleidsnota raakt jouw bedrijf, maar je weet niet precies wat het betekent. Beantwoord een paar vragen — je krijgt een concept-vraag aan de instantie en een interne checklist.",
  icon: "help",
  questions: [
    {
      id: "type_regel",
      type: "select",
      label: "Wat voor regel of besluit is het?",
      required: true,
      options: [
        { value: "lokaal", label: "Lokaal (gemeente, omgevingsdienst, APV)" },
        { value: "landelijk", label: "Landelijk (wet, ministeriële regeling)" },
        { value: "europees", label: "Europees (EU-richtlijn of -verordening)" },
        { value: "anders", label: "Iets anders" },
      ],
    },
    {
      id: "instantie",
      type: "text",
      label: "Welke instantie heeft het opgesteld?",
      placeholder: "Bijv. Gemeente Eindhoven, RVO, Provincie Utrecht",
      required: true,
    },
    {
      id: "onderwerp",
      type: "text",
      label: "Wat is het onderwerp in één zin?",
      placeholder: "Bijv. 'nieuwe regels voor terras op openbare grond'",
      required: true,
    },
    {
      id: "onduidelijk",
      type: "textarea",
      label: "Wat is precies onduidelijk voor jou?",
      placeholder:
        "Bijv. 'het is mij niet duidelijk of dit ook geldt voor zaterdagen'",
      required: true,
    },
    {
      id: "urgentie",
      type: "radio",
      label: "Hoe urgent is het?",
      required: true,
      options: [
        { value: "handhaving", label: "Er loopt al handhaving of een controle" },
        { value: "deadline", label: "Er komt een deadline aan" },
        { value: "informatief", label: "Puur informatief, geen tijdsdruk" },
      ],
    },
    {
      id: "contact",
      type: "text",
      label: "Heb je een contactpersoon bij die instantie? (optioneel)",
      placeholder: "Naam, afdeling of e-mailadres",
    },
  ],
  outputTitle: "Concept-vraag aan de instantie",
  outputTemplate: `Onderwerp: Verduidelijking {{onderwerp|regel of besluit}}

Geachte heer/mevrouw (t.a.v. {{contact|behandelend ambtenaar}}),

Als ondernemer wil ik graag uw uitleg vragen over {{onderwerp|deze regel}} van {{instantie|uw organisatie}}.

Mijn vraag: {{onduidelijk|kunt u toelichten hoe deze regel in mijn situatie moet worden toegepast?}}

Achtergrond: het gaat om een {{type_regel|regel}} die mijn bedrijfsvoering raakt. Voor mij is het belangrijk om zeker te weten waar ik aan moet voldoen, voordat ik mijn werkwijze aanpas.

Kunt u mij schriftelijk laten weten:
1. Hoe deze regel in mijn situatie geldt;
2. Welke onderliggende grondslag of beleidskeuze hierachter ligt;
3. Tot wanneer ik tijd heb om eventueel aan te passen.

Alvast dank voor uw reactie.

Met vriendelijke groet,
[Naam]
[Bedrijfsnaam]

— Conceptvraag van OpenRegio. Pas aan voordat je hem verstuurt.`,
  scenarios: [
    {
      id: "hoog-handhaving",
      level: "hoog",
      riskLabel: "Hoog risico — handhaving loopt",
      when: [{ questionId: "urgentie", equals: "handhaving" }],
      checks: [
        "Verzamel alle correspondentie van de controleur of handhaver.",
        "Stuur je vraag schriftelijk (e-mail), zodat je een bewijs hebt van je verzoek om duidelijkheid.",
        "Overweeg juridisch advies als de handhaving een sanctie kan opleveren.",
      ],
      nextStep:
        "Verstuur de concept-vraag vandaag nog en bewaar bewijs van verzending. Maak intern een notitie van de termijn waarop je antwoord verwacht (in principe binnen 4 weken).",
    },
    {
      id: "midden-deadline",
      level: "midden",
      riskLabel: "Let op — deadline in zicht",
      when: [{ questionId: "urgentie", equals: "deadline" }],
      checks: [
        "Noteer de aankomende deadline in je agenda.",
        "Stel je vraag schriftelijk en vraag expliciet om reactie ruim vóór de deadline.",
        "Bedenk een 'plan B' voor het geval geen tijdige reactie komt.",
      ],
      nextStep:
        "Stuur de concept-vraag deze week. Houd zelf bij wanneer je antwoord moet binnen zijn om je eigen deadline nog te halen.",
    },
    {
      id: "laag-informatief",
      level: "laag",
      riskLabel: "Informatief — rustig uitzoeken",
      when: [{ questionId: "urgentie", equals: "informatief" }],
      checks: [
        "Bewaar je vraag en het verwachte antwoord in je dossier.",
        "Een schriftelijk antwoord van de instantie is later goed bewijs.",
      ],
      nextStep:
        "Verstuur de concept-vraag wanneer het je uitkomt. Reactietijd van een overheid is meestal 4-6 weken.",
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
