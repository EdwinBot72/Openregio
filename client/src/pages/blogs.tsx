import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, User, ArrowRight } from "lucide-react";
import type { Blog } from "@shared/schema";
import { PublicTopNav } from "@/components/PublicTopNav";

export default function BlogsPage() {
  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs/public"],
  });

  const formatDate = (date: string | Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="openregio-public-page" data-testid="page-blogs">
      <PublicTopNav />
      <div className="openregio-public-content" style={{ maxWidth: 880 }}>
        <h1 className="openregio-public-title" data-testid="text-blogs-title">Blogs</h1>
        <p className="openregio-public-lead">Nieuws, tips en inzichten voor lokale ondernemers.</p>

        {isLoading ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "32px 0" }}>Laden…</p>
        ) : blogs.length === 0 ? (
          <p style={{ color: "#64748b", textAlign: "center", padding: "32px 0" }}>Nog geen blogs gepubliceerd.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
            {blogs.map((blog) => (
              <article
                key={blog.id}
                className="openregio-public-card"
                style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", marginBottom: 0 }}
                data-testid={`card-blog-${blog.id}`}
              >
                {blog.featuredImage && (
                  <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#e6ebf2" }}>
                    <img
                      src={blog.featuredImage}
                      alt={blog.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      data-testid={`img-blog-${blog.id}`}
                    />
                  </div>
                )}
                <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(blog.publishedAt)}
                    </span>
                    {blog.authorName && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <User className="h-3 w-3" />
                        {blog.authorName}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0b2240", marginBottom: 6, lineHeight: 1.3 }}>
                    {blog.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.6, flex: 1 }}>
                    {blog.excerpt}
                  </p>
                  <Link href={`/blog/${blog.slug}`}>
                    <button
                      className="openregio-button openregio-button-outline openregio-button-small"
                      data-testid={`button-read-blog-${blog.id}`}
                      style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      Lees meer <ArrowRight className="h-3 w-3" />
                    </button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <footer style={{ borderTop: "1px solid #e6ebf2", padding: "24px 16px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        © 2026 OpenRegio – Regionale omzet. Duidelijke regels. Sterke ondernemers.
      </footer>
    </div>
  );
}
