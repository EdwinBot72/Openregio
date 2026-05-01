import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bedrijfsprofiel } from "@shared/schema";

interface BusinessMapViewProps {
  businesses: Bedrijfsprofiel[];
  heightClass?: string;
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

const REGION_COORDINATES: Record<string, [number, number]> = {
  "Achterhoek": [52.0, 6.4],
  "Acht Zaligheden": [51.55, 4.9],
  "Alblasserwaard": [51.88, 4.75],
  "Ameland": [53.45, 5.75],
  "Amstelland": [52.3, 4.9],
  "Amsterdam": [52.37, 4.89],
  "Arkemheen": [52.28, 5.55],
  "De Bangert": [52.65, 5.05],
  "Baronie van Breda": [51.59, 4.77],
  "Beemster": [52.55, 4.9],
  "Beijerland": [51.78, 4.42],
  "Betuwe": [51.9, 5.5],
  "De Biesbosch": [51.72, 4.78],
  "Het Bildt": [53.25, 5.6],
  "Bollenstreek": [52.25, 4.55],
  "Bommelerwaard": [51.8, 5.25],
  "Bonaire": [12.2, -68.26],
  "Bouwhoek": [53.25, 5.8],
  "Brabantse Biesbosch": [51.7, 4.85],
  "Brabantse Stedenrij": [51.55, 5.1],
  "Brabantse Wal": [51.45, 4.35],
  "Centrale Woldgebied": [53.2, 6.8],
  "Centrale Weidestreek": [53.15, 6.6],
  "Delfland": [52.0, 4.35],
  "Den Haag": [52.08, 4.3],
  "Dieverderdingspel": [52.85, 6.35],
  "Dokkumer Wouden": [53.3, 6.0],
  "Dollardpolders": [53.25, 7.15],
  "Drechterland": [52.65, 5.2],
  "Drechtsteden": [51.8, 4.65],
  "Drentse Veenkoloniën": [52.9, 6.85],
  "Drents Plateau": [52.85, 6.55],
  "Dronterland": [52.52, 5.72],
  "De Duffelt": [51.85, 6.0],
  "Duiveland": [51.65, 3.95],
  "Duurswold": [53.2, 6.75],
  "Eemland": [52.2, 5.35],
  "Eemvallei": [52.15, 5.4],
  "Eierland": [53.15, 4.85],
  "Eiland van Dordrecht": [51.8, 4.7],
  "Ellertsveld": [52.75, 6.65],
  "Sint Eustatius": [17.48, -62.98],
  "Fivelingo": [53.35, 6.8],
  "Flevopolder": [52.45, 5.5],
  "Friese merengebied": [53.0, 5.75],
  "Friese Wouden": [53.15, 6.1],
  "Gaasterland": [52.85, 5.55],
  "Gelderse Vallei": [52.1, 5.55],
  "Generaliteitslanden": [51.5, 5.0],
  "Goeree-Overflakkee": [51.75, 4.1],
  "Het Gooi": [52.25, 5.2],
  "Gorecht": [53.2, 6.55],
  "De Graafschap": [52.0, 6.15],
  "Graetheide": [51.0, 5.85],
  "Greidhoek": [53.15, 5.55],
  "Groene Hart": [52.1, 4.75],
  "Groninger Veenkoloniën": [53.1, 6.95],
  "Haarlem": [52.38, 4.64],
  "Haarlemmermeer": [52.3, 4.65],
  "Halfambt": [53.15, 6.85],
  "Heuvelland": [50.85, 5.85],
  "Hoeksche Waard": [51.75, 4.45],
  "Het Hogeland": [53.35, 6.5],
  "Holland": [52.2, 4.6],
  "Hondsrug": [53.0, 6.7],
  "Hogeland": [53.35, 6.5],
  "Hulster Ambacht": [51.35, 4.05],
  "Humsterland": [53.35, 6.35],
  "Hunsingo": [53.35, 6.45],
  "IJsseldal": [52.35, 6.15],
  "IJsselmonde": [51.88, 4.52],
  "Innersdijk": [53.25, 6.9],
  "Kampereiland": [52.58, 5.92],
  "Kanaalstreek": [53.1, 7.0],
  "Kempen": [51.35, 5.25],
  "Kennemerland": [52.45, 4.65],
  "Klei-Oldambt": [53.2, 7.0],
  "Kleistreek": [53.15, 5.75],
  "Koningslaagte": [53.25, 6.55],
  "Kop van Noord-Holland": [52.85, 4.8],
  "Kop van Overijssel": [52.7, 6.05],
  "Krimpenerwaard": [51.95, 4.65],
  "Kromme Rijnstreek": [52.05, 5.2],
  "Kwartier van 's-Hertogenbosch": [51.7, 5.3],
  "Kwartier van Nijmegen": [51.85, 5.85],
  "Kwartier van Oisterwijk": [51.55, 5.2],
  "Kwartier van Veluwe": [52.2, 5.95],
  "Land van Bergen op Zoom": [51.5, 4.3],
  "Land van Buren en Culemborg": [51.95, 5.25],
  "Land van Cuijk": [51.7, 5.85],
  "Land van Heusden en Altena": [51.75, 5.05],
  "Land van Horn": [51.2, 5.95],
  "Land van Kessel": [51.4, 6.05],
  "Land van Maas en Waal": [51.85, 5.65],
  "Land van Montfort": [51.15, 6.0],
  "Land van Thorn": [51.15, 5.85],
  "Land van Vollenhove": [52.68, 5.95],
  "Land van Voorne": [51.88, 4.15],
  "Land van Weert": [51.25, 5.7],
  "Land van Winterswijk": [51.97, 6.72],
  "Land van Zwentibold": [50.95, 5.75],
  "Landen van Overmaas": [50.85, 5.75],
  "Langewold": [53.25, 6.4],
  "Langstraat": [51.7, 5.0],
  "Lauwersland": [53.35, 6.2],
  "Leiden": [52.16, 4.49],
  "Liemers": [51.92, 6.1],
  "Lössgebied": [50.85, 5.9],
  "Lopikerwaard": [52.0, 4.9],
  "Maasland": [51.05, 5.95],
  "Maaskant": [51.7, 5.45],
  "Maasplassen": [51.1, 5.95],
  "Markiezaat van Bergen op Zoom": [51.48, 4.28],
  "Marne": [53.35, 6.35],
  "Marnewaard": [53.4, 6.25],
  "Mastenbroek": [52.58, 6.02],
  "Meierij van 's-Hertogenbosch": [51.65, 5.35],
  "Menterne": [53.3, 6.55],
  "Mergelland": [50.82, 5.85],
  "Middag": [53.25, 6.45],
  "Midden-Delfland": [51.98, 4.35],
  "Midden-Limburg": [51.2, 5.95],
  "Midden-Zeeland": [51.5, 3.75],
  "Middenveld": [52.8, 6.5],
  "Montferland": [51.92, 6.25],
  "Neder-Betuwe": [51.92, 5.55],
  "Nederkwartier": [52.1, 5.1],
  "Nifterlake": [52.0, 5.0],
  "Noord-Beveland": [51.58, 3.78],
  "Noord-Limburg": [51.45, 6.1],
  "Noord-Zeeland": [51.55, 3.85],
  "Noordelijke Bouwstreek": [53.35, 6.65],
  "Noordenveld": [53.1, 6.45],
  "Noordoostpolder": [52.72, 5.75],
  "Oldambt": [53.18, 7.0],
  "Ommelanden": [53.25, 6.7],
  "Oostelijk Flevoland": [52.45, 5.65],
  "Oostelijke Bouwstreek": [53.3, 6.95],
  "Oostelijke Mijnstreek": [50.92, 5.98],
  "Oosterambt": [53.22, 6.95],
  "Oostergo": [53.2, 5.95],
  "Oosterhoek": [53.2, 7.05],
  "Oostermoer": [52.95, 6.75],
  "Oost-Zeeuws-Vlaanderen": [51.3, 3.95],
  "Opper-Gelre": [51.45, 6.15],
  "Over-Betuwe": [51.9, 5.85],
  "Overkwartier": [52.05, 5.15],
  "Overveluwe": [52.25, 5.85],
  "Overflakkee": [51.72, 4.15],
  "Parkstad Limburg": [50.9, 6.0],
  "De Peel": [51.45, 5.85],
  "Peelland": [51.5, 5.65],
  "Plateau van Margraten": [50.82, 5.78],
  "Prins Alexanderpolder": [51.95, 4.55],
  "Purmer": [52.48, 4.95],
  "Putten": [51.88, 4.18],
  "Randstad": [52.15, 4.65],
  "Reiderland": [53.18, 7.1],
  "Rijk van Nijmegen": [51.83, 5.88],
  "Rijnland": [52.15, 4.55],
  "Rijnmond": [51.92, 4.35],
  "Rivierengebied": [51.88, 5.35],
  "Rolderdingspel": [53.0, 6.45],
  "Rotterdam": [51.92, 4.48],
  "Rottum": [53.55, 6.58],
  "Saba": [17.63, -63.23],
  "Saeftinghe": [51.35, 4.15],
  "Salland": [52.45, 6.25],
  "Schelde- en Maasdelta": [51.55, 4.0],
  "Schermer": [52.58, 4.85],
  "Schermereiland": [52.6, 4.82],
  "Schieland": [51.95, 4.5],
  "Schiermonnikoog": [53.48, 6.2],
  "Schouwen": [51.68, 3.85],
  "Schouwen-Duiveland": [51.65, 3.85],
  "Sint Philipsland": [51.62, 4.15],
  "Staats-Brabant": [51.5, 5.2],
  "Staats-Overmaas": [50.88, 5.75],
  "Staats-Vlaanderen": [51.28, 3.75],
  "Stedendriehoek": [52.22, 6.15],
  "Stellingwerven": [52.92, 6.15],
  "Stichtse Lustwarande": [52.12, 5.25],
  "De Streek": [52.68, 5.15],
  "Teisterbant": [51.88, 5.15],
  "Terschelling": [53.4, 5.35],
  "Texel": [53.08, 4.8],
  "Tielerwaard": [51.88, 5.35],
  "Tiengemeten": [51.75, 4.35],
  "Tholen": [51.55, 4.2],
  "Twente": [52.35, 6.7],
  "Upgo": [53.35, 6.55],
  "Utrecht": [52.09, 5.12],
  "Utrechtse Heuvelrug": [52.08, 5.35],
  "Vechtstreek": [52.25, 5.05],
  "Veluwe": [52.25, 5.85],
  "Veluwezoom": [52.05, 6.0],
  "Vier Ambachten": [51.3, 3.85],
  "Vijfheerenlanden": [51.95, 5.05],
  "Vlieland": [53.28, 5.05],
  "Voorne": [51.88, 4.12],
  "Voorne-Putten": [51.85, 4.15],
  "Vredewold": [53.22, 6.35],
  "Vrije van Sluis": [51.32, 3.45],
  "Walcheren": [51.5, 3.6],
  "Waterland": [52.45, 5.0],
  "De Weerribben": [52.78, 5.95],
  "Weidestreken": [52.5, 5.0],
  "West-Friesland": [52.7, 5.05],
  "Westelijke Mijnstreek": [50.95, 5.75],
  "Westergo": [53.15, 5.55],
  "Westerkwartier": [53.2, 6.35],
  "Westerlauwers Friesland": [53.15, 5.75],
  "Westerwolde": [53.0, 7.05],
  "Westhoek": [51.65, 4.85],
  "Westland": [52.0, 4.25],
  "West-Zeeuws-Vlaanderen": [51.32, 3.55],
  "De Wieden": [52.72, 6.05],
  "Wieringen": [52.92, 4.98],
  "Wieringermeer": [52.82, 5.02],
  "Zaanstreek": [52.45, 4.8],
  "Zandgebieden": [51.8, 5.5],
  "Zeekleigebieden": [53.0, 5.5],
  "Zeeuws-Vlaanderen": [51.3, 3.75],
  "Zeevang": [52.52, 5.02],
  "Zeven Heerlijkheden": [51.42, 4.95],
  "Zevenwouden": [53.0, 6.0],
  "Zuid-Beveland": [51.45, 3.95],
  "Zuid-Hollandse Eilanden": [51.78, 4.35],
  "Zuid-Limburg": [50.88, 5.85],
  "Zuidelijk Flevoland": [52.35, 5.45],
  "Zuidenveld": [52.72, 6.7],
  "Zuidplaspolder": [52.0, 4.58],
  "Zuidwesthoek": [52.98, 5.45],
  "Zwijndrechtse Waard": [51.82, 4.62],
};

function getCoordinatesForRegion(region: string): [number, number] | null {
  if (REGION_COORDINATES[region]) {
    return REGION_COORDINATES[region];
  }
  for (const [key, coords] of Object.entries(REGION_COORDINATES)) {
    if (key.toLowerCase().includes(region.toLowerCase()) || 
        region.toLowerCase().includes(key.toLowerCase())) {
      return coords;
    }
  }
  return null;
}

export function BusinessMapView({ businesses, heightClass = "h-[500px]" }: BusinessMapViewProps) {
  const defaultCenter: [number, number] = [52.1326, 5.2913];
  
  const businessesWithCoords = businesses
    .map(b => ({
      ...b,
      coords: getCoordinatesForRegion(b.regio)
    }))
    .filter(b => b.coords !== null);

  return (
    <div className={`${heightClass} w-full rounded-lg overflow-hidden border`} data-testid="business-map-view">
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
        
        {businessesWithCoords.map((business) => (
          <Marker
            key={business.id}
            position={business.coords!}
            icon={customIcon}
          >
            <Popup>
              <div className="min-w-[220px]" data-testid={`business-popup-${business.id}`}>
                <div className="flex items-start gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-base">{business.naam}</h3>
                    <p className="text-xs text-muted-foreground">{business.eigenaarnaam}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <Badge variant="secondary" className="text-xs">{business.regio}</Badge>
                </div>
                
                {business.beschrijving && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {business.beschrijving.slice(0, 100)}...
                  </p>
                )}
                
                {business.websiteUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    asChild
                    data-testid={`button-website-${business.id}`}
                  >
                    <a 
                      href={business.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      Website bezoeken
                    </a>
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
