import { Card, CardContent } from "@/components/ui/card";
import { Search, Users, Bot, Building2 } from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "Word gevonden zonder Google",
    description: "Een openbaar ondernemersprofiel dat direct zichtbaar is voor klanten in jouw buurt — zonder algoritmes, advertenties of platformbelangen.",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Bouw een netwerk dat wél werkt",
    description: "Ontdek andere ondernemers in de regio, deel leads, werk samen aan acties en versterk elkaar. Geen praatgroep — maar een actieve community.",
  },
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI die je business versterkt",
    description: "RegioBot helpt je met posts en teksten, aanbiedingen, lokale SEO, klantbereik en slimme automatiseringen. Hyperlokaal. Superefficiënt.",
  },
  {
    icon: <Building2 className="h-8 w-8" />,
    title: "Coöperatie in je broekzak",
    description: "Iedere ondernemer heeft een stem. Transparante bijdragen. Eerlijke besluitvorming. Een netwerk dat van ons is — niet van een platform.",
  },
];

export function FeatureSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
            Waarom OpenRegio?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Omdat we klaar zijn met afhankelijkheid. We bouwen onze eigen digitale economie. Samen. Sterk. Onafhankelijk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <a 
              key={idx} 
              href="/lidmaatschap"
              className="block"
              data-testid={`link-feature-${idx}`}
            >
              <Card className="hover-elevate active-elevate-2 h-full" data-testid={`card-feature-${idx}`}>
                <CardContent className="p-6">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-accent text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
