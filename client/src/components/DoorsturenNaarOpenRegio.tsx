import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2, Send } from "lucide-react";

const NAVY = "#0b2240";

/**
 * Stuurt het gekozen document (of de geplakte tekst) per e-mail naar info@openregio.nl.
 * Alleen na uitdrukkelijke toestemming; zonder toestemming blijft de knop uit.
 */
export function DoorsturenNaarOpenRegio({ soort, bestanden, tekst }: { soort: "brief" | "contract"; bestanden: File[]; tekst: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [bericht, setBericht] = useState("");
  const [toestemming, setToestemming] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const heeftDocument = bestanden.length > 0 || tekst.trim().length >= 20;
  const woord = soort === "contract" ? "contract" : "brief";

  const mut = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("soort", soort);
      form.append("bericht", bericht.trim());
      form.append("toestemming", String(toestemming));
      if (bestanden.length) for (const b of bestanden) form.append("file", b);
      else form.append("tekst", tekst.trim());
      const r = await fetch("/api/brieven/naar-openregio", { method: "POST", body: form, credentials: "include" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Versturen lukte niet.");
    },
    onSuccess: () => { setVerstuurd(true); setBericht(""); setToestemming(false); },
    onError: (e: Error) => toast({ title: "Versturen mislukt", description: e.message, variant: "destructive" }),
  });

  if (verstuurd) {
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "#e8f5ee", border: "1px solid #bfe3cf", borderRadius: 12, padding: 16 }}>
        <CheckCircle2 size={18} style={{ color: "#1f6b45", flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 14, color: "#1f4d36" }}>
          <strong>Verstuurd naar OpenRegio.</strong> We reageren via het e-mailadres van je account.{" "}
          <button onClick={() => setVerstuurd(false)} style={{ background: "none", border: 0, padding: 0, color: NAVY, fontWeight: 700, cursor: "pointer" }}>Nog een {woord} sturen</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 18, background: "#f8fafc" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Send size={17} style={{ color: NAVY }} />
        <strong style={{ fontSize: 15, color: NAVY, flex: 1, minWidth: 200 }}>Wil je dat OpenRegio meekijkt?</strong>
        {!open && <Button size="sm" variant="outline" onClick={() => setOpen(true)} data-testid="button-naar-openregio-open">Stuur je {woord} naar OpenRegio</Button>}
      </div>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
        Stuur je {woord} naar info@openregio.nl, met je vraag erbij. We reageren via het e-mailadres van je account.
      </p>

      {open && (
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          <div style={{ fontSize: 13, color: heeftDocument ? "#1f6b45" : "#8a5300" }}>
            {heeftDocument
              ? bestanden.length
                ? `Meegestuurd: ${bestanden.map((b) => b.name).join(", ")}`
                : "Meegestuurd: de tekst die je hierboven hebt geplakt"
              : `Kies eerst hierboven je ${woord} of plak de tekst.`}
          </div>
          <Textarea value={bericht} onChange={(e) => setBericht(e.target.value)} placeholder="Je vraag of toelichting (optioneel)" style={{ minHeight: 90, fontSize: 14, background: "white" }} data-testid="textarea-naar-openregio" />
          <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, color: "#334155", lineHeight: 1.55, cursor: "pointer" }}>
            <input type="checkbox" checked={toestemming} onChange={(e) => setToestemming(e.target.checked)} style={{ marginTop: 3 }} data-testid="checkbox-naar-openregio" />
            <span>
              Ik geef toestemming om mijn {woord}, met de persoonsgegevens die erin staan, per e-mail naar OpenRegio te sturen. OpenRegio bewaart
              het in de mailbox zolang dat nodig is om mijn vraag te behandelen (maximaal 2 jaar). Zie de <Link href="/privacy" style={{ color: NAVY, fontWeight: 700 }}>privacyverklaring</Link>.
            </span>
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button disabled={!heeftDocument || !toestemming || mut.isPending} onClick={() => mut.mutate()} style={{ background: NAVY }} data-testid="button-naar-openregio-verstuur">
              {mut.isPending ? <><Loader2 size={14} className="animate-spin" /> Versturen…</> : <><Send size={14} /> Verstuur naar OpenRegio</>}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Annuleren</Button>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>OpenRegio geeft geen juridisch advies en treedt niet namens je op. Termijnen in je {woord} lopen gewoon door.</p>
        </div>
      )}
    </div>
  );
}
