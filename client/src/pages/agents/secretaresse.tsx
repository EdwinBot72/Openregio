import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Star, Send, Copy, CheckCircle2, AlertCircle,
  ArrowRight, Mail, FileCheck,
} from "lucide-react";

const ACCENT = "#7c3aed";

type TaskType = {
  id: string;
  label: string;
  placeholder: string;
  prompt: (input: string) => string;
};

const TASK_TYPES: TaskType[] = [
  {
    id: "vergadering",
    label: "Vergadering samenvatten",
    placeholder: "Plak hier de notulen of aantekeningen van de vergadering...",
    prompt: (input) =>
      `Je bent een professionele secretaresse voor een Nederlandse ondernemer. Maak een heldere, beknopte samenvatting van de volgende vergadering of notulen. Gebruik kopjes, vermeld besluiten en actiepunten apart:\n\n${input}`,
  },
  {
    id: "taken",
    label: "Takenlijst opstellen",
    placeholder: "Beschrijf de situatie, vergadering of het project waarvoor je een takenlijst wilt...",
    prompt: (input) =>
      `Je bent een professionele secretaresse. Stel een gestructureerde takenlijst op met prioriteiten, deadlines (indien bekend) en verantwoordelijken op basis van het volgende:\n\n${input}`,
  },
  {
    id: "email",
    label: "E-mail opstellen",
    placeholder: "Beschrijf het doel van de e-mail, de ontvanger en de boodschap die je wilt overbrengen...",
    prompt: (input) =>
      `Je bent een professionele secretaresse. Schrijf een nette, zakelijke e-mail in het Nederlands op basis van de volgende instructie. Gebruik een passende aanhef en afsluiting:\n\n${input}`,
  },
  {
    id: "planning",
    label: "Planning maken",
    placeholder: "Beschrijf het project, de deadlines en de beschikbare mensen of middelen...",
    prompt: (input) =>
      `Je bent een professionele secretaresse. Maak een overzichtelijke planning of tijdlijn op basis van het volgende. Gebruik een duidelijke structuur met fasen of weken:\n\n${input}`,
  },
  {
    id: "vrij",
    label: "Vrije opdracht",
    placeholder: "Beschrijf hier je opdracht of vraag voor de secretaresse...",
    prompt: (input) =>
      `Je bent een professionele secretaresse voor een Nederlandse ondernemer. Voer de volgende opdracht uit op een heldere en zakelijke manier:\n\n${input}`,
  },
];

export default function SecretaressePage() {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<string>("vergadering");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const task = TASK_TYPES.find((t) => t.id === selectedTask) ?? TASK_TYPES[0];

  const mutation = useMutation({
    mutationFn: async () => {
      const message = task.prompt(input);
      return apiRequest("POST", "/api/regiobot/route", { message, type: "secretaresse" });
    },
    onSuccess: (data: any) => {
      const output = data?.answer ?? data?.output ?? data?.result ?? "";
      setResult(typeof output === "string" ? output : JSON.stringify(output));
    },
    onError: (e: Error) => toast({ title: "Fout", description: e.message, variant: "destructive" }),
  });

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const canSubmit = input.trim().length > 10;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: ACCENT + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Star size={22} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0b2240" }}>Secretaresse-agent</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Pijler 1 — Grip op Regels</p>
          </div>
          <Badge style={{ marginLeft: "auto", background: ACCENT + "18", color: ACCENT, border: "none" }}>AI-assistent</Badge>
        </div>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>
          Jouw digitale secretaresse helpt met vergaderverslagen, takenlijsten, e-mails en planningen — snel en professioneel.
        </p>
      </div>

      {/* Task type selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Wat wil je doen?
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {TASK_TYPES.map((t) => (
            <Button
              key={t.id}
              variant={selectedTask === t.id ? "default" : "outline"}
              size="sm"
              onClick={() => { setSelectedTask(t.id); setResult(null); setInput(""); }}
              data-testid={`button-task-${t.id}`}
              style={selectedTask === t.id ? { background: ACCENT, borderColor: ACCENT } : {}}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <Textarea
          placeholder={task.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          data-testid="textarea-secretaresse"
          style={{ minHeight: 160, resize: "vertical", fontSize: 14 }}
        />
      </div>

      <Button
        disabled={!canSubmit || mutation.isPending}
        onClick={() => mutation.mutate()}
        data-testid="button-submit-secretaresse"
        style={{ background: ACCENT, borderColor: ACCENT, width: "100%", marginBottom: 32 }}
      >
        {mutation.isPending ? "Bezig..." : <><Send size={15} /> Uitvoeren</>}
      </Button>

      {/* Result */}
      {result && (
        <div style={{ background: "white", border: `1.5px solid ${ACCENT}30`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <CheckCircle2 size={17} style={{ color: ACCENT }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#0b2240", flex: 1 }}>Resultaat</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              data-testid="button-copy-result"
            >
              {copied ? <><CheckCircle2 size={13} /> Gekopieerd</> : <><Copy size={13} /> Kopiëren</>}
            </Button>
          </div>
          <div style={{
            fontSize: 14,
            color: "#334155",
            lineHeight: 1.75,
            background: "#f8fafc",
            borderRadius: 8,
            padding: "14px 16px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {result}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10, background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "12px 14px" }}>
            <AlertCircle size={15} style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#5b21b6", lineHeight: 1.6 }}>
              Dit is een AI-gegenereerde tekst. Controleer de inhoud altijd zelf voordat je hem verstuurt of gebruikt.
            </p>
          </div>
        </div>
      )}

      {/* Meer tools */}
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>Meer tools</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/agents/brievenagent">
            <Button variant="outline" size="sm" data-testid="link-to-brievenagent">
              <Mail size={14} /> Brievenagent <ArrowRight size={13} />
            </Button>
          </Link>
          <Link href="/agents/contractagent">
            <Button variant="outline" size="sm" data-testid="link-to-contractagent">
              <FileCheck size={14} /> Contractagent <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
