import { useEffect, useMemo, useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link, useSearch } from "wouter";

type Task =
  | "analyse_besluit"
  | "mandaat_check"
  | "wat_ontbreekt"
  | "vervolg_woo"
  | "tijdlijn"
  | "publiceer_samenvatting";

interface Region { id: number; name: string; slug: string }
interface Authority { id: number; name: string; slug: string }
interface DossierRow {
  id: number; title: string; reference_code: string | null;
  region_name: string | null;
}
interface Citation {
  sourceNo: number; source_type: string; request_id: number;
  document_id: number | null; region: string | null; authority: string | null;
  title: string | null; filename: string | null; file_url: string | null;
}
interface RegioBotResponse { answer: string; citations: Citation[] }

interface Message {
  role: "bot" | "user";
  text: string;
  citations?: Citation[];
}

const TASK_LABELS: Record<Task, string> = {
  analyse_besluit: "Analyseer besluit",
  mandaat_check: "Mandaat-check",
  wat_ontbreekt: "Wat ontbreekt?",
  vervolg_woo: "Vervolg-WOO",
  tijdlijn: "Bouw tijdlijn",
  publiceer_samenvatting: "Publiceer-samenvatting",
};

const TASK_TEMPLATES: Record<Task, string> = {
  analyse_besluit:
    "Analyseer dit besluit/antwoord. Geef: kernbeslissing, genoemde grondslag, wie tekent/rol, wat wringt, en welke stukken ontbreken (WOO).\n\n",
  mandaat_check:
    "Doe een mandaat-check voor dit onderwerp/besluit. Zoek naar mandaat/delegatie/aanwijzing/uitbesteding. Zeg wat je wel/niet ziet en formuleer concrete WOO-vragen.\n\n",
  wat_ontbreekt:
    "Maak een checklist van ontbrekende stukken (besluiten, mandaatregister, contracten, werkinstructies, beleidskaders). Formuleer vervolg-WOO vragen.\n\n",
  vervolg_woo:
    "Genereer vervolg-WOO vragen op basis van gaten/inconsistenties. Kort, documentgericht.\n\n",
  tijdlijn:
    "Bouw een tijdlijn met datum/actie/partij en markeer hiaten. Gebruik alleen feiten uit bronnen.\n\n",
  publiceer_samenvatting:
    "Maak een publicatie-ready samenvatting (zonder persoonsgegevens). Alleen feiten + verwijzingen.\n\n",
};

const SUGGESTIONS: { label: string; task: Task; preset?: string }[] = [
  { label: "Analyseer een besluit", task: "analyse_besluit" },
  { label: "Doe een mandaat-check", task: "mandaat_check" },
  { label: "Wat ontbreekt in dit dossier?", task: "wat_ontbreekt" },
  { label: "Stel vervolg-WOO vragen op", task: "vervolg_woo" },
  { label: "Bouw een tijdlijn", task: "tijdlijn" },
  { label: "Maak een publiceerbare samenvatting", task: "publiceer_samenvatting" },
];

const INTRO_MESSAGE: Message = {
  role: "bot",
  text:
    "Hoi! Ik ben de RegioBot. Ik help je met WOO-verzoeken, mandaatchecks en analyses van besluiten — altijd met bronvermelding. Kies hieronder een taak of stel direct je vraag.",
};

export default function RegioBotPage() {
  usePageTitle("RegioBot");
  const { user, isLoading } = useAuth();
  const isPro = user?.plan === "pro";
  const searchString = useSearch();

  const [task, setTask] = useState<Task>("analyse_besluit");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([INTRO_MESSAGE]);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedAuthority, setSelectedAuthority] = useState<string>("all");
  const [selectedDossierId, setSelectedDossierId] = useState<string>("none");

  const { data: regions = [] } = useQuery<Region[]>({ queryKey: ["/api/woo/regions"] });
  const { data: authorities = [] } = useQuery<Authority[]>({ queryKey: ["/api/woo/authorities"] });

  const dossiersUrl = useMemo(() => {
    const p = new URLSearchParams();
    if (selectedRegion !== "all") p.set("region", selectedRegion);
    if (selectedAuthority !== "all") p.set("authority", selectedAuthority);
    return `/api/woo/library?${p.toString()}`;
  }, [selectedRegion, selectedAuthority]);

  const { data: dossiers = [] } = useQuery<DossierRow[]>({ queryKey: [dossiersUrl] });

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const dossier = params.get("dossier");
    const t = params.get("task") as Task | null;
    if (dossier) setSelectedDossierId(dossier);
    if (t && t in TASK_LABELS) setTask(t);
  }, [searchString]);

  const askMutation = useMutation({
    mutationFn: async (finalQuestion: string) => {
      const payload = {
        task,
        question: finalQuestion,
        dossierRequestId:
          selectedDossierId === "none" ? undefined : Number(selectedDossierId),
        regionSlug: selectedRegion === "all" ? undefined : selectedRegion,
        authoritySlug: selectedAuthority === "all" ? undefined : selectedAuthority,
        limit: 6,
      };
      const res = await apiRequest("POST", "/api/regiobot", payload);
      return res.json() as Promise<RegioBotResponse>;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.answer, citations: data.citations },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            "Er ging iets mis bij het verwerken. Probeer het opnieuw of selecteer eerst een dossier.",
        },
      ]);
    },
  });

  const applySuggestion = (s: { task: Task }) => {
    setTask(s.task);
    setQuestion(TASK_TEMPLATES[s.task]);
  };

  const handleSubmit = () => {
    const final = question.trim();
    if (final.length < 3 && selectedDossierId === "none") return;
    setMessages((prev) => [...prev, { role: "user", text: final || `(${TASK_LABELS[task]})` }]);
    setQuestion("");
    askMutation.mutate(final);
  };

  // Pro-gate
  if (!isLoading && !isPro) {
    return (
      <div className="openregio-regiobot openregio-regiobot-container" data-testid="page-regiobot-gate">
        <h1>RegioBot</h1>
        <p className="openregio-subtitle">
          De Regelgeving-assistent werkt met WOO-bronnen en regionale dossiers — beschikbaar voor Pro-leden.
        </p>
        <div className="openregio-card openregio-upgrade-card" data-testid="card-upgrade">
          <h3>Upgrade naar Pro</h3>
          <p>Krijg toegang tot RegioBot, WOO-bibliotheek en printbare overzichten.</p>
          <Link
            href="/lidmaatschap?plan=pro"
            className="openregio-button openregio-button-pro"
            data-testid="button-upgrade-pro"
          >
            Upgrade naar Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="openregio-regiobot openregio-regiobot-container" data-testid="page-regiobot">
      <h1>RegioBot</h1>
      <p className="openregio-subtitle">
        Document-gedreven analyses van besluiten, mandaten en regelgeving — met bronvermelding.
        Geen persoonlijke boetes of verkeerszaken.
      </p>

      {/* Filters / context */}
      <div className="openregio-card" data-testid="card-context">
        <h2>Context</h2>
        <div className="openregio-form-group">
          <label htmlFor="rb-dossier">Dossier (optioneel)</label>
          <select
            id="rb-dossier"
            value={selectedDossierId}
            onChange={(e) => setSelectedDossierId(e.target.value)}
            data-testid="select-dossier"
          >
            <option value="none">Geen dossier (losse vraag)</option>
            {dossiers.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.title || "(geen titel)"}{d.reference_code ? ` · ${d.reference_code}` : ""}
                {d.region_name ? ` · ${d.region_name}` : ""}
              </option>
            ))}
          </select>
          <p className="openregio-form-help">
            Met dossier: RegioBot gebruikt automatisch verzoek + bijlagen als context.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="openregio-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="rb-region">Regio</label>
            <select
              id="rb-region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              data-testid="select-region"
            >
              <option value="all">Alle regio's</option>
              {regions.map((r) => (
                <option key={r.id} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="openregio-form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="rb-authority">Bestuursorgaan</label>
            <select
              id="rb-authority"
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
              data-testid="select-authority"
            >
              <option value="all">Alle bestuursorganen</option>
              {authorities.map((a) => (
                <option key={a.id} value={a.slug}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggestie-pillen */}
      <div className="openregio-card openregio-regiobot-suggestions" data-testid="card-suggestions">
        <p>
          <strong>Snelle taken</strong>
        </p>
        <ul>
          {SUGGESTIONS.map((s) => (
            <li
              key={s.task}
              onClick={() => applySuggestion(s)}
              data-testid={`suggestion-${s.task}`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat */}
      <div className="openregio-regiobot-chat" data-testid="card-chat">
        <div className="openregio-chat-messages" data-testid="chat-messages">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`openregio-chat-message ${
                m.role === "bot" ? "openregio-chat-bot" : "openregio-chat-user"
              }`}
              data-testid={`message-${m.role}-${idx}`}
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{m.text}</p>
              {m.citations && m.citations.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
                  {m.citations.map((c) => (
                    <div key={c.sourceNo} data-testid={`citation-${idx}-${c.sourceNo}`}>
                      Bron {c.sourceNo}: {c.title || c.filename || `request ${c.request_id}`}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {askMutation.isPending && (
            <div className="openregio-chat-message openregio-chat-bot" data-testid="message-loading">
              <p>RegioBot denkt na...</p>
            </div>
          )}
        </div>
        <form
          className="openregio-chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Stel een vraag — actieve taak: ${TASK_LABELS[task]}`}
            data-testid="textarea-question"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <button
            type="submit"
            className="openregio-button openregio-button-primary"
            disabled={
              askMutation.isPending ||
              (question.trim().length < 3 && selectedDossierId === "none")
            }
            data-testid="button-submit"
          >
            {askMutation.isPending ? "Bezig..." : "Verstuur"}
          </button>
        </form>
      </div>
    </div>
  );
}
