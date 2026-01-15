import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, ArrowRight } from "lucide-react";
import type { Blog } from "@shared/schema";

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
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary" 
            data-testid="link-home-logo"
          >
            OpenRegio
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/lidmaatschap" 
              className="text-sm font-medium hover:text-primary transition-colors" 
              data-testid="link-membership"
            >
              Lidmaatschap
            </Link>
            <Link 
              href="/blogs" 
              className="text-sm font-medium text-primary" 
              data-testid="link-blogs"
            >
              Blogs
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2" 
              data-testid="button-nav-login"
            >
              Inloggen
            </Link>
            <Link 
              href="/start?plan=basic" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2 bg-primary text-primary-foreground border border-primary-border" 
              data-testid="button-nav-start"
            >
              Word lid
            </Link>
          </div>
        </div>
      </nav>

      <main className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back-home">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar home
              </Button>
            </Link>
            <h1 className="font-accent text-3xl md:text-4xl font-bold mb-2" data-testid="text-blogs-title">
              Blogs
            </h1>
            <p className="text-lg text-muted-foreground">
              Nieuws, tips en inzichten voor lokale ondernemers
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Laden...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nog geen blogs gepubliceerd.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Card 
                  key={blog.id} 
                  className="group overflow-hidden hover-elevate"
                  data-testid={`card-blog-${blog.id}`}
                >
                  {blog.featuredImage && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        data-testid={`img-blog-${blog.id}`}
                      />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(blog.publishedAt)}</span>
                      </div>
                      {blog.authorName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{blog.authorName}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-accent text-xl font-semibold mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <Link href={`/blog/${blog.slug}`}>
                      <Button variant="outline" size="sm" data-testid={`button-read-blog-${blog.id}`}>
                        Lees meer
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-8 px-4 border-t mt-12">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 OpenRegio – Regionale omzet. Duidelijke regels. Sterke ondernemers.</p>
        </div>
      </footer>
    </div>
  );
}
