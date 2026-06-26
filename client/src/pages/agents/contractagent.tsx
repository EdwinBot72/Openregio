import { useState, useRef } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck, Upload, FileText, AlertCircle, ArrowRight,
  Users, Clock, AlignLeft, Lightbulb, CheckCircle2, Mail, Star,
} from "lucide-react";

type ContractResult = {
  contractType?: string;
  partijen?: string;
  looptijd?: string;
  samenvatting?: string;
  aandachtspunten?: string | string[];
  documentType?: string;
  afzender?: string;
  termijn?: string;
  aanbevolenActie?: string;
  juridischeBasis?: string;
};

const ACCENT = "#16a34a";

export default function ContractagentPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ContractResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "contract");
      const res = await fetch("/api/brief-analyse/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data: any) => setResult(mapResponse(data)),
    onError: (e: Error) => toast({ title: "Fout bij uploaden", description: e.message, variant: "destructive" }),
  });

  const textMutation = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/brief-analyse", { content: text, type: "contract" }),
    onSuccess: (data: any) => setResult(mapResponse(data)),
    onError: (e: Error) => toast({ title: "Fout bij analyseren", description: e.message, variant: "destructive" }),
  });

  function mapResponse(data: any): ContractResult {
    return {
      contractType: data.documentType,
      partijen: data.afzender,
      looptijd: data.termijn,
      samenvatting: data.aanbevolenActie,
      aandachtspunten: data.juridischeBasis,
    };
  }

  function handleFile(file: File) {
    setSelectedFile(file);
    setResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit() {
    if (mode === "upload" && selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else if (mode === "text" && text.trim()) {
      textMutation.mutate();
    }
  }

  const isPending = uploadMutation.isPending || textMutation.isPending;
  const canSubmit = mode === "upload" ? !!selectedFile : text.trim().length > 20;

  const aandachtspunten = result?.aandachtspunten
    ? Array.isArray(result.aandachtspunten)
      ? result.aandachtspunten
      : result.aandachtspunten.split(/\n|;|•/).map((s) => s.trim()).filter(Boolean)
    : [];

  const mainFields = [
    { icon: <FileCheck size={14} />, label: "Type contract", value: result?.contractType },
    { icon: <Users size={14} />, label: "Partijen", value: result?.partijen },
    { icon: <Clock size={14} />, label: "Looptijd", value: result?.looptijd },
    { icon: <AlignLeft size={14} />, label: "Samenvatting", value: result?.samenvatting },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: ACCENT + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileCheck size={22} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0b2240" }}>Contractagent</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Pijler 1 — Grip op Regels</p>
          </div>
          <Badge style={{ marginLeft: "auto", background: ACCENT + "18", color: ACCENT, border: "none" }}>AI-analyse</Badge>
        </div>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>
          Upload een contract of plak de tekst. De Contractagent brengt de kernpunten, partijen en aandachtspunten overzichtelijk in beeld.
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Button
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
          data-testid="button-mode-upload"
          style={mode === "upload" ? { background: ACCENT, borderColor: ACCENT } : {}}
        >
          <Upload size={14} /> Bestand uploaden
        </Button>
        <Button
          variant={mode === "text" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("text")}
          data-testid="button-mode-text"
          style={mode === "text" ? { background: ACCENT, borderColor: ACCENT } : {}}
        >
          <FileText size={14} /> Tekst plakken
        </Button>
      </div>

      {/* Input area */}
      <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 24, marginBottom: 20 }}>
        {mode === "upload" ? (
          <>
            <div
              data-testid="dropzone-contractagent"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? ACCENT : "#cbd5e1"}`,
                borderRadius: 10,
                padding: "36px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? ACCENT + "08" : "#f8fafc",
                transition: "border-color 0.15s, background 0.15s",
                marginBottom: selectedFile ? 12 : 0,
              }}
            >
              <Upload size={28} style={{ color: "#94a3b8", marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                Sleep een bestand hierheen of klik om te kiezen
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>PDF, JPG, PNG of TXT — max 10 MB</div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                style={{ display: "none" }}
                data-testid="input-file-contractagent"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
            {selectedFile && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: ACCENT + "10", borderRadius: 8, fontSize: 13, color: ACCENT, fontWeight: 600 }}>
                <CheckCircle2 size={15} /> {selectedFile.name}
              </div>
            )}
          </>
        ) : (
          <Textarea
            placeholder="Plak hier de tekst van het contract..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="textarea-contractagent"
            style={{ minHeight: 180, resize: "vertical", fontSize: 14 }}
          />
        )}
      </div>

      <Button
        disabled={!canSubmit || isPending}
        onClick={handleSubmit}
        data-testid="button-submit-contractagent"
        style={{ background: ACCENT, borderColor: ACCENT, width: "100%", marginBottom: 32 }}
      >
        {isPending ? "Bezig met analyseren..." : <><FileCheck size={15} /> Contract analyseren</>}
      </Button>

      {/* Result */}
      {result && (
        <div style={{ background: "white", border: `1.5px solid ${ACCENT}30`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <CheckCircle2 size={17} style={{ color: ACCENT }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#0b2240" }}>Contractanalyse gereed</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mainFields.map((f) =>
              f.value ? (
                <div key={f.label}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                    {f.icon} {f.label}
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.65, background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                    {f.value}
                  </div>
                </div>
              ) : null
            )}

            {aandachtspunten.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  <Lightbulb size={14} /> Aandachtspunten
                </div>
                <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                  {aandachtspunten.map((pt, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#334155", lineHeight: 1.65, marginBottom: i < aandachtspunten.length - 1 ? 6 : 0 }}>
                      <span style={{ color: ACCENT, fontWeight: 800, flexShrink: 0 }}>·</span> {pt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px" }}>
            <AlertCircle size={15} style={{ color: "#166534", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#14532d", lineHeight: 1.6 }}>
              Deze analyse is informatief en geen vervanging voor professioneel juridisch advies. Raadpleeg bij twijfel een jurist of rechtsbijstandverzekering.
            </p>
          </div>
        </div>
      )}

      {!result && (
        <div style={{ display: "flex", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", marginBottom: 32 }}>
          <AlertCircle size={15} style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12, color: "#14532d", lineHeight: 1.6 }}>
            De analyse is informatief en geen vervanging voor professioneel juridisch advies.
          </p>
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
          <Link href="/agents/secretaresse">
            <Button variant="outline" size="sm" data-testid="link-to-secretaresse">
              <Star size={14} /> Secretaresse <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
