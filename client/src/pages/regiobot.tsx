import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link, useSearch } from "wouter";
import { Crown, Scale, FileText, Zap, Tag, MapPin, FolderOpen, Info, Lightbulb } from "lucide-react";

type Task =
  | "analyse_besluit"
  | "mandaat_check"
  | "wat_ontbreekt"
  | "vervolg_woo"
  | "tijdlijn"
  | "publiceer_samenvatting";

interface Region {
  id: number;
  name: string;
  slug: string;
}
interface Authority {
  id: number;
  name: string;
  slug: string;
}

interface DossierRow {
  id: number;
  title: string;
  reference_code: string | null;
  sent_at: string | null;
  status: string | null;
  region_slug: string | null;
  region_name: string | null;
  authority_slug: string | null;
  authority_name: string | null;
}

interface Citation {
  sourceNo: number;
  source_type: string;
  request_id: number;
  document_id: number | null;
  region: string | null;
  authority: string | null;
  title: string | null;
  filename: string | null;
  file_url: string | null;
}

interface RegioBotResponse {
  answer: string;
  citations: Citation[];
}

const ALLOWED_TAGS = [
  { slug: "mandaat", label: "Mandaat" },
  { slug: "delegatie", label: "Delegatie" },
  { slug: "verordening", label: "Verordening" },
  { slug: "beleid", label: "Beleid" },
  { slug: "heffing", label: "Heffing/Leges" },
  { slug: "handhaving", label: "Handhavingskader" },
  { slug: "aanbesteding", label: "Aanbesteding" },
  { slug: "subsidie", label: "Subsidie" },
  { slug: "vergunning", label: "Vergunning" },
];

function taskLabel(t: Task) {
  switch (t) {
    case "analyse_besluit":
      return "Analyseer besluit";
    case "mandaat_check":
      return "Mandaat-check";
    case "wat_ontbreekt":
      return "Wat ontbreekt?";
    case "vervolg_woo":
      return "Genereer vervolg-WOO";
    case "tijdlijn":
      return "Bouw tijdlijn";
    case "publiceer_samenvatting":
      return "Publiceer-samenvatting";
  }
}

function taskTemplate(t: Task) {
  switch (t) {
    case "analyse_besluit":
      return "Analyseer dit besluit/antwoord. Geef: kernbeslissing, genoemde grondslag, wie tekent/rol, wat wringt, en welke stukken ontbreken (WOO). Plak tekst hieronder:\n\n";
    case "mandaat_check":
      return "Doe een mandaat-check voor dit onderwerp/besluit. Zoek naar mandaat/delegatie/aanwijzing/uitbesteding. Zeg wat je wel/niet ziet en formuleer concrete WOO-vragen. Context/tekst:\n\n";
    case "wat_ontbreekt":
      return "Maak een checklist van ontbrekende stukken (besluiten, mandaatregister, contracten, werkinstructies, beleidskaders). Formuleer vervolg-WOO vragen. Context/tekst:\n\n";
    case "vervolg_woo":
      return "Genereer vervolg-WOO vragen op basis van gaten/inconsistenties. Kort, documentgericht, zonder meningen. Context/tekst:\n\n";
    case "tijdlijn":
      return "Bouw een tijdlijn met datum/actie/partij en markeer hiaten. Gebruik alleen feiten uit bronnen. Context/tekst:\n\n";
    case "publiceer_samenvatting":
      return "Maak een publicatie-ready samenvatting (zonder persoonsgegevens). Alleen feiten + verwijzingen. Context/tekst:\n\n";
  }
}

export default function RegioBotPage() {
  const { user, isLoading } = useAuth();
  const isPro = user?.plan === "pro";
  const searchString = useSearch();

  const [task, setTask] = useState<Task>("analyse_besluit");
  const [question, setQuestion] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedAuthority, setSelectedAuthority] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDossierId, setSelectedDossierId] = useState<string>("none");
  const [response, setResponse] = useState<RegioBotResponse | null>(null);

  const { data: regions = [] } = useQuery<Region[]>({ queryKey: ["/api/woo/regions"] });
  const { data: authorities = [] } = useQuery<Authority[]>({ queryKey: ["/api/woo/authorities"] });

  const dossiersUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedRegion && selectedRegion !== "all") p.set("region", selectedRegion);
    if (selectedAuthority && selectedAuthority !== "all") p.set("authority", selectedAuthority);
    return `/api/woo/dossiers?${p.toString()}`;
  }, [selectedRegion, selectedAuthority]);

  const { data: dossiers = [] } = useQuery<DossierRow[]>({ queryKey: [dossiersUrl] });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const dossier = params.get("dossier");
    const t = params.get("task") as Task | null;
    const preset = params.get("preset");

    if (dossier) setSelectedDossierId(dossier);
    if (t && ["analyse_besluit", "mandaat_check", "wat_ontbreekt", "vervolg_woo", "tijdlijn", "publiceer_samenvatting"].includes(t)) {
      setTask(t);
    }
    
    // Handle preset prompts from dashboard buttons
    if (preset) {
      switch (preset) {
        case "woo":
          setTask("vervolg_woo");
          setQuestion("Stel een WOO-verzoek op voor openbare documenten over: [onderwerp]. Beperk tot ondernemersregels. Maak het per documenttype.\n\nOnderwerp: ");
          break;
        case "besluit":
          setTask("analyse_besluit");
          setQuestion("Vat dit document samen in 10 bullets: wat staat er, welke datum, welke bevoegdheid, welke verplichting, welke gevolgen.\n\nPlak document hieronder:\n\n");
          break;
        case "mandaat":
          setTask("mandaat_check");
          setQuestion("Zoek in dit document: wie tekent, namens wie, welke mandaatketen wordt genoemd, en wat ontbreekt om bevoegdheid te onderbouwen.\n\nPlak document hieronder:\n\n");
          break;
        case "ontbrekend":
          setTask("wat_ontbreekt");
          setQuestion("Maak een lijst van documenten die logisch ontbreken om dit volledig te onderbouwen (mandaatbesluit, delegatie, beleidsregel, publicatie, bijlagen).\n\nContext/document:\n\n");
          break;
      }
    }
  }, [searchString]);

  const askMutation = useMutation({
    mutationFn: async (finalQuestion: string) => {
      const payload = {
        task,
        question: finalQuestion,
        dossierRequestId: selectedDossierId === "none" ? undefined : Number(selectedDossierId),
        regionSlug: selectedRegion === "all" ? undefined : selectedRegion || undefined,
        authoritySlug: selectedAuthority === "all" ? undefined : selectedAuthority || undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        limit: 6,
      };
      const res = await apiRequest("POST", "/api/regiobot", payload);
      return res.json() as Promise<RegioBotResponse>;
    },
    onSuccess: (data) => setResponse(data),
  });

  const outOfScopeHint = useMemo(() => {
    return (
      "OpenRegio is WOO + wet- en regelgeving voor ondernemers. " +
      "Persoonlijke zaken (snelheid/rood licht/Mulder/CJIB/parkeerboetes) worden niet meegenomen."
    );
  }, []);

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  };

  const applyTaskTemplate = (t: Task) => {
    setTask(t);
    setQuestion((prev) => {
      if (prev.trim().length > 0) return prev;
      return taskTemplate(t);
    });
  };

  const handleSubmit = () => {
    const finalQuestion = question.trim();
    
    // Allow empty question if dossier is selected (server uses task keywords for FTS)
    if (finalQuestion.length < 3 && selectedDossierId === "none") return;
    
    setResponse(null);
    askMutation.mutate(finalQuestion);
  };

  if (!isLoading && !isPro) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card data-testid="card-upgrade-prompt">
          <CardContent className="p-6 space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <Crown className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold">RegioBot voor Pro-bijdragers</h1>
            <p className="text-muted-foreground">
              RegioBot werkt met WOO-bronnen en regionale dossiers. Als Pro-bijdrager krijg je deze krachtige tool erbij.
            </p>
            <Link href="/lidmaatschap?plan=pro" asChild>
              <Button size="lg" data-testid="button-upgrade-to-pro">
                <Crown className="mr-2 h-5 w-5" /> Word Pro-bijdrager
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="heading-regiobot">RegioBot – Regionale WOO & Juridische AI</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Samen bouwen we een WOO-bibliotheek om wet- en regelgeving die ondernemers raakt inzichtelijk te maken.
          RegioBot antwoordt document-gedreven (met bronnen), niet op gevoel.
        </p>
        <p className="text-[11px] text-muted-foreground">{outOfScopeHint}</p>
      </header>

      {/* Uitleg */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Hoe werkt RegioBot?</p>
              <p className="text-sm text-muted-foreground">
                RegioBot is een AI-assistent die antwoorden geeft op basis van jouw eigen geüploade documenten: WOO-brieven,
                gemeentebesluiten, mandaatregisters en meer. Zo krijg je altijd een antwoord mét bronverwijzing — geen giswerk.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Stap 1:</p>
                <p>Upload documenten via <span className="font-medium">Documenten (WOO-bibliotheek)</span> in het menu.</p>
                <p className="font-medium text-foreground">Stap 2:</p>
                <p>Kies hier een taak, selecteer een dossier (optioneel) en stel je vraag.</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "Besluit analyseren",
                  "Mandaat-check",
                  "Wat ontbreekt?",
                  "Vervolg-WOO",
                  "Tijdlijn maken",
                  "Samenvatting",
                ].map((label) => (
                  <Badge key={label} variant="secondary" className="text-xs font-normal">{label}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-8">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              RegioBot is exclusief voor Pro-leden en weigert vragen over verkeersboetes en niet-zakelijke zaken.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* TASK BUTTONS */}
      <section className="flex flex-wrap gap-2 text-xs md:text-sm">
        <Button
          variant={task === "analyse_besluit" ? "default" : "outline"}
          onClick={() => applyTaskTemplate("analyse_besluit")}
          data-testid="button-task-analyse"
        >
          <FileText className="w-4 h-4 mr-2" /> {taskLabel("analyse_besluit")}
        </Button>
        <Button
          variant={task === "mandaat_check" ? "default" : "outline"}
          onClick={() => applyTaskTemplate("mandaat_check")}
          data-testid="button-task-mandaat"
        >
          <Scale className="w-4 h-4 mr-2" /> {taskLabel("mandaat_check")}
        </Button>
        <Button
          variant={task === "wat_ontbreekt" ? "default" : "outline"}
          onClick={() => applyTaskTemplate("wat_ontbreekt")}
          data-testid="button-task-missing"
        >
          <Tag className="w-4 h-4 mr-2" /> {taskLabel("wat_ontbreekt")}
        </Button>
        <Button
          variant={task === "vervolg_woo" ? "default" : "outline"}
          onClick={() => applyTaskTemplate("vervolg_woo")}
          data-testid="button-task-followup"
        >
          <Zap className="w-4 h-4 mr-2" /> {taskLabel("vervolg_woo")}
        </Button>
        <Button
          variant={task === "tijdlijn" ? "default" : "outline"}
          onClick={() => applyTaskTemplate("tijdlijn")}
          data-testid="button-task-timeline"
        >
          <MapPin className="w-4 h-4 mr-2" /> {taskLabel("tijdlijn")}
        </Button>
      </section>

      <div className="grid md:grid-cols-[2fr,1.4fr] gap-6">
        {/* LEFT */}
        <Card className="h-full">
          <CardContent className="p-5 space-y-4">
            {/* Dossier Selector */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <FolderOpen className="w-3 h-3" /> Dossier (optioneel)
              </div>
              <Select value={selectedDossierId} onValueChange={setSelectedDossierId}>
                <SelectTrigger data-testid="select-dossier">
                  <SelectValue placeholder="Kies dossier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Geen dossier (losse vraag)</SelectItem>
                  {dossiers.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.title || "(geen titel)"} {d.reference_code ? `• ${d.reference_code}` : ""} {d.region_name ? `• ${d.region_name}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Met dossier: RegioBot gebruikt automatisch verzoek + bijlagen als context.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Regio</div>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger data-testid="select-region">
                    <SelectValue placeholder="Kies regio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle regio's</SelectItem>
                    {regions.map((r) => (
                      <SelectItem key={r.id} value={r.slug}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Bestuursorgaan</div>
                <Select value={selectedAuthority} onValueChange={setSelectedAuthority}>
                  <SelectTrigger data-testid="select-authority">
                    <SelectValue placeholder="Kies bestuursorgaan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle bestuursorganen</SelectItem>
                    {authorities.map((a) => (
                      <SelectItem key={a.id} value={a.slug}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Tags (optioneel)</div>
              <div className="flex flex-wrap gap-2">
                {ALLOWED_TAGS.map((t) => (
                  <Badge
                    key={t.slug}
                    variant={selectedTags.includes(t.slug) ? "default" : "outline"}
                    className="cursor-pointer select-none"
                    onClick={() => toggleTag(t.slug)}
                    data-testid={`badge-tag-${t.slug}`}
                  >
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Input</div>
              <textarea
                className="w-full border rounded-md p-2 text-sm min-h-[180px] bg-background"
                placeholder="Stel een vraag over wet- en regelgeving in jouw regio, of plak hier een WOO-verzoek/besluit/antwoord om te analyseren."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                data-testid="textarea-regiobot-question"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <Button onClick={handleSubmit} disabled={askMutation.isPending || (question.trim().length < 3 && selectedDossierId === "none")} data-testid="button-submit-regiobot">
                {askMutation.isPending ? "RegioBot werkt..." : "Verwerk"}
              </Button>
              <p className="text-[10px] text-muted-foreground max-w-xs text-right">
                Document-gedreven analyse. Geen persoonlijke boetes/traffic cases.
              </p>
            </div>

            {response?.answer && (
              <div className="border-t pt-4 mt-4 space-y-3">
                <h2 className="text-sm font-semibold">Output</h2>
                <div className="text-sm whitespace-pre-wrap bg-muted/30 p-4 rounded-md" data-testid="text-regiobot-answer">{response.answer}</div>

                {response.citations?.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs font-semibold mb-2 text-muted-foreground">Bronnen</div>
                    <div className="space-y-2">
                      {response.citations.map((c) => (
                        <div key={c.sourceNo} className="text-xs text-muted-foreground border rounded p-2" data-testid={`citation-${c.sourceNo}`}>
                          <div className="font-semibold">
                            SOURCE {c.sourceNo} • request_id {c.request_id}
                            {c.document_id ? ` • document_id ${c.document_id}` : ""}
                          </div>
                          <div>{c.title || c.filename || "(geen titel)"}</div>
                          {c.file_url ? <div className="truncate">{c.file_url}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT */}
        <Card className="h-full">
          <CardContent className="p-5 space-y-3 text-sm">
            <h2 className="font-semibold mb-1">Gebruik dit zo</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Kies eerst regio + bestuursorgaan (scheelt ruis).</li>
              <li>Plak WOO-tekst / besluit / antwoord in de input.</li>
              <li>Klik een task: output is altijd "bewijs + wat ontbreekt + vervolg-WOO + bronnen".</li>
            </ul>

            <div className="pt-2">
              <h3 className="font-semibold mb-1">Niet toegestaan</h3>
              <p className="text-muted-foreground">
                Snelheid, rood licht, Mulder, CJIB, persoonlijke boetes of individuele handhaving.
                OpenRegio is voor structurele regels die ondernemers raken.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
