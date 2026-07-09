import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Search, MapPin, Globe, Phone, ArrowRight, Building2, Star,
} from "lucide-react";
import type { Bedrijfsprofiel } from "@shared/schema";

const CATEGORIE_LABELS: Record<string, string> = {
  retail: "Detailhandel & Winkels",
  food: "Horeca & Voeding",
  services: "Dienstverlening",
  health: "Zorg & Gezondheid",
  education: "Onderwijs & Training",
  creative: "Creatief & Media",
  construction: "Bouw & Renovatie",
  agriculture: "Landbouw & Tuinbouw",
  transport: "Transport & Logistiek",
};

const CATEGORIE_KLEUR: Record<string, string> = {
  retail: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40 text-[#0b2240] dark:text-[#0b2240]/30",
  food: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40 text-[#f28a1a] dark:text-[#f28a1a]/30",
  services: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40 text-[#0b2240] dark:text-[#0b2240]/30",
  health: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40 text-[#f28a1a] dark:text-[#f28a1a]/30",
  education: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40 text-[#0b2240] dark:text-[#0b2240]/30",
  creative: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40 text-[#0b2240] dark:text-[#0b2240]/30",
  construction: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40 text-[#f28a1a] dark:text-[#f28a1a]/30",
  agriculture: "bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40 text-[#f28a1a] dark:text-[#f28a1a]/30",
  transport: "bg-[#0b2240]/10 dark:bg-[#0b2240]/40 text-[#0b2240] dark:text-[#0b2240]/30",
};

export default function KoopLokaalPage() {
  usePageTitle("Koop Lokaal – Ontdek lokale bedrijven");

  const [zoekterm, setZoekterm] = useState("");
  const [geselecteerdeCategorie, setGeselecteerdeCategorie] = useState("alle");
  const [geselecteerdeRegio, setGeselecteerdeRegio] = useState("alle");

  const { data: bedrijven = [], isLoading } = useQuery<Bedrijfsprofiel[]>({
    queryKey: ["/api/business-profiles/public"],
  });

  const regioos = Array.from(new Set(bedrijven.map((b) => b.regio))).sort();

  const gefilterd = bedrijven.filter((b) => {
    const matchZoek =
      zoekterm.trim() === "" ||
      b.naam.toLowerCase().includes(zoekterm.toLowerCase()) ||
      b.beschrijving.toLowerCase().includes(zoekterm.toLowerCase());
    const matchCat = geselecteerdeCategorie === "alle" || b.categorieId === geselecteerdeCategorie;
    const matchRegio = geselecteerdeRegio === "alle" || b.regio === geselecteerdeRegio;
    return matchZoek && matchCat && matchRegio;
  });

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40 flex items-center justify-center mx-auto">
          <Star className="h-7 w-7 text-[#f28a1a] dark:text-[#f28a1a]" />
        </div>
        <h1 className="text-3xl font-bold">Koop Lokaal</h1>
        <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Ontdek lokale ondernemers in jouw regio. Elke euro die je lokaal uitgeeft, blijft in de regio en versterkt de lokale economie.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span><strong className="text-foreground">{bedrijven.length}</strong> lokale bedrijven aangesloten</span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam of activiteit..."
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            className="pl-9"
            data-testid="input-zoek"
          />
        </div>
        <Select value={geselecteerdeCategorie} onValueChange={setGeselecteerdeCategorie}>
          <SelectTrigger data-testid="select-categorie">
            <SelectValue placeholder="Alle sectoren" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle sectoren</SelectItem>
            {Object.entries(CATEGORIE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={geselecteerdeRegio} onValueChange={setGeselecteerdeRegio}>
          <SelectTrigger data-testid="select-regio">
            <SelectValue placeholder="Alle regio's" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle regio's</SelectItem>
            {regioos.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resultaten */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : gefilterd.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground space-y-2">
          <Building2 className="h-10 w-10 mx-auto opacity-30" />
          <p className="font-medium">Geen bedrijven gevonden</p>
          <p className="text-sm">Probeer andere zoektermen of pas de filters aan.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gefilterd.map((b) => (
            <Card key={b.id} className="hover-elevate" data-testid={`card-bedrijf-${b.id}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm leading-tight">{b.naam}</p>
                    <p className="text-xs text-muted-foreground">{b.eigenaarnaam}</p>
                  </div>
                  <Badge className={`text-[10px] shrink-0 ${CATEGORIE_KLEUR[b.categorieId] ?? "bg-muted text-muted-foreground"}`}>
                    {CATEGORIE_LABELS[b.categorieId] ?? b.categorieId}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{b.beschrijving}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {b.regio}
                </div>
                {b.websiteUrl && (
                  <a
                    href={b.websiteUrl.startsWith("http") ? b.websiteUrl : `https://${b.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#0b2240] dark:text-[#0b2240] hover:underline"
                    data-testid={`link-website-${b.id}`}
                  >
                    <Globe className="h-3 w-3" />
                    Website bezoeken
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CTA voor ondernemers */}
      <div className="border rounded-xl p-6 flex items-center justify-between gap-4 flex-wrap bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#f28a1a]/10 dark:bg-[#f28a1a]/40 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-[#f28a1a] dark:text-[#f28a1a]" />
          </div>
          <div>
            <p className="font-semibold text-sm">Ben jij ondernemer?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Maak een profiel aan op OpenRegio en verschijn hier voor lokale klanten en collega-ondernemers.
            </p>
          </div>
        </div>
        <Link href="/register">
          <Button size="sm" data-testid="button-aanmelden">
            Meld je aan <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
