import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, PenSquare, Calendar, User, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface BlogPost {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  excerpt?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: posts = [], isLoading, refetch } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/blog", { title, content });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Gepubliceerd!", description: "Je blogpost is gepubliceerd." });
      setTitle("");
      setContent("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
    onError: (err: any) => {
      toast({ title: "Fout", description: err?.message || "Kon niet publiceren", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest("DELETE", `/api/blog/${postId}`);
    },
    onSuccess: () => {
      toast({ title: "Verwijderd", description: "Je blogpost is verwijderd." });
      setSelectedPost(null);
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
    onError: (err: any) => {
      toast({ title: "Fout", description: err?.message || "Kon niet verwijderen", variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Velden verplicht", description: "Vul titel en inhoud in.", variant: "destructive" });
      return;
    }
    createMutation.mutate();
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: nl });
    } catch {
      return dateString;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen">
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="font-accent text-2xl font-bold text-primary">
              OpenRegio
            </Link>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-accent text-2xl font-bold text-primary" data-testid="link-blog-logo">
            OpenRegio
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/lidmaatschap" className="text-sm font-medium hover:text-primary transition-colors" data-testid="link-blog-membership">
              Lidmaatschap
            </Link>
            <Link href="/blog" className="text-sm font-medium text-primary" data-testid="link-blog-current">
              Blog
            </Link>
            {user ? (
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2" data-testid="button-blog-dashboard">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 h-8 px-3 py-2" data-testid="button-blog-login">
                Inloggen
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-accent text-3xl font-bold" data-testid="text-blog-title">Blog</h1>
            <p className="text-muted-foreground mt-1">Nieuws en updates van de OpenRegio community</p>
          </div>
          
          {user && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-new-post">
                  <Plus className="mr-2 h-4 w-4" />
                  Nieuwe post
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Nieuwe blogpost</DialogTitle>
                  <DialogDescription>Schrijf een bericht voor de community</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">Titel</Label>
                    <Input
                      id="post-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Bijv. Welkom bij OpenRegio"
                      data-testid="input-post-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-content">Inhoud</Label>
                    <Textarea
                      id="post-content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Schrijf je bericht hier..."
                      rows={8}
                      data-testid="textarea-post-content"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button onClick={handleSubmit} disabled={createMutation.isPending} data-testid="button-publish-post">
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publiceren...
                      </>
                    ) : (
                      <>
                        <PenSquare className="mr-2 h-4 w-4" />
                        Publiceren
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <PenSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-lg mb-2">Nog geen blogposts</h3>
              <p className="text-muted-foreground">
                {user ? "Schrijf de eerste blogpost voor de community!" : "Er zijn nog geen berichten gepubliceerd."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover-elevate cursor-pointer" onClick={() => setSelectedPost(post)} data-testid={`card-post-${post.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.authorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.createdAt)}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3">
                    {post.excerpt || post.content.slice(0, 200)}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedPost && (
          <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedPost.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(selectedPost.createdAt)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {selectedPost.content}
                </div>
              </div>
              {user?.id === selectedPost.authorId && (
                <DialogFooter>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteMutation.mutate(selectedPost.id)}
                    disabled={deleteMutation.isPending}
                    data-testid="button-delete-post"
                  >
                    {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                    Verwijderen
                  </Button>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        )}
      </main>

      <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} OpenRegio - Lokaal ondernemerschap</p>
      </footer>
    </div>
  );
}
