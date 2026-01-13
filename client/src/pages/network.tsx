import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Megaphone,
  Share2,
  CalendarDays,
  MapPin,
  Plus,
} from "lucide-react";

type PostType = "vraag" | "aanbod" | "lead" | "event" | "alles";

interface Post {
  id: string;
  type: "vraag" | "aanbod" | "lead" | "event";
  title: string;
  body: string;
  region: string;
  createdAt: string;
  authorName: string;
}

const mockPosts: Post[] = [
  {
    id: "1",
    type: "vraag",
    title: "Schilder gezocht voor trap en gang",
    body: "Woonhuis in Haarlem, werk in de komende 3 weken. Indicatie-offerte gewenst.",
    region: "Haarlem",
    createdAt: "2 dagen geleden",
    authorName: "Lisa van Dijk",
  },
  {
    id: "2",
    type: "aanbod",
    title: "Onderhoudsbeurt bedrijfsbus met ondernemerskorting",
    body: "Garage in Beverwijk, ruimte op dinsdag en donderdag. Speciaal tarief voor leden.",
    region: "IJmond",
    createdAt: "5 dagen geleden",
    authorName: "Garage De Haven",
  },
  {
    id: "3",
    type: "lead",
    title: "Lead: kapsalon zoekt vaste boekhouder",
    body: "Klant van mij in Haarlem, op zoek naar een boekhouder in de buurt. Ik verbind jullie graag.",
    region: "Haarlem",
    createdAt: "6 dagen geleden",
    authorName: "Marco Jansen",
  },
  {
    id: "4",
    type: "event",
    title: "Kleine netwerkavond bij de bakkerij",
    body: "Informele borrel op woensdagavond, maximaal 15 ondernemers, focus op lokale samenwerkingen.",
    region: "Spaarndam",
    createdAt: "8 dagen geleden",
    authorName: "Bakkerij De Brink",
  },
];

export default function NetworkPage() {
  const [typeFilter, setTypeFilter] = useState<PostType>("alles");
  const [regionFilter, setRegionFilter] = useState<string>("alle");

  const regions = ["alle", "Haarlem", "IJmond", "Spaarndam"];

  const filteredPosts = useMemo(() => {
    return mockPosts.filter((post) => {
      if (typeFilter !== "alles" && post.type !== typeFilter) return false;
      if (regionFilter !== "alle" && post.region !== regionFilter) return false;
      return true;
    });
  }, [typeFilter, regionFilter]);

  function labelForType(t: Post["type"]) {
    switch (t) {
      case "vraag":
        return "Vraag";
      case "aanbod":
        return "Aanbod";
      case "lead":
        return "Lead";
      case "event":
        return "Event";
    }
  }

  function iconForType(t: Post["type"]) {
    switch (t) {
      case "vraag":
        return <HelpCircle className="w-3 h-3" />;
      case "aanbod":
        return <Megaphone className="w-3 h-3" />;
      case "lead":
        return <Share2 className="w-3 h-3" />;
      case "event":
        return <CalendarDays className="w-3 h-3" />;
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-network-title">
          Community & Kansenbord
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Deel concrete vragen, aanbiedingen, leads en events met ondernemers in jouw regio. 
          Hou het kort, zakelijk en praktisch.
        </p>
        <p className="text-xs text-muted-foreground">
          Voorbeelden: "Wie kan volgende week 3 uur fotograferen in Haarlem?" of 
          "Ik zoek een lokale drukker voor 250 flyers".
        </p>
      </header>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          <span className="font-semibold">Filter:</span>
          <div className="inline-flex rounded-full border bg-background p-1">
            {[
              { key: "alles", label: "Alles" },
              { key: "vraag", label: "Vraag" },
              { key: "aanbod", label: "Aanbod" },
              { key: "lead", label: "Lead" },
              { key: "event", label: "Event" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTypeFilter(opt.key as PostType)}
                data-testid={`button-filter-${opt.key}`}
                className={[
                  "px-3 py-1 rounded-full text-xs md:text-sm transition-colors",
                  typeFilter === opt.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              data-testid="select-region"
              className="border rounded-md px-2 py-1 text-xs md:text-sm bg-background"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === "alle" ? "Alle regio's" : r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" data-testid="button-new-vraag">
            <Plus className="w-3 h-3 mr-1" />
            Nieuwe vraag
          </Button>
          <Button size="sm" variant="outline" data-testid="button-new-aanbod">
            <Plus className="w-3 h-3 mr-1" />
            Nieuw aanbod
          </Button>
          <Button size="sm" variant="outline" data-testid="button-new-lead">
            <Plus className="w-3 h-3 mr-1" />
            Lead delen
          </Button>
          <Button size="sm" variant="outline" data-testid="button-new-event">
            <Plus className="w-3 h-3 mr-1" />
            Event plaatsen
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        {filteredPosts.length === 0 && (
          <p className="text-sm text-muted-foreground" data-testid="text-no-posts">
            Nog geen berichten met deze filters. Plaats de eerste vraag of aanbod.
          </p>
        )}

        {filteredPosts.map((post) => (
          <Card key={post.id} data-testid={`card-post-${post.id}`}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide border bg-muted text-muted-foreground">
                    {iconForType(post.type)}
                    {labelForType(post.type)}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {post.region}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {post.createdAt}
                </span>
              </div>

              <h2 className="font-semibold text-sm md:text-base" data-testid={`text-post-title-${post.id}`}>
                {post.title}
              </h2>
              <p className="text-sm text-muted-foreground">{post.body}</p>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">
                  Door <span className="font-medium">{post.authorName}</span>
                </span>
                <Button size="sm" variant="outline" data-testid={`button-respond-${post.id}`}>
                  Reageren
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
