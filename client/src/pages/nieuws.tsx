import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Loader2, Newspaper, Radio, Sparkles, Building2 } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  publishedAt: string;
  aiContext: string | null;
  related: { titel: string; toelichting: string }[];
  media?: { naam: string; hoek: string; impact: string }[];
  lokaleImpact?: { sector: string; toelichting: string }[];
}

interface NewsResponse {
  items: NewsItem[];
  fetchedAt: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default function NieuwsPage() {
  usePageTitle("Nieuws — OpenRegio");

  const { data, isLoading, isError } = useQuery<NewsResponse>({
    queryKey: ["/api/news"],
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div data-testid="page-nieuws">
      <div className="openregio-greeting">
        <h1 data-testid="text-nieuws-title">Nieuws met context</h1>
        <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.7, margin: "8px 0 0", maxWidth: 720 }}>
          Actuele berichten uit Nederlandse bronnen, voorzien van AI-context, alternatieve media en een concreet beeld van welke lokale ondernemingen het raakt.
        </p>
      </div>

      {isLoading && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", padding: "20px 0" }}>
          <Loader2 className="h-4 w-4 animate-spin" />
          Nieuws en AI-context worden opgehaald…
        </div>
      )}

      {isError && (
        <div style={{ background: "#fff", border: "1px solid #e6ebf2", borderRadius: 14, padding: "22px 26px" }} data-testid="error-news">
          <p style={{ color: "#b91c1c", margin: 0 }}>
            Het nieuws kon nu niet worden opgehaald. Probeer het later opnieuw.
          </p>
        </div>
      )}

      {data?.items?.length === 0 && !isLoading && (
        <div style={{ background: "#fff", border: "1px solid #e6ebf2", borderRadius: 14, padding: "22px 26px" }}>
          <p style={{ color: "#64748b", margin: 0 }}>Er is op dit moment geen nieuws beschikbaar.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data?.items?.map((item) => (
          <article
            key={item.id}
            style={{ background: "#fff", border: "1px solid #e6ebf2", borderRadius: 14, padding: "30px 32px" }}
            data-testid={`card-news-${item.id}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 600 }}>
              <Newspaper className="h-3.5 w-3.5" style={{ color: "#94a3b8" }} />
              <span>{formatDate(item.publishedAt)}</span>
            </div>

            <h2
              style={{ fontSize: 22, fontWeight: 800, color: "#0b2240", margin: "0 0 14px", lineHeight: 1.3 }}
              data-testid={`text-title-${item.id}`}
            >
              {item.title}
            </h2>

            {item.summary && (
              <p style={{ fontSize: 15, color: "#475569", margin: "0 0 22px", lineHeight: 1.7 }}>
                {item.summary}
              </p>
            )}

            {item.aiContext && (
              <div style={{ marginTop: 8 }} data-testid={`ai-context-${item.id}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Sparkles className="h-4 w-4" style={{ color: "#1f5fae" }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: ".5px" }}>
                    Wat speelt hier?
                  </span>
                </div>
                <p style={{ fontSize: 15, color: "#334155", margin: 0, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                  {item.aiContext}
                </p>
              </div>
            )}

            {item.lokaleImpact && item.lokaleImpact.length > 0 && (
              <div style={{ marginTop: 24 }} data-testid={`lokale-impact-${item.id}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Building2 className="h-4 w-4" style={{ color: "#f28a1a" }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: ".5px" }}>
                    Welke lokale ondernemers raakt dit?
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc" }}>
                  {item.lokaleImpact.map((s, i) => (
                    <li key={i} style={{ fontSize: 15, color: "#334155", lineHeight: 1.75, marginBottom: 8 }}>
                      <strong style={{ color: "#0b2240" }}>{s.sector}</strong>
                      {s.toelichting && <> — {s.toelichting}</>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.related && item.related.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: ".5px" }}>
                    Verwante verhaallijnen
                  </span>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc" }}>
                  {item.related.map((r, i) => (
                    <li key={i} style={{ fontSize: 15, color: "#334155", lineHeight: 1.75, marginBottom: 8 }}>
                      <strong style={{ color: "#0b2240" }}>{r.titel}</strong> — {r.toelichting}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.media && item.media.length > 0 && (
              <div style={{ marginTop: 24 }} data-testid={`media-impact-${item.id}`}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Radio className="h-4 w-4" style={{ color: "#1f5fae" }} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#0b2240", textTransform: "uppercase", letterSpacing: ".5px" }}>
                    Andere media hierover
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {item.media.map((m, i) => (
                    <div key={i} style={{ fontSize: 15, color: "#334155", lineHeight: 1.7 }}>
                      <div style={{ fontWeight: 700, color: "#0b2240", marginBottom: 2 }}>{m.naam}</div>
                      {m.hoek && <div style={{ color: "#475569" }}>{m.hoek}</div>}
                      {m.impact && (
                        <div style={{ marginTop: 6, fontSize: 14, color: "#475569" }}>
                          <strong style={{ color: "#0b2240" }}>Impact lokale ondernemer:</strong> {m.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 24 }}>
        AI-context is automatisch gegenereerd op basis van openbare bronnen. Geen vervanging voor eigen onderzoek.
      </p>
    </div>
  );
}
