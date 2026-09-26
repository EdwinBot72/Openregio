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
        { p: "Doe je mee aan het partnerprogramma, dan ontvang je een vergoeding per nieuwe betalende klant die via jouw persoonlijke link een abonnement afsluit. De hoogte staat op het platform. Een vergoeding is alleen verschuldigd voor klanten die daadwerkelijk hebben betaald en niet binnen de eerste betaalperiode zijn teruggeboekt. Bij misbruik — zoals aanmelden van jezelf, nepaccounts of misleidende reclame — vervalt de vergoeding en mogen wij je deelname beëindigen. [● uitbetalingsmoment en -wijze invullen]" },
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
  versie: "2.0",
  bijgewerkt: "26 september 2026",
  intro: [
    "In deze verklaring lees je welke persoonsgegevens OpenRegio verwerkt, waarom, hoe lang, met wie we ze delen en welke rechten je hebt. We houden het zo concreet mogelijk en beschrijven hoe het platform écht werkt.",
  ],
  secties: [
    {
      titel: "1. Wie is verantwoordelijk",
      blokken: [
        { p: `Verwerkingsverantwoordelijke is ${AANBIEDER_VOLLEDIG} (hierna: **OpenRegio**). Voor vragen over privacy mail je naar ${PRIVACYCONTACT}.` },
      ],
    },
    {
      titel: "2. In het kort",
      blokken: [
        { ul: [
          "**Je brieven blijven op onze eigen server.** Brieven die je laat controleren, worden verwerkt op onze eigen server met een lokaal AI-model. Ze gaan niet naar externe AI-diensten zoals OpenAI of Google.",
          "**Brieven worden niet bewaard.** Een geüploade brief wordt na de analyse uit het geheugen gewist. Alleen het rapport blijft maximaal 24 uur klaarstaan zodat je het kunt ophalen.",
          "**Geen tracking.** Geen advertentiecookies, geen analytics, geen verkoop van gegevens.",
          "**Geen training.** Je documenten worden niet gebruikt om AI-modellen te trainen.",
        ] },
      ],
    },
    {
      titel: "3. Welke gegevens, waarvoor en hoe lang",
      blokken: [
        { h3: "Account" },
        { p: "Naam, e-mailadres, wachtwoord (versleuteld opgeslagen), bedrijfsnaam, abonnement en instellingen. **Doel:** je laten inloggen en het platform leveren. **Grondslag:** uitvoering van de overeenkomst. **Bewaartermijn:** zolang je account bestaat; na beëindiging verwijderen we je accountgegevens binnen 3 maanden, behalve wat we wettelijk langer moeten bewaren." },
        { h3: "Betaling en facturen" },
        { p: "Abonnement, bedragen, factuurgegevens en betaalstatus. De betaling zelf (kaart- of bankgegevens) verloopt via Stripe; wij zien en bewaren geen volledige kaart- of rekeningnummers. **Grondslag:** uitvoering van de overeenkomst en wettelijke plicht. **Bewaartermijn:** 7 jaar (fiscale bewaarplicht)." },
        { h3: "Brieven die je laat controleren" },
        { p: "De tekst van de brief of het bestand dat je uploadt, inclusief de persoonsgegevens die erin staan — ook van anderen, zoals de naam van een ambtenaar, en eventueel gegevens over boetes of overtredingen. **Doel:** het rapport voor jou maken. **Grondslag:** uitvoering van de overeenkomst. **Bewaartermijn:** het bestand wordt alleen in het werkgeheugen verwerkt en na de analyse gewist; het rapport blijft maximaal 24 uur in het werkgeheugen staan en wordt daarna gewist. Brieven en rapporten worden niet in de database opgeslagen. Je hoeft persoonsgegevens dus niet weg te lakken." },
        { h3: "RegioBot, dossiers en documenten" },
        { p: "Vragen en gesprekken met RegioBot, dossiers die je in vragenroutes of bij Woo-verzoeken opslaat en documenten die je zelf in je account bewaart. **Doel:** deze functies leveren. **Grondslag:** uitvoering van de overeenkomst. **Bewaartermijn:** zolang je account bestaat, tenzij je ze eerder verwijdert of ons daarom vraagt." },
        { h3: "Openbaar bedrijfsprofiel en lokale onderdelen" },
        { p: "Wat je zelf in je bedrijfsprofiel, bij lokale acties, workshops of aanbod zet (zoals bedrijfsnaam, omschrijving, adres, website en contactgegevens). Deze gegevens zijn **openbaar zichtbaar**. Om je bedrijf op de kaart te tonen, zetten we het adres om in coördinaten. **Grondslag:** uitvoering van de overeenkomst. **Bewaartermijn:** zolang je profiel bestaat." },
        { h3: "E-mail" },
        { p: "Je e-mailadres, om je noodzakelijke berichten te sturen: activatie, wachtwoord herstellen, betaling en een melding als een analyse klaar is terwijl je weg was. **Grondslag:** uitvoering van de overeenkomst. Nieuwsbrieven sturen we alleen met je toestemming; die kun je altijd intrekken." },
        { h3: "Partnerprogramma" },
        { p: "Welke klanten via jouw link zijn aangemeld en welke vergoeding je daarvoor krijgt. **Grondslag:** uitvoering van de overeenkomst en wettelijke plicht (administratie). **Bewaartermijn:** 7 jaar." },
        { h3: "Beveiliging en foutopsporing" },
        { p: "Technische gegevens zoals IP-adres, tijdstip en de opgevraagde pagina in serverlogs, en inlogpogingen. **Doel:** het platform beveiligen, misbruik tegengaan en fouten oplossen. **Grondslag:** gerechtvaardigd belang. **Bewaartermijn:** kort, [● bewaartermijn serverlogs invullen]." },
        { h3: "Contact en support" },
        { p: "Wat je ons mailt of via het platform vraagt. **Grondslag:** gerechtvaardigd belang (je vraag beantwoorden) of uitvoering van de overeenkomst. **Bewaartermijn:** tot je vraag is afgehandeld en daarna maximaal 2 jaar." },
      ],
    },
    {
      titel: "4. Kunstmatige intelligentie",
      blokken: [
        { p: "Voor de briefcontrole, RegioBot en de AI-agents gebruiken we een AI-model dat op onze eigen server draait. Je gegevens gaan daarvoor niet naar externe AI-aanbieders. Het model wordt niet getraind met jouw gegevens. [● controleren: draait ook de zoekfunctie in eigen documenten (embeddings) lokaal? Zo niet, dan hier de aanbieder noemen]" },
        { p: "De uitkomsten zijn hulpmiddelen. Er is geen sprake van een geautomatiseerd besluit met rechtsgevolgen voor jou (artikel 22 AVG): jij beslist zelf wat je met een uitkomst doet." },
      ],
    },
    {
      titel: "5. Met wie we gegevens delen",
      blokken: [
        { p: "We verkopen je gegevens nooit. We delen ze alleen met partijen die we nodig hebben om het platform te laten werken, en alleen voor zover nodig:" },
        { ul: [
          "**Hostinger** — hosting van de server waarop het platform, de database en het AI-model draaien, en onze e-maildienst. [● locatie datacenter controleren en invullen]",
          "**Stripe** — betalingen en facturen.",
          "**Google Fonts** — lettertypen op de website. Daarbij ontvangt Google je IP-adres. [● of lettertypen zelf hosten; dan vervalt dit punt]",
          "**Google Maps en/of OpenStreetMap (Nominatim)** — het omzetten van een bedrijfsadres in coördinaten voor de kaart. Daarbij wordt het adres gedeeld, geen gegevens over jou als bezoeker.",
          "**Overheden en rechters** — alleen als wij daartoe wettelijk verplicht zijn.",
        ] },
        { p: "Met partijen die namens ons gegevens verwerken, sluiten we een verwerkersovereenkomst of maken we gebruik van hun standaard verwerkersvoorwaarden." },
      ],
    },
    {
      titel: "6. Gegevens buiten de Europese Unie",
      blokken: [
        { p: "Stripe en Google kunnen gegevens verwerken in de Verenigde Staten. Die doorgifte gebeurt op basis van het EU-VS-gegevensprivacykader (Data Privacy Framework) of de standaardcontractbepalingen van de Europese Commissie." },
      ],
    },
    {
      titel: "7. Cookies en opslag in je browser",
      blokken: [
        { p: "We gebruiken alleen **functionele cookies** die nodig zijn om in te loggen en ingelogd te blijven (accessToken, refreshToken en tokenId). Deze zijn beveiligd (httpOnly, secure). Daarvoor is geen toestemming nodig." },
        { p: "Daarnaast bewaart je browser soms een kenmerk van een lopende analyse, zodat je die kunt terugvinden als je de pagina sluit. Dat staat alleen op je eigen apparaat." },
        { p: "We gebruiken geen tracking-, marketing- of analysecookies en geen cookies van advertentienetwerken. Meer hierover in het [cookiebeleid](/cookiebeleid)." },
      ],
    },
    {
      titel: "8. Beveiliging",
      blokken: [
        { ul: [
          "Alle verbindingen zijn versleuteld (HTTPS).",
          "Wachtwoorden worden versleuteld opgeslagen en zijn ook voor ons niet leesbaar.",
          "De server is alleen met persoonlijke sleutels toegankelijk voor beheerders.",
          "Brieven voor de briefcontrole worden niet opgeslagen (zie artikel 3).",
          "Toegang tot gegevens is beperkt tot wat nodig is voor beheer en support.",
        ] },
        { p: "Gaat er toch iets mis met je gegevens (een datalek), dan melden we dat waar nodig aan de Autoriteit Persoonsgegevens en aan jou." },
      ],
    },
    {
      titel: "9. Je rechten",
      blokken: [
        { p: "Je hebt het recht om:" },
        { ul: [
          "je gegevens in te zien;",
          "onjuiste gegevens te laten verbeteren;",
          "je gegevens te laten verwijderen;",
          "de verwerking te laten beperken;",
          "bezwaar te maken tegen verwerking op grond van gerechtvaardigd belang;",
          "je gegevens in een gangbaar formaat te ontvangen (overdraagbaarheid);",
          "een gegeven toestemming in te trekken.",
        ] },
        { p: `Mail je verzoek naar ${PRIVACYCONTACT}. We reageren binnen een maand. Om misbruik te voorkomen kunnen we je vragen je identiteit aan te tonen.` },
        { p: "Ben je niet tevreden over hoe wij met je gegevens omgaan, dan kun je een klacht indienen bij de [Autoriteit Persoonsgegevens](https://www.autoriteitpersoonsgegevens.nl)." },
      ],
    },
    {
      titel: "10. Kinderen",
      blokken: [
        { p: "OpenRegio is bedoeld voor ondernemers. We verwerken niet bewust gegevens van kinderen onder de 16 jaar." },
      ],
    },
    {
      titel: "11. Wijzigingen",
      blokken: [
        { p: "Als het platform verandert, passen we deze verklaring aan. De datum bovenaan laat zien wanneer dat voor het laatst is gebeurd. Bij belangrijke wijzigingen laten we het je vooraf weten." },
      ],
    },
  ],
};
