import { HeroSection } from "@/components/HeroSection";
import { FeatureSection } from "@/components/FeatureSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeatureSection />

      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-accent text-3xl md:text-4xl font-bold mb-4">
              Wat ondernemers zeggen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Maria van den Berg",
                business: "Bakkerij De Gouden Korrel",
                quote: "Eindelijk een platform dat echt werkt voor lokale ondernemers. Ik heb al drie samenwerkingen opgezet!",
              },
              {
                name: "Ahmed Hassan",
                business: "Tech Solutions NL",
                quote: "RegioBot helpt me enorm met marketing. Mijn bereik is verdubbeld sinds ik OpenRegio gebruik.",
              },
              {
                name: "Sophie de Vries",
                business: "Groen Advies",
                quote: "Het is fijn om onderdeel te zijn van een coöperatie. We hebben eindelijk een stem in ons eigen platform.",
              },
            ].map((testimonial, idx) => (
              <Card key={idx} data-testid={`card-testimonial-${idx}`}>
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <p className="text-foreground mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-accent text-3xl md:text-4xl font-bold mb-6">
            Klaar om te starten?
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Sluit je vandaag nog aan bij duizenden ondernemers die hun digitale onafhankelijkheid terug hebben gepakt.
          </p>
          <Button
            size="lg"
            variant="outline"
            className="text-primary bg-primary-foreground hover:bg-primary-foreground/90 border-primary-foreground text-lg"
            data-testid="button-join-now"
          >
            Word lid van OpenRegio
          </Button>
        </div>
      </section>
    </div>
  );
}
