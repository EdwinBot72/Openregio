// ─────────────────────────────────────────────────────────────
// Juridische taal in een contract — zonder AI.
//
// Zelfde opzet als ../rechten/taal.ts, maar voor overeenkomsten tussen
// ondernemers: per begrip wat het betekent, wat je controleert en wat je
// ermee kunt. `let` markeert bepalingen die vaak nadelig uitpakken.
// ─────────────────────────────────────────────────────────────
import { besteZin } from "../rechten/zin";
import type { TaalPunt } from "../rechten/taal";

export interface ContractPunt extends TaalPunt { letOp: boolean }

interface Regel { term: string; re: RegExp; betekenis: string; controleer: string; ermee: string; wet?: string; letOp?: boolean }

const REGELS: Regel[] = [
  {
    term: "Partijen en vertegenwoordiging",
    re: /\b(partijen|ondergetekenden|hierna\s+te\s+noemen|vertegenwoordigd\s+door|rechtsgeldig\s+vertegenwoordigd)\b/i,
    betekenis: "Een contract bindt alleen de partijen die erin staan. Voor een bedrijf tekent iemand die bevoegd is om het bedrijf te vertegenwoordigen (bijvoorbeeld de bestuurder, of iemand met een volmacht).",
    controleer: "Staan de juiste namen en rechtsvormen erin (jij privé, je eenmanszaak of je bv)? Tekent aan de andere kant iemand die daartoe bevoegd is — check het KvK-uittreksel.",
    ermee: "Vraag bij twijfel om een KvK-uittreksel of volmacht van de ondertekenaar, en laat een verkeerde partij of rechtsvorm aanpassen vóór je tekent.",
    wet: "art. 2:130 en 2:240 BW (vertegenwoordiging bv/nv); art. 3:60 BW (volmacht)",
  },
  {
    term: "Looptijd",
    re: /\b(looptijd|duur\s+van\s+(de|deze)\s+overeenkomst|aangegaan\s+voor\s+(de\s+duur\s+van|een\s+periode\s+van)|voor\s+onbepaalde\s+tijd|voor\s+bepaalde\s+tijd)\b/i,
    betekenis: "Hoe lang het contract loopt: voor een vaste periode (bepaalde tijd) of zonder einddatum (onbepaalde tijd).",
    controleer: "Wanneer begint het, wanneer eindigt het, en kun je tussentijds stoppen?",
    ermee: "Past de looptijd niet bij je plannen, vraag dan om een kortere periode of een tussentijdse opzegmogelijkheid.",
  },
  {
    term: "Stilzwijgende verlenging",
    re: /\b(stilzwijgend|automatisch)\s+(verlengd|verlenging|voortgezet)\b|\bwordt\s+(telkens\s+)?verlengd\b/i,
    betekenis: "Het contract loopt vanzelf door als je niet op tijd opzegt — vaak weer voor een hele periode.",
    controleer: "Met hoeveel tijd wordt het verlengd, en tot wanneer moet je uiterlijk opzeggen om dat te voorkomen?",
    ermee: "Zet de uiterste opzegdatum direct in je agenda. Vraag bij onderhandelen om verlenging per maand in plaats van per jaar.",
    letOp: true,
  },
  {
    term: "Opzegging",
    re: /\b(opzeg(gen|ging|termijn)|op\s+te\s+zeggen|kan\s+worden\s+opgezegd)\b/i,
    betekenis: "Hoe en wanneer je het contract kunt beëindigen: met welke termijn en in welke vorm (schriftelijk, per e-mail, aangetekend).",
    controleer: "Hoe lang is de opzegtermijn, per wanneer kun je opzeggen, en hoe moet dat precies?",
    ermee: "Zeg altijd op zoals het contract voorschrijft en bewaar het bewijs (bijvoorbeeld een ontvangstbevestiging).",
  },
  {
    term: "Ontbinding",
    re: /\b(ontbind(en|ing)|ontbonden|beëindig(en|ing)\s+met\s+onmiddellijke\s+ingang)\b/i,
    betekenis: "Het contract (eerder) beëindigen omdat de ander zich niet aan de afspraken houdt, of in bijzondere situaties zoals faillissement.",
    controleer: "In welke gevallen mag de ander ontbinden — en jij? Is dat voor beide partijen gelijk geregeld?",
    ermee: "Vraag om een wederzijdse regeling. Een tekortkoming moet meestal eerst schriftelijk worden gemeld met een redelijke termijn om het op te lossen.",
    wet: "art. 6:265 BW",
  },
  {
    term: "Betaling en rente",
    re: /\b(betalingstermijn|binnen\s+\d+\s+dagen\s+na\s+factuurdatum|te\s+betalen|vergoeding|tarief|(wettelijke\s+)?(handels)?rente|incassokosten)\b/i,
    betekenis: "Wat je betaalt, wanneer, en wat er gebeurt als je te laat bent (rente en kosten).",
    controleer: "Is de prijs vast of kan die worden verhoogd? Wat is de betalingstermijn, en welke rente en kosten rekenen ze bij te late betaling?",
    ermee: "Leg prijsverhogingen vast met een maximum of een opzegrecht. Tussen bedrijven geldt zonder afspraak een betalingstermijn van 30 dagen.",
    wet: "art. 6:119a BW (handelsrente, betalingstermijn)",
  },
  {
    term: "Prijswijziging of eenzijdige wijziging",
    re: /\b(eenzijdig\s+(te\s+)?wijzig|behoudt\s+zich\s+het\s+recht\s+voor|prijzen\s+(jaarlijks\s+)?(te\s+)?(wijzigen|indexeren|aanpassen)|indexer(en|ing))\w*/i,
    betekenis: "De andere partij mag de prijs of de voorwaarden later zelf aanpassen, zonder dat jij daarmee instemt.",
    controleer: "Wat mag er precies veranderen, hoe vaak, met welk maximum, en mag jij opzeggen als je het er niet mee eens bent?",
    ermee: "Vraag om een maximum (bijvoorbeeld de inflatie) en een recht om op te zeggen bij een wijziging.",
    letOp: true,
  },
  {
    term: "Boete",
    re: /\b(boete|boetebeding|verbeurt|verbeuren|contractuele\s+boete)\w*/i,
    betekenis: "Een vast bedrag dat je moet betalen als je een afspraak overtreedt — vaak los van de werkelijke schade.",
    controleer: "Hoe hoog is de boete, per keer of per dag, is er een maximum, en komt de schadevergoeding er nog bovenop?",
    ermee: "Vraag om een lager bedrag en een maximum. Een buitensporige boete kan de rechter matigen, maar dat is geen zekerheid.",
    wet: "art. 6:91 en 6:94 BW",
    letOp: true,
  },
  {
    term: "Aansprakelijkheid",
    re: /\b(aansprakelijk\w*|schadevergoeding|gevolgschade|indirecte\s+schade)\b/i,
    betekenis: "Wie betaalt als er iets misgaat, en tot welk bedrag. Vaak wordt de aansprakelijkheid van één partij beperkt of uitgesloten.",
    controleer: "Is de aansprakelijkheid van de ander beperkt (tot welk bedrag)? En die van jou? Is dat in evenwicht?",
    ermee: "Vraag om een gelijkwaardige regeling. Check ook of jouw verzekering de risico's dekt die jij in dit contract op je neemt.",
    letOp: true,
  },
  {
    term: "Vrijwaring",
    re: /\bvrijwa(ren|ring|art)\b/i,
    betekenis: "Je belooft de andere partij schadeloos te stellen als een derde háár aanspreekt — ook als het niet jouw schuld is.",
    controleer: "Waarvoor precies vrijwaar je de ander, is er een maximum, en is het wederzijds?",
    ermee: "Beperk de vrijwaring tot schade die jij zelf veroorzaakt, met een maximum.",
    letOp: true,
  },
  {
    term: "Concurrentie- of relatiebeding",
    re: /\b(concurrentiebeding|relatiebeding|non-?concurrentie|niet\s+(in\s+)?concurreren|geen\s+(zaken|diensten)\s+(te\s+)?doen\s+met)\w*/i,
    betekenis: "Je mag (na afloop) niet voor concurrenten werken of geen zaken doen met klanten van de andere partij.",
    controleer: "Voor hoe lang, in welk gebied, voor welke klanten of activiteiten, en staat er een boete op?",
    ermee: "Vraag om een korte duur, een beperkt gebied en een duidelijke omschrijving — of schrap het beding.",
    letOp: true,
  },
  {
    term: "Geheimhouding",
    re: /\b(geheimhouding|vertrouwelijk\w*|geheim\s+te\s+houden)\b/i,
    betekenis: "Je mag bepaalde informatie niet delen met anderen, soms ook nog lang na afloop van het contract.",
    controleer: "Welke informatie valt eronder, hoe lang geldt het, en staat er een boete op?",
    ermee: "Zorg dat duidelijk is wat wél mag (bijvoorbeeld delen met je boekhouder of advocaat).",
  },
  {
    term: "Intellectueel eigendom",
    re: /\b(intellectu[eë]{1,2}l\s+eigendom|auteursrecht\w*|eigendomsrecht\w*\s+op|licentie)\b/i,
    betekenis: "Wie eigenaar wordt van wat er wordt gemaakt (teksten, ontwerpen, software) en wie het mag gebruiken.",
    controleer: "Blijven de rechten bij de maker, of gaan ze over? Mag je het resultaat gebruiken zoals je van plan bent?",
    ermee: "Leg vast dat jij kunt gebruiken wat je nodig hebt, voor de duur en het doel dat je voor ogen hebt.",
  },
  {
    term: "Algemene voorwaarden",
    re: /\balgemene\s+(leverings|inkoop|verkoop)?voorwaarden\b/i,
    betekenis: "Aanvullende standaardregels die ook bij het contract horen — vaak met belangrijke afspraken over aansprakelijkheid en betaling.",
    controleer: "Welke voorwaarden gelden (die van hen of die van jou)? Heb je ze vóór het tekenen ontvangen?",
    ermee: "Vraag de voorwaarden op en lees ze vóór je tekent. Heb je ze niet redelijkerwijs kunnen lezen, dan kun je bepalingen soms vernietigen.",
    wet: "art. 6:233 en 6:234 BW",
  },
  {
    term: "Eigendomsvoorbehoud",
    re: /\beigendomsvoorbehoud\b|\beigendom\s+(blijft|gaat\s+pas\s+over)\b/i,
    betekenis: "Geleverde spullen blijven eigendom van de verkoper totdat alles is betaald.",
    controleer: "Wat gebeurt er met de spullen als je niet (op tijd) betaalt?",
    ermee: "Houd rekening met terughalen bij een betalingsachterstand.",
    wet: "art. 3:92 BW",
  },
  {
    term: "Overmacht",
    re: /\bovermacht\b/i,
    betekenis: "Situaties waarin een partij haar afspraak niet hoeft na te komen omdat het buiten haar schuld onmogelijk is.",
    controleer: "Wat telt als overmacht (ziekte, storing, leveranciers?), en mag je ontbinden als het lang duurt?",
    ermee: "Let op dat overmacht niet te ruim is omschreven voor de andere partij en te smal voor jou.",
    wet: "art. 6:75 BW",
  },
  {
    term: "Garantie",
    re: /\bgarant(ie|ies|eert|eren)\b/i,
    betekenis: "Een belofte over de kwaliteit of werking van wat wordt geleverd, en wat er gebeurt als dat niet klopt.",
    controleer: "Wat valt onder de garantie, hoe lang, en wat moet je doen om er gebruik van te maken?",
    ermee: "Meld gebreken snel en schriftelijk; te laat melden kan je rechten kosten.",
  },
  {
    term: "Toepasselijk recht en rechter",
    re: /\b(toepasselijk\s+recht|bevoegde\s+rechter|geschillen\s+worden\s+voorgelegd|arbitrage|mediation)\b/i,
    betekenis: "Welk recht geldt en waar een geschil wordt behandeld — bij een rechter, via arbitrage of eerst via mediation.",
    controleer: "Is het Nederlands recht? Welke rechter of welk instituut? Arbitrage kan duur zijn.",
    ermee: "Vraag om de rechter bij jou in de buurt, of om Nederlands recht als het een buitenlandse partij is.",
  },
  {
    term: "Verwerking van persoonsgegevens",
    re: /\b(persoonsgegevens|AVG|verwerkersovereenkomst)\b/i,
    betekenis: "Afspraken over het gebruik van persoonsgegevens. Verwerkt de ander gegevens namens jou, dan is vaak een verwerkersovereenkomst nodig.",
    controleer: "Wie is verantwoordelijk voor welke gegevens, en is er een verwerkersovereenkomst waar dat nodig is?",
    ermee: "Vraag om een verwerkersovereenkomst als de ander persoonsgegevens voor jou verwerkt.",
    wet: "art. 28 AVG",
  },
];

/** Alle contractbegrippen die in de tekst voorkomen, met het letterlijke citaat. */
export function vindContractTaal(tekst: string): ContractPunt[] {
  const uit: ContractPunt[] = [];
  for (const r of REGELS) {
    const citaat = besteZin(tekst, r.re);
    if (!citaat) continue;
    uit.push({
      term: r.term, citaat,
      betekenis: r.betekenis, controleer: r.controleer, ermee: r.ermee, wet: r.wet, letOp: !!r.letOp,
    });
  }
  return uit;
}
