import { useState, useCallback, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, X, Check, ExternalLink } from "lucide-react";

type PexelsPhoto = {
  id: number;
  url: string;
  thumb: string;
  photographer: string;
  alt: string;
};

type Props = {
  value: string;
  onChange: (url: string) => void;
  defaultQuery?: string;
  compact?: boolean;
};

export function PexelsPicker({ value, onChange, defaultQuery = "", compact = false }: Props) {
  const [query, setQuery] = useState(defaultQuery);
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const userTyped = useRef(false);

  useEffect(() => {
    if (!userTyped.current && defaultQuery) {
      setQuery(defaultQuery);
    }
  }, [defaultQuery]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/admin/image-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.noKey) {
        setNoKey(true);
        setPhotos([]);
      } else {
        setNoKey(false);
        setPhotos(data.fotos ?? []);
      }
    } catch {
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search(query);
    }
  };

  const gridCols = compact ? "grid-cols-3" : "grid-cols-3 sm:grid-cols-4";
  const thumbClass = compact ? "h-16" : "h-20";

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => { userTyped.current = true; setQuery(e.target.value); }}
            onKeyDown={handleKeyDown}
            placeholder="Zoek foto op Pexels..."
            className="pl-8 text-sm"
            data-testid="input-pexels-search"
          />
        </div>
        <Button
          type="button"
          size="default"
          variant="outline"
          onClick={() => search(query)}
          disabled={loading || !query.trim()}
          data-testid="button-pexels-search"
        >
          {loading ? "Zoeken..." : "Zoek"}
        </Button>
      </div>

      {noKey && (
        <p className="text-xs text-destructive">PEXELS_API_KEY is niet ingesteld.</p>
      )}

      {/* Results grid */}
      {searched && !loading && !noKey && (
        <>
          {photos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Geen resultaten gevonden.</p>
          ) : (
            <div className={`grid ${gridCols} gap-2`} data-testid="grid-pexels-results">
              {photos.map((photo) => {
                const selected = value === photo.url;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => onChange(selected ? "" : photo.url)}
                    className={`relative rounded-md overflow-hidden border-2 transition-all ${
                      selected
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-muted-foreground/40"
                    }`}
                    title={photo.alt || photo.photographer}
                    data-testid={`pexels-photo-${photo.id}`}
                  >
                    <img
                      src={photo.thumb}
                      alt={photo.alt}
                      className={`w-full ${thumbClass} object-cover`}
                      loading="lazy"
                    />
                    {selected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-1">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {photos.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              Foto&apos;s via{" "}
              <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">
                Pexels
              </a>{" "}
              — gratis te gebruiken
            </p>
          )}
        </>
      )}

      {loading && (
        <div className={`grid ${gridCols} gap-2`}>
          {Array.from({ length: compact ? 6 : 8 }).map((_, i) => (
            <Skeleton key={i} className={`w-full ${thumbClass} rounded-md`} />
          ))}
        </div>
      )}

      {/* Selected preview + clear */}
      {value && (
        <div className="relative rounded-md overflow-hidden border">
          <img
            src={value}
            alt="Geselecteerde afbeelding"
            className="w-full h-36 object-cover"
            data-testid="preview-selected-image"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black/60 text-white rounded-md p-1.5 hover:bg-black/80"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-black/60 text-white rounded-md p-1.5 hover:bg-black/80"
              data-testid="button-clear-image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
            <p className="text-[10px] text-white truncate">Geselecteerde afbeelding</p>
          </div>
        </div>
      )}
    </div>
  );
}
