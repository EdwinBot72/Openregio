import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/hooks/usePageTitle";
import { BookOpen, Calendar, MapPin, Building2, Gavel, Plus, Filter, FileText } from "lucide-react";
import { Link } from "wouter";

type Publicatie = {
  id: number;
  afzender: string;
  onderwerp: string;
  regio: string;
  ingediend_op: string;
};

type PublicatiesResponse = {
  items: Publicatie[];
  filteredByRegio: boolean;
};

function PublicatieCard({ item }: { item: Publicatie }) {
  const datum = new Date(item.ingediend_op).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card data-testid={`card-publicatie-${item.id}`}>
      <CardContent className="pt-5 pb-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm leading-snug" data-testid={`text-onderwerp-${item.id}`}>
                {item.onderwerp}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0" data-testid={`badge-regio-${item.id}`}>
              <MapPin className="h-3 w-3 mr-1" />
              {item.regio}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1" data-testid={`text-afzender-${item.id}`}>
              <Building2 className="h-3 w-3" />
              {item.afzender}
            </span>
            <span className="flex items-center gap-1" data-testid={`text-datum-${item.id}`}>
              <Calendar className="h-3 w-3" />
              {datum}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WetgevingPublicatiesPage() {
  usePageTitle("Wet & Regelgeving — Publicaties");

  const { data, isLoading } = useQuery<PublicatiesResponse>({
    queryKey: ["/api/wetgeving/publicaties"],
  });

  const publicaties = data?.items ?? [];
  const filteredByRegio = data?.filteredByRegio ?? false;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText style={{ width: 24, height: 24, color: "#1f5fae" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-publicaties">Publicaties</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Overheidspost die leden hebben ingediend en ons team heeft verwerkt.
            </p>
          </div>
        </div>
        <Link href="/wetgeving-indienen">
          <Button size="default" data-testid="button-indienen">
            <Plus className="h-4 w-4 mr-2" />
            Brief indienen
          </Button>
        </Link>
      </div>

      {filteredByRegio && (
        <Card data-testid="card-regio-filter">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Gefilterd op jouw regio. Andere gemeenten kunnen ook relevante regelgeving hebben.
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3" data-testid="section-loading">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-5 pb-5">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : publicaties.length > 0 ? (
        <div className="space-y-3" data-testid="list-publicaties">
          {publicaties.map((item) => (
            <PublicatieCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <Card data-testid="card-leeg">
          <CardContent className="pt-10 pb-10 text-center space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-muted p-4">
                <Gavel className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <p className="font-medium">Nog geen publicaties</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Er zijn nog geen brieven verwerkt door ons team. Wil je als eerste een brief indienen?
            </p>
            <Link href="/wetgeving-indienen">
              <Button variant="outline" data-testid="button-eerste-indienen">
                Brief indienen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
  );
}
