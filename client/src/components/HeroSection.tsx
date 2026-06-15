import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Bot, Building2 } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/img/hero-bg.webp)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="font-accent text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            OpenRegio – De Coöperatieve App voor Lokale Ondernemers
          </h1>
          <p className="text-xl md:text-2xl text-white/95 mb-4">
            Jouw digitale vuist tegen Big Tech.
          </p>
          <p className="text-lg text-white/90 mb-8 max-w-2xl">
            Eén app waarin lokale ondernemers zichzelf zichtbaar maken, samenwerken en winst terughalen naar de regio.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary border-primary-border text-lg gap-2"
              data-testid="button-join-movement"
            >
              Sluit je aan bij de beweging
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm text-lg"
              data-testid="button-learn-more"
            >
              Leer meer
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Netwerk</h3>
                <p className="text-sm text-white/80">Verbind met lokale ondernemers</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">RegioBot AI</h3>
                <p className="text-sm text-white/80">Slimme business assistent</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Coöperatie</h3>
                <p className="text-sm text-white/80">Democratisch en transparant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
