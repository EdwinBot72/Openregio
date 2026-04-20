import type { FlowSchema } from "../types";

export const briefOntvangenFlow: FlowSchema = {
  id: "brief-ontvangen",
  title: "Brief ontvangen",
  intro:
    "Je hebt post van een gemeente, provincie of overheidsinstantie ontvangen. Beantwoord een paar vragen — je krijgt direct een samenvatting, risico-inschatting en een concept-reactie.",
  icon: "mail",
  questions: [
    {
      id: "afzender",
      type: "select",
      label: "Wie is de afzender?",
      required: true,
      options: [
        { value: "gemeente", label: "Gemeente" },
        { value: "provincie", label: "Provincie" },
        { value: "rvo", label: "RVO / ministerie" },
        { value: "omgevingsdienst", label: "Omgevingsdienst" },
        { value: "anders", label: "Anders" },
      ],
    },
    {
      id: "onderwerp",
      type: "select",
      label: "Wat is het onderwerp?",
      required: true,
      options: [
        { value: "vergunning", label: "Vergunning of melding" },
        { value: "handhaving", label: "Handhaving of waarschuwing" },
        { value: "subsidie", label: "Subsidie of regeling" },
        { value: "informatie", label: "Informatie of consultatie" },
        { value: "anders", label: "Iets anders" },
      ],
    },
    {
      id: "is_besluit",
      type: "radio",
      label: "Bevat de brief een besluit dat jouw bedrijf raakt?",
      required: true,
      options: [
        { value: "ja", label: "Ja, er staat een besluit in" },
        { value: "nee", label: "Nee, het is informatief" },
      ],
    },
    {
      id: "termijn",
      type: "radio",
      label: "Welke reactietermijn staat erin?",
      required: true,
      options: [
        { value: "kort", label: "Korter dan 14 dagen" },
        { value: "normaal", label: "14 dagen tot 6 weken" },
        { value: "lang", label: "Langer dan 6 weken of geen termijn" },
      ],
    },
    {
      id: "kenmerk",
      type: "text",
      label: "Kenmerk of zaaknummer (optioneel)",
      placeholder: "Bijv. Z-2026-12345",
    },
    {
      id: "kort",
      type: "textarea",
      label: "Wat is volgens jou de kern? (één of twee zinnen)",
      placeholder: "Bijv. 'Mijn aanvraag voor een terras is afgewezen omdat...'",
      help: "Hoeft geen jurist-taal — je eigen woorden zijn prima.",
    },
  ],
  outputTitle: "Concept-reactie + samenvatting",
  outputTemplate: `Geachte {{afzender|gemeente/instantie}},

Ik heb uw brief (kenmerk: {{kenmerk|onbekend}}) ontvangen en bevestig hierbij de ontvangst.

Onderwerp van de brief: {{onderwerp|onbekend}}.
Mijn lezing: {{kort|de inhoud van uw brief is mij duidelijk}}.

Ik wil graag binnen de gestelde termijn reageren. Mocht ik aanvullende informatie nodig hebben om dit zorgvuldig te kunnen doen, dan neem ik daarover contact op.

Met vriendelijke groet,
[Naam]
[Bedrijfsnaam]

— Dit is een conceptbrief, gegenereerd door OpenRegio. Lees hem door en pas aan voordat je hem verstuurt.`,
  scenarios: [
    {
      id: "hoog-besluit-kort",
      level: "hoog",
      riskLabel: "Hoog risico — kort handelen",
      when: [
        { questionId: "is_besluit", equals: "ja" },
        { questionId: "termijn", equals: "kort" },
      ],
      checks: [
        "Noteer de uiterste reactiedatum direct in je agenda.",
        "Verzamel alle achterliggende stukken (aanvraag, eerdere correspondentie).",
        "Overweeg of een bezwaar of zienswijze nodig is — termijn is kort.",
        "Stuur de ontvangstbevestiging vandaag nog, dan koop je gespreksruimte.",
      ],
      nextStep:
        "Reageer binnen 7 dagen met de concept-bevestiging hieronder en vraag direct om de onderliggende stukken (besluit, motivering, bevoegdheid).",
    },
    {
      id: "midden-besluit-of-kort",
      level: "midden",
      riskLabel: "Let op — actie nodig",
      when: [{ questionId: "is_besluit", equals: "ja" }],
      checks: [
        "Lees het besluit door en streep aan wat onduidelijk is.",
        "Zet de reactietermijn in je agenda met een herinnering 7 dagen ervoor.",
        "Bewaar de brief bij de overige stukken van dit dossier.",
      ],
      nextStep:
        "Stuur de ontvangstbevestiging hieronder en plan deze week tijd om het besluit op de inhoud te bekijken. Bij twijfel: een vraag stellen kan altijd, ook zonder formeel bezwaar.",
    },
    {
      id: "midden-kort-zonder-besluit",
      level: "midden",
      riskLabel: "Let op — korte termijn",
      when: [{ questionId: "termijn", equals: "kort" }],
      checks: [
        "Noteer de termijn — ook informatieve brieven kunnen een reactie verwachten.",
        "Check of je actie nodig hebt of dat archiveren volstaat.",
      ],
      nextStep:
        "Reageer kort en zakelijk met de concept-bevestiging. Vraag toelichting als de bedoeling van de brief je niet helder is.",
    },
    {
      id: "laag-informatief",
      level: "laag",
      riskLabel: "Informatief — geen directe actie",
      when: [{ questionId: "is_besluit", equals: "nee" }],
      checks: [
        "Bewaar de brief in je dossier voor later naslag.",
        "Geen termijnactie nodig.",
      ],
      nextStep:
        "Je kunt de concept-bevestiging als ontvangstbevestiging sturen, of de brief simpelweg archiveren.",
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
