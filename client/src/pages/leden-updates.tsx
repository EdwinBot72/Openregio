import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Megaphone, Search, ChevronLeft, ChevronRight, X, Calendar } from "lucide-react";
import type { Blog } from "@shared/schema";

type LedenUpdateItem = Blog & { isUnread?: boolean };

type LedenUpdatesResponse = {
  items: LedenUpdateItem[];
  total: number;
  limit: number;
  offset: number;
};

const PAGE_SIZE = 10;

function formatDate(iso: string | Date | null | undefined) {
  if (!iso) return "";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default function LedenUpdatesPage() {
  usePageTitle("Leden-updates — OpenRegio");

  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("limit", String(PAGE_SIZE));
    sp.set("offset", String(page * PAGE_SIZE));
    if (search) sp.set("search", search);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    return sp.toString();
  }, [page, search, from, to]);

  const { data, isLoading, isFetching } = useQuery<LedenUpdatesResponse>({
    queryKey: ["/api/news/leden", { page, search, from, to }],
    queryFn: async () => {
      const res = await fetch(`/api/news/leden?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Kon leden-updates niet laden");
      return res.json();
    },
    staleTime: 1000 * 60,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = Boolean(search || from || to);

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setFrom("");
    setTo("");
    setPage(0);
  }

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-leden-updates">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff8ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Megaphone style={{ width: 24, height: 24, color: "#f28a1a" }} />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-leden-updates-title">Leden-updates</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
            Platform-aankondigingen en nieuws van OpenRegio voor leden.
          </p>
        </div>
      </div>

      <section
        className="openregio-card"
        style={{ marginTop: 16, padding: "16px 18px", borderRadius: 16 }}
        data-testid="card-leden-updates-filters"
      >
        <form
          onSubmit={applySearch}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, alignItems: "end" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label htmlFor="filter-search" style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Trefwoord
            </label>
            <div style={{ position: "relative" }}>
              <Search className="h-4 w-4" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
              <Input
                id="filter-search"
                data-testid="input-search-leden-updates"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Zoek in titels en inhoud"
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label htmlFor="filter-from" style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Vanaf
            </label>
            <Input
              id="filter-from"
              type="date"
              data-testid="input-from-leden-updates"
              value={from}
              onChange={(e) => { setPage(0); setFrom(e.target.value); }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label htmlFor="filter-to" style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>
              Tot en met
            </label>
            <Input
              id="filter-to"
              type="date"
              data-testid="input-to-leden-updates"
              value={to}
              onChange={(e) => { setPage(0); setTo(e.target.value); }}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit" data-testid="button-apply-filters">
              Zoeken
            </Button>
            {hasFilters && (
              <Button type="button" variant="outline" onClick={resetFilters} data-testid="button-reset-filters">
                <X className="h-4 w-4" />
                Wis
              </Button>
            )}
          </div>
        </form>
      </section>

      <section
        className="openregio-card"
        style={{ marginTop: 14, padding: "18px 20px", borderRadius: 18 }}
        data-testid="card-leden-updates-list"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }} data-testid="text-result-count">
            {isLoading ? "Bezig met laden…" : `${total} ${total === 1 ? "update" : "updates"} gevonden`}
          </p>
          {totalPages > 1 && (
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }} data-testid="text-pagination-info">
              Pagina {page + 1} van {totalPages}
            </p>
          )}
        </div>

        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div style={{ textAlign: "center", padding: "32px 12px", color: "#94a3b8" }} data-testid="text-empty-leden-updates">
            <Megaphone className="h-8 w-8" style={{ margin: "0 auto 10px", opacity: 0.45 }} />
            <p style={{ margin: 0, fontSize: 14 }}>
              {hasFilters
                ? "Geen leden-updates gevonden met deze filters."
                : "Er zijn nog geen leden-updates."}
            </p>
          </div>
        )}

        {!isLoading && items.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((b) => (
              <li key={b.id} data-testid={`item-leden-update-${b.id}`}>
                <Link
                  href={`/leden-updates/${b.slug}`}
                  className="hover-elevate"
                  data-testid={`link-leden-update-${b.id}`}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid #e6ebf2",
                    textDecoration: "none",
                    color: "inherit",
                    background: "#fff",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      display: "inline-flex",
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#fff2e0",
                      color: "#c2410c",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Megaphone className="h-4 w-4" />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px", fontWeight: 700, marginBottom: 4, flexWrap: "wrap" }}>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(b.publishedAt) || formatDate(b.createdAt)}</span>
                      {b.authorName && (
                        <>
                          <span style={{ opacity: 0.5 }}>·</span>
                          <span style={{ textTransform: "none", letterSpacing: 0, fontWeight: 600 }}>{b.authorName}</span>
                        </>
                      )}
                      {b.isUnread && (
                        <Badge
                          data-testid={`badge-nieuw-${b.id}`}
                          style={{ fontSize: 10, padding: "1px 7px", background: "#c2410c", color: "#fff", textTransform: "uppercase", letterSpacing: ".5px", borderRadius: 6 }}
                        >
                          Nieuw
                        </Badge>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0b2240", lineHeight: 1.4 }}>
                      {b.title}
                    </p>
                    {b.excerpt && (
                      <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>
                        {b.excerpt}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
              Vorige
            </Button>
            <span style={{ fontSize: 12, color: "#64748b" }} data-testid="text-page-indicator">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages || isFetching}
              data-testid="button-next-page"
            >
              Volgende
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </div>
  </div>
  );
}
