import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import type { LokaleActie } from "@shared/schema";

interface LokaleActiesMapProps {
  acties: LokaleActie[];
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

const CACHE_KEY = "openregio_geocode_cache_v1";
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dagen

type GeocodeCache = Record<string, { lat: number; lng: number; ts: number }>;

function readCache(): GeocodeCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as GeocodeCache;
  } catch {
    return {};
  }
}

function writeCache(cache: GeocodeCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage kan vol/uitgeschakeld zijn — geocoding werkt dan gewoon zonder cache
  }
}

function formatDatumKort(d: string | Date | null | undefined) {
  if (!d) return "Doorlopend";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "d MMM yyyy, HH:mm", { locale: nl });
}

function actieKey(actie: LokaleActie) {
  return `${actie.locatie}, ${actie.regio}, Nederland`;
}

export function LokaleActiesMap({ acties }: LokaleActiesMapProps) {
  const [open, setOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 768
  );
  const [coords, setCoords] = useState<Record<string, { lat: number; lng: number }>>({});

  const uniekeAdressen = useMemo(() => {
    const set = new Set<string>();
    acties.forEach((a) => set.add(actieKey(a)));
    return Array.from(set);
  }, [acties]);

  useEffect(() => {
    let cancelled = false;

    async function geocodeAll() {
      const cache = readCache();
      const now = Date.now();
      const resolved: Record<string, { lat: number; lng: number }> = {};
      const todo: string[] = [];

      for (const adres of uniekeAdressen) {
        const hit = cache[adres];
        if (hit && now - hit.ts < CACHE_TTL_MS) {
          resolved[adres] = { lat: hit.lat, lng: hit.lng };
        } else {
          todo.push(adres);
        }
      }

      if (Object.keys(resolved).length > 0 && !cancelled) {
        setCoords((prev) => ({ ...prev, ...resolved }));
      }

      for (const adres of todo) {
        if (cancelled) return;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=nl&q=${encodeURIComponent(adres)}`,
            { headers: { Accept: "application/json" } }
          );
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json) && json.length > 0) {
              const lat = parseFloat(json[0].lat);
              const lng = parseFloat(json[0].lon);
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                cache[adres] = { lat, lng, ts: Date.now() };
                writeCache(cache);
                if (!cancelled) {
                  setCoords((prev) => ({ ...prev, [adres]: { lat, lng } }));
                }
              }
            }
          }
        } catch {
          // Geocoding mislukt voor dit adres — actie wordt simpelweg niet op de kaart getoond
        }
        // Respecteer Nominatim's usage policy (max ~1 request/seconde)
        await new Promise((resolve) => setTimeout(resolve, 1100));
      }
    }

    if (uniekeAdressen.length > 0) {
      geocodeAll();
    }

    return () => {
      cancelled = true;
    };
  }, [uniekeAdressen]);

  const actiesMetCoords = useMemo(
    () =>
      acties
        .map((actie) => ({ actie, coord: coords[actieKey(actie)] }))
        .filter((x): x is { actie: LokaleActie; coord: { lat: number; lng: number } } => !!x.coord),
    [acties, coords]
  );

  const defaultCenter: [number, number] = [52.1326, 5.2913];
  const center: [number, number] =
    actiesMetCoords.length > 0
      ? [actiesMetCoords[0].coord.lat, actiesMetCoords[0].coord.lng]
      : defaultCenter;

  return (
    <div style={{ marginBottom: 24 }} data-testid="container-lokale-acties-map">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b" }}>
          <MapPin size={14} />
          <span>
            {actiesMetCoords.length === 0
              ? "Kaart wordt geladen…"
              : `${actiesMetCoords.length} ${actiesMetCoords.length === 1 ? "actie" : "acties"} op de kaart`}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((v) => !v)}
          data-testid="button-toggle-kaart"
        >
          {open ? (
            <>
              Verberg kaart <ChevronUp className="ml-1 h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Toon kaart <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>

      {open && (
        <div
          className="h-[360px] w-full rounded-lg overflow-hidden border"
          data-testid="map-lokale-acties"
        >
          <MapContainer center={center} zoom={7} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {actiesMetCoords.map(({ actie, coord }) => (
              <Marker key={actie.id} position={[coord.lat, coord.lng]} icon={customIcon}>
                <Popup>
                  <div className="min-w-[220px]" data-testid={`map-popup-${actie.id}`}>
                    <p className="font-semibold text-sm mb-1">{actie.titel}</p>
                    <p className="text-xs text-muted-foreground mb-2">{formatDatumKort(actie.datum)}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {actie.locatie} — {actie.regio}
                    </p>
                    <Link
                      href={`/acties/${actie.id}`}
                      className="text-xs font-medium"
                      style={{ color: "#0A2D6E" }}
                      data-testid={`link-map-actie-${actie.id}`}
                    >
                      Bekijk details →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
