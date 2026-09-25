// ─────────────────────────────────────────────────────────────
// Juridische taal in een brief — zonder AI.
//
// Zoekt woorden met rechtsgevolg ("wij", "u bent verschuldigd", "namens",
// "dwangbevel" …) en legt per woord in gewone taal uit:
//  • wat het betekent,
//  • wat je controleert,
//  • wat je ermee kunt.
// Het citaat komt letterlijk uit de brief. De uitleg is algemene duiding;
// wetsartikelen staan apart in `wet` en worden alleen op verzoek getoond.
// ─────────────────────────────────────────────────────────────
import { zinRond } from "./zin";

export interface TaalPunt {
  term: string;
  citaat: string;
  betekenis: string;
  controleer: string;
  ermee: string;
  wet?: string;
}

interface Regel { term: string; re: RegExp; betekenis: string; controleer: string; ermee: string; wet?: string }

const REGELS: Regel[] = [
  {
    term: "“Wij”",
    re: /\b(wij|we)\b/i,
    betekenis: "“Wij” is geen partij. Een organisatie kan zelf niets beslissen of ondertekenen: dat doet altijd een orgaan of persoon die daartoe bevoegd is. Bij een gemeente is dat het college van B&W, de burgemeester of de raad (of een ambtenaar namens hen); bij een bedrijf de bestuurder of iemand met een volmacht.",
    controleer: "Staat in de brief wie ‘wij’ precies is: welk orgaan of welke persoon, in welke functie, en met welke bevoegdheid?",
    ermee: "Staat dat er niet? Vraag het schriftelijk: ‘Wie bedoelt u met “wij”, en op grond van welke bevoegdheid treedt u op?’ Let op: termijnen lopen intussen wel door.",
    wet: "art. 2:1 BW (overheden zijn rechtspersonen); art. 10:1 e.v. Awb (mandaat); art. 3:60 BW (volmacht)",
  },
  {
    term: "“De gemeente” als handelende partij",
    re: /\bde\s+(gemeente|provincie|belastingdienst)\b|\bhet\s+waterschap\b/i,
    betekenis: "Een gemeente (of provincie, waterschap, Belastingdienst) is een organisatie, geen persoon. Ze handelt via bestuursorganen, zoals het college van burgemeester en wethouders of de burgemeester, en die kunnen taken doorgeven aan ambtenaren (mandaat). ‘De gemeente heeft besloten’ zegt dus nog niet wíé heeft besloten.",
    controleer: "Welk bestuursorgaan heeft besloten, en tekent de ondertekenaar namens dat orgaan?",
    ermee: "Vraag welk orgaan het besluit nam en welk mandaatbesluit de ondertekenaar gebruikt. Mandaatbesluiten staan vaak op officielebekendmakingen.nl — daar kun je het zelf nakijken.",
    wet: "art. 2:1 BW; art. 10:1–10:10 Awb",
  },
  {
    term: "Namens / in opdracht van",
    re: /\bnamens\b|\bin\s+mandaat\b|\bi\.o\.|\bvoor\s+deze\b|\bbij\s+volmacht\b|\bin\s+opdracht\s+van\b/i,
    betekenis: "De ondertekenaar handelt niet voor zichzelf, maar voor een ander. Bij een overheid heet dat mandaat, bij een bedrijf volmacht of opdracht. De bevoegdheid ligt bij die ander.",
    controleer: "Namens wie precies? En heeft de ondertekenaar die bevoegdheid echt gekregen — schriftelijk, voor dit soort beslissingen?",
    ermee: "Vraag om het mandaatbesluit, de volmacht of de opdracht. Bij een incassobureau: vraag wie de opdrachtgever is en om bewijs van de opdracht.",
    wet: "art. 10:3, 10:5 en 10:10 Awb; art. 3:60 BW",
  },
  {
    term: "Schuld / vordering",
    re: /\b(verschuldigd|schuld|openstaande?\s+(bedrag|vordering|saldo|post)|achterstand|vorderen|vordering)\b/i,
    betekenis: "Dat jij iets verschuldigd bent, moet ergens uit volgen: een besluit of aanslag van een overheid, een overeenkomst die jij bent aangegaan, een uitspraak van de rechter, of rechtstreeks de wet. Een brief die alleen zegt dát je iets schuldig bent, bewijst dat nog niet.",
    controleer: "Noemt de brief waar deze schuld uit voortkomt — met datum en kenmerk van het besluit, de aanslag, de factuur of het vonnis? Klopt het bedrag, en is het aan jou (of aan je bedrijf) gericht?",
    ermee: "Vraag om een kopie van het onderliggende stuk en een specificatie van het bedrag. Betwist je de schuld, zeg dat dan schriftelijk en met redenen. Bij een overheid maak je bezwaar tegen het besluit of de aanslag zelf, niet tegen een herinnering.",
    wet: "art. 6:1 BW (verbintenissen ontstaan alleen uit de wet)",
  },
  {
    term: "“U bent verplicht” / “u dient”",
    re: /\b(bent|is|zijn)\s+(u\s+)?verplicht|\bu\s+dient\b|\bdient\s+u\b|\bu\s+moet\b|\bmoet\s+u\b/i,
    betekenis: "Een plicht moet een basis hebben: een wetsartikel, een verordening, een besluit of een overeenkomst. ‘U dient’ of ‘u bent verplicht’ zonder die basis is een bewering, geen bewijs.",
    controleer: "Staat erbij op welke regel of welk besluit deze plicht rust — en waarom die regel voor jou (in jouw rol) geldt?",
    ermee: "Vraag: ‘Op welke regel of welk besluit baseert u deze verplichting, en waarom geldt die voor mij?’ Zoek de genoemde regel zelf op via wetten.overheid.nl of lokaleregelgeving.overheid.nl.",
    wet: "art. 3:46 en 3:47 Awb",
  },
  {
    term: "Besluit / beschikking",
    re: /\b(besluit|beschikking|hebben\s+besloten|besluiten\s+(wij|om))\b/i,
    betekenis: "Een besluit (beschikking) is een beslissing van een bestuursorgaan met rechtsgevolg voor jou. Het geldt ook zonder dat je ermee instemt — maar je kunt ertegen opkomen.",
    controleer: "Welk orgaan nam het besluit, op welke datum, en staat erin hoe en binnen welke termijn je bezwaar kunt maken?",
    ermee: "Bezwaar maken binnen zes weken. Wil je het besluit zelf laten doorlichten op vormfouten, gebruik dan ‘Besluit controleren’.",
    wet: "art. 1:3 en 6:7 Awb",
  },
  {
    term: "Last onder dwangsom / bestuursdwang",
    re: /last\s+onder\s+(dwangsom|bestuursdwang)|\bdwangsom\b|\bbestuursdwang\b/i,
    betekenis: "Een last onder dwangsom is een opdracht om iets te doen of te stoppen, met een geldbedrag dat je verbeurt als je dat niet op tijd doet. Bij bestuursdwang grijpt de overheid zelf in, op jouw kosten. Het is een herstelsanctie, geen straf.",
    controleer: "Wat moet je precies doen, vóór wanneer (de begunstigingstermijn), en hoe hoog is de dwangsom per keer of per dag, met welk maximum?",
    ermee: "Voer de last op tijd uit óf maak bezwaar — bezwaar alleen houdt de dwangsom niet tegen. Is het dringend, vraag dan de voorzieningenrechter om schorsing.",
    wet: "art. 5:31d, 5:32 en 5:32a Awb",
  },
  {
    term: "Aanslag",
    re: /\b(naheffings)?aanslag\b/i,
    betekenis: "Een aanslag is een besluit waarin een belasting of heffing voor jou wordt vastgesteld. Het is dus een besluit: je kunt er bezwaar tegen maken.",
    controleer: "Welke heffing, welk tijdvak, welk object (pand, bedrijf), en welke tarieven of waarde zijn gebruikt?",
    ermee: "Bezwaar binnen zes weken bij de heffende instantie. Vraag daarbij om uitstel van betaling zolang het bezwaar loopt.",
    wet: "art. 6:7 Awb; Invorderingswet 1990",
  },
  {
    term: "Dwangbevel",
    re: /\bdwangbevel\b/i,
    betekenis: "Met een dwangbevel kan een overheid een geldbedrag zelf afdwingen, zonder eerst naar de rechter te gaan. Het wordt meestal betekend door een (belasting)deurwaarder en kan tot beslag leiden.",
    controleer: "Is er eerst een besluit of aanslag geweest, en daarna een aanmaning? Wie heeft het dwangbevel uitgevaardigd, en is het jou officieel betekend?",
    ermee: "Je kunt in verzet gaan bij de rechter. De termijn is kort — kijk direct wat in het dwangbevel staat en schakel bij twijfel meteen hulp in.",
    wet: "art. 4:114 e.v. Awb; art. 12 en 17 Invorderingswet 1990",
  },
  {
    term: "Ingebrekestelling / sommatie",
    re: /\b(ingebrekestelling|in\s+gebreke|sommatie|sommeren|in\s+verzuim)\b/i,
    betekenis: "Een formele waarschuwing: de afzender vindt dat je te laat bent en geeft je een laatste termijn. Daarna kunnen rente en kosten gaan lopen, of kan de afzender verdere stappen zetten.",
    controleer: "Bestaat de verplichting waar het om gaat echt, en is de termijn die je krijgt redelijk?",
    ermee: "Ben je het er niet mee eens, reageer dan schriftelijk vóór de termijn en leg uit waarom. Bewaar een kopie en bewijs van verzending.",
    wet: "art. 6:82 BW",
  },
  {
    term: "Incassokosten / rente",
    re: /\b(incassokosten|buitengerechtelijke\s+kosten|wettelijke\s+(handels)?rente|administratiekosten)\b/i,
    betekenis: "Bedragen bovenop de hoofdsom. Ze mogen niet zomaar worden bijgeteld: incassokosten zijn wettelijk begrensd, en bij consumenten pas verschuldigd na een aanmaning met 14 dagen betaaltermijn.",
    controleer: "Is de hoofdsom apart vermeld? Zijn kosten en rente gespecificeerd, en vanaf welke datum wordt rente gerekend?",
    ermee: "Vraag een specificatie. Betaal eventueel alleen het deel dat je niet betwist, en schrijf erbij waarvoor je betaalt.",
    wet: "art. 6:96 en 6:119 BW; Besluit vergoeding voor buitengerechtelijke incassokosten",
  },
  {
    term: "Beslag / deurwaarder",
    re: /\b(beslag|deurwaarder|executie|executoria)\w*/i,
    betekenis: "Beslag betekent dat je bezit of inkomen wordt vastgezet om een schuld te innen. Dat mag alleen met een executoriale titel: een vonnis van de rechter, of bij een overheid een dwangbevel. Een incassobureau kan zelf geen beslag leggen.",
    controleer: "Wordt er gedreigd met beslag zonder dat er een vonnis of dwangbevel is? Is de genoemde gerechtsdeurwaarder echt (zoek hem op bij de KBvG)?",
    ermee: "Vraag om een kopie van het vonnis of dwangbevel. Dreigen met beslag zonder titel is druk zetten, geen bevoegdheid.",
    wet: "art. 430 Wetboek van Burgerlijke Rechtsvordering",
  },
  {
    term: "Je rol: overtreder, eigenaar, belanghebbende …",
    re: /\b(overtreder|belanghebbende|eigenaar|gebruiker|vergunninghouder|belastingplichtige|aansprakelijk)\b/i,
    betekenis: "De rol waarin je wordt aangesproken bepaalt wat er van je mag worden geëist. Een verkeerde rol kan het hele verhaal onderuit halen.",
    controleer: "Klopt die rol? Ben jij echt de eigenaar, de gebruiker of degene die het deed — of is dat iemand anders, of je bedrijf?",
    ermee: "Klopt de rol niet, betwist dat dan schriftelijk en onderbouw het (koopakte, huurcontract, KvK-uittreksel).",
    wet: "art. 1:2 en 5:1 Awb",
  },
  {
    term: "Voornemen / zienswijze",
    re: /\b(voornemen|voornemens|zienswijze)\b/i,
    betekenis: "Er is nog geen definitief besluit: de afzender is van plan iets te beslissen en geeft je de kans om vooraf te reageren.",
    controleer: "Wat is het voorgenomen besluit precies, en tot wanneer kun je reageren?",
    ermee: "Geef je zienswijze op tijd — mondeling of schriftelijk. Wat je nu inbrengt, moet bij het besluit worden meegewogen.",
    wet: "art. 4:8 Awb",
  },
  {
    term: "Bezwaar / beroep",
    re: /\b(bezwaar|beroep)\b/i,
    betekenis: "Bezwaar is de eerste stap tegen een besluit: je vraagt het orgaan zelf om er opnieuw naar te kijken. Beroep is de stap daarna, bij de rechter.",
    controleer: "Staat er bij wie en binnen welke termijn je bezwaar kunt maken? Die termijn is meestal zes weken en is streng.",
    ermee: "Te weinig tijd of nog geen antwoorden? Dien op tijd een kort bezwaar in (pro forma) en vul de gronden later aan.",
    wet: "art. 6:5, 6:6 en 6:7 Awb",
  },
  {
    term: "Hoofdelijk aansprakelijk",
    re: /\bhoofdelijk\w*/i,
    betekenis: "Hoofdelijk aansprakelijk betekent dat de afzender het hele bedrag van ieder van de betrokkenen kan vragen, niet alleen jouw deel.",
    controleer: "Met wie ben je samen aansprakelijk, en waarom? Staat de grond daarvoor in de brief?",
    ermee: "Vraag waarop de hoofdelijkheid berust. Betaal je meer dan jouw deel, dan kun je dat later verhalen op de anderen.",
    wet: "art. 6:6 en 6:10 BW",
  },
  {
    term: "Erkennen / akkoord gaan",
    re: /\b(erkent|erkenning|stemt\s+u\s+in|gaat\s+u\s+akkoord|akkoord\s+met)\b/i,
    betekenis: "Door te betalen, te tekenen of ‘akkoord’ te geven kun je (ongewild) erkennen dat de vordering of het verwijt klopt.",
    controleer: "Wat erken je precies als je betaalt, tekent of akkoord geeft?",
    ermee: "Betwist je het, maar wil je verdere kosten voorkomen? Betaal dan ‘onder voorbehoud van alle rechten’ en zeg dat er schriftelijk bij.",
  },
  {
    term: "Overgedragen vordering",
    re: /\b(overgedragen|gecedeerd|cessie|rechtsopvolger|overgenomen\s+door)\b/i,
    betekenis: "De vordering is overgedragen aan een andere partij (bijvoorbeeld verkocht aan een incassobedrijf). Die nieuwe partij kan pas bij jou innen als de overdracht aan jou is meegedeeld.",
    controleer: "Wie is nu de schuldeiser, sinds wanneer, en is die overdracht aan jou gemeld?",
    ermee: "Vraag om bewijs van de overdracht. Betaal niet aan een partij die dat niet kan laten zien.",
    wet: "art. 3:94 BW",
  },
];

/** Alle juridische kernbegrippen die in de brief voorkomen, met het letterlijke citaat. */
export function vindJuridischeTaal(tekst: string): TaalPunt[] {
  const uit: TaalPunt[] = [];
  for (const r of REGELS) {
    const m = r.re.exec(tekst);
    if (!m || m.index === undefined) continue;
    uit.push({ term: r.term, citaat: zinRond(tekst, m.index, m[0].length), betekenis: r.betekenis, controleer: r.controleer, ermee: r.ermee, wet: r.wet });
  }
  return uit;
}
