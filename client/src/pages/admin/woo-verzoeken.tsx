import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchMetSessie } from "@/lib/queryClient";
import { ArrowLeft, Send } from "lucide-react";

const NAVY = "#0b2240";

interface Verzoek {
  id: number; bron: string | null; orgaan: string; onderwerp: string; status: string;
  aangemaakt: string; ingediendOp?: string; deadline?: string; ingebrekeOp?: string;
  ontvanger?: string; notitie?: string; verzoeker?: string; tekst?: string; machtigingOp?: string;
  gebruiker: { email?: string; naam?: string };
}

const datum = (d?: string) => (d ? new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }) : "—");

async function post(url: string, body?: unknown) {
  const r = await fetchMetSessie(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Er ging iets mis.");
  return j;
}

function Rij({ v }: { v: Verzoek }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [ontvanger, setOntvanger] = useState("");
  const [reden, setReden] = useState("");
  const [toonTekst, setToonTekst] = useState(v.status === "wacht_op_goedkeuring");
  const klaar = (titel: string) => () => { toast({ title: titel }); qc.invalidateQueries({ queryKey: ["/api/admin/woo-namens"] }); };
  const fout = (e: Error) => toast({ title: "Mislukt", description: e.message, variant: "destructive" });
  const verstuur = useMutation({ mutationFn: () => post(`/api/admin/woo-namens/${v.id}/verstuur`, { ontvanger }), onSuccess: klaar("Verstuurd naar het bestuursorgaan"), onError: fout });
  const afwijzen = useMutation({ mutationFn: () => post(`/api/admin/woo-namens/${v.id}/afwijzen`, { reden }), onSuccess: klaar("Niet ingediend; ondernemer is gemaild"), onError: fout });
  const ingebreke = useMutation({ mutationFn: () => post(`/api/admin/woo-namens/${v.id}/ingebreke`), onSuccess: klaar("Ingebrekestelling verstuurd"), onError: fout });
  const status = useMutation({ mutationFn: (s: string) => post(`/api/admin/woo-namens/${v.id}/status`, { status: s }), onSuccess: klaar("Status bijgewerkt"), onError: fout });
  const verlopen = v.status === "verstuurd" && v.deadline && new Date(v.deadline).getTime() < Date.now();

  return (
    <div style={{ border: `1.5px solid ${v.status === "wacht_op_goedkeuring" ? "#f5c98a" : "#e2e8f0"}`, borderRadius: 12, padding: 16, background: "white", display: "grid", gap: 10 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
        <strong style={{ color: NAVY, fontSize: 15, flex: 1, minWidth: 240 }}>#{v.id} · {v.onderwerp}</strong>
        <span style={{ fontSize: 12, fontWeight: 800, color: verlopen ? "#b0452b" : NAVY }}>{v.status}{verlopen ? " — termijn verstreken" : ""}</span>
      </div>
      <div style={{ fontSize: 13, color: "#475569", display: "grid", gap: 2 }}>
        <span><strong>Bestuursorgaan:</strong> {v.orgaan} · <strong>Soort:</strong> {v.bron === "regel" ? "regel of verordening" : "brief"}</span>
        <span><strong>Verzoeker:</strong> {v.verzoeker || "—"} · <strong>Account:</strong> {v.gebruiker.naam || "—"} ({v.gebruiker.email || "—"})</span>
        <span><strong>Machtiging gegeven:</strong> {datum(v.machtigingOp)} · <strong>Aangevraagd:</strong> {datum(v.aangemaakt)}</span>
        {v.ingediendOp && <span><strong>Verstuurd:</strong> {datum(v.ingediendOp)} naar {v.ontvanger} · <strong>Uiterste beslisdatum:</strong> {datum(v.deadline)}</span>}
        {v.ingebrekeOp && <span><strong>In gebreke gesteld:</strong> {datum(v.ingebrekeOp)}</span>}
        {v.notitie && <span><strong>Notitie:</strong> {v.notitie}</span>}
      </div>
      {v.tekst && (
        <>
          <Button size="sm" variant="outline" onClick={() => setToonTekst(!toonTekst)} style={{ justifySelf: "start" }}>{toonTekst ? "Verberg de tekst" : "Toon de tekst"}</Button>
          {toonTekst && <pre style={{ whiteSpace: "pre-wrap", fontFamily: "Georgia, serif", fontSize: 13, lineHeight: 1.55, background: "#f8fafc", borderRadius: 8, padding: 12, maxHeight: 460, overflow: "auto", margin: 0 }}>{v.tekst}</pre>}
        </>
      )}

      {v.status === "wacht_op_goedkeuring" && (
        <div style={{ display: "grid", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Input value={ontvanger} onChange={(e) => setOntvanger(e.target.value)} placeholder="Woo-adres van het bestuursorgaan, bijv. woo@gemeente.nl" style={{ flex: 1, minWidth: 260 }} data-testid={`input-ontvanger-${v.id}`} />
            <Button onClick={() => verstuur.mutate()} disabled={!ontvanger || verstuur.isPending} style={{ background: NAVY }} data-testid={`button-verstuur-${v.id}`}>
              <Send size={14} /> Verstuur namens de ondernemer
            </Button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>Het verzoek gaat per e-mail vanaf info@openregio.nl; antwoorden komen daar binnen. De ondernemer krijgt een kopie.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
            <Textarea value={reden} onChange={(e) => setReden(e.target.value)} placeholder="Reden om niet in te dienen (de ondernemer krijgt deze te zien)" style={{ flex: 1, minWidth: 260, minHeight: 60 }} />
            <Button variant="outline" onClick={() => afwijzen.mutate()} disabled={!reden.trim() || afwijzen.isPending}>Niet indienen</Button>
          </div>
        </div>
      )}
      {v.status === "verstuurd" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
          {verlopen && (
            <>
              <Button onClick={() => { if (window.confirm("Heeft het bestuursorgaan de termijn met twee weken verdaagd? Controleer eerst de mailbox. Pas als er geen verdaging is (of die ook verstreken is), verstuur je de ingebrekestelling.\n\nNu versturen?")) ingebreke.mutate(); }} disabled={ingebreke.isPending} style={{ background: "#b0452b" }}>Ingebrekestelling versturen</Button>
              <span style={{ fontSize: 12, color: "#8a5300", alignSelf: "center" }}>Controleer eerst of het orgaan de termijn heeft verdaagd (+2 weken).</span>
            </>
          )}
          <Button variant="outline" onClick={() => status.mutate("beantwoord")}>Markeer als beantwoord</Button>
        </div>
      )}
      {(v.status === "ingebreke_gesteld" || v.status === "beantwoord") && (
        <div style={{ display: "flex", gap: 8, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
          {v.status === "ingebreke_gesteld" && <Button variant="outline" onClick={() => status.mutate("beantwoord")}>Markeer als beantwoord</Button>}
          <Button variant="outline" onClick={() => status.mutate("afgerond")}>Afronden</Button>
        </div>
      )}
    </div>
  );
}

export default function AdminWooVerzoekenPage() {
  usePageTitle("Woo-verzoeken namens ondernemers — beheer");
  const lijst = useQuery<Verzoek[]>({ queryKey: ["/api/admin/woo-namens"] });
  const wachtend = (lijst.data || []).filter((v) => v.status === "wacht_op_goedkeuring");
  const overig = (lijst.data || []).filter((v) => v.status !== "wacht_op_goedkeuring");
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 64px", display: "grid", gap: 18 }}>
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:underline"><ArrowLeft className="w-4 h-4 mr-1" /> Beheer</Link>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: NAVY }}>Woo-verzoeken namens ondernemers</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#475569" }}>Controleer elk verzoek voordat het namens de ondernemer naar het bestuursorgaan gaat.</p>
      </div>
      {lijst.isLoading && <p>Laden…</p>}
      {lijst.isError && <p style={{ color: "#b0452b" }}>Ophalen mislukt.</p>}
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: NAVY }}>Wacht op goedkeuring ({wachtend.length})</h2>
      {wachtend.length ? wachtend.map((v) => <Rij key={v.id} v={v} />) : <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Niets te doen.</p>}
      <h2 style={{ margin: "10px 0 0", fontSize: 16, fontWeight: 800, color: NAVY }}>Alle verzoeken</h2>
      {overig.length ? overig.map((v) => <Rij key={v.id} v={v} />) : <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Nog geen verstuurde verzoeken.</p>}
    </div>
  );
}
