import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import type { Blog } from "@shared/schema";

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Blog niet gevonden</h1>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/" 
            className="font-accent text-2xl font-bold text-primary" 
            data-testid="link-home-logo"
          >
            OpenRegio
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2" 
              data-testid="button-nav-login"
            >
              Inloggen
            </Link>
          </div>
        </div>
      </nav>

      <article className="py-12 px-4" data-testid="blog-article">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar home
            </Button>
          </Link>

          {blog.featuredImage && (
            <div className="aspect-video overflow-hidden rounded-md mb-8">
              <img 
                src={blog.featuredImage} 
                alt={blog.title} 
                className="w-full h-full object-cover"
                data-testid="img-blog-featured"
              />
            </div>
          )}

          <h1 
            className="font-accent text-3xl md:text-5xl font-bold mb-4" 
            data-testid="text-blog-title"
          >
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span data-testid="text-blog-date">{formatDate(blog.publishedAt)}</span>
            </div>
            {blog.authorName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span data-testid="text-blog-author">{blog.authorName}</span>
              </div>
            )}
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-lg text-muted-foreground italic" data-testid="text-blog-excerpt">
                {blog.excerpt}
              </p>
            </CardContent>
          </Card>

          <div 
            className="prose prose-lg max-w-none dark:prose-invert" 
            data-testid="content-blog-body"
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br/>') }}
          />

          <div className="mt-12 pt-8 border-t">
            <Link href="/">
              <Button data-testid="button-blog-cta">
                Word lid van OpenRegio
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>© 2026 OpenRegio – Regionale omzet. Duidelijke regels. Sterke ondernemers.</p>
        </div>
      </footer>
    </div>
  );
}
