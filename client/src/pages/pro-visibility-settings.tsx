import { MapPin, Lock, ArrowRight, TrendingUp } from "lucide-react";
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
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <TrendingUp style={{ width: 24, height: 24, color: "#0b2240" }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Lokale Zichtbaarheid</h1>
              <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
                Ontdek welke zoektermen klanten gebruiken, genereer website-teksten die lokaal scoren.
              </p>
            </div>
          </div>
        </div>
        <LokaleVindbaarheid />
      </div>
    </div>
  );
}
