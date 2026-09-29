import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchMetSessie } from "@/lib/queryClient";
import { CheckCircle2, FileSearch, Loader2, Send } from "lucide-react";

const NAVY = "#0b2240";

export interface WooVoorinvulling {
  orgaan?: string;
  onderwerp?: string;
  kenmerk?: string;
  datumBrief?: string;
}

async function post(url: string, body: unknown) {
  const r = await fetchMetSessie(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Er ging iets mis.");
  return j;
}

function Veld({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>{label}</span>
      {children}
      {hint && <span style={{ fontSize: 12, color: "#64748b" }}>{hint}</span>}
    </label>
  );
}

/**
 * Woo-verzoek dat OpenRegio namens de ondernemer indient.
 * bron "brief": de stukken achter een ontvangen brief; bron "regel": de achtergrond van een regel of verordening.
 */
export function WooNamensFormulier({ bron, voorinvulling = {}, onKlaar }: { bron: "brief" | "regel"; voorinvulling?: WooVoorinvulling; onKlaar?: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { user } = useAuth() as any;
  const [v, setV] = useState({
    orgaan: voorinvulling.orgaan || "",
    onderwerp: voorinvulling.onderwerp || "",
    kenmerk: voorinvulling.kenmerk || "",
    datumBrief: voorinvulling.datumBrief || "",
    regelNaam: "",
    regelLink: "",
    periode: "",
    extra: "",
    naam: [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    bedrijf: user?.businessName || "",
    adres: "",
    postcodePlaats: "",
  });
  const [voorbeeld, setVoorbeeld] = useState<{ tekst: string; machtiging: string } | null>(null);
  const [akkoord, setAkkoord] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const zet = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: e.target.value }); setVoorbeeld(null); setAkkoord(false); };

  const body = () => ({
    bron, orgaan: v.orgaan, onderwerp: v.onderwerp, kenmerk: v.kenmerk, datumBrief: v.datumBrief,
    regelNaam: v.regelNaam, regelLink: v.regelLink, periode: v.periode, extra: v.extra,
    ondernemer: { naam: v.naam, bedrijf: v.bedrijf, adres: v.adres, postcodePlaats: v.postcodePlaats },
  });

  const bekijk = useMutation({
    mutationFn: () => post("/api/woo/namens/voorbeeld", body()),
    onSuccess: (j) => setVoorbeeld(j),
    onError: (e: Error) => toast({ title: "Nog niet compleet", description: e.message, variant: "destructive" }),
  });
  const indienen = useMutation({
    mutationFn: () => post("/api/woo/namens", { ...body(), machtigingAkkoord: akkoord }),
    onSuccess: () => { setKlaar(true); qc.invalidateQueries({ queryKey: ["/api/woo/namens"] }); onKlaar?.(); },
    onError: (e: Error) => toast({ title: "Indienen mislukt", description: e.message, variant: "destructive" }),
  });

  if (klaar) {
    return (
      <div style={{ display: "flex", gap: 10, background: "#e8f5ee", border: "1px solid #bfe3cf", borderRadius: 12, padding: 16 }}>
        <CheckCircle2 size={18} style={{ color: "#1f6b45", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 14, color: "#1f4d36", lineHeight: 1.6 }}>
          <strong>Je Woo-verzoek staat klaar.</strong> OpenRegio controleert het en dient het namens je in. Je krijgt een e-mail zodra het is
          verstuurd, met de datum waarop het bestuursorgaan uiterlijk moet beslissen. <Link href="/woo-verzoeken" style={{ color: NAVY, fontWeight: 700 }}>Bekijk je Woo-verzoeken</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <Veld label="Bestuursorgaan" hint="Bijvoorbeeld: Gemeente Haarlemmermeer, college van B&W">
          <Input value={v.orgaan} onChange={zet("orgaan")} data-testid="input-woo-orgaan" />
        </Veld>
        <Veld label="Onderwerp">
          <Input value={v.onderwerp} onChange={zet("onderwerp")} placeholder={bron === "regel" ? "Bijv. nieuwe terrassenverordening" : "Bijv. last onder dwangsom terras"} data-testid="input-woo-onderwerp" />
        </Veld>
        {bron === "brief" ? (
          <>
            <Veld label="Kenmerk van de brief"><Input value={v.kenmerk} onChange={zet("kenmerk")} /></Veld>
            <Veld label="Datum van de brief"><Input value={v.datumBrief} onChange={zet("datumBrief")} placeholder="Bijv. 13 augustus 2025" /></Veld>
          </>
        ) : (
          <>
            <Veld label="Naam van de regel of verordening"><Input value={v.regelNaam} onChange={zet("regelNaam")} placeholder="Bijv. Terrassenverordening Haarlemmermeer 2026" data-testid="input-woo-regel" /></Veld>
            <Veld label="Link (optioneel)" hint="Bijv. de vindplaats op lokaleregelgeving.overheid.nl"><Input value={v.regelLink} onChange={zet("regelLink")} /></Veld>
          </>
        )}
        <Veld label="Periode (optioneel)" hint="Een afgebakende periode geeft sneller antwoord"><Input value={v.periode} onChange={zet("periode")} placeholder="Bijv. 1 januari 2025 tot heden" /></Veld>
      </div>
      <Veld label="Wat wil je nog meer weten? (optioneel)">
        <Textarea value={v.extra} onChange={zet("extra")} style={{ minHeight: 70 }} placeholder="Bijv. de communicatie met de brandweer over mijn pand" />
      </Veld>

      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Namens wie dient OpenRegio het in?</div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <Veld label="Je naam"><Input value={v.naam} onChange={zet("naam")} /></Veld>
          <Veld label="Bedrijfsnaam (optioneel)"><Input value={v.bedrijf} onChange={zet("bedrijf")} /></Veld>
          <Veld label="Adres"><Input value={v.adres} onChange={zet("adres")} /></Veld>
          <Veld label="Postcode en plaats"><Input value={v.postcodePlaats} onChange={zet("postcodePlaats")} /></Veld>
        </div>
      </div>

      {!voorbeeld ? (
        <Button onClick={() => bekijk.mutate()} disabled={bekijk.isPending} style={{ background: NAVY, justifySelf: "start" }} data-testid="button-woo-bekijk">
          {bekijk.isPending ? <Loader2 size={14} className="animate-spin" /> : <FileSearch size={14} />} Bekijk het verzoek
        </Button>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", fontSize: 13.5, lineHeight: 1.55, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 14, maxHeight: 420, overflow: "auto" }} data-testid="text-woo-voorbeeld">{voorbeeld.tekst}</pre>
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#334155", lineHeight: 1.55, cursor: "pointer", background: "#fffaf1", border: "1px solid #f5c98a", borderRadius: 10, padding: 12 }}>
            <input type="checkbox" checked={akkoord} onChange={(e) => setAkkoord(e.target.checked)} style={{ marginTop: 3 }} data-testid="checkbox-woo-machtiging" />
            <span><strong>Machtiging.</strong> {voorbeeld.machtiging} Zie ook de <Link href="/voorwaarden" style={{ color: NAVY, fontWeight: 700 }}>voorwaarden</Link> en de <Link href="/privacy" style={{ color: NAVY, fontWeight: 700 }}>privacyverklaring</Link>.</span>
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button onClick={() => indienen.mutate()} disabled={!akkoord || indienen.isPending} style={{ background: NAVY }} data-testid="button-woo-indienen">
              {indienen.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Laat OpenRegio dit indienen
            </Button>
            <Button variant="outline" onClick={() => { setVoorbeeld(null); setAkkoord(false); }}>Aanpassen</Button>
          </div>
        </div>
      )}

      <p style={{ margin: 0, fontSize: 12, color: "#8a5300" }}>
        OpenRegio controleert elk verzoek voordat het wordt verstuurd. Het bestuursorgaan moet binnen vier weken beslissen (verlenging met twee weken is mogelijk).
        Een Woo-verzoek houdt termijnen in je eigen zaak — zoals een betaal- of bezwaartermijn — niet tegen.
      </p>
    </div>
  );
}
