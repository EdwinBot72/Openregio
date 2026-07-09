import { useState, useRef } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail, Upload, FileText, AlertCircle, ArrowRight,
  User, Scale, Clock, Lightbulb, AlignLeft, CheckCircle2,
  FileCheck, Star,
} from "lucide-react";

type AnalyseResult = {
  afzender?: string;
  documentType?: string;
  juridischeBasis?: string;
  termijn?: string;
  aanbevolenActie?: string;
  samenvatting?: string;
};

const ACCENT = "#0b2240";

export default function BrievenagentPage() {
  const { toast } = useToast();
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [text, setText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalyseResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/brief-analyse/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => setResult(data),
    onError: (e: Error) => toast({ title: "Fout bij uploaden", description: e.message, variant: "destructive" }),
  });

  const textMutation = useMutation({
    mutationFn: async () =>
      apiRequest("POST", "/api/brief-analyse", { content: text, type: "brief" }),
    onSuccess: (data: any) => setResult(data),
    onError: (e: Error) => toast({ title: "Fout bij analyseren", description: e.message, variant: "destructive" }),
  });

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

  const resultFields = [
    { icon: <User size={14} />, label: "Afzender", value: result?.afzender },
    { icon: <FileText size={14} />, label: "Documenttype", value: result?.documentType },
    { icon: <Scale size={14} />, label: "Juridische basis", value: result?.juridischeBasis },
    { icon: <Clock size={14} />, label: "Termijn / deadline", value: result?.termijn },
    { icon: <Lightbulb size={14} />, label: "Aanbevolen actie", value: result?.aanbevolenActie },
    { icon: <AlignLeft size={14} />, label: "Samenvatting", value: result?.samenvatting },
  ];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: ACCENT + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Mail size={22} style={{ color: ACCENT }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#0b2240" }}>Brievenagent</h1>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Pijler 1 — Grip op Regels</p>
          </div>
          <Badge style={{ marginLeft: "auto", background: ACCENT + "18", color: ACCENT, border: "none" }}>AI-analyse</Badge>
        </div>
        <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, margin: 0 }}>
          Upload een overheidsbrief of plak de tekst hieronder. De Brievenagent analyseert de inhoud en legt uit wat er van je verwacht wordt.
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
              data-testid="dropzone-brievenagent"
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
                data-testid="input-file-brievenagent"
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
            placeholder="Plak hier de tekst van de brief of het document..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            data-testid="textarea-brievenagent"
            style={{ minHeight: 180, resize: "vertical", fontSize: 14 }}
          />
        )}
      </div>

      <Button
        disabled={!canSubmit || isPending}
        onClick={handleSubmit}
        data-testid="button-submit-brievenagent"
        style={{ background: ACCENT, borderColor: ACCENT, width: "100%", marginBottom: 32 }}
      >
        {isPending ? "Bezig met analyseren..." : <><Mail size={15} /> Brief analyseren</>}
      </Button>

      {/* Result */}
      {result && (
        <div style={{ background: "white", border: `1.5px solid ${ACCENT}30`, borderRadius: 14, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            <CheckCircle2 size={17} style={{ color: ACCENT }} />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#0b2240" }}>Analyse gereed</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {resultFields.map((f) =>
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
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 20, display: "flex", gap: 10, background: "#fef9e7", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px" }}>
            <AlertCircle size={15} style={{ color: "#b45309", flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
              Deze analyse is informatief en geen vervanging voor professioneel juridisch advies. Raadpleeg bij twijfel een jurist of rechtsbijstandverzekering.
            </p>
          </div>
        </div>
      )}

      {!result && (
        <div style={{ display: "flex", gap: 10, background: "#f0f4ff", border: "1px solid #c7d7f8", borderRadius: 10, padding: "12px 14px", marginBottom: 32 }}>
          <AlertCircle size={15} style={{ color: ACCENT, flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, fontSize: 12, color: "#3b5fa0", lineHeight: 1.6 }}>
            De analyse is informatief en geen vervanging voor professioneel juridisch advies.
          </p>
        </div>
      )}

      {/* Meer tools */}
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>Meer tools</div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/agents/contractagent">
            <Button variant="outline" size="sm" data-testid="link-to-contractagent">
              <FileCheck size={14} /> Contractagent <ArrowRight size={13} />
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
