import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { PublicTopNav } from "@/components/PublicTopNav";
import { ExternalLink, Loader2, Newspaper, Sparkles } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  link: string;
  source: string;
  publishedAt: string;
  aiContext: string | null;
  related: { titel: string; toelichting: string }[];
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
    <div className="openregio-public-page" data-testid="page-nieuws">
      <PublicTopNav />

      <div className="openregio-public-content">
        <h1 className="openregio-public-title" data-testid="text-nieuws-title">Nieuws met context</h1>
        <p className="openregio-public-lead">
          Actuele berichten uit Nederlandse bronnen, voorzien van AI-context die uitlegt waar het verhaal vandaan komt en wat erachter speelt. Bron blijft altijd zichtbaar.
        </p>

        {isLoading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", padding: "20px 0" }}>
            <Loader2 className="h-4 w-4 animate-spin" />
            Nieuws en AI-context worden opgehaald…
          </div>
        )}

        {isError && (
          <div className="openregio-public-card" data-testid="error-news">
            <p style={{ color: "#b91c1c", margin: 0 }}>
              Het nieuws kon nu niet worden opgehaald. Probeer het later opnieuw.
            </p>
          </div>
        )}

        {data?.items?.length === 0 && !isLoading && (
          <div className="openregio-public-card">
            <p style={{ color: "#64748b", margin: 0 }}>Er is op dit moment geen nieuws beschikbaar.</p>
          </div>
        )}

        {data?.items?.map((item) => (
          <article
            key={item.id}
            className="openregio-public-card"
            data-testid={`card-news-${item.id}`}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748b", marginBottom: 8 }}>
              <Newspaper className="h-3.5 w-3.5" style={{ color: "#1f5fae" }} />
              <a
                href={item.source.startsWith("http") ? item.source : `https://${item.source}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1f5fae", fontWeight: 600, textDecoration: "none" }}
                data-testid={`link-source-${item.id}`}
              >
                {item.source.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
              <span>·</span>
              <span>{formatDate(item.publishedAt)}</span>
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0b2240", margin: "0 0 8px", lineHeight: 1.35 }}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}
                data-testid={`link-title-${item.id}`}
              >
                {item.title}
              </a>
            </h2>

            {item.summary && (
              <p style={{ fontSize: 14, color: "#475569", margin: "0 0 14px", lineHeight: 1.6 }}>
                {item.summary}
              </p>
            )}

            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1f5fae", fontWeight: 600, textDecoration: "none", marginBottom: 14 }}
              data-testid={`link-original-${item.id}`}
            >
              Lees origineel bericht <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {item.aiContext && (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: 10,
                  padding: "14px 16px",
                  marginTop: 4,
                }}
                data-testid={`ai-context-${item.id}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: "#c2410c" }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#c2410c", textTransform: "uppercase", letterSpacing: ".5px" }}>
                    AI-context
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "#7c2d12", margin: 0, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
                  {item.aiContext}
                </p>

                {item.related && item.related.length > 0 && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #fed7aa" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: ".5px", margin: "0 0 6px" }}>
                      Gerelateerde verhaallijnen
                    </p>
                    <ul style={{ margin: 0, paddingLeft: 18, listStyle: "disc" }}>
                      {item.related.map((r, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#7c2d12", lineHeight: 1.6, marginBottom: 4 }}>
                          <strong>{r.titel}</strong> — {r.toelichting}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </article>
        ))}

        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 24 }}>
          AI-context is automatisch gegenereerd op basis van openbare bronnen. Geen vervanging voor eigen onderzoek.
        </p>
      </div>
    </div>
  );
}
