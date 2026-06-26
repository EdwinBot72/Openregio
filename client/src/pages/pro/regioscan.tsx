import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest, parseApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { exportRegioScanPdf } from "@/lib/regioscan-pdf";
import {
  Compass,
  AlertTriangle,
  TrendingUp,
  ScrollText,
  FileSearch,
  Lightbulb,
  ListChecks,
  Trash2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  FileText,
  Copy,
  Check,
  Loader2,
  Calendar,
  FolderOpen,
  RotateCw,
  Download,
  Mail,
  Send,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import type { RegioScan, RegioScanResult, RegioScanItem, RegioScanActie, WooDossier } from "@shared/schema";
import { regioScanResultSchema } from "@shared/schema";

const PRIO_COLOR: Record<string, { bg: string; fg: string; label: string }> = {
  hoog: { bg: "#fef2f2", fg: "#b91c1c", label: "Hoog" },
  midden: { bg: "#fff7ed", fg: "#c2410c", label: "Midden" },
  laag: { bg: "#f0f9ff", fg: "#1f5fae", label: "Laag" },
};

function relTime(d: string | Date | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  return formatDistanceToNow(dt, { addSuffix: true, locale: nl });
}

function ScoreBalk({
  label,
  value,
  kleur,
  toelichting,
  testId,
}: {
  label: string;
  value: number;
  kleur: string;
  toelichting?: string;
  testId: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div data-testid={testId}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0b2240" }}>{label}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: kleur }} data-testid={`${testId}-value`}>{pct}</span>
      </div>
      <div style={{ height: 10, background: "#eef2f7", borderRadius: 999, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: kleur, borderRadius: 999, transition: "width 400ms" }} />
      </div>
      {toelichting && (
        <p style={{ fontSize: 12, color: "#475569", margin: "8px 0 0", lineHeight: 1.55 }}>{toelichting}</p>
      )}
    </div>
  );
}

function UitkomstBlok({
  icon: Icon,
  titel,
  items,
  kleur,
  testId,
  legeTekst,
}: {
  icon: React.ElementType;
  titel: string;
  items: RegioScanItem[];
  kleur: string;
  testId: string;
  legeTekst: string;
}) {
  return (
    <section className="openregio-public-card" data-testid={testId} style={{ marginBottom: 14 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", width: 32, height: 32, borderRadius: 10, background: `${kleur}1a`, alignItems: "center", justifyContent: "center" }}>
          <Icon className="h-4 w-4" style={{ color: kleur }} />
        </span>
        <span>{titel}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginLeft: "auto" }}>{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{legeTekst}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((it, i) => (
            <div
              key={`${testId}-${i}`}
              data-testid={`${testId}-item-${i}`}
              style={{
                border: "1px solid #e6ebf2",
                borderRadius: 12,
                padding: "12px 14px",
                background: "#fafbfd",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0b2240", marginBottom: 4 }}>{it.titel}</div>
              {it.toelichting && (
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{it.toelichting}</div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {it.datum && it.datum !== "onbekend" && (
                  <span
                    style={{ fontSize: 11, color: "#0b2240", background: "#dbeafe", padding: "3px 8px", borderRadius: 999, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}
                    data-testid={`${testId}-datum-${i}`}
                  >
                    <Calendar className="h-3 w-3" />
                    {it.datum}
                  </span>
                )}
                {it.bron && (
                  <span style={{ fontSize: 11, color: "#64748b", background: "#eef2f7", padding: "3px 8px", borderRadius: 999 }}>
                    Bron: {it.bron}
                  </span>
                )}
                {it.teVerifieren !== false && (
                  <span style={{ fontSize: 11, color: "#92400e", background: "#fef3c7", padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>
                    Te verifiëren
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ActieBlok({ acties }: { acties: RegioScanActie[] }) {
  return (
    <section className="openregio-public-card" data-testid="block-acties" style={{ marginBottom: 14 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", width: 32, height: 32, borderRadius: 10, background: "#1f5fae1a", alignItems: "center", justifyContent: "center" }}>
          <ListChecks className="h-4 w-4" style={{ color: "#1f5fae" }} />
        </span>
        <span>Aanbevolen acties</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginLeft: "auto" }}>{acties.length}</span>
      </h2>
      {acties.length === 0 ? (
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Geen acties voorgesteld.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {acties.map((a, i) => {
            const p = PRIO_COLOR[a.prio] ?? PRIO_COLOR.midden;
            return (
              <div
                key={`actie-${i}`}
                data-testid={`block-acties-item-${i}`}
                style={{ border: "1px solid #e6ebf2", borderRadius: 12, padding: "12px 14px", background: "#fafbfd" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", background: p.bg, color: p.fg, padding: "3px 8px", borderRadius: 999 }}>
                    Prio {p.label}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#0b2240" }}>{a.titel}</span>
                </div>
                {a.toelichting && (
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.55 }}>{a.toelichting}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function IndienBlok({
  scan,
  dossier,
  defaultEmail,
  onIndien,
  loading,
}: {
  scan: RegioScan;
  dossier: WooDossier | undefined;
  defaultEmail: string;
  onIndien: (kanaal: "email" | "post", ontvanger: string) => void;
  loading: boolean;
}) {
  const [kanaal, setKanaal] = useState<"email" | "post">("email");
  const [ontvanger, setOntvanger] = useState<string>("");

  const reedsIngediend = !!dossier?.ingediendOp;

  if (reedsIngediend) {
    const isEmail = dossier!.indienKanaal === "email";
    return (
      <section className="openregio-public-card" data-testid="indien-status-blok" style={{ marginTop: 14, background: "#f0fdf4", borderColor: "#bbf7d0" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 32, height: 32, borderRadius: 10, background: "#16a34a1a", alignItems: "center", justifyContent: "center" }}>
            <Check className="h-4 w-4" style={{ color: "#16a34a" }} />
          </span>
          Ingediend bij gemeente {scan.gemeente}
        </h2>
        <div style={{ fontSize: 13, color: "#166534", lineHeight: 1.7 }} data-testid="text-indien-status">
          <div><strong>Kanaal:</strong> {isEmail ? "E-mail" : "Post (zelf versturen)"}</div>
          <div data-testid="text-indien-ontvanger"><strong>{isEmail ? "Verstuurd naar" : "Ontvanger"}:</strong> {dossier!.indienOntvanger}</div>
          <div><strong>Datum:</strong> {new Date(dossier!.ingediendOp!).toLocaleString("nl-NL")}</div>
          {dossier!.deadline && (
            <div><strong>Wettelijke termijn (28 dagen):</strong> {new Date(dossier!.deadline).toLocaleDateString("nl-NL")}</div>
          )}
        </div>
        <p style={{ fontSize: 12, color: "#475569", margin: "10px 0 0", lineHeight: 1.6 }}>
          Status en eventuele reactie kun je bijhouden in je <Link href="/regels/woo" className="openregio-link" data-testid="link-woo-bibliotheek-indien">Woo-bibliotheek</Link>.
          {isEmail && " De gemeente kan rechtstreeks reageren op je eigen e-mailadres (Reply-to)."}
        </p>
      </section>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const waarde = ontvanger.trim();
    if (!waarde) return;
    if (kanaal === "email") {
      // Veiligheid: e-mailadres van de gemeente is verplicht en mag NOOIT
      // het eigen e-mailadres van de ingelogde gebruiker zijn — anders
      // wordt het verzoek per ongeluk naar de ondernemer zelf gestuurd.
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(waarde)) return;
      if (defaultEmail && waarde.toLowerCase() === defaultEmail.trim().toLowerCase()) {
        alert("Het e-mailadres mag niet je eigen adres zijn — vul het officiële e-mailadres van de gemeente in.");
        return;
      }
    }
    onIndien(kanaal, waarde);
  }

  return (
    <section className="openregio-public-card" data-testid="indien-blok" style={{ marginTop: 14 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-flex", width: 32, height: 32, borderRadius: 10, background: "#1f5fae1a", alignItems: "center", justifyContent: "center" }}>
          <Send className="h-4 w-4" style={{ color: "#1f5fae" }} />
        </span>
        Indienen bij gemeente {scan.gemeente}
      </h2>
      <p style={{ fontSize: 13, color: "#475569", margin: "0 0 12px", lineHeight: 1.6 }}>
        Verstuur het opgeslagen concept Woo-verzoek direct naar de gemeente via e-mail, of registreer dat je het per post verstuurt. We starten daarmee automatisch de wettelijke termijn van 28 dagen in je dossier.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#0b2240", cursor: "pointer" }}>
            <input
              type="radio"
              name="indien-kanaal"
              value="email"
              checked={kanaal === "email"}
              onChange={() => setKanaal("email")}
              data-testid="radio-kanaal-email"
            />
            <Mail className="h-4 w-4" style={{ color: "#1f5fae" }} />
            E-mail
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#0b2240", cursor: "pointer" }}>
            <input
              type="radio"
              name="indien-kanaal"
              value="post"
              checked={kanaal === "post"}
              onChange={() => setKanaal("post")}
              data-testid="radio-kanaal-post"
            />
            <FileText className="h-4 w-4" style={{ color: "#1f5fae" }} />
            Post (zelf versturen)
          </label>
        </div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2240" }}>
            {kanaal === "email"
              ? `E-mailadres gemeente ${scan.gemeente}`
              : `Postadres gemeente ${scan.gemeente}`}
          </span>
          <input
            type={kanaal === "email" ? "email" : "text"}
            value={ontvanger}
            onChange={(e) => setOntvanger(e.target.value)}
            placeholder={
              kanaal === "email"
                ? `bv. info@${scan.gemeente.toLowerCase().replace(/\s+/g, "")}.nl`
                : "bv. Gemeente X, Postbus 1, 1234 AB Plaats"
            }
            className="openregio-input"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14 }}
            data-testid="input-indien-ontvanger"
            required
            minLength={3}
            maxLength={500}
          />
          {kanaal === "email" && (
            <span style={{ fontSize: 11, color: "#64748b" }}>
              Reacties komen rechtstreeks bij jouw e-mailadres ({defaultEmail || "ingelogde account"}) terecht.
            </span>
          )}
        </label>
        <div>
          <button
            type="submit"
            className="openregio-button openregio-button-primary"
            disabled={loading}
            data-testid="button-indienen-gemeente"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 6, display: "inline-block" }} />
                {kanaal === "email" ? "Versturen…" : "Registreren…"}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
                {kanaal === "email"
                  ? `Verstuur Woo-verzoek per e-mail`
                  : `Registreer als per post verzonden`}
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function ResultaatWeergave({
  scan,
  dossier,
  onNieuw,
  onOpnieuwScannen,
  onWooConcept,
  onNaarDossier,
  onIndien,
  defaultEmail,
  wooLoading,
  dossierLoading,
  rescanLoading,
  indienLoading,
}: {
  scan: RegioScan;
  dossier: WooDossier | undefined;
  onNieuw: () => void;
  onOpnieuwScannen: () => void;
  onWooConcept: () => void;
  onNaarDossier: () => void;
  onIndien: (kanaal: "email" | "post", ontvanger: string) => void;
  defaultEmail: string;
  wooLoading: boolean;
  dossierLoading: boolean;
  rescanLoading: boolean;
  indienLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const parsed = regioScanResultSchema.safeParse(scan.result);
  if (!parsed.success) {
    return (
      <section className="openregio-public-card" data-testid="resultaat-ongeldig">
        <h2 style={{ marginTop: 0 }}>
          <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b", marginRight: 6, display: "inline-block", verticalAlign: "-3px" }} />
          Scan kan niet worden weergegeven
        </h2>
        <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6 }}>
          Deze scan kan niet worden weergegeven, mogelijk doordat het opslagformaat sinds de scan is gewijzigd. Voer een nieuwe scan uit om de resultaten opnieuw te bekijken.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button
            type="button"
            className="openregio-button openregio-button-primary openregio-button-small"
            onClick={onOpnieuwScannen}
            disabled={rescanLoading}
            data-testid="button-ongeldig-opnieuw-scannen"
          >
            {rescanLoading ? "Bezig…" : "Voer nieuwe scan uit"}
          </button>
          <button
            type="button"
            className="openregio-button openregio-button-outline openregio-button-small"
            onClick={onNieuw}
            data-testid="button-ongeldig-nieuw"
          >
            Nieuwe scan starten
          </button>
        </div>
      </section>
    );
  }
  const result: RegioScanResult = parsed.data;

  async function copyConcept() {
    if (!scan.wooConcept) return;
    try {
      await navigator.clipboard.writeText(scan.wooConcept);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* niet kritiek */
    }
  }

  return (
    <div data-testid="resultaat-weergave">
      {/* Kop met scan-info */}
      <section className="openregio-public-card" data-testid="resultaat-kop">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ flex: "1 1 300px" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", color: "#1f5fae", marginBottom: 4 }}>
              RegioScan
            </div>
            <h2 style={{ margin: 0 }} data-testid="text-scan-titel">{scan.branche} · {scan.gemeente}</h2>
            {result.samenvatting && (
              <p style={{ fontSize: 14, color: "#374151", margin: "8px 0 0", lineHeight: 1.6 }} data-testid="text-samenvatting">
                {result.samenvatting}
              </p>
            )}
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
              Uitgevoerd {relTime(scan.createdAt)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="openregio-button openregio-button-outline"
              onClick={() => exportRegioScanPdf(scan)}
              data-testid="button-download-pdf"
              title="Download dit RegioScan-rapport als PDF"
            >
              <Download className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
              Download als PDF
            </button>
            <button
              type="button"
              className="openregio-button openregio-button-outline"
              onClick={onOpnieuwScannen}
              disabled={rescanLoading}
              data-testid="button-opnieuw-scannen"
              title={`Opnieuw scannen voor ${scan.branche} in ${scan.gemeente}`}
            >
              {rescanLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 6, display: "inline-block" }} />
                  Bezig…
                </>
              ) : (
                <>
                  <RotateCw className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
                  Opnieuw scannen
                </>
              )}
            </button>
            <button
              type="button"
              className="openregio-button openregio-button-outline"
              onClick={onNieuw}
              data-testid="button-nieuwe-scan"
            >
              <RefreshCw className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
              Nieuwe scan
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 18 }}>
          <ScoreBalk
            label="Risicoscore"
            value={result.scoreRisico}
            kleur="#dc2626"
            toelichting={result.risicoToelichting}
            testId="score-risico"
          />
          <ScoreBalk
            label="Kansenscore"
            value={result.scoreKans}
            kleur="#16a34a"
            toelichting={result.kansenToelichting}
            testId="score-kansen"
          />
        </div>
      </section>

      {/* 6 uitkomstblokken in een grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
        <UitkomstBlok
          icon={ScrollText}
          titel="Lokale besluiten"
          items={result.besluiten}
          kleur="#1f5fae"
          testId="block-besluiten"
          legeTekst="Geen specifieke besluiten gevonden."
        />
        <UitkomstBlok
          icon={Compass}
          titel="Regels & verordeningen"
          items={result.regels}
          kleur="#0b2240"
          testId="block-regels"
          legeTekst="Geen relevante regels gevonden."
        />
        <UitkomstBlok
          icon={TrendingUp}
          titel="Kansen"
          items={result.kansen}
          kleur="#16a34a"
          testId="block-kansen"
          legeTekst="Geen kansen aangetroffen."
        />
        <UitkomstBlok
          icon={FileSearch}
          titel="Documenten om op te vragen"
          items={result.documenten}
          kleur="#f28a1a"
          testId="block-documenten"
          legeTekst="Geen documenten voorgesteld."
        />
        <UitkomstBlok
          icon={ShieldAlert}
          titel="Risico's & valkuilen"
          items={result.risicos}
          kleur="#dc2626"
          testId="block-risicos"
          legeTekst="Geen specifieke risico's geïdentificeerd."
        />
        <ActieBlok acties={result.acties} />
      </div>

      {/* Woo-concept actiestrook */}
      <section className="openregio-public-card" data-testid="woo-concept-blok" style={{ marginTop: 14 }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", width: 32, height: 32, borderRadius: 10, background: "#1f5fae1a", alignItems: "center", justifyContent: "center" }}>
            <FileText className="h-4 w-4" style={{ color: "#1f5fae" }} />
          </span>
          Concept Woo-verzoek
        </h2>
        <p style={{ fontSize: 13, color: "#475569", margin: "0 0 12px", lineHeight: 1.6 }}>
          Genereer een kant-en-klaar concept Woo-verzoek voor gemeente {scan.gemeente}, gebaseerd op de aanbevolen documenten. Je kunt het concept kopiëren of opslaan als ondernemersdossier.
        </p>

        {!scan.wooConcept ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="openregio-button openregio-button-primary"
              onClick={onWooConcept}
              disabled={wooLoading}
              data-testid="button-genereer-woo"
            >
              {wooLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 6, display: "inline-block" }} />
                  Concept wordt opgesteld…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
                  Genereer concept Woo-verzoek
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="openregio-soft-box" style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#0b2240", lineHeight: 1.7, maxHeight: 360, overflowY: "auto" }} data-testid="text-woo-concept">
              {scan.wooConcept}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button
                type="button"
                className="openregio-button openregio-button-outline"
                onClick={copyConcept}
                data-testid="button-kopieer-woo"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
                    Gekopieerd
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
                    Kopieer concept
                  </>
                )}
              </button>
              <button
                type="button"
                className="openregio-button openregio-button-outline"
                onClick={onWooConcept}
                disabled={wooLoading}
                data-testid="button-herzie-woo"
              >
                {wooLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 6, display: "inline-block" }} />
                    Herzien…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
                    Concept herzien
                  </>
                )}
              </button>
              {scan.wooDossierId ? (
                <Link
                  href="/regels/woo"
                  className="openregio-button openregio-button-primary"
                  data-testid="link-bekijk-dossier"
                >
                  Bekijk dossier
                  <ArrowRight className="h-4 w-4" style={{ marginLeft: 6, display: "inline-block" }} />
                </Link>
              ) : (
                <button
                  type="button"
                  className="openregio-button openregio-button-primary"
                  onClick={onNaarDossier}
                  disabled={dossierLoading}
                  data-testid="button-naar-dossier"
                >
                  {dossierLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 6, display: "inline-block" }} />
                      Opslaan…
                    </>
                  ) : (
                    <>
                      Opslaan als ondernemersdossier
                      <ArrowRight className="h-4 w-4" style={{ marginLeft: 6, display: "inline-block" }} />
                    </>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </section>

      {/* Indien-blok: zichtbaar zodra een ondernemersdossier is opgeslagen */}
      {scan.wooDossierId && scan.wooConcept && (
        <IndienBlok
          scan={scan}
          dossier={dossier}
          defaultEmail={defaultEmail}
          onIndien={onIndien}
          loading={indienLoading}
        />
      )}

      {/* Persistente CTA: altijd naar ondernemersdossier-overzicht */}
      <section
        className="openregio-public-card"
        data-testid="dossier-cta-blok"
        style={{
          marginTop: 14,
          background: "linear-gradient(135deg, #eaf2ff 0%, #f7faff 100%)",
          borderColor: "#cfe1ff",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span style={{ display: "inline-flex", width: 44, height: 44, borderRadius: 12, background: "#1f5fae", alignItems: "center", justifyContent: "center" }}>
          <FolderOpen className="h-5 w-5" style={{ color: "#fff" }} />
        </span>
        <div style={{ flex: "1 1 220px" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0b2240" }}>
            Mijn ondernemersdossier (Woo-bibliotheek)
          </div>
          <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
            Bekijk al je opgeslagen Woo-dossiers, lopende verzoeken en correspondentie op één plek. Eerdere RegioScans staan onderaan deze pagina.
          </div>
        </div>
        <Link
          href="/regels/woo"
          className="openregio-button openregio-button-primary"
          data-testid="link-naar-ondernemersdossier"
        >
          Open Woo-bibliotheek
          <ArrowRight className="h-4 w-4" style={{ marginLeft: 6, display: "inline-block" }} />
        </Link>
      </section>
    </div>
  );
}

function ScanFormulier({
  onResult,
}: {
  onResult: (scan: RegioScan) => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [branche, setBranche] = useState<string>(user?.category ?? "");
  const [gemeente, setGemeente] = useState<string>(user?.region ?? "");
  const [extraContext, setExtraContext] = useState<string>("");

  const runMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/regioscan/run", {
        branche: branche.trim(),
        gemeente: gemeente.trim(),
        extraContext: extraContext.trim() || undefined,
      });
      return (await res.json()) as RegioScan;
    },
    onSuccess: (scan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/regioscan"] });
      onResult(scan);
      toast({ title: "RegioScan klaar", description: "Bekijk hieronder de uitkomsten van je scan." });
    },
    onError: (err: any) => {
      toast({
        title: "Scan mislukt",
        description: parseApiError(err),
        variant: "destructive",
      });
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (branche.trim().length < 2 || gemeente.trim().length < 2) {
      toast({ title: "Vul branche en gemeente in", description: "Beide velden zijn verplicht.", variant: "destructive" });
      return;
    }
    runMutation.mutate();
  }

  return (
    <form
      onSubmit={submit}
      className="openregio-public-card"
      data-testid="formulier-regioscan"
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <div>
        <h2 style={{ margin: 0 }}>
          <Compass className="h-5 w-5" style={{ color: "#1f5fae", marginRight: 6, display: "inline-block", verticalAlign: "-3px" }} />
          Start je RegioScan
        </h2>
        <p style={{ fontSize: 13, color: "#475569", margin: "6px 0 0", lineHeight: 1.6 }}>
          Vul je branche en gemeente in. We brengen lokale besluiten, regels, kansen, op te vragen documenten, risico's en concrete acties voor je in kaart — inclusief risico- en kansenscore.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2240" }}>Branche</span>
          <input
            type="text"
            value={branche}
            onChange={(e) => setBranche(e.target.value)}
            placeholder="bv. Horeca, Retail, Bouw"
            className="openregio-input"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14 }}
            data-testid="input-branche"
            required
            minLength={2}
            maxLength={120}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2240" }}>Gemeente</span>
          <input
            type="text"
            value={gemeente}
            onChange={(e) => setGemeente(e.target.value)}
            placeholder="bv. Utrecht, Zwolle, Eindhoven"
            className="openregio-input"
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14 }}
            data-testid="input-gemeente"
            required
            minLength={2}
            maxLength={120}
          />
        </label>
      </div>

      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#0b2240" }}>Extra context (optioneel)</span>
        <textarea
          value={extraContext}
          onChange={(e) => setExtraContext(e.target.value)}
          placeholder="Specifieke vraag, type onderneming, locatie, of een lopend traject?"
          className="openregio-input"
          style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", fontSize: 14, minHeight: 80, resize: "vertical" }}
          data-testid="input-extra-context"
          maxLength={2000}
          rows={3}
        />
      </label>

      <div>
        <button
          type="submit"
          className="openregio-button openregio-button-primary"
          disabled={runMutation.isPending}
          data-testid="button-start-scan"
        >
          {runMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 6, display: "inline-block" }} />
              Scan loopt… (kan ~10-20s duren)
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" style={{ marginRight: 6, display: "inline-block" }} />
              Start RegioScan
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function UpgradeBlok() {
  return (
    <section className="openregio-public-card" data-testid="upgrade-blok">
      <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Compass className="h-5 w-5" style={{ color: "#f28a1a" }} />
        RegioScan voor Pro
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
        De RegioScan brengt voor jouw branche en gemeente in kaart welke besluiten, regels, kansen, op te vragen documenten en risico's er nu spelen. Inclusief twee scores (risico en kansen), concrete acties en een concept Woo-verzoek dat je kunt opslaan als ondernemersdossier.
      </p>
      <ul>
        <li>6 uitkomstblokken: lokale besluiten, regels, kansen, documenten, risico's en acties.</li>
        <li>Risico- en kansenscore (0-100) met toelichting per branche en gemeente.</li>
        <li>Genereer in één klik een concept Woo-verzoek en sla op als dossier.</li>
        <li>Onbeperkt scans uitvoeren — inclusief in je Pro-lidmaatschap.</li>
      </ul>
      <Link
        href="/lidmaatschap?plan=pro"
        className="openregio-button openregio-button-pro"
        data-testid="link-upgrade-pro"
      >
        Upgrade naar Pro
        <ArrowRight className="h-4 w-4" style={{ marginLeft: 6, display: "inline-block" }} />
      </Link>
    </section>
  );
}

export default function RegioScanProPage() {
  usePageTitle("RegioScan voor Pro · OpenRegio");
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [actieveScan, setActieveScan] = useState<RegioScan | null>(null);

  const isPro = user?.plan === "pro" || user?.plan === "coaching";

  const { data: scans = [], isLoading: scansLoading } = useQuery<RegioScan[]>({
    queryKey: ["/api/regioscan"],
    enabled: !!user && isPro,
  });

  const wooConceptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/regioscan/${id}/woo-concept`, {});
      return (await res.json()) as RegioScan;
    },
    onSuccess: (scan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/regioscan"] });
      setActieveScan(scan);
      toast({ title: "Concept Woo-verzoek gegenereerd" });
    },
    onError: (err: any) => {
      toast({
        title: "Genereren mislukt",
        description: parseApiError(err),
        variant: "destructive",
      });
    },
  });

  const naarDossierMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/regioscan/${id}/naar-dossier`, {});
      return (await res.json()) as { dossierId: number };
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/regioscan"] });
      queryClient.invalidateQueries({ queryKey: ["/api/woo/dossiers"] });
      // refresh active scan zodat wooDossierId zichtbaar wordt
      if (actieveScan && actieveScan.id === id) {
        setActieveScan({ ...actieveScan, wooDossierId: data.dossierId });
      }
      toast({
        title: "Opgeslagen als ondernemersdossier",
        description: "Je vindt het terug onder Regels → Woo-bibliotheek.",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Opslaan mislukt",
        description: parseApiError(err),
        variant: "destructive",
      });
    },
  });

  const rescanMutation = useMutation({
    mutationFn: async (s: RegioScan) => {
      const res = await apiRequest("POST", "/api/regioscan/run", {
        branche: s.branche,
        gemeente: s.gemeente,
        extraContext: s.extraContext ?? undefined,
      });
      return (await res.json()) as RegioScan;
    },
    onSuccess: (scan) => {
      queryClient.invalidateQueries({ queryKey: ["/api/regioscan"] });
      setActieveScan(scan);
      toast({ title: "Opnieuw gescand", description: "De RegioScan is bijgewerkt met de nieuwste analyse." });
    },
    onError: (err: any) => {
      toast({
        title: "Opnieuw scannen mislukt",
        description: parseApiError(err),
        variant: "destructive",
      });
    },
  });

  const dossierId = actieveScan?.wooDossierId ?? null;
  const { data: dossier } = useQuery<WooDossier>({
    queryKey: ["/api/woo/dossiers", dossierId],
    enabled: !!dossierId,
  });

  const indienMutation = useMutation({
    mutationFn: async ({ scanId, kanaal, ontvanger }: { scanId: number; kanaal: "email" | "post"; ontvanger: string }) => {
      const res = await apiRequest("POST", `/api/regioscan/${scanId}/indien`, { kanaal, ontvanger });
      return (await res.json()) as { ok: true; kanaal: "email" | "post"; ontvanger: string; ingediendOp: string; dossier: WooDossier };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/woo/dossiers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/woo/dossiers", data.dossier?.id] });
      toast({
        title: data.kanaal === "email" ? "Woo-verzoek verzonden" : "Indiening geregistreerd",
        description: data.kanaal === "email"
          ? `Verstuurd naar ${data.ontvanger}. Reacties komen op je eigen e-mailadres binnen.`
          : `Geregistreerd als per post verzonden naar ${data.ontvanger}.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Indienen mislukt",
        description: parseApiError(err),
        variant: "destructive",
      });
    },
  });

  const verwijderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/regioscan/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/regioscan"] });
      if (actieveScan?.id === id) setActieveScan(null);
      toast({ title: "Scan verwijderd" });
    },
    onError: (err: any) => {
      toast({
        title: "Verwijderen mislukt",
        description: parseApiError(err),
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="openregio-dashboard" data-testid="skeleton-regioscan">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="openregio-dashboard" data-testid="page-regioscan-niet-ingelogd">
        <section className="openregio-public-card">
          <h2>Log eerst in</h2>
          <p>Je moet ingelogd zijn als Pro-lid om de RegioScan te gebruiken.</p>
          <Link href="/login" className="openregio-button openregio-button-primary" data-testid="link-login">
            Inloggen
          </Link>
        </section>
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="openregio-dashboard" data-testid="page-regioscan-upgrade">
        <header style={{ marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#0b2240" }} data-testid="text-titel">
            RegioScan voor Pro
          </h1>
          <p style={{ fontSize: 14, color: "#475569", margin: "6px 0 0", lineHeight: 1.6 }}>
            Brancheafhankelijke scan met lokale besluiten, regels, kansen en een concept Woo-verzoek.
          </p>
        </header>
        <UpgradeBlok />
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-regioscan">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MapPin style={{ width: 24, height: 24, color: "#0891b2" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-titel">RegioScan Pro</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Brancheafhankelijke scan met risico- en kansenscore en een concept Woo-verzoek.
            </p>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: "#0891b2", background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 6, padding: "2px 7px", letterSpacing: "0.06em" }}>PRO</span>
        </div>
      </div>

      {!actieveScan && <ScanFormulier onResult={setActieveScan} />}

      {actieveScan && (
        <ResultaatWeergave
          scan={actieveScan}
          dossier={dossier}
          onNieuw={() => setActieveScan(null)}
          onOpnieuwScannen={() => rescanMutation.mutate(actieveScan)}
          onWooConcept={() => wooConceptMutation.mutate(actieveScan.id)}
          onNaarDossier={() => naarDossierMutation.mutate(actieveScan.id)}
          onIndien={(kanaal, ontvanger) =>
            indienMutation.mutate({ scanId: actieveScan.id, kanaal, ontvanger })
          }
          defaultEmail={user?.email ?? ""}
          wooLoading={wooConceptMutation.isPending}
          dossierLoading={naarDossierMutation.isPending}
          rescanLoading={rescanMutation.isPending}
          indienLoading={indienMutation.isPending}
        />
      )}

      {/* Eerdere scans */}
      <section className="openregio-public-card" data-testid="lijst-eerdere-scans" style={{ marginTop: 14 }}>
        <h2>
          <ListChecks className="h-5 w-5" style={{ color: "#1f5fae", marginRight: 6, display: "inline-block", verticalAlign: "-3px" }} />
          Eerdere scans
        </h2>
        {scansLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : scans.length === 0 ? (
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }} data-testid="text-geen-scans">
            Je hebt nog geen scans uitgevoerd. Vul hierboven een branche en gemeente in om te starten.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scans.map((s) => {
              const actief = actieveScan?.id === s.id;
              return (
                <div
                  key={s.id}
                  data-testid={`scan-rij-${s.id}`}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "12px 14px",
                    border: "1px solid #e6ebf2",
                    borderRadius: 12,
                    background: actief ? "#eff4fd" : "#fff",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 220px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0b2240" }}>{s.branche} · {s.gemeente}</span>
                      {s.wooDossierId && (
                        <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".5px", background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: 999 }}>
                          Dossier
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#64748b", flexWrap: "wrap" }}>
                      <span>Risico: <strong style={{ color: "#dc2626" }}>{s.scoreRisico}</strong></span>
                      <span>Kansen: <strong style={{ color: "#16a34a" }}>{s.scoreKans}</strong></span>
                      <span>{relTime(s.createdAt)}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="openregio-button openregio-button-outline openregio-button-small"
                      onClick={() => setActieveScan(s)}
                      data-testid={`button-bekijk-${s.id}`}
                    >
                      Bekijk
                    </button>
                    <button
                      type="button"
                      className="openregio-button openregio-button-danger openregio-button-small"
                      onClick={() => {
                        if (confirm(`Scan voor ${s.branche} in ${s.gemeente} verwijderen?`)) {
                          verwijderMutation.mutate(s.id);
                        }
                      }}
                      disabled={verwijderMutation.isPending}
                      data-testid={`button-verwijder-${s.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="openregio-public-card" data-testid="disclaimer-blok" style={{ marginTop: 14, background: "#fffaf0", borderColor: "#fde68a" }}>
        <h2 style={{ color: "#92400e" }}>
          <AlertTriangle className="h-5 w-5" style={{ color: "#f59e0b", marginRight: 6, display: "inline-block", verticalAlign: "-3px" }} />
          Belangrijk om te weten
        </h2>
        <p style={{ fontSize: 13, color: "#78350f", margin: 0, lineHeight: 1.6 }}>
          De RegioScan combineert AI-analyse met je bedrijfsprofiel om relevante regels, kansen en documenten in beeld te brengen. Verifieer wettelijke verwijzingen altijd bij de officiële bron (gemeente, overheid.nl). Dit is geen juridisch advies.
        </p>
      </section>
    </div>
  </div>
  );
}
