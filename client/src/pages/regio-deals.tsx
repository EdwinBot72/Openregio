import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, Check, Tag, Star } from "lucide-react";
import type { RegioDeal } from "@shared/schema";
import { REGIO_DEAL_CATEGORIES } from "@shared/schema";

const CATEGORY_COLORS: Record<string, string> = {
  Software: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  Kantoor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Marketing: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  Verzekering: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  Energie: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  Overig: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

function PromoCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      toast({ title: "Gekopieerd!", description: `Code "${code}" staat in je klembord.` });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <code
        className="flex-1 text-sm font-mono bg-muted px-3 py-1.5 rounded-md border text-center tracking-widest"
        data-testid="text-promo-code"
      >
        {code}
      </code>
      <Button
        size="icon"
        variant="outline"
        onClick={handleCopy}
        data-testid="button-copy-promo-code"
        title="Kopieer code"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function DealCard({ deal }: { deal: RegioDeal }) {
  const categoryColor = CATEGORY_COLORS[deal.category] ?? CATEGORY_COLORS["Overig"];

  return (
    <Card className="flex flex-col h-full" data-testid={`card-deal-${deal.id}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1" data-testid={`text-provider-${deal.id}`}>
              {deal.provider}
            </p>
            <h3 className="font-semibold text-base leading-snug" data-testid={`text-title-${deal.id}`}>
              {deal.title}
            </h3>
          </div>
          <Badge className={`shrink-0 text-xs font-medium ${categoryColor} no-default-active-elevate`} data-testid={`badge-category-${deal.id}`}>
            {deal.category}
          </Badge>
        </div>
        <div
          className="mt-2 inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-md font-semibold text-sm w-fit"
          data-testid={`text-discount-${deal.id}`}
        >
          <Tag className="w-3.5 h-3.5" />
          {deal.discount}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 gap-3 pt-0">
        <p className="text-sm text-muted-foreground flex-1" data-testid={`text-description-${deal.id}`}>
          {deal.description}
        </p>

        {deal.promoCode && <PromoCodeButton code={deal.promoCode} />}

        {deal.validUntil && (
          <p className="text-xs text-muted-foreground" data-testid={`text-valid-until-${deal.id}`}>
            Geldig t/m {deal.validUntil}
          </p>
        )}

        <Button
          asChild
          className="w-full mt-auto"
          data-testid={`button-claim-deal-${deal.id}`}
        >
          <a href={deal.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Claim deal
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RegiodealsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Alle");

  const { data: deals, isLoading } = useQuery<RegioDeal[]>({
    queryKey: ["/api/regio-deals"],
  });

  const filtered = useMemo(() => {
    if (!deals) return [];
    if (activeCategory === "Alle") return deals;
    return deals.filter((d) => d.category === activeCategory);
  }, [deals, activeCategory]);

  const categories = ["Alle", ...REGIO_DEAL_CATEGORIES];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="rounded-md bg-primary px-5 py-4 text-primary-foreground flex items-center gap-3">
        <Star className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-semibold">Exclusief voor OpenRegio-leden</p>
          <p className="text-sm text-primary-foreground/80">
            Profiteer van collectief onderhandelde kortingen en afspraken speciaal voor jou.
          </p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold" data-testid="heading-regio-deals">Regio Deals</h1>
        <p className="text-muted-foreground mt-1">
          Collectieve afspraken en deals speciaal voor leden van OpenRegio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="filter-categories">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            data-testid={`button-filter-${cat.toLowerCase()}`}
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-md" />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div
          className="text-center py-16 text-muted-foreground"
          data-testid="text-empty-state"
        >
          {deals && deals.length === 0
            ? "Er zijn nog geen Regio Deals beschikbaar. Binnenkort meer!"
            : `Geen deals gevonden in de categorie "${activeCategory}".`}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  );
}
