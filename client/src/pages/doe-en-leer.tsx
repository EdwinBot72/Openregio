import { useState, type CSSProperties } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { CalendarDays, MapPin, Users, GraduationCap, Loader2 } from "lucide-react";

const BLAUW = "#15233b";
const ORANJE = "#e8772e";
const DISP = "'Barlow Condensed', 'Barlow', sans-serif";

type Workshop = {
  id: string; titel: string; beschrijving: string; datum: string; locatie: string;
  regio: string; prijsCent: number; plaatsen: number; plaatsenVrij: number; bedrijfsnaam?: string;
  afbeelding?: string;
};

function euro(cent: number) {
  return cent === 0 ? "Gratis" : "€ " + (cent / 100).toFixed(2).replace(".", ",");
}
function datum(d: string) {
  try { return new Date(d).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }); }
  catch { return d; }
}

export default function DoeEnLeerPage() {
  usePageTitle("Doe & leer — OpenRegio");
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ naam: "", email: "", aantal: 1 });

  const { data: workshops = [], isLoading } = useQuery<Workshop[]>({
    queryKey: ["/api/workshops"],
    queryFn: async () => (await (await fetch("/api/workshops", { credentials: "include" })).json()),
  });

  const boek = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/workshops/${id}/boeking`, form);
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Geboekt!", description: "Je plek is gereserveerd. De ondernemer neemt contact op." });
      setOpen(null); setForm({ naam: "", email: "", aantal: 1 });
      qc.invalidateQueries({ queryKey: ["/api/workshops"] });
    },
    onError: (err) => toast({ title: "Boeken mislukt", description: parseApiError(err), variant: "destructive" }),
  });

  return (
    <div style={{ background: "#faf9f5", minHeight: "100vh", padding: "40px clamp(16px,4vw,40px) 72px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: ORANJE, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap style={{ width: 24, height: 24, color: "#fff" }} />
          </div>
          <h1 style={{ fontFamily: DISP, textTransform: "uppercase", fontSize: "clamp(30px,4vw,46px)", fontWeight: 700, color: BLAUW, margin: 0, lineHeight: 1 }}>Doe &amp; leer</h1>
        </div>
        <p style={{ fontSize: 16, color: "#5a6680", margin: "0 0 32px", maxWidth: "58ch", lineHeight: 1.6 }}>
          Workshops en activiteiten, gegeven door ondernemers uit jouw regio. Leer een vak van iemand die het elke dag doet.
        </p>

        {isLoading && <p style={{ color: "#5a6680" }}>Workshops laden…</p>}

        {!isLoading && workshops.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #e6e2d6", borderRadius: 14, padding: "40px 24px", textAlign: "center" }}>
            <GraduationCap style={{ width: 32, height: 32, color: "#cbd5e1", margin: "0 auto 10px" }} />
            <p style={{ fontWeight: 700, color: BLAUW, margin: 0 }}>Nog geen workshops in jouw regio</p>
            <p style={{ color: "#5a6680", margin: "6px 0 0", fontSize: 14 }}>Ben je ondernemer? Deel je vakkennis en bied hier je eerste workshop aan.</p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
          {workshops.map((w) => (
            <div key={w.id} style={{ background: "#fff", border: "1px solid #e6e2d6", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {w.afbeelding && (
                <div style={{ height: 170, overflow: "hidden" }}>
                  <img src={w.afbeelding} alt={w.titel} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
              )}
              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <div style={{ fontFamily: DISP, textTransform: "uppercase", fontSize: 21, fontWeight: 700, color: BLAUW, lineHeight: 1.05 }}>{w.titel}</div>
              {w.bedrijfsnaam && <div style={{ fontSize: 13, color: ORANJE, fontStyle: "italic", marginTop: 3 }}>{w.bedrijfsnaam}</div>}
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: "12px 0 14px", flexGrow: 1 }}>{w.beschrijving}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 13.5, color: "#5a6680", marginBottom: 14 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><CalendarDays style={{ width: 15, height: 15, color: ORANJE }} /> {datum(w.datum)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><MapPin style={{ width: 15, height: 15, color: ORANJE }} /> {w.locatie}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Users style={{ width: 15, height: 15, color: ORANJE }} /> {w.plaatsenVrij} van {w.plaatsen} plaatsen vrij</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: open === w.id ? 14 : 0 }}>
                <span style={{ fontFamily: DISP, fontSize: 22, fontWeight: 700, color: BLAUW }}>{euro(w.prijsCent)}</span>
                <button
                  onClick={() => setOpen(open === w.id ? null : w.id)}
                  disabled={w.plaatsenVrij <= 0}
                  style={{ fontFamily: DISP, textTransform: "uppercase", letterSpacing: ".04em", padding: "10px 20px", borderRadius: 9, fontSize: 14.5, fontWeight: 700, border: "none", cursor: w.plaatsenVrij <= 0 ? "not-allowed" : "pointer", background: w.plaatsenVrij <= 0 ? "#cbd5e1" : ORANJE, color: "#fff" }}
                >
                  {w.plaatsenVrij <= 0 ? "Vol" : open === w.id ? "Sluiten" : "Boeken"}
                </button>
              </div>

              {open === w.id && w.plaatsenVrij > 0 && (
                <div style={{ borderTop: "1px solid #f0ede4", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <input placeholder="Je naam" value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} style={inp} />
                  <input placeholder="Je e-mailadres" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inp} />
                  <input placeholder="Aantal" type="number" min={1} max={w.plaatsenVrij} value={form.aantal} onChange={(e) => setForm({ ...form, aantal: Math.max(1, parseInt(e.target.value) || 1) })} style={inp} />
                  <button
                    onClick={() => boek.mutate(w.id)}
                    disabled={!form.naam || !form.email || boek.isPending}
                    style={{ fontFamily: DISP, textTransform: "uppercase", letterSpacing: ".04em", padding: "11px", borderRadius: 9, fontSize: 14.5, fontWeight: 700, border: "none", cursor: "pointer", background: BLAUW, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                  >
                    {boek.isPending && <Loader2 style={{ width: 15, height: 15 }} className="animate-spin" />} Reserveer je plek
                  </button>
                  <p style={{ fontSize: 11.5, color: "#94a3b8", margin: 0, textAlign: "center" }}>Reservering; betaling regel je met de ondernemer.</p>
                </div>
              )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const inp: CSSProperties = {
  padding: "10px 12px", borderRadius: 8, border: "1px solid #e6e2d6", fontSize: 14, fontFamily: "inherit", outline: "none", width: "100%",
};
