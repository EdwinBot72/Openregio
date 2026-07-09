import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, Calendar, BookOpen, Image, FileText } from "lucide-react";
import type { Blog, InsertBlog, BlogStatus, BlogAudience } from "@shared/schema";
import { PexelsPicker } from "@/components/PexelsPicker";

export default function AdminBlogsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<Partial<InsertBlog>>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    status: "draft",
    audience: "publiek",
    featuredImage: "",
  });

  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertBlog>) => {
      const res = await apiRequest("POST", "/api/blogs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/latest"] });
      toast({ title: "Blog aangemaakt" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertBlog> }) => {
      const res = await apiRequest("PUT", `/api/blogs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/latest"] });
      toast({ title: "Blog bijgewerkt" });
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blogs/public"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news/latest"] });
      toast({ title: "Blog verwijderd" });
    },
    onError: (error: any) => {
      toast({ title: "Fout", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft",
      audience: "publiek",
      featuredImage: "",
    });
    setEditingBlog(null);
    setIsOpen(false);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      status: blog.status,
      audience: blog.audience ?? "publiek",
      featuredImage: blog.featuredImage || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Gepubliceerd</Badge>;
      case "draft":
        return <Badge variant="secondary">Concept</Badge>;
      case "archived":
        return <Badge variant="outline">Gearchiveerd</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Blogs laden...</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eef2f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FileText style={{ width: 24, height: 24, color: "#0b2240" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }}>Content beheren</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Beheer blogs voor de homepage</p>
          </div>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-blog" onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "Blog bewerken" : "Nieuwe blog"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: !editingBlog ? generateSlug(e.target.value) : formData.slug,
                    });
                  }}
                  placeholder="Blog titel"
                  data-testid="input-blog-title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="blog-url-slug"
                  data-testid="input-blog-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Wordt gebruikt in de URL: /blog/{formData.slug || "..."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Samenvatting</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Korte samenvatting voor de homepage"
                  rows={2}
                  data-testid="input-blog-excerpt"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Inhoud</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Volledige blog inhoud..."
                  rows={10}
                  data-testid="input-blog-content"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Coverafbeelding via Pexels (optioneel)
                  </div>
                </Label>
                <PexelsPicker
                  value={formData.featuredImage || ""}
                  onChange={(url) => setFormData({ ...formData, featuredImage: url })}
                  defaultQuery={formData.title || "ondernemer"}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: BlogStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger data-testid="select-blog-status">
                      <SelectValue placeholder="Selecteer status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Concept</SelectItem>
                      <SelectItem value="published">Gepubliceerd</SelectItem>
                      <SelectItem value="archived">Gearchiveerd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audience">Doelgroep</Label>
                  <Select
                    value={formData.audience ?? "publiek"}
                    onValueChange={(value: BlogAudience) => setFormData({ ...formData, audience: value })}
                  >
                    <SelectTrigger data-testid="select-blog-audience">
                      <SelectValue placeholder="Selecteer doelgroep" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publiek">Publiek (homepage)</SelectItem>
                      <SelectItem value="leden">Leden (Vandaag-pagina)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Publieke blogs verschijnen op de openbare homepage. Leden-updates verschijnen alleen op de Vandaag-pagina van ingelogde leden.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuleren
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-blog"
                >
                  {createMutation.isPending || updateMutation.isPending ? "Opslaan..." : "Opslaan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {blogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nog geen blogs aangemaakt</p>
            <Button 
              className="mt-4" 
              onClick={() => setIsOpen(true)}
              data-testid="button-create-first-blog"
            >
              <Plus className="h-4 w-4 mr-2" />
              Eerste blog aanmaken
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Card key={blog.id} data-testid={`card-blog-admin-${blog.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  {blog.featuredImage && (
                    <div className="w-24 h-16 rounded overflow-hidden shrink-0 bg-muted">
                      <img 
                        src={blog.featuredImage} 
                        alt={blog.title}
                        className="w-full h-full object-cover"
                        data-testid={`thumbnail-blog-${blog.id}`}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getStatusBadge(blog.status)}
                      <Badge
                        variant={blog.audience === "leden" ? "default" : "outline"}
                        className="text-xs"
                        data-testid={`badge-audience-${blog.id}`}
                      >
                        {blog.audience === "leden" ? "Leden-update" : "Publiek"}
                      </Badge>
                      {!blog.featuredImage && (
                        <Badge variant="outline" className="text-xs">
                          <Image className="h-3 w-3 mr-1" />
                          Geen afbeelding
                        </Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        /blog/{blog.slug}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg truncate">{blog.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {blog.status === "published" ? `Gepubliceerd: ${formatDate(blog.publishedAt)}` : `Aangemaakt: ${formatDate(blog.createdAt)}`}
                      </span>
                      {blog.authorName && (
                        <span>Door: {blog.authorName}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {blog.status === "published" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                        title="Bekijken"
                        data-testid={`button-view-blog-${blog.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(blog)}
                      title="Bewerken"
                      data-testid={`button-edit-blog-${blog.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Weet je zeker dat je deze blog wilt verwijderen?")) {
                          deleteMutation.mutate(blog.id);
                        }
                      }}
                      title="Verwijderen"
                      data-testid={`button-delete-blog-${blog.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  </div>
  );
}
