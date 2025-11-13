import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Mail, Phone } from "lucide-react";

export interface BusinessProfile {
  id: string;
  name: string;
  owner: string;
  category: string;
  description: string;
  location: string;
  distance?: string;
  image?: string;
  email?: string;
  phone?: string;
}

interface BusinessProfileCardProps {
  profile: BusinessProfile;
  onViewProfile?: (id: string) => void;
  onContact?: (id: string) => void;
}

export function BusinessProfileCard({ profile, onViewProfile, onContact }: BusinessProfileCardProps) {
  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-business-${profile.id}`}>
      <CardHeader className="p-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg leading-tight" data-testid={`text-business-name-${profile.id}`}>
            {profile.name}
          </h3>
          <Badge variant="secondary" className="shrink-0" data-testid={`badge-category-${profile.id}`}>
            {profile.category}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-1">{profile.owner}</p>
        <p className="text-sm text-foreground mb-3 line-clamp-2">{profile.description}</p>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{profile.location}</span>
          {profile.distance && (
            <span className="text-xs text-primary ml-1">• {profile.distance}</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onViewProfile?.(profile.id)}
          data-testid={`button-view-profile-${profile.id}`}
        >
          Bekijk Profiel
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onContact?.(profile.id)}
          data-testid={`button-contact-${profile.id}`}
        >
          <Mail className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
