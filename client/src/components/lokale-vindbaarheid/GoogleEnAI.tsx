import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Bot, Star, Link2 } from "lucide-react";
import { Link } from "wouter";

const KAARTEN = [
  {
    Icon: MapPin,
    titel: "Google Bedrijfsprofiel",
    badge: "Gratis",
    omschrijving:
      "Het krachtigste lokale SEO-hulpmiddel. Verschijnt in Google Maps en in AI-samenvattingen van Gemini.",
    acties: [
      { label: "Profiel tekst schrijven", href: "/regels/check?vraag=schrijf+google+bedrijfsprofiel" },
      { label: "Categorieën kiezen", href: "/regels/check?vraag=google+bedrijfsprofiel+categorieën" },
    ],
  },
  {
    Icon: Bot,
    titel: "ChatGPT & Perplexity",
    badge: "AI-zoek",
    omschrijving:
      "AI-zoekmachines halen info van je website en Google profiel. Consistente tekst is hier cruciaal.",
    acties: [
      { label: "AI-strategie bekijken", href: "/regels/check?vraag=ai+zoekmachines+lokaal" },
      { label: "Schema markup uitleg", href: "/regels/check?vraag=localbusiness+schema+markup" },
    ],
  },
  {
    Icon: Star,
    titel: "Reviews strategie",
    badge: "Reputatie",
    omschrijving:
      "Reviews met plaatsnamen en diensten zijn lokale SEO-goud. Vraag er actief om na elke opdracht.",
    acties: [
      { label: "Review verzoek schrijven", href: "/regels/check?vraag=review+verzoek+klant" },
    ],
  },
  {
    Icon: Link2,
    titel: "Lokale links",
    badge: "Autoriteit",
    omschrijving:
      "Links van gemeente, lokale krant of ondernemersvereniging versterken je regionale autoriteit.",
    acties: [
      { label: "Linkbuilding tips", href: "/regels/check?vraag=lokale+backlinks+strategie" },
    ],
  },
];

export default function GoogleEnAI() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
      {KAARTEN.map((kaart) => (
        <Card key={kaart.titel}>
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <kaart.Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">{kaart.titel}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground ml-auto">
                {kaart.badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {kaart.omschrijving}
            </p>
            <div className="flex flex-wrap gap-2">
              {kaart.acties.map((actie) => (
                <Link
                  key={actie.label}
                  href={actie.href}
                  className="text-xs px-3 py-1.5 rounded border border-border text-muted-foreground hover-elevate transition-colors"
                  data-testid={`link-google-${actie.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {actie.label} →
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
