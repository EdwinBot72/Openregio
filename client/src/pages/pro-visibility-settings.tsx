import { MapPin, Lock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import LokaleVindbaarheid from "@/components/lokale-vindbaarheid/LokaleVindbaarheid";

export default function ProVisibilitySettings() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPro = user?.plan === "pro" || user?.plan === "coaching" || user?.role === "admin" || user?.role === "master";

  if (!isPro) {
    return (
      <div className="container max-w-3xl mx-auto py-16 px-4 text-center space-y-6" data-testid="page-zichtbaarheid-gate">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold mb-2">Lokale zichtbaarheid</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ontdek welke zoektermen klanten gebruiken, genereer website-teksten die lokaal scoren en bekijk in welke gemeente de vraag het grootst is.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 max-w-sm mx-auto space-y-4 text-left">
          <p className="font-semibold text-sm">Pro-functie</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {["Lokale zoekwoord-analyse", "SEO-teksten op maat", "Gemeente-vraag kaart", "Vindbaarheid verbeteren"].map(f => (
              <li key={f} className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button className="w-full" asChild data-testid="button-upgrade-pro">
            <Link href="/lidmaatschap?plan=pro">Upgrade naar Pro — €59/mnd</Link>
          </Button>
          <p className="text-xs text-muted-foreground text-center">excl. btw · maandelijks opzegbaar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-md bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Lokale zichtbaarheid</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Gebruik deze tools om als lokale ondernemer beter gevonden te worden. Ontdek welke zoektermen klanten gebruiken,
          genereer website-teksten die lokaal scoren, en bekijk in welke gemeente de vraag naar jouw dienst het grootst is.
        </p>
      </div>
      <LokaleVindbaarheid />
    </div>
  );
}
