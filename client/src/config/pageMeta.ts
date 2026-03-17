export type PageMeta = {
  title: string;
  description?: string;
};

export const PAGE_META: Record<string, PageMeta> = {
  "/dashboard": {
    title: "Overzicht",
    description: "Jouw persoonlijke overzicht van OpenRegio.",
  },
  "/tools/brief-analyse": {
    title: "Brief begrijpen",
    description: "Plak een overheidsbrief en ontvang direct uitleg, termijnen en aanbevolen acties.",
  },
  "/beleidsmonitor": {
    title: "Regels & besluiten",
    description: "Volg beleidsupdates en besluiten in jouw gemeente.",
  },
  "/kansen/gemeente-updates": {
    title: "Gemeente-updates",
    description: "Dagelijks bijgewerkt overzicht van nieuws uit jouw gemeente.",
  },
  "/kansen/aanbestedingen": {
    title: "Aanbestedingen",
    description: "Actuele aanbestedingen in jouw regio.",
  },
  "/regelgeving-verkenner": {
    title: "Regelgeving verkenner",
    description: "Zoek door officiële verordeningen, beleidsregels en besluiten.",
  },
  "/woo-wizard": {
    title: "Nieuw Woo-verzoek",
    description: "Maak een formeel Woo-verzoek of bevoegdheidscan.",
  },
  "/woo-bibliotheek": {
    title: "Mijn documenten",
    description: "Jouw persoonlijke bibliotheek van WOO-documenten.",
  },
  "/woo-bot": {
    title: "Document-assistent",
    description: "Zoek in WOO-documenten of genereer een WOO-verzoekbrief.",
  },
  "/regiobot": {
    title: "RegioBot",
    description: "Regionale WOO & juridische AI-assistent.",
  },
  "/bedrijfsprofiel": {
    title: "Bedrijfsprofiel",
    description: "Jouw bedrijfsprofiel op OpenRegio.",
  },
  "/tools/website-scan": {
    title: "Website Scan",
    description: "Analyseer jouw website op vindbaarheid en technische kwaliteit.",
  },
  "/zichtbaarheid/vindbaarheid": {
    title: "Lokale vindbaarheid",
    description: "Vergroot je zichtbaarheid in zoekmachines.",
  },
  "/pro/visibility-settings": {
    title: "Privacy & zichtbaarheid",
    description: "Bepaal wie welke informatie over jouw bedrijf kan zien.",
  },
  "/regiocrew": {
    title: "RegioCrew",
    description: "Samenwerken met ondernemers in jouw regio.",
  },
  "/regio-deals": {
    title: "Regio Deals",
    description: "Lokale deals en samenwerkingen in jouw regio.",
  },
  "/community": {
    title: "Community",
    description: "OpenRegio community voor Nederlandse ondernemers.",
  },
};
