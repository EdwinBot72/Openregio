import { useState } from "react";
import { NetworkGrid } from "@/components/NetworkGrid";
import { MapView } from "@/components/MapView";
import type { BusinessProfile } from "@/components/BusinessProfileCard";
import { useQuery } from "@tanstack/react-query";
import type { Entrepreneur } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Map, Grid3x3 } from "lucide-react";

export default function NetworkPage() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("map");
  
  const { data: entrepreneurs, isLoading } = useQuery<Entrepreneur[]>({
    queryKey: ["/api/entrepreneurs"],
  });

  const profiles: BusinessProfile[] = (entrepreneurs || []).map((e) => ({
    id: e.id,
    name: e.name,
    owner: e.owner,
    category: e.category,
    description: e.description,
    location: e.location,
    email: e.email,
    phone: e.phone ?? undefined,
    image: e.image ?? undefined,
  }));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-accent text-3xl font-bold mb-2">Ontdek je Netwerk</h1>
          <p className="text-muted-foreground">
            Vind en verbind met lokale ondernemers in jouw regio.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-accent text-3xl font-bold mb-2">Ontdek je Netwerk</h1>
          <p className="text-muted-foreground">
            Vind en verbind met lokale ondernemers in jouw regio.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            data-testid="button-view-map"
          >
            <Map className="h-4 w-4 mr-2" />
            Kaart
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {viewMode === "map" ? (
        <MapView entrepreneurs={entrepreneurs || []} />
      ) : (
        <NetworkGrid
          profiles={profiles}
          onViewProfile={(id) => console.log("View profile:", id)}
          onContact={(id) => console.log("Contact:", id)}
        />
      )}
    </div>
  );
}
