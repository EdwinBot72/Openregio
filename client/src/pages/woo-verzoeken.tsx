import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { WooNamensFormulier } from "@/components/WooNamensFormulier";
import { fetchMetSessie } from "@/lib/queryClient";
import { ArrowLeft, FileSearch, Landmark } from "lucide-react";

const NAVY = "#0b2240";

interface WooVerzoek {
  id: number; bron: "brief" | "regel" | null; orgaan: string; onderwerp: string; status: string;
  aangemaakt: string; ingediendOp?: string; deadline?: string; ingebrekeOp?: string; reden?: string; tekst?: string;
}

const STATUS: Record<string, { tekst: string; kleur: string; achtergrond: string }> = {
  wacht_op_goedkeuring: { tekst: "Wordt gecontroleerd door OpenRegio", kleur: "#8a5300", achtergrond: "#fff4e0" },
  verstuurd: { tekst: "Ingediend — wacht op besluit", kleur: "#1d4a8f", achtergrond: "#eaf0fb" },
  ingebreke_gesteld: { tekst: "In gebreke gesteld", kleur: "#b0452b", achtergrond: "#f8e6e1" },
  beantwoord: { tekst: "Beantwoord", kleur: "#1f6b45", achtergrond: "#e8f5ee" },
  afgerond: { tekst: "Afgerond", kleur: "#475569", achtergrond: "#eef2f6" },
  afgewezen: { tekst: "Niet ingediend", kleur: "#475569", achtergrond: "#eef2f6" },
  ingetrokken: { tekst: "Ingetrokken", kleur: "#475569", achtergrond: "#eef2f6" },
};
const datum = (d?: string) => (d ? new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : "");

function VerzoekKaart({ w }: { w: WooVerzoek }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const s = STATUS[w.status] || { tekst: w.status, kleur: "#475569", achtergrond: "#eef2f6" };
  const verlopen = w.status === "verstuurd" && w.deadline && new Date(w.deadline).getTime() < Date.now();
  const intrekken = useMutation({
    mutationFn: async () => {
      const r = await fetchMetSessie(`/api/woo/namens/${w.id}/intrekken`, { method: "POST" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Intrekken mislukt.");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/woo/namens"] }),
    onError: (e: Error) => toast({ title: "Intrekken mislukt", description: e.message, variant: "destructive" }),
  });
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "white" }} data-testid={`woo-verzoek-${w.id}`}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 800, color: NAVY, fontSize: 15 }}>{w.onderwerp}</div>
          <div style={{ fontSize: 13, color: "#475569" }}>{w.orgaan} · {w.bron === "regel" ? "regel of verordening" : "brief"} · aangevraagd {datum(w.aangemaakt)}</div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, color: s.kleur, background: s.achtergrond, borderRadius: 999, padding: "3px 10px" }}>{s.tekst}</span>
      </div>
      <div style={{ fontSize: 13, color: "#334155", marginTop: 8, display: "grid", gap: 2 }}>
        {w.ingediendOp && <span>Ingediend op {datum(w.ingediendOp)}</span>}
        {w.deadline && w.status === "verstuurd" && (
          <span style={{ color: verlopen ? "#b0452b" : undefined }}>
            Uiterste beslisdatum: <strong>{datum(w.deadline)}</strong> (verlenging met twee weken is mogelijk){verlopen ? " — termijn verstreken; OpenRegio kan het orgaan in gebreke stellen." : ""}
          </span>
        )}
        {w.ingebrekeOp && <span>In gebreke gesteld op {datum(w.ingebrekeOp)}</span>}
        {w.reden && <span>Reden: {w.reden}</span>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {w.tekst && <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>{open ? "Verberg het verzoek" : "Bekijk het verzoek"}</Button>}
        {w.status === "wacht_op_goedkeuring" && <Button size="sm" variant="ghost" onClick={() => intrekken.mutate()} disabled={intrekken.isPending}>Intrekken</Button>}
      </div>
      {open && w.tekst && <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", fontSize: 13, lineHeight: 1.55, background: "#f8fafc", borderRadius: 8, padding: 12, marginTop: 10 }}>{w.tekst}</pre>}
    </div>
  );
}

export default function WooVerzoekenPage() {
  usePageTitle("Woo-verzoeken — OpenRegio");
  const [nieuw, setNieuw] = useState(false);
  const lijst = useQuery<WooVerzoek[]>({ queryKey: ["/api/woo/namens"] });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <Link href="/regels" className="inline-flex items-center text-sm text-muted-foreground hover:underline mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Grip op Regels
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Landmark size={22} color="white" />
        </div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: NAVY }}>Woo-verzoeken</h1>
      </div>
      <p style={{ fontSize: 14.5, color: "#475569", lineHeight: 1.7, margin: "0 0 8px" }}>
        Met de Wet open overheid (Woo) kun je documenten van de overheid opvragen: het dossier achter een brief die je kreeg, of de
        achtergrond van een nieuwe of gewijzigde regel. <strong>OpenRegio dient het verzoek namens je in</strong>, bewaakt de termijn en stelt het
        bestuursorgaan in gebreke als het te laat beslist.
      </p>
      <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 22px" }}>
        Kreeg je een brief? Start dan bij <Link href="/regels/documenten" style={{ color: NAVY, fontWeight: 700 }}>Brief analyseren</Link> — onder het rapport kun je direct de stukken opvragen.
      </p>

      <section style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 18, marginBottom: 28, background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <FileSearch size={18} style={{ color: NAVY }} />
          <strong style={{ flex: 1, minWidth: 220, color: NAVY, fontSize: 16 }}>Nieuwe of gewijzigde regel? Vraag de achtergrond op</strong>
          {!nieuw && <Button size="sm" onClick={() => setNieuw(true)} style={{ background: NAVY }} data-testid="button-woo-nieuw">Nieuw verzoek</Button>}
        </div>
        <p style={{ fontSize: 13, color: "#475569", margin: "6px 0 0", lineHeight: 1.6 }}>
          Veel is al openbaar: kijk eerst op <a href="https://lokaleregelgeving.overheid.nl" target="_blank" rel="noopener noreferrer" style={{ color: NAVY, fontWeight: 700 }}>lokaleregelgeving.overheid.nl</a> en
          in het raadsinformatiesysteem van je gemeente. Met een Woo-verzoek vraag je de rest op: adviezen, effectrapportages (zoals de gevolgen voor ondernemers),
          inspraakreacties en correspondentie met belangengroepen.
        </p>
        {nieuw && <div style={{ marginTop: 16 }}><WooNamensFormulier bron="regel" onKlaar={() => lijst.refetch()} /></div>}
      </section>

      <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, margin: "0 0 12px" }}>Mijn Woo-verzoeken</h2>
      {lijst.isLoading ? (
        <p style={{ fontSize: 14, color: "#64748b" }}>Laden…</p>
      ) : lijst.isError ? (
        <p style={{ fontSize: 14, color: "#b0452b" }}>Je Woo-verzoeken konden niet worden geladen. Woo-verzoeken zijn onderdeel van OpenRegio Pro.</p>
      ) : !lijst.data?.length ? (
        <p style={{ fontSize: 14, color: "#64748b" }}>Je hebt nog geen Woo-verzoeken.</p>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>{lijst.data.map((w) => <VerzoekKaart key={w.id} w={w} />)}</div>
      )}
    </div>
  );
}
