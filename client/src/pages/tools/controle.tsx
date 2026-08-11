import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Scale,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";

const BLAUW = "#0b2240";
const GROEN = "#1a6b3a";
const ORANJE = "#f28a1a";
const ROOD = "#b3261e";

interface ControleRespons {
  controle: string;
  aandachtspunten: string;
  letop: string;
}
interface BezwaarRespons {
  letter: string;
  controleslag: string;
  letop: string;
}

type Status = "IN ORDE" | "ONTBREEKT" | "ONDUIDELIJK" | "ONBEKEND";

function statusVan(regel: string): { status: Status; tekst: string } {
  const m = regel.match(/^\s*\[(.+?)\]\s*(.*)$/);
  if (!m) return { status: "ONBEKEND", tekst: regel.trim() };
  const ruw = m[1].toUpperCase().trim();
  const status: Status =
    ruw.includes("IN ORDE") ? "IN ORDE" : ruw.includes("ONTBREEKT") ? "ONTBREEKT" : ruw.includes("ONDUIDELIJK") ? "ONDUIDELIJK" : "ONBEKEND";
  return { status, tekst: m[2].trim() };
}

function StatusBadge({ status }: { status: Status }) {
  if (status === "IN ORDE")
    return (
      <Badge style={{ background: GROEN }} className="text-white shrink-0">
        <CheckCircle2 className="w-3 h-3 mr-1" /> In orde
      </Badge>
    );
  if (status === "ONTBREEKT")
    return (
      <Badge style={{ background: ROOD }} className="text-white shrink-0">
        <AlertTriangle className="w-3 h-3 mr-1" /> Ontbreekt
      </Badge>
    );
  if (status === "ONDUIDELIJK")
    return (
      <Badge style={{ background: ORANJE }} className="text-white shrink-0">
        <HelpCircle className="w-3 h-3 mr-1" /> Onduidelijk
      </Badge>
    );
  return <Badge variant="secondary" className="shrink-0">—</Badge>;
}

function KopieerKnop({ tekst }: { tekst: string }) {
  const [gekopieerd, setGekopieerd] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(tekst);
        setGekopieerd(true);
        setTimeout(() => setGekopieerd(false), 1800);
      }}
    >
      {gekopieerd ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
      {gekopieerd ? "Gekopieerd" : "Kopiëren"}
    </Button>
  );
}

export default function ControlePage() {
  usePageTitle("Besluit controleren — OpenRegio");
  const { toast } = useToast();
  const { user } = useAuth();
  const isPro = user?.plan === "pro" || user?.plan === "coaching";

  const [bestuursorgaan, setBestuursorgaan] = useState("");
  const [onderwerp, setOnderwerp] = useState("");
  const [context, setContext] = useState("");
  const [besluitTekst, setBesluitTekst] = useState("");

  const [controle, setControle] = useState<ControleRespons | null>(null);
  const [gekozen, setGekozen] = useState<Record<number, boolean>>({});
  const [bezwaar, setBezwaar] = useState<BezwaarRespons | null>(null);

  const controleMutatie = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/brieven/controle", { besluitTekst, context });
      return (await res.json()) as ControleRespons;
    },
    onSuccess: (data) => {
      setControle(data);
      setBezwaar(null);
      // Alle aandachtspunten standaard aangevinkt.
      const punten = splitsPunten(data.aandachtspunten);
      const init: Record<number, boolean> = {};
      punten.forEach((_, i) => (init[i] = true));
      setGekozen(init);
    },
    onError: (err) => toast({ title: "Controle mislukt", description: parseApiError(err), variant: "destructive" }),
  });

  const bezwaarMutatie = useMutation({
    mutationFn: async (gronden: string) => {
      const res = await apiRequest("POST", "/api/brieven/generate", {
        brieftype: "bezwaar",
        bestuursorgaan,
        onderwerp,
        context,
        gevraagd: gronden,
      });
      return (await res.json()) as BezwaarRespons;
    },
    onSuccess: (data) => setBezwaar(data),
    onError: (err) => toast({ title: "Bezwaar genereren mislukt", description: parseApiError(err), variant: "destructive" }),
  });

  const controleRegels = useMemo(
    () => (controle?.controle || "").split("\n").map((r) => r.trim()).filter(Boolean),
    [controle],
  );
  const aandachtspunten = useMemo(() => splitsPunten(controle?.aandachtspunten || ""), [controle]);

  const kanControleren = besluitTekst.trim().length >= 40;
  const geselecteerdePunten = aandachtspunten.filter((_, i) => gekozen[i]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/regels/documenten" className="inline-flex items-center text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Terug naar tools
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: BLAUW }}>
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: BLAUW }}>Besluit controleren</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Plak de brief of het besluit dat je van de overheid kreeg. Wij controleren op de punten die er
        volgens de wet in horen te staan — wie het opmaakte, wie bevoegd is, de motivering, de termijn en
        je rechtsmiddelen. <strong>Wij controleren, jij beslist.</strong> Er wordt niets verzonnen: we kijken
        alleen naar de tekst die je zelf aanlevert.
      </p>

      {!isPro && (
        <Card className="mb-6 border-amber-300">
          <CardContent className="p-4 flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ORANJE }} />
            <span>Deze controle is onderdeel van OpenRegio Pro. Je kunt hem uitproberen; bij het opslaan of genereren kan om een upgrade worden gevraagd.</span>
          </CardContent>
        </Card>
      )}

      {/* Stap 1 — invoer */}
      <Card className="mb-6">
        <CardContent className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Bestuursorgaan</label>
              <Input value={bestuursorgaan} onChange={(e) => setBestuursorgaan(e.target.value)} placeholder="Bijv. Gemeente Utrecht" />
            </div>
            <div>
              <label className="text-sm font-medium">Onderwerp</label>
              <Input value={onderwerp} onChange={(e) => setOnderwerp(e.target.value)} placeholder="Bijv. Last onder dwangsom terras" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Jouw situatie (optioneel)</label>
            <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="Eén zin: wat speelt er?" />
          </div>
          <div>
            <label className="text-sm font-medium">Tekst van het besluit *</label>
            <Textarea
              value={besluitTekst}
              onChange={(e) => setBesluitTekst(e.target.value)}
              placeholder="Plak hier de volledige tekst van de brief/het besluit…"
              className="min-h-[180px]"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimaal enkele zinnen. Hoe vollediger de tekst, hoe beter de controle.</p>
          </div>
          <Button
            onClick={() => controleMutatie.mutate()}
            disabled={!kanControleren || controleMutatie.isPending}
            style={{ background: BLAUW }}
            className="text-white"
          >
            {controleMutatie.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            {controleMutatie.isPending ? "Bezig met controleren…" : "Controleer besluit"}
          </Button>
        </CardContent>
      </Card>

      {/* Stap 2 — resultaat */}
      {controle && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="text-lg font-semibold mb-3" style={{ color: BLAUW }}>Resultaat van de controle</h2>
            <div className="space-y-2">
              {controleRegels.map((regel, i) => {
                const { status, tekst } = statusVan(regel);
                return (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <StatusBadge status={status} />
                    <span>{tekst}</span>
                  </div>
                );
              })}
            </div>

            {aandachtspunten.length > 0 && (
              <>
                <Separator className="my-4" />
                <h3 className="font-semibold mb-1" style={{ color: BLAUW }}>Aandachtspunten voor bezwaar</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Vink aan welke punten je in je bezwaar wilt gebruiken. Controleer elk punt eerst tegen je eigen besluit.
                </p>
                <div className="space-y-2">
                  {aandachtspunten.map((punt, i) => (
                    <label key={i} className="flex items-start gap-2 text-sm cursor-pointer">
                      <Checkbox checked={!!gekozen[i]} onCheckedChange={(v) => setGekozen((g) => ({ ...g, [i]: !!v }))} className="mt-0.5" />
                      <span>{punt}</span>
                    </label>
                  ))}
                </div>
                <Button
                  className="mt-4 text-white"
                  style={{ background: GROEN }}
                  disabled={geselecteerdePunten.length === 0 || !bestuursorgaan || !onderwerp || bezwaarMutatie.isPending}
                  onClick={() => bezwaarMutatie.mutate(geselecteerdePunten.map((p, i) => `${i + 1}. ${p}`).join("\n"))}
                >
                  {bezwaarMutatie.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Scale className="w-4 h-4 mr-2" />}
                  {bezwaarMutatie.isPending ? "Bezwaar opstellen…" : "Maak bezwaar van geselecteerde punten"}
                </Button>
                {(!bestuursorgaan || !onderwerp) && (
                  <p className="text-xs text-muted-foreground mt-2">Vul hierboven bestuursorgaan en onderwerp in om een bezwaar te maken.</p>
                )}
              </>
            )}

            {controle.letop && (
              <div className="mt-4 p-3 rounded-md text-xs" style={{ background: "#fff7ed", color: "#7c2d12" }}>
                <strong>Let op. </strong>{controle.letop}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stap 3 — bezwaar */}
      {bezwaar && (
        <Card className="mb-10 border-2" style={{ borderColor: GROEN }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold" style={{ color: BLAUW }}>Concept-bezwaarschrift</h2>
              <KopieerKnop tekst={bezwaar.letter} />
            </div>
            <pre className="whitespace-pre-wrap text-sm font-sans bg-muted/40 p-4 rounded-md">{bezwaar.letter}</pre>
            {bezwaar.controleslag && (
              <div className="mt-4">
                <h3 className="font-semibold mb-1" style={{ color: BLAUW }}>Controleslag vóór verzenden</h3>
                <pre className="whitespace-pre-wrap text-sm font-sans">{bezwaar.controleslag}</pre>
              </div>
            )}
            {bezwaar.letop && (
              <div className="mt-4 p-3 rounded-md text-xs" style={{ background: "#fff7ed", color: "#7c2d12" }}>
                <strong>Let op. </strong>{bezwaar.letop}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function splitsPunten(tekst: string): string[] {
  return tekst
    .split("\n")
    .map((r) => r.replace(/^\s*[-•]\s*/, "").replace(/^Aandachtspunt:\s*/i, "").trim())
    .filter((r) => r.length > 0);
}
