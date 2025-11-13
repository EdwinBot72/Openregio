import { BusinessProfileCard, type BusinessProfile } from "./BusinessProfileCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface NetworkGridProps {
  profiles: BusinessProfile[];
  onViewProfile?: (id: string) => void;
  onContact?: (id: string) => void;
}

export function NetworkGrid({ profiles, onViewProfile, onContact }: NetworkGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(profiles.map((p) => p.category)));

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || profile.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek ondernemers, locaties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-network"
          />
        </div>
        <Button variant="outline" className="gap-2" data-testid="button-filter">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer hover-elevate"
          onClick={() => setSelectedCategory(null)}
          data-testid="badge-category-all"
        >
          Alle sectoren
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer hover-elevate"
            onClick={() => setSelectedCategory(category)}
            data-testid={`badge-category-${category}`}
          >
            {category}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map((profile) => (
          <BusinessProfileCard
            key={profile.id}
            profile={profile}
            onViewProfile={onViewProfile}
            onContact={onContact}
          />
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">Geen ondernemers gevonden</h3>
          <p className="text-muted-foreground">Pas je zoekfilters aan om meer resultaten te zien.</p>
        </div>
      )}
    </div>
  );
}
