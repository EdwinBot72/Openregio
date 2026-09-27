// ─────────────────────────────────────────────────────────────
// Algemene voorwaarden en privacyverklaring van OpenRegio.
//
// Eén bron: de pagina's /voorwaarden en /privacy tonen deze tekst, en
// scripts/juridisch-naar-md.ts maakt er een leesversie van voor juridische review.
//
// Opmaak in de tekst: **vet** en [linktekst](https://…).
// Nog in te vullen gegevens staan als [● …] en worden op de pagina geel gemarkeerd.
// ─────────────────────────────────────────────────────────────

export type Blok = { p: string } | { ul: string[] } | { h3: string } | { let: string };
export interface Sectie { titel: string; blokken: Blok[] }
export interface JuridischDocument { titel: string; versie: string; bijgewerkt: string; intro: string[]; secties: Sectie[] }

// Gegevens uit het Handelsregister (KvK), opgezocht op 26 september 2026.
const AANBIEDER = "Stroombox";
const AANBIEDER_VOLLEDIG = `${AANBIEDER} (eenmanszaak), handelend onder de naam OpenRegio, ingeschreven bij de Kamer van Koophandel onder nummer 55672671, gevestigd aan de Van Meeuwenstraat 19, 2064 LD Spaarndam`;
const CONTACT = "info@openregio.nl";
const PRIVACYCONTACT = "privacy@openregio.nl";

export const VOORWAARDEN: JuridischDocument = {
  titel: "Algemene voorwaarden",
  versie: "2.0",
  bijgewerkt: "26 september 2026",
  intro: [
    "Deze voorwaarden gelden voor iedereen die een account heeft op OpenRegio of de diensten van OpenRegio gebruikt. Lees vooral artikel 3 (wat OpenRegio wel en niet is), artikel 4 (je eigen verantwoordelijkheid) en artikel 9 (aansprakelijkheid). Daar staat wat je van ons kunt verwachten — en wat niet.",
  ],
  secties: [
    {
      titel: "1. Wie zijn wij en wat betekenen de woorden in deze voorwaarden",
      blokken: [
        { p: `OpenRegio is een dienst van ${AANBIEDER_VOLLEDIG} (hierna: **OpenRegio**, **wij** of **ons**).` },
        { p: "In deze voorwaarden bedoelen we met:" },
        { ul: [
          "**Platform:** de website openregio.nl en alle onderdelen, tools en pagina's die daarbij horen.",
          "**Gebruiker** of **jij:** de ondernemer die een account aanmaakt of het platform gebruikt, en de persoon die namens die ondernemer handelt.",
          "**Abonnement:** een betaald lidmaatschap (Basis of Pro) waarmee je toegang krijgt tot onderdelen van het platform.",
          "**Diensten:** alles wat OpenRegio via het platform aanbiedt, waaronder de briefcontrole, Besluit controleren, RegioBot, de AI-agents, vragenroutes, overzichten van regels en de onderdelen voor lokale zichtbaarheid.",
          "**Uitkomst:** alles wat het platform voor jou maakt of toont: analyses, rapporten, overzichten, uitleg, vragenlijsten, conceptbrieven en antwoorden van RegioBot.",
          "**Overheid:** een gemeente, provincie, waterschap, het Rijk, een zelfstandig bestuursorgaan of een organisatie die namens een van hen optreedt.",
        ] },
      ],
    },
    {
      titel: "2. Wanneer gelden deze voorwaarden",
      blokken: [
        { p: "Deze voorwaarden gelden voor elk gebruik van het platform, voor elk abonnement en voor elke overeenkomst tussen jou en OpenRegio. Door een account aan te maken of het platform te gebruiken, ga je met deze voorwaarden akkoord." },
        { p: "**OpenRegio is er voor ondernemers.** Door een account aan te maken verklaar je dat je handelt in de uitoefening van je beroep of bedrijf (bijvoorbeeld als zzp'er, eenmanszaak, vof, bv of stichting). Het platform is niet bedoeld voor gebruik als consument." },
        { p: "Algemene voorwaarden van jouw kant gelden niet, tenzij wij daar schriftelijk mee hebben ingestemd." },
        { p: "Is een bepaling in deze voorwaarden ongeldig of wordt die vernietigd, dan blijven de andere bepalingen gelden. De ongeldige bepaling wordt vervangen door een geldige bepaling die zo dicht mogelijk bij de bedoeling ervan ligt." },
      ],
    },
    {
      titel: "3. Wat OpenRegio wel is — en wat niet",
      blokken: [
        { p: "OpenRegio helpt je om je positie te kennen: van wie een brief komt, wie iets van je verlangt, of die daartoe bevoegd lijkt, welke juridische begrippen erin staan en welke vragen je kunt stellen. Het platform zet informatie op een rij zodat je zelf beter kunt beslissen." },
        { let: "**OpenRegio geeft geen juridisch advies.** Wij zijn geen advocaat, geen juridisch adviesbureau en geen rechtsbijstandverlener. De uitkomsten zijn algemene informatie en hulpmiddelen, geen advies over jouw specifieke situatie. Wij beoordelen je zaak niet inhoudelijk en doen geen uitspraak over je kansen." },
        { ul: [
          "**Geautomatiseerd.** Uitkomsten worden grotendeels automatisch gemaakt, deels met behulp van kunstmatige intelligentie (AI) en tekstherkenning (OCR). Automatische systemen maken fouten: ze kunnen tekst verkeerd lezen, iets missen of iets onjuist samenvatten. Wij controleren uitkomsten niet handmatig.",
          "**Labels zijn een hulpmiddel.** Wat als “vaststaand” is gemarkeerd, is letterlijk teruggevonden in de tekst die je aanleverde — maar kan verkeerd zijn uitgelezen. “Juridische duiding” is algemene uitleg die in jouw situatie anders kan uitpakken. “Nog te controleren” moet je zelf nagaan.",
          "**Niet volledig.** Het platform bekijkt alleen de tekst die jij aanlevert. Andere stukken, eerdere besluiten, afspraken of omstandigheden kennen wij niet.",
          "**Regels veranderen.** Wetten, verordeningen, beleid en rechtspraak veranderen. Informatie op het platform kan verouderd zijn.",
          "**Geen vertegenwoordiging.** Wij treden niet namens jou op, voeren geen correspondentie voor je en bewaken geen termijnen voor je.",
        ] },
      ],
    },
    {
      titel: "4. Jouw eigen verantwoordelijkheid",
      blokken: [
        { p: "Jij beslist wat je met een uitkomst doet — en jij draagt daarvan de gevolgen. Dat betekent onder meer:" },
        { ul: [
          "Je controleert elke uitkomst zelf voordat je erop vertrouwt of ernaar handelt.",
          "Je leest elke conceptbrief na, past die aan waar nodig en beslist zelf of je hem verstuurt. Wat je verstuurt, is jouw brief.",
          "Je houdt zelf je termijnen in de gaten (bijvoorbeeld voor bezwaar, beroep, betaling of het uitvoeren van een last). Een indicatieve termijn op het platform is geen garantie.",
          "Je zorgt dat je de gegevens die je uploadt mag gebruiken en delen.",
          "Bij een groot belang — hoge bedragen, dreigende sluiting, beslag, strafrechtelijke gevolgen — schakel je tijdig een advocaat, jurist of het Juridisch Loket in.",
        ] },
        { h3: "Een besluit blijft gelden, ook als het niet klopt" },
        { p: "Veel besluiten van een overheid zijn aanvechtbaar, en toch worden ze uitgevoerd. **Een besluit blijft rechtsgeldig totdat het is ingetrokken, in bezwaar is herroepen of door de rechter is vernietigd** — ook als het naar jouw oordeel niet deugt, en ook als OpenRegio aandachtspunten laat zien. Betalingsverplichtingen, dwangsommen, termijnen en invordering lopen in de tussentijd door. Vragen stellen over bevoegdheid of herkomst van een brief schort een besluit of een termijn niet op. OpenRegio kan dat niet tegenhouden." },
        { h3: "Verliezen hoort soms bij winnen" },
        { p: "Opkomen voor je rechten is geen garantie op gelijk krijgen. Een verzoek kan onbeantwoord blijven, een bezwaar kan worden afgewezen en een procedure kan verloren gaan — ook als het platform punten aanwees die aandacht verdienen. Soms verlies je een ronde om later, in bezwaar, beroep of hoger beroep, alsnog gelijk te krijgen; soms niet. Procederen kost tijd en kan geld kosten (bijvoorbeeld griffierecht, proceskosten of oplopende dwangsommen). Die afweging maak jij, en de risico's daarvan liggen bij jou." },
      ],
    },
    {
      titel: "5. Je account",
      blokken: [
        { ul: [
          "Je geeft bij het aanmaken van je account juiste en volledige gegevens en houdt die actueel.",
          "Je houdt je inloggegevens geheim. Alles wat via jouw account gebeurt, komt voor jouw rekening, tenzij je ons direct hebt gemeld dat je account is misbruikt.",
          "Een account is persoonlijk voor jouw onderneming. Je mag het niet doorverkopen of delen met andere ondernemingen.",
        ] },
      ],
    },
    {
      titel: "6. Abonnementen, prijzen en betaling",
      blokken: [
        { ul: [
          "De actuele abonnementen en prijzen staan op de pagina [Lidmaatschap](/lidmaatschap). Prijzen zijn per maand en **exclusief btw**; de btw wordt bij de betaling en op de factuur apart vermeld.",
          "Betaling verloopt via onze betaaldienstverlener Stripe, met iDEAL, creditcard of SEPA-incasso. Het abonnement wordt maandelijks vooraf automatisch verlengd en afgeschreven.",
          "Mislukt een betaling, dan mogen wij de toegang tot betaalde onderdelen opschorten totdat alsnog is betaald.",
          "Wij mogen prijzen en de inhoud van abonnementen wijzigen. Een prijsverhoging maken we minimaal 30 dagen van tevoren bekend. Ben je het er niet mee eens, dan kun je opzeggen tegen de datum waarop de wijziging ingaat.",
        ] },
      ],
    },
    {
      titel: "7. Opzeggen en beëindigen",
      blokken: [
        { ul: [
          "Je kunt je abonnement op elk moment opzeggen. De opzegging gaat in aan het einde van de lopende betaalperiode; tot dan houd je toegang.",
          "Al betaalde bedragen worden niet terugbetaald, ook niet als je het platform in die periode niet (volledig) hebt gebruikt.",
          "Wij mogen je account opschorten of beëindigen als je deze voorwaarden overtreedt, het platform misbruikt, niet betaalt of als we daartoe wettelijk verplicht zijn. Als het redelijk is, waarschuwen we je eerst.",
          "Na beëindiging kun je niet meer bij je account. Wat er met je gegevens gebeurt, staat in de [privacyverklaring](/privacy).",
        ] },
      ],
    },
    {
      titel: "8. Beschikbaarheid, wachttijd en eerlijk gebruik",
      blokken: [
        { ul: [
          "Wij doen ons best om het platform goed en veilig beschikbaar te houden, maar garanderen niet dat het altijd, ononderbroken en foutloos werkt. Onderhoud, storingen en updates kunnen de dienst tijdelijk onderbreken.",
          "Analyses draaien op onze eigen server. Bij drukte kom je in een wachtrij en kan een analyse enkele minuten duren. Er geldt een maximum aantal gelijktijdige analyses per gebruiker.",
          "Wij mogen onderdelen van het platform wijzigen, uitbreiden, beperken of stopzetten.",
          "Je gebruikt het platform niet op een manier die het platform, andere gebruikers of derden schaadt: geen misbruik, geen geautomatiseerd massaal opvragen, geen pogingen om beveiliging te omzeilen, geen onrechtmatige, misleidende of beledigende inhoud en geen spam.",
        ] },
      ],
    },
    {
      titel: "9. Aansprakelijkheid",
      blokken: [
        { p: "Deze paragraaf is belangrijk. Lees hem goed." },
        { p: "**9.1 Inspanning, geen resultaat.** OpenRegio levert een hulpmiddel. Wij spannen ons in om dat zorgvuldig te doen, maar staan niet in voor de juistheid, volledigheid of bruikbaarheid van uitkomsten en garanderen geen resultaat — niet in een procedure, niet in contact met een overheid of bedrijf en niet financieel." },
        { p: "**9.2 Geen aansprakelijkheid voor wat je met uitkomsten doet.** OpenRegio is niet aansprakelijk voor schade die ontstaat doordat je een uitkomst gebruikt, er (niet) naar handelt of erop vertrouwt. Daaronder valt in elk geval:" },
        { ul: [
          "geldschade, zoals boetes, dwangsommen, belastingaanslagen, rente, incasso- en invorderingskosten, griffierecht, proceskosten en kosten van juridische hulp;",
          "schade door een gemiste of verkeerd berekende termijn;",
          "schade door een afgewezen verzoek, bezwaar of beroep, of een verloren procedure;",
          "schade door een brief die je op basis van het platform hebt verstuurd;",
          "schade door onjuist uitgelezen tekst (OCR), onjuiste AI-uitkomsten of verouderde informatie;",
          "gevolgschade en indirecte schade, zoals gederfde winst, gemiste besparingen, omzetverlies, bedrijfsstilstand, reputatieschade en verlies van gegevens.",
        ] },
        { p: "**9.3 Maximum.** Voor zover OpenRegio toch aansprakelijk is, is die aansprakelijkheid in totaal beperkt tot het bedrag dat je in de drie maanden vóór de gebeurtenis die de schade veroorzaakte aan abonnementsgeld hebt betaald (exclusief btw), met een maximum van € 250." },
        { p: "**9.4 Grens van de wet.** De beperkingen in dit artikel gelden niet als de schade het gevolg is van opzet of bewuste roekeloosheid van OpenRegio of haar leidinggevenden. Dat kan wettelijk niet worden uitgesloten." },
        { p: "**9.5 Melden.** Een aanspraak op schadevergoeding moet je binnen 30 dagen nadat je de schade hebt ontdekt of redelijkerwijs had kunnen ontdekken, schriftelijk bij ons melden. Elke aanspraak vervalt één jaar na de gebeurtenis die de schade veroorzaakte." },
        { p: "**9.6 Vrijwaring.** Je vrijwaart OpenRegio voor aanspraken van derden — waaronder een overheid, een schuldeiser of een persoon die in een brief wordt genoemd — die voortkomen uit jouw gebruik van het platform of uit wat jij op basis daarvan hebt verstuurd of gedaan." },
        { p: "**9.7 Derden.** OpenRegio is niet aansprakelijk voor diensten en websites van derden waar het platform naar verwijst of mee werkt, zoals overheidswebsites, registers en betaaldiensten." },
      ],
    },
    {
      titel: "10. Jouw inhoud en je bedrijfsprofiel",
      blokken: [
        { ul: [
          "Wat je uploadt of invoert, blijft van jou. Je geeft OpenRegio toestemming om die inhoud te gebruiken voor zover dat nodig is om de diensten aan jou te leveren. Wij gebruiken jouw brieven en documenten niet om AI-modellen te trainen.",
          "Gegevens die je in je openbare bedrijfsprofiel zet, zijn voor iedereen zichtbaar. Jij bepaalt wat daarin staat en bent verantwoordelijk voor de juistheid ervan.",
          "Je plaatst geen inhoud die onrechtmatig is of inbreuk maakt op rechten van anderen. Wij mogen zulke inhoud verwijderen.",
        ] },
      ],
    },
    {
      titel: "11. Intellectueel eigendom",
      blokken: [
        { p: "Alle rechten op het platform — waaronder de software, teksten, vragenroutes, sjablonen, ontwerp en merknaam OpenRegio — liggen bij OpenRegio of haar licentiegevers. Je krijgt voor de duur van je account een beperkt, niet-overdraagbaar recht om het platform voor je eigen onderneming te gebruiken. Uitkomsten die voor jou zijn gemaakt (zoals een rapport of conceptbrief) mag je voor je eigen zaak vrij gebruiken." },
      ],
    },
    {
      titel: "12. Partnerprogramma",
      blokken: [
        { p: "Biedt OpenRegio een partnerprogramma aan, dan gelden daarvoor aanvullende voorwaarden die we bij aanmelding bekendmaken. Tot die tijd is er geen recht op een vergoeding voor het aanbrengen van klanten." },
      ],
    },
    {
      titel: "13. Privacy",
      blokken: [
        { p: "Hoe wij met persoonsgegevens omgaan, staat in onze [privacyverklaring](/privacy)." },
      ],
    },
    {
      titel: "14. Wijzigingen van deze voorwaarden",
      blokken: [
        { p: "Wij mogen deze voorwaarden wijzigen. Belangrijke wijzigingen maken we minimaal 30 dagen van tevoren bekend via het platform of per e-mail. Ben je het niet eens met een wijziging, dan kun je opzeggen tegen de datum waarop die ingaat. Gebruik je het platform daarna, dan geldt de nieuwe versie." },
      ],
    },
    {
      titel: "15. Toepasselijk recht en geschillen",
      blokken: [
        { p: "Op deze voorwaarden en op alle overeenkomsten met OpenRegio is Nederlands recht van toepassing. Heb je een klacht, meld die dan eerst bij ons via " + CONTACT + "; we reageren binnen 14 dagen. Komen we er samen niet uit, dan is de bevoegde rechter in het arrondissement waar OpenRegio is gevestigd bevoegd." },
      ],
    },
    {
      titel: "Contact",
      blokken: [
        { p: `${AANBIEDER_VOLLEDIG}. E-mail: ${CONTACT}.` },
      ],
    },
  ],
};

export const PRIVACY: JuridischDocument = {
  titel: "Privacyverklaring",
  versie: "2.1",
  bijgewerkt: "27 september 2026",
  intro: [
    "In deze verklaring lees je welke persoonsgegevens OpenRegio verwerkt, waarom we dat doen, hoe lang we gegevens bewaren, met wie gegevens kunnen worden gedeeld en welke rechten je hebt. We houden dit zo concreet mogelijk en beschrijven hoe het platform daadwerkelijk werkt.",
  ],
  secties: [
    {
      titel: "1. Wie is verantwoordelijk?",
      blokken: [
        { p: "OpenRegio wordt aangeboden door:" },
        { let: `**Stroombox**, eenmanszaak, handelend onder de naam OpenRegio\nKvK-nummer: 55672671\nVan Meeuwenstraat 19, 2064 LD Spaarndam\nE-mail voor privacyvragen: [${PRIVACYCONTACT}](mailto:${PRIVACYCONTACT})` },
        { p: "Voor persoonsgegevens die OpenRegio voor zijn eigen bedrijfsvoering verwerkt, zoals accountgegevens, betalingen, beveiliging en support, is Stroombox de verwerkingsverantwoordelijke." },
        { p: "Wanneer een zakelijke gebruiker persoonsgegevens van anderen invoert of uploadt in OpenRegio en OpenRegio deze gegevens uitsluitend verwerkt om de door die gebruiker gekozen functie uit te voeren, kan OpenRegio voor die verwerking optreden als verwerker. De zakelijke gebruiker blijft dan verantwoordelijk voor het doel en de rechtmatigheid van die verwerking." },
        { p: "Waar dat volgens de AVG nodig is, worden hierover afspraken gemaakt in een verwerkersovereenkomst of verwerkersvoorwaarden." },
      ],
    },
    {
      titel: "2. Privacy in het kort",
      blokken: [
        { h3: "Je documenten blijven op onze eigen server" },
        { p: "Documenten en brieven die je door OpenRegio laat analyseren, worden verwerkt op onze eigen server met een lokaal draaiend AI-model. De inhoud daarvan wordt niet voor analyse doorgestuurd naar externe AI-diensten zoals OpenAI of Google." },
        { h3: "Brieven worden niet blijvend opgeslagen" },
        { p: "Een document dat uitsluitend voor een losse briefanalyse wordt geüpload, wordt na verwerking verwijderd." },
        { p: "Het gegenereerde rapport wordt maximaal 24 uur tijdelijk beschikbaar gehouden zodat je het kunt terugvinden of ophalen. Daarna wordt het automatisch verwijderd." },
        { p: "Brieven en tijdelijke analyserapporten worden niet blijvend in onze database opgeslagen." },
        { h3: "Geen tracking" },
        { p: "OpenRegio gebruikt:" },
        { ul: [
          "geen advertentiecookies;",
          "geen trackingcookies;",
          "geen analytics;",
          "geen advertentienetwerken;",
          "geen trackingpixels;",
          "geen externe lettertypen voor tracking;",
          "geen verkoop van persoonsgegevens.",
        ] },
        { h3: "Geen AI-training" },
        { p: "Documenten, gesprekken en andere persoonsgegevens van gebruikers worden niet gebruikt om onze AI-modellen te trainen." },
      ],
    },
    {
      titel: "3. Welke persoonsgegevens verwerken we?",
      blokken: [
        { h3: "3.1 Account" },
        { p: "We kunnen verwerken:" },
        { ul: ["naam;", "e-mailadres;", "bedrijfsnaam;", "abonnement;", "accountinstellingen;", "authenticatiegegevens."] },
        { p: "**Doel:** je account aanmaken, je laten inloggen en het platform leveren." },
        { p: "**Grondslag:** uitvoering van de overeenkomst." },
        { p: "**Bewaartermijn:** zolang je account bestaat. Na beëindiging van het account verwijderen we accountgegevens in beginsel binnen 3 maanden, behalve wanneer bepaalde gegevens op grond van een wettelijke verplichting langer moeten worden bewaard." },
        { p: "Wachtwoorden worden niet leesbaar opgeslagen. Ze worden opgeslagen als cryptografische hash, zodat wij het oorspronkelijke wachtwoord niet kunnen uitlezen." },

        { h3: "3.2 Betalingen en facturen" },
        { p: "We verwerken onder andere:" },
        { ul: ["abonnement;", "betaalstatus;", "betaalde bedragen;", "factuurgegevens;", "administratieve gegevens die nodig zijn voor onze boekhouding."] },
        { p: "Betalingen verlopen via Stripe. OpenRegio ontvangt en bewaart geen volledige betaalkaartgegevens." },
        { p: "**Doel:** betaling van abonnementen, facturatie en administratie." },
        { p: "**Grondslag:** uitvoering van de overeenkomst en wettelijke verplichtingen." },
        { p: "**Bewaartermijn:** gegevens waarvoor een fiscale bewaarplicht geldt, bewaren we gedurende de wettelijk voorgeschreven termijn, in beginsel 7 jaar." },

        { h3: "3.3 Brieven en documenten die je laat controleren" },
        { p: "Wanneer je een brief of ander document laat controleren, verwerken we de inhoud daarvan voor zover dat nodig is om de analyse uit te voeren." },
        { p: "Een document kan persoonsgegevens bevatten van jezelf of van anderen, bijvoorbeeld:" },
        { ul: [
          "namen;", "adressen;", "contactgegevens;", "namen of functies van medewerkers of ambtenaren;", "zaak- of dossierinformatie;",
          "juridische correspondentie;", "informatie over geschillen;", "gegevens over boetes, overtredingen of andere juridische kwesties.",
        ] },
        { p: "**Doel:** de door jou gevraagde analyse uitvoeren en een rapport genereren." },
        { p: "Wanneer OpenRegio zelf verwerkingsverantwoordelijke is voor deze verwerking, baseren we de verwerking waar mogelijk op de uitvoering van onze overeenkomst met jou." },
        { p: "Wanneer je als zakelijke gebruiker persoonsgegevens van anderen invoert en OpenRegio die gegevens uitsluitend namens jou verwerkt, kan OpenRegio optreden als verwerker. In dat geval ben jij als gebruiker verantwoordelijk voor de rechtmatigheid van het aanleveren en verwerken van die persoonsgegevens." },
        { p: "**Gevoelige gegevens.** Documenten kunnen incidenteel bijzondere persoonsgegevens of strafrechtelijke persoonsgegevens bevatten. Voor strafrechtelijke persoonsgegevens gelden aanvullende wettelijke regels. OpenRegio gebruikt dergelijke gegevens niet voor eigen doeleinden, profilering, marketing of AI-training. Wanneer OpenRegio deze gegevens uitsluitend namens een zakelijke gebruiker verwerkt, is die gebruiker verantwoordelijk voor het bestaan van een geldige wettelijke basis om deze gegevens te verwerken." },
        { p: "**Dataminimalisatie.** Je hoeft gegevens die noodzakelijk zijn voor de analyse niet vooraf te verwijderen. We adviseren wel om persoonsgegevens die voor de analyse niet relevant zijn, waar mogelijk weg te laten of af te schermen." },
        { p: "**Bewaartermijn:** het oorspronkelijke document wordt na de analyse verwijderd. Het gegenereerde analyserapport blijft maximaal 24 uur tijdelijk beschikbaar en wordt daarna automatisch verwijderd. Deze documenten en rapporten worden niet blijvend in de database opgeslagen." },

        { h3: "3.4 RegioBot" },
        { p: "Wanneer je RegioBot gebruikt, verwerken we de vragen en informatie die je zelf invoert." },
        { p: "**Doel:** je vragen beantwoorden en de functionaliteit van RegioBot leveren." },
        { p: "**Grondslag:** uitvoering van de overeenkomst." },
        { p: "Wanneer je daarbij persoonsgegevens van anderen invoert in het kader van je eigen onderneming of organisatie, kan OpenRegio voor die gegevens als verwerker optreden." },

        { h3: "3.5 Dossiers en documenten in je account" },
        { p: "Als je zelf dossiers, Woo-verzoeken, notities of documenten in je account opslaat, verwerken we die gegevens zodat je deze functies kunt gebruiken." },
        { p: "**Doel:** opslag, beheer en verwerking van je eigen dossiers en documenten." },
        { p: "**Grondslag:** uitvoering van de overeenkomst." },
        { p: "**Bewaartermijn:** zolang je account bestaat of totdat je de gegevens zelf verwijdert, tenzij een andere bewaartermijn uitdrukkelijk wordt aangegeven." },

        { h3: "3.6 Openbaar bedrijfsprofiel en lokale onderdelen" },
        { p: "Wanneer je informatie publiceert in een bedrijfsprofiel, lokale actie, workshop of aanbod, kunnen bijvoorbeeld worden verwerkt:" },
        { ul: ["bedrijfsnaam;", "omschrijving;", "adres;", "website;", "contactgegevens;", "openingstijden;", "door jou aangeleverde overige bedrijfsinformatie."] },
        { p: "Deze gegevens zijn openbaar zichtbaar wanneer je ervoor kiest ze te publiceren. Om een locatie op een kaart te tonen, kan een adres worden omgezet in geografische coördinaten." },
        { p: "**Grondslag:** uitvoering van de overeenkomst en jouw keuze om deze gegevens openbaar te publiceren." },
        { p: "**Bewaartermijn:** zolang het profiel of de betreffende publicatie bestaat." },
        { p: "Let erop dat een bedrijfsadres bij bijvoorbeeld een eenmanszaak ook een woonadres kan zijn. Publiceer daarom alleen gegevens die je daadwerkelijk openbaar wilt maken." },

        { h3: "3.7 E-mail" },
        { p: "We gebruiken je e-mailadres voor noodzakelijke communicatie over je account of dienstverlening, bijvoorbeeld:" },
        { ul: ["accountactivatie;", "herstellen van een wachtwoord;", "betaalinformatie;", "belangrijke wijzigingen in je account of abonnement;", "melding dat een aangevraagde analyse klaarstaat."] },
        { p: "**Grondslag:** uitvoering van de overeenkomst." },
        { p: "Nieuwsbrieven of commerciële e-mails sturen we alleen wanneer daarvoor toestemming is gegeven of wanneer een andere wettelijke grondslag daarvoor geldt. Een gegeven toestemming kun je altijd intrekken." },

        { h3: "3.8 Beveiliging en foutopsporing" },
        { p: "Voor de beveiliging van OpenRegio kunnen we technische gegevens tijdelijk verwerken." },
        { p: "**IP-adressen.** Een IP-adres kan kortdurend in het werkgeheugen van de server worden gebruikt om misbruik tegen te gaan, bijvoorbeeld bij:" },
        { ul: ["grote aantallen inlogpogingen;", "registratiepogingen;", "geautomatiseerd misbruik;", "aanvallen op het platform."] },
        { p: "Een IP-adres dat hiervoor wordt gebruikt, blijft maximaal ongeveer één uur beschikbaar. IP-adressen worden niet structureel opgeslagen in onze applicatielogbestanden." },
        { p: "**Technische logs.** Technische foutmeldingen kunnen tijdelijk in logbestanden terechtkomen. De logbestanden zijn in omvang begrensd en worden automatisch overschreven. Bij updates van het platform kunnen deze logs eveneens worden verwijderd." },
        { p: "**Doel:** OpenRegio beveiligen, storingen onderzoeken en misbruik voorkomen." },
        { p: "**Grondslag:** gerechtvaardigd belang. Ons gerechtvaardigd belang is de bescherming van OpenRegio en zijn gebruikers tegen ongeautoriseerde toegang, misbruik, aanvallen en technische storingen." },

        { h3: "3.9 Contact en support" },
        { p: "Wanneer je contact met ons opneemt, verwerken we de informatie die je daarbij verstrekt." },
        { p: "**Doel:** je vraag beantwoorden, ondersteuning bieden en correspondentie kunnen afhandelen." },
        { p: "**Grondslag:** uitvoering van de overeenkomst of ons gerechtvaardigd belang bij het beantwoorden en administreren van vragen." },
        { p: "**Bewaartermijn:** zolang noodzakelijk voor de behandeling van je vraag en daarna in beginsel maximaal 2 jaar." },
      ],
    },
    {
      titel: "4. Kunstmatige intelligentie",
      blokken: [
        { p: "Voor onder andere briefcontrole, RegioBot en AI-functionaliteiten gebruikt OpenRegio een AI-model dat op onze eigen server draait. De inhoud van documenten en vragen wordt voor deze functies niet naar externe AI-aanbieders gestuurd." },
        { p: "Ook het doorzoeken van documenten die je bij OpenRegio opslaat, kan lokaal op onze eigen infrastructuur plaatsvinden." },
        { p: "Persoonsgegevens worden niet gebruikt om het AI-model te trainen." },
        { h3: "AI geeft geen bindende beslissing" },
        { p: "AI-uitkomsten van OpenRegio zijn hulpmiddelen. OpenRegio neemt op basis daarvan geen geautomatiseerde besluiten die zelfstandig rechtsgevolgen voor jou hebben of jou op vergelijkbare wijze aanzienlijk treffen. Jij bepaalt zelf wat je met een analyse, advies, tekst of uitkomst doet." },
      ],
    },
    {
      titel: "5. Met wie delen we gegevens?",
      blokken: [
        { p: "We verkopen persoonsgegevens nooit." },
        { p: "We verstrekken persoonsgegevens alleen wanneer dat nodig is om OpenRegio te laten functioneren, wanneer jij daar zelf voor kiest of wanneer wij daartoe wettelijk verplicht zijn. We gebruiken onder andere de volgende dienstverleners." },
        { h3: "Hostinger" },
        { p: "Hostinger levert onze server- en hostinginfrastructuur en e-mailvoorzieningen. De server waarop OpenRegio, de database en het lokale AI-model draaien bevindt zich in een datacenter in Frankfurt, Duitsland." },
        { h3: "Stripe" },
        { p: "Stripe wordt gebruikt voor betalingen en aanverwante betaal- en factuurfunctionaliteit. Stripe verwerkt bepaalde persoonsgegevens volgens zijn eigen privacy- en betaalvoorwaarden." },
        { h3: "OpenStreetMap / Nominatim" },
        { p: "Voor bepaalde kaartfuncties kan OpenStreetMap/Nominatim worden gebruikt om een adres om te zetten in geografische coördinaten. Afhankelijk van de technische manier waarop een verzoek wordt uitgevoerd, kan deze dienst technische gegevens ontvangen die noodzakelijk zijn om het verzoek af te handelen." },
        { h3: "Google" },
        { p: "Gegevens worden alleen aan Google verstrekt wanneer je zelf een functie gebruikt waarvoor Google nodig is, bijvoorbeeld een controle van een Google-bedrijfsvermelding. Daarbij worden alleen de gegevens verstrekt die noodzakelijk zijn voor die functie, bijvoorbeeld een bedrijfsnaam en plaats." },
        { h3: "Overheidsinstanties en rechterlijke instanties" },
        { p: "We verstrekken persoonsgegevens wanneer we daartoe op grond van een geldige wettelijke verplichting gehouden zijn. Een verzoek van een overheidsinstantie betekent niet automatisch dat gegevens worden verstrekt. Waar mogelijk beoordelen we eerst of het verzoek een voldoende wettelijke basis heeft." },
        { h3: "Verwerkers en andere verantwoordelijken" },
        { p: "Niet iedere externe dienstverlener heeft onder de AVG dezelfde juridische rol. Sommige organisaties verwerken persoonsgegevens uitsluitend namens OpenRegio en zijn daarmee verwerker. Andere organisaties bepalen voor bepaalde verwerkingen zelf het doel en de middelen en kunnen daarvoor zelfstandig verwerkingsverantwoordelijke zijn." },
        { p: "Waar de AVG dit vereist, sluiten we met verwerkers een verwerkersovereenkomst of maken we gebruik van passende verwerkersvoorwaarden." },
      ],
    },
    {
      titel: "6. Gegevens buiten de Europese Economische Ruimte",
      blokken: [
        { p: "Onze hoofdserver staat in Duitsland en daarmee binnen de Europese Economische Ruimte." },
        { p: "Sommige externe dienstverleners, waaronder Stripe of Google, kunnen bepaalde persoonsgegevens buiten de EER verwerken. Wanneer persoonsgegevens buiten de EER worden verwerkt, moet daarvoor een geldige doorgiftegrondslag bestaan. Dit kan bijvoorbeeld zijn:" },
        { ul: [
          "een adequaatheidsbesluit van de Europese Commissie;",
          "deelname aan het EU-US Data Privacy Framework, voor zover dit voor de betreffende organisatie en verwerking geldt;",
          "standaardcontractbepalingen van de Europese Commissie;",
          "een andere wettelijk toegestane waarborg.",
        ] },
        { p: "OpenStreetMap Foundation is gevestigd in het Verenigd Koninkrijk. Voor doorgiften naar het Verenigd Koninkrijk kan gebruik worden gemaakt van het geldende adequaatheidsbesluit van de Europese Commissie." },
      ],
    },
    {
      titel: "7. Cookies en opslag in je browser",
      blokken: [
        { p: "OpenRegio gebruikt geen trackingcookies, marketingcookies of analysecookies. We gebruiken alleen technische opslag die noodzakelijk is om het platform te laten functioneren." },
        { h3: "Inloggen" },
        { p: "Voor het veilig inloggen en ingelogd blijven kunnen onder andere worden gebruikt:" },
        { ul: ["accessToken;", "refreshToken;", "tokenId."] },
        { p: "Waar deze als cookie worden opgeslagen, worden beveiligingsmaatregelen zoals httpOnly en secure toegepast. Deze opslag is noodzakelijk om de door jou gevraagde dienst te leveren. Hiervoor is geen toestemming voor marketing- of trackingdoeleinden nodig." },
        { h3: "Lopende analyses" },
        { p: "Je browser kan tijdelijk een technisch kenmerk van een lopende analyse bewaren zodat je die analyse kunt terugvinden wanneer je een pagina sluit of opnieuw opent. Deze informatie staat op je eigen apparaat." },
        { h3: "Wat we niet gebruiken" },
        { p: "OpenRegio gebruikt:" },
        { ul: [
          "geen Google Analytics;", "geen Meta Pixel;", "geen advertentiecookies;", "geen trackingcookies;",
          "geen marketingcookies;", "geen analyticscookies;", "geen advertentienetwerken;", "geen externe trackingpixels.",
        ] },
        { p: "Meer informatie staat in ons [cookiebeleid](/cookiebeleid)." },
      ],
    },
    {
      titel: "8. Beveiliging",
      blokken: [
        { p: "We nemen technische en organisatorische maatregelen om persoonsgegevens te beschermen. Onder andere:" },
        { ul: [
          "verbindingen met het platform verlopen via HTTPS;",
          "wachtwoorden worden cryptografisch gehasht en niet leesbaar opgeslagen;",
          "toegang tot de server is beperkt tot bevoegde beheerders;",
          "serverbeheer vindt plaats met persoonlijke toegangssleutels;",
          "toegang tot persoonsgegevens is beperkt tot wat noodzakelijk is;",
          "briefbestanden voor losse analyses worden na verwerking verwijderd;",
          "tijdelijke analyserapporten worden automatisch verwijderd;",
          "persoonsgegevens worden niet gebruikt voor AI-training;",
          "toegangs- en beveiligingsmaatregelen worden aangepast wanneer dat technisch of organisatorisch noodzakelijk is.",
        ] },
        { p: "Geen enkel computersysteem kan absolute veiligheid garanderen." },
        { p: "Wanneer zich een beveiligingsincident voordoet waarbij persoonsgegevens betrokken zijn, beoordelen we of sprake is van een datalek. Wanneer de wet dit vereist, melden we het datalek bij de Autoriteit Persoonsgegevens en informeren we betrokkenen." },
      ],
    },
    {
      titel: "9. Je privacyrechten",
      blokken: [
        { p: "Afhankelijk van de verwerking en de toepasselijke wettelijke voorwaarden kun je onder de AVG onder meer het recht hebben om:" },
        { ul: [
          "persoonsgegevens in te zien;",
          "onjuiste persoonsgegevens te laten corrigeren;",
          "persoonsgegevens te laten verwijderen;",
          "de verwerking te laten beperken;",
          "bezwaar te maken tegen bepaalde verwerkingen;",
          "persoonsgegevens in een gangbaar formaat te ontvangen;",
          "persoonsgegevens te laten overdragen wanneer het recht op gegevensoverdraagbaarheid van toepassing is;",
          "een gegeven toestemming in te trekken.",
        ] },
        { p: `Je kunt hiervoor mailen naar [${PRIVACYCONTACT}](mailto:${PRIVACYCONTACT}).` },
        { p: "We reageren in beginsel binnen één maand. Wanneer een verzoek complex is of wanneer meerdere verzoeken tegelijk worden gedaan, kan de AVG toestaan dat deze termijn wordt verlengd. Als dat gebeurt, informeren we je daarover." },
        { p: "Wanneer we redelijkerwijs twijfelen aan de identiteit van degene die een verzoek doet, kunnen we aanvullende informatie vragen om de identiteit te controleren. We vragen daarbij niet meer persoonsgegevens dan noodzakelijk." },
        { p: "Wanneer OpenRegio voor bepaalde gegevens uitsluitend verwerker is, kan het nodig zijn dat een privacyverzoek wordt behandeld door de organisatie die voor die verwerking verwerkingsverantwoordelijke is. Waar nodig helpen we die organisatie bij de behandeling van het verzoek." },
        { p: "Ben je niet tevreden over hoe wij persoonsgegevens verwerken, dan kun je een klacht indienen bij de [Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl)." },
      ],
    },
    {
      titel: "10. Gegevens die noodzakelijk zijn",
      blokken: [
        { p: "Sommige persoonsgegevens zijn noodzakelijk om OpenRegio te kunnen gebruiken. Zo hebben we bepaalde gegevens nodig om:" },
        { ul: [
          "een account aan te maken;",
          "je identiteit als accounthouder te herkennen;",
          "een abonnement af te sluiten;",
          "betalingen af te handelen;",
          "functies uit te voeren die je zelf aanvraagt.",
        ] },
        { p: "Als je de daarvoor noodzakelijke gegevens niet verstrekt, kunnen we de betreffende functie of dienst mogelijk niet leveren. Andere gegevens zijn optioneel. Waar dat relevant is, proberen we dit duidelijk aan te geven." },
      ],
    },
    {
      titel: "11. Kinderen",
      blokken: [
        { p: "OpenRegio is bedoeld voor ondernemers en zakelijke gebruikers. We richten onze dienstverlening niet bewust op kinderen onder de 16 jaar en verzamelen niet bewust accountgegevens van kinderen onder de 16 jaar." },
        { p: "Wanneer we ontdekken dat dergelijke gegevens zonder geldige reden via OpenRegio zijn verzameld, kunnen we passende maatregelen nemen om deze gegevens te verwijderen." },
      ],
    },
    {
      titel: "12. Wijzigingen",
      blokken: [
        { p: "OpenRegio ontwikkelt door. Wanneer functies veranderen, kunnen ook de persoonsgegevens die we verwerken of de manier waarop we die verwerken veranderen. Daarom kunnen we deze privacyverklaring aanpassen." },
        { p: "De datum bovenaan deze verklaring geeft aan wanneer de verklaring voor het laatst is gewijzigd. Bij belangrijke wijzigingen die gevolgen hebben voor de manier waarop we persoonsgegevens verwerken, informeren we gebruikers waar dat redelijkerwijs nodig is." },
      ],
    },
  ],
};
