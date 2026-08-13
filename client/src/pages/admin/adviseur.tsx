import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, parseApiError } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Scale, ShieldCheck } from "lucide-react";

const BLAUW = "#0b2240";
const ORANJE = "#f28a1a";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Ik kreeg een brief van de gemeente — waar moet ik op letten?",
  "Welke rechten heb ik als de overheid iets van me eist?",
  "Hoe controleer ik of een besluit bevoegd genomen is?",
  "Wat kan ik opvragen via de Wet open overheid?",
];

export default function AdviseurPage() {
  usePageTitle("Adviseur — OpenRegio");
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin" || user?.role === "master" || (user as any)?.isAdmin;

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const vraag = useMutation({
    mutationFn: async (history: Msg[]) => {
      const res = await apiRequest("POST", "/api/admin/adviseur", { messages: history });
      return (await res.json()) as { answer: string };
    },
    onSuccess: (data) => setMessages((m) => [...m, { role: "assistant", content: data.answer || "(geen antwoord)" }]),
    onError: (err) => {
      toast({ title: "De adviseur kon niet antwoorden", description: parseApiError(err), variant: "destructive" });
      setMessages((m) => m.slice(0, -1)); // haal de zojuist toegevoegde vraag weg
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, vraag.isPending]);

  function verstuur(tekst: string) {
    const t = tekst.trim();
    if (!t || vraag.isPending) return;
    const nieuw: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(nieuw);
    setInput("");
    vraag.mutate(nieuw);
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
        Deze pagina is alleen voor beheerders.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: BLAUW }}>
          <Scale className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: BLAUW }}>Adviseur</h1>
      </div>
      <p className="text-muted-foreground mb-2">
        Vertrouwelijk overleg met je eigen AI — op onze eigen server, niet bij een externe partij. Denk rustig
        mee vanuit je rechten: wat mag, wat kun je controleren, en welke stap staat open?
      </p>
      <p className="text-sm mb-6 flex items-start gap-1.5" style={{ color: BLAUW }}>
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Grounded in mensenrechten en het geldende recht. Geen juridisch advies — bij een echt belang: raadpleeg een jurist.</span>
      </p>

      <Card>
        <CardContent className="p-0">
          <div ref={scrollRef} className="max-h-[52vh] overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-3">Waarmee kan ik je helpen? Bijvoorbeeld:</p>
                <div className="flex flex-col gap-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => verstuur(s)}
                      className="text-left rounded-md border px-3 py-2 hover:bg-muted/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className="rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap max-w-[85%]"
                  style={
                    m.role === "user"
                      ? { background: BLAUW, color: "#fff" }
                      : { background: "#f4f6f9", color: "#1f2937" }
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {vraag.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2" style={{ background: "#f4f6f9", color: "#6b7280" }}>
                  <Loader2 className="w-4 h-4 animate-spin" /> De adviseur denkt na…
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-3 flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  verstuur(input);
                }
              }}
              placeholder="Stel je vraag… (Enter om te versturen, Shift+Enter voor een nieuwe regel)"
              className="min-h-[46px] max-h-40 resize-none"
              rows={1}
            />
            <Button
              onClick={() => verstuur(input)}
              disabled={!input.trim() || vraag.isPending}
              style={{ background: ORANJE }}
              className="text-white shrink-0"
            >
              {vraag.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-3">
        Het antwoord komt van een lokaal AI-model en kan even duren. Je gesprek blijft op je eigen server.
      </p>
    </div>
  );
}
