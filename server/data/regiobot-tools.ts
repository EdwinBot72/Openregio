export type ToolCategory =
  | "tekst"
  | "design"
  | "planning"
  | "administratie"
  | "automatisering"
  | "marketing"
  | "website"
  | "onderzoek"
  | "video"
  | "betaling"
  | "boekhouding"
  | "klantcontact";

export interface BusinessTool {
  name: string;
  category: ToolCategory;
  solves: string[];
  bestFor: string[];
  pricing: "gratis" | "freemium" | "betaald";
  difficulty: "makkelijk" | "gemiddeld" | "gevorderd";
  whenToUse: string;
  whenNotToUse?: string;
  openRegioService?: string;
}

export const businessTools: BusinessTool[] = [
  {
    name: "ChatGPT",
    category: "tekst",
    solves: ["teksten", "ideeën", "mails", "plannen", "klantcommunicatie"],
    bestFor: ["zzp'ers", "lokale ondernemers", "dienstverleners"],
    pricing: "freemium",
    difficulty: "makkelijk",
    whenToUse: "Voor teksten, ideeën, mails, scripts, plannen en snelle concepten.",
    openRegioService: "OpenRegio kan prompts, templates en vaste workflows voor je maken.",
  },
  {
    name: "Canva",
    category: "design",
    solves: ["flyers", "social posts", "posters", "presentaties", "visuele acties"],
    bestFor: ["winkels", "horeca", "coaches", "lokale dienstverleners"],
    pricing: "freemium",
    difficulty: "makkelijk",
    whenToUse: "Voor snelle visuele content zonder designer.",
    openRegioService: "OpenRegio kan flyers en lokale campagnes voor je klaarzetten.",
  },
  {
    name: "Moneybird",
    category: "boekhouding",
    solves: ["facturen", "offertes", "betalingsherinneringen", "boekhouding"],
    bestFor: ["zzp'ers", "kleine ondernemers"],
    pricing: "betaald",
    difficulty: "gemiddeld",
    whenToUse: "Voor ondernemers die facturen en offertes professioneel willen beheren.",
    openRegioService: "OpenRegio kan offerte- en mailtemplates voor je structureren.",
  },
  {
    name: "Google Bedrijfsprofiel",
    category: "marketing",
    solves: ["lokale vindbaarheid", "reviews", "openingstijden", "Google Maps"],
    bestFor: ["lokale ondernemers", "winkels", "horeca", "praktijken"],
    pricing: "gratis",
    difficulty: "makkelijk",
    whenToUse: "Als klanten je lokaal moeten kunnen vinden via Google.",
    openRegioService: "OpenRegio kan je profieltekst, posts en reviewstrategie verbeteren.",
  },
  {
    name: "Make",
    category: "automatisering",
    solves: ["koppelingen", "automatische workflows", "formulier naar mail", "CRM"],
    bestFor: ["groeiende ondernemers", "teams", "dienstverleners"],
    pricing: "freemium",
    difficulty: "gevorderd",
    whenToUse: "Als je terugkerende taken wilt automatiseren.",
    openRegioService: "OpenRegio kan eenvoudige automatiseringen voor je ontwerpen.",
  },
  {
    name: "Google Forms",
    category: "klantcontact",
    solves: ["intakeformulieren", "aanvragen", "klantgegevens verzamelen"],
    bestFor: ["dienstverleners", "coaches", "klusbedrijven", "praktijken"],
    pricing: "gratis",
    difficulty: "makkelijk",
    whenToUse: "Als je klantinformatie gestructureerd wilt verzamelen.",
    openRegioService: "OpenRegio kan intakeformulieren en opvolgmails voor je maken.",
  },
  {
    name: "Trello",
    category: "planning",
    solves: ["taken", "planning", "projectoverzicht", "teamwerk"],
    bestFor: ["zzp'ers", "kleine teams"],
    pricing: "freemium",
    difficulty: "makkelijk",
    whenToUse: "Als je overzicht wilt krijgen in werk, klanten en projecten.",
    openRegioService: "OpenRegio kan een simpel ondernemersbord voor je opzetten.",
  },
  {
    name: "Brevo",
    category: "marketing",
    solves: ["nieuwsbrieven", "mailcampagnes", "klantopvolging"],
    bestFor: ["winkels", "horeca", "webshops", "dienstverleners"],
    pricing: "freemium",
    difficulty: "gemiddeld",
    whenToUse: "Als je klanten vaker wilt bereiken via e-mail.",
    openRegioService: "OpenRegio kan mailcampagnes en klantflows schrijven.",
  },
  {
    name: "Mollie",
    category: "betaling",
    solves: ["online betalingen", "betaallinks", "iDEAL", "abonnementen"],
    bestFor: ["websites", "lokale diensten", "cursussen", "boekingen"],
    pricing: "betaald",
    difficulty: "gemiddeld",
    whenToUse: "Als je online betalingen of betaallinks nodig hebt.",
    openRegioService: "OpenRegio kan betaalflows en betaalknoppen helpen opzetten.",
  },
  {
    name: "CapCut",
    category: "video",
    solves: ["korte video's", "social reels", "promotievideo's"],
    bestFor: ["horeca", "winkels", "coaches", "lokale ondernemers"],
    pricing: "freemium",
    difficulty: "makkelijk",
    whenToUse: "Als je snel korte video's wilt maken voor social media.",
    openRegioService: "OpenRegio kan video-ideeën en scripts maken.",
  },
];
