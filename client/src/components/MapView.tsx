import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Globe } from "lucide-react";
import type { Entrepreneur } from "@shared/schema";

interface MapViewProps {
  entrepreneurs: Entrepreneur[];
}

const locationCoordinates: Record<string, [number, number]> = {
  "Amsterdam": [52.3676, 4.9041],
  "Rotterdam": [51.9225, 4.47917],
  "Utrecht": [52.0907, 5.1214],
  "Den Haag": [52.0705, 4.3007],
  "Eindhoven": [51.4416, 5.4697],
  "Groningen": [53.2194, 6.5665],
  "Tilburg": [51.5555, 5.0913],
  "Almere": [52.3508, 5.2647],
  "Breda": [51.5719, 4.7683],
  "Nijmegen": [51.8126, 5.8372],
};

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
        
        {entrepreneurs.map((entrepreneur) => {
          const coords = locationCoordinates[entrepreneur.location];
          if (!coords) return null;

          return (
            <Marker
              key={entrepreneur.id}
              position={coords}
              icon={customIcon}
            >
              <Popup>
                <div className="min-w-[250px]" data-testid={`map-popup-${entrepreneur.id}`}>
                  <h3 className="font-semibold text-base mb-2">{entrepreneur.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{entrepreneur.location}</span>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {entrepreneur.category}
                    </Badge>
                    
                    {entrepreneur.description && (
                      <p className="text-muted-foreground mt-2 text-xs">
                        {entrepreneur.description.slice(0, 100)}...
                      </p>
                    )}
                    
                    <div className="flex flex-col gap-1 pt-2 border-t">
                      {entrepreneur.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="h-3 w-3" />
                          <span>{entrepreneur.phone}</span>
                        </div>
                      )}
                      {entrepreneur.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3 w-3" />
                          <span>{entrepreneur.email}</span>
                        </div>
                      )}
                      {entrepreneur.website && (
                        <div className="flex items-center gap-2 text-xs">
                          <Globe className="h-3 w-3" />
                          <a 
                            href={entrepreneur.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>
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
