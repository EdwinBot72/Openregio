import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Globe, Navigation, MessageSquare, BadgeCheck, Clock } from "lucide-react";
import type { Entrepreneur } from "@shared/schema";

interface MapViewProps {
  entrepreneurs: Entrepreneur[];
}

const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function MapView({ entrepreneurs }: MapViewProps) {
  const defaultCenter: [number, number] = [52.1326, 5.2913];
  
  const entrepreneursWithCoords = entrepreneurs.filter(
    (e) => e.lat !== null && e.lng !== null
  );

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border" data-testid="map-view">
      <MapContainer
        center={defaultCenter}
        zoom={7}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {entrepreneursWithCoords.map((entrepreneur) => {
          const coords: [number, number] = [entrepreneur.lat!, entrepreneur.lng!];

          return (
            <Marker
              key={entrepreneur.id}
              position={coords}
              icon={customIcon}
            >
              <Popup>
                <div className="min-w-[280px]" data-testid={`map-popup-${entrepreneur.id}`}>
                  <div className="flex items-start gap-3 mb-3">
                    {entrepreneur.logoUrl && (
                      <img 
                        src={entrepreneur.logoUrl} 
                        alt={`${entrepreneur.name} logo`}
                        className="w-12 h-12 rounded object-cover"
                        data-testid={`logo-${entrepreneur.id}`}
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">{entrepreneur.name}</h3>
                        {entrepreneur.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-primary" data-testid={`verified-${entrepreneur.id}`} />
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {entrepreneur.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm mb-3">
                    {entrepreneur.address && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{entrepreneur.address}, {entrepreneur.location}</span>
                      </div>
                    )}
                    
                    {entrepreneur.openingHours && (
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{entrepreneur.openingHours}</span>
                      </div>
                    )}
                    
                    {entrepreneur.description && (
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {entrepreneur.description.slice(0, 120)}...
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                    {entrepreneur.phone && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        asChild
                        data-testid={`button-call-${entrepreneur.id}`}
                      >
                        <a href={`tel:${entrepreneur.phone}`}>
                          <Phone className="h-3 w-3 mr-1" />
                          Bellen
                        </a>
                      </Button>
                    )}
                    
                    {entrepreneur.lat !== null && entrepreneur.lng !== null && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        asChild
                        data-testid={`button-route-${entrepreneur.id}`}
                      >
                        <a 
                          href={`https://www.google.com/maps/dir/?api=1&destination=${entrepreneur.lat},${entrepreneur.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="h-3 w-3 mr-1" />
                          Route
                        </a>
                      </Button>
                    )}
                    
                    {entrepreneur.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        asChild
                        data-testid={`button-website-${entrepreneur.id}`}
                      >
                        <a 
                          href={entrepreneur.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      data-testid={`button-chat-${entrepreneur.id}`}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
