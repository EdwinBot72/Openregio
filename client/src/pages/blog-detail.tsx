import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, User } from "lucide-react";
import type { Blog } from "@shared/schema";
import { PublicTopNav } from "@/components/PublicTopNav";

export default function BlogDetailPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: blog, isLoading, error } = useQuery<Blog>({
    queryKey: ["/api/blogs/public", slug],
    queryFn: async () => {
      const res = await fetch(`/api/blogs/public/${slug}`);
      if (!res.ok) throw new Error("Blog niet gevonden");
      return res.json();
    },
    enabled: !!slug,
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="openregio-public-page">
        <PublicTopNav />
        <div className="openregio-public-content" style={{ textAlign: "center" }}>
          <p style={{ color: "#64748b" }}>Laden…</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="openregio-public-page">
        <PublicTopNav />
        <div className="openregio-public-content" style={{ textAlign: "center" }}>
          <h1 className="openregio-public-title">Blog niet gevonden</h1>
          <Link href="/">
            <button className="openregio-button openregio-button-outline" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ArrowLeft className="h-4 w-4" /> Terug naar home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="openregio-public-page" data-testid="page-blog-detail">
      <PublicTopNav />
      <article className="openregio-public-content" style={{ maxWidth: 760 }} data-testid="blog-article">
        <Link href="/blogs">
          <button
            className="openregio-button openregio-button-outline openregio-button-small"
            data-testid="button-back-blogs"
            style={{ marginBottom: 18, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft className="h-3 w-3" /> Alle blogs
          </button>
        </Link>

        {blog.featuredImage ? (
          <div className="openregio-blog-hero">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              data-testid="img-blog-featured"
            />
            <div className="openregio-blog-hero-wash" />
            <div className="openregio-blog-hero-content">
              <h1 className="openregio-blog-hero-title" data-testid="text-blog-title">
                {blog.title}
              </h1>
              <div className="openregio-blog-hero-meta">
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar className="h-3 w-3" />
                  <span data-testid="text-blog-date">{formatDate(blog.publishedAt)}</span>
                </span>
                {blog.authorName && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <User className="h-3 w-3" />
                    <span data-testid="text-blog-author">{blog.authorName}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1 className="openregio-public-title" data-testid="text-blog-title">{blog.title}</h1>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#94a3b8", marginBottom: 24 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Calendar className="h-3 w-3" />
                <span data-testid="text-blog-date">{formatDate(blog.publishedAt)}</span>
              </span>
              {blog.authorName && (
                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <User className="h-3 w-3" />
                  <span data-testid="text-blog-author">{blog.authorName}</span>
                </span>
              )}
            </div>
          </>
        )}

        <div className="openregio-public-card" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 16, color: "#475569", fontStyle: "italic", margin: 0, lineHeight: 1.6 }} data-testid="text-blog-excerpt">
            {blog.excerpt}
          </p>
        </div>

        <div
          className="openregio-public-card"
          data-testid="content-blog-body"
          style={{ fontSize: 15, lineHeight: 1.8, color: "#1f2937" }}
          dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, "<br/>") }}
        />

        <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid #e6ebf2", textAlign: "center" }}>
          <Link href="/lidmaatschap">
            <button className="openregio-button openregio-button-primary" data-testid="button-blog-cta">
              Word lid van OpenRegio
            </button>
          </Link>
        </div>
      </article>

      <footer style={{ borderTop: "1px solid #e6ebf2", padding: "24px 16px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        © 2026 OpenRegio – Regionale omzet. Duidelijke regels. Sterke ondernemers.
      </footer>
    </div>
  );
}
