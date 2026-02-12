import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Handshake,
  TrendingUp,
  Shield,
  Download,
  UserPlus,
  ArrowRight,
  FileUp,
  FileText,
  Lightbulb,
  Bot,
  Send,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SECTORS = ["Bouw", "IT & Marketing", "Horeca", "Advies", "Detailhandel", "Zorg", "Groenvoorziening", "Transport"];

const KANSEN_DATA = [
  { datum: "12-02", onderwerp: "Herinrichting Marktplein", kansVoor: "Horeca & Groenvoorziening" },
  { datum: "10-02", onderwerp: "Subsidie Verduurzaming Bedrijfspanden", kansVoor: "Alle ondernemers" },
  { datum: "08-02", onderwerp: "Nieuwe aanbesteding gemeentelijk groen", kansVoor: "Groenvoorziening & Bouw" },
];

type TabId = "kansen" | "samenwerken" | "impact";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("kansen");
  const [beroep, setBeroep] = useState("");
  const [stad, setStad] = useState("");
  const [vraag, setVraag] = useState("");
  const [buurmanAntwoord, setBuurmanAntwoord] = useState("");
  const [sector, setSector] = useState("");
  const [lokaalPercentage, setLokaalPercentage] = useState([25]);

  const { data: bedrijfsprofiel } = useQuery<{ naam: string; status: string; regio: string } | null>({
    queryKey: ["/api/business-profile/me"],
    enabled: !!user,
  });

  const buurmanMutation = useMutation({
    mutationFn: async (data: { beroep: string; stad: string; vraag?: string }) => {
      const res = await apiRequest("POST", "/api/regiobot/buurman", data);
      return res.json() as Promise<{ antwoord: string }>;
    },
    onSuccess: (data) => {
      setBuurmanAntwoord(data.antwoord);
    },
    onError: () => {
      toast({ title: "Kon geen antwoord ophalen", variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Log opnieuw in om door te gaan.</p>
        </Card>
      </div>
    );
  }

  const isPro = user.plan === "pro";
  const isAdmin = user.isAdmin || false;
  const displayName = bedrijfsprofiel?.naam || user.firstName || "ondernemer";
  const impact = lokaalPercentage[0] * 1.5;

  const tabs: { id: TabId; label: string; icon: typeof Search }[] = [
    { id: "kansen", label: "Kansen in de regio", icon: Search },
    { id: "samenwerken", label: "Lokaal samenwerken", icon: Handshake },
    { id: "impact", label: "Mijn Impact", icon: TrendingUp },
  ];

  const handleBuurmanVraag = () => {
    if (!beroep.trim() || !stad.trim()) {
      toast({ title: "Vul je beroep en stad in", variant: "destructive" });
      return;
    }
    setBuurmanAntwoord("");
    buurmanMutation.mutate({ beroep: beroep.trim(), stad: stad.trim(), vraag: vraag.trim() || undefined });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold" data-testid="text-welcome">
            Hallo, {displayName}!
          </h1>
          <Badge variant={isPro ? "default" : "secondary"} data-testid="badge-plan">
            {isPro ? "Pro-bijdrager" : "Basis-lid"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Ik ben je digitale buurman. Waar kan ik je vandaag mee helpen?
        </p>
      </header>

      <div className="flex gap-2 flex-wrap" data-testid="tab-bar">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className="toggle-elevate"
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === "kansen" && (
        <section className="space-y-4" data-testid="section-kansen">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#1f5fae]/10">
                  <Bot className="h-5 w-5 text-[#1f5fae]" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">RegioBot: Wat gebeurt er bij de gemeente?</h2>
                  <p className="text-sm text-muted-foreground">
                    Ik heb de laatste WOO-documenten gescand. Hier is wat relevant is voor jou:
                  </p>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">Datum</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Onderwerp</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Kans voor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KANSEN_DATA.map((k, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-3 text-muted-foreground whitespace-nowrap" data-testid={`text-kans-datum-${i}`}>{k.datum}</td>
                        <td className="p-3 font-medium" data-testid={`text-kans-onderwerp-${i}`}>{k.onderwerp}</td>
                        <td className="p-3">
                          <Badge variant="secondary" data-testid={`badge-kans-sector-${i}`}>{k.kansVoor}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-buurman">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#f28a1a]/10">
                  <Lightbulb className="h-5 w-5 text-[#f28a1a]" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Vraag je digitale buurman</h2>
                  <p className="text-sm text-muted-foreground">Vertel wat je doet en waar, dan zoek ik kansen voor je.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Wat is je beroep?</label>
                  <Input
                    value={beroep}
                    onChange={(e) => setBeroep(e.target.value)}
                    placeholder="Bijv: schilder, bakker, IT-er"
                    data-testid="input-beroep"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">In welke stad/regio?</label>
                  <Input
                    value={stad}
                    onChange={(e) => setStad(e.target.value)}
                    placeholder="Bijv: Utrecht, Amersfoort"
                    data-testid="input-stad"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Extra vraag (optioneel)</label>
                <div className="flex gap-2">
                  <Input
                    value={vraag}
                    onChange={(e) => setVraag(e.target.value)}
                    placeholder="Bijv: 'Is er nieuws over parkeertarieven?'"
                    onKeyDown={(e) => e.key === "Enter" && handleBuurmanVraag()}
                    data-testid="input-buurman-vraag"
                  />
                  <Button
                    onClick={handleBuurmanVraag}
                    disabled={buurmanMutation.isPending || !beroep.trim() || !stad.trim()}
                    data-testid="button-buurman-vraag"
                  >
                    {buurmanMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {buurmanAntwoord && (
                <div className="rounded-md bg-muted/50 p-4 text-sm leading-relaxed" data-testid="text-buurman-antwoord">
                  {buurmanAntwoord}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="hover-elevate" data-testid="card-upload-brief">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <FileUp className="h-5 w-5 text-[#1f5fae]" />
                  <h3 className="font-semibold">Brief uploaden</h3>
                  {!isPro && (
                    <Badge variant="secondary" className="text-[10px]">1x per dag</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload een brief of document voor analyse.
                </p>
                <Link href="/woo-bibliotheek">
                  <Button size="sm" data-testid="button-upload-brief">
                    Upload
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-elevate" data-testid="card-juridisch">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#1f5fae]" />
                  <h3 className="font-semibold">Juridische Instrumenten</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Signaalinstrument of BevoegdheidsScan kiezen.
                </p>
                <Link href="/woo-wizard">
                  <Button size="sm" data-testid="button-woo-wizard">
                    Kiezen
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {activeTab === "samenwerken" && (
        <section className="space-y-4" data-testid="section-samenwerken">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#f28a1a]/10">
                  <Handshake className="h-5 w-5 text-[#f28a1a]" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">De RegioMarkt</h2>
                  <p className="text-sm text-muted-foreground">Wie heb je nodig?</p>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Sector</label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger data-testid="select-sector">
                      <SelectValue placeholder="Kies een sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Link href="/network">
                  <Button data-testid="button-vind-partners">
                    Vind lokale partners
                  </Button>
                </Link>
              </div>

              <div className="flex items-start gap-3 rounded-md bg-muted/50 p-4">
                <Lightbulb className="h-5 w-5 text-[#f28a1a] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Tip</p>
                  <p className="text-sm text-muted-foreground">
                    Bekijk de RegioCrew voor flexibele inzet bij personeelstekorten.
                  </p>
                  <Link href="/regiocrew">
                    <Button size="sm" variant="outline" className="mt-2" data-testid="button-naar-regiocrew">
                      Naar RegioCrew
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === "impact" && (
        <section className="space-y-4" data-testid="section-impact">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">Jouw Regionale Voetafdruk</h2>
                  <p className="text-sm text-muted-foreground">Hoeveel van jouw euro's blijven in de buurt?</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-muted-foreground">
                  Hoeveel procent koop jij lokaal in? <span className="font-bold text-foreground">{lokaalPercentage[0]}%</span>
                </label>
                <Slider
                  value={lokaalPercentage}
                  onValueChange={setLokaalPercentage}
                  max={100}
                  min={0}
                  step={5}
                  data-testid="slider-lokaal-percentage"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Regionale Groeifactor</p>
                    <p className="text-3xl font-bold text-green-600" data-testid="text-impact-factor">{impact.toFixed(0)}%</p>
                    <Badge variant="secondary" className="mt-2">Boven gemiddelde</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">Regionaal effect</p>
                    <p className="text-sm leading-relaxed" data-testid="text-impact-beschrijving">
                      Door <span className="font-bold">{lokaalPercentage[0]}%</span> lokaal te besteden, help je direct <span className="font-bold text-green-600">{Math.max(1, Math.round(lokaalPercentage[0] / 8))} banen</span> in de regio te behouden.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {isAdmin && (
        <section className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <h2 className="font-semibold">Admin</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card data-testid="card-admin-export">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Leden export</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="/api/export/nieuwe-leden?days=7&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-7">
                      CSV (7 dagen)
                    </Button>
                  </a>
                  <a href="/api/export/nieuwe-leden?days=30&format=csv">
                    <Button size="sm" variant="outline" data-testid="button-export-csv-30">
                      CSV (30 dagen)
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-admin-create-user">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-medium text-sm">Gebruiker aanmaken</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maak gratis accounts aan voor vrienden en kennissen.
                </p>
                <Link href="/admin/users">
                  <Button size="sm" data-testid="button-admin-create-user">
                    Nieuw account
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </div>
  );
}
