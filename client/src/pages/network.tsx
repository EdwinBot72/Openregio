import { NetworkGrid } from "@/components/NetworkGrid";
import type { BusinessProfile } from "@/components/BusinessProfileCard";
import { useQuery } from "@tanstack/react-query";
import type { Entrepreneur } from "@shared/schema";

export default function NetworkPage() {
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
      <div className="mb-8">
        <h1 className="font-accent text-3xl font-bold mb-2">Ontdek je Netwerk</h1>
        <p className="text-muted-foreground">
          Vind en verbind met lokale ondernemers in jouw regio.
        </p>
      </div>

      <NetworkGrid
        profiles={profiles}
        onViewProfile={(id) => console.log("View profile:", id)}
        onContact={(id) => console.log("Contact:", id)}
      />
    </div>
  );
}
