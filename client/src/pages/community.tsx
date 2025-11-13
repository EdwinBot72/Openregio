import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

const postTypes = [
  { value: "vraag", label: "Vraag", variant: "default" as const },
  { value: "aanbieding", label: "Aanbieding", variant: "secondary" as const },
  { value: "lead", label: "Lead", variant: "default" as const },
  { value: "event", label: "Event", variant: "secondary" as const },
  { value: "update", label: "Update", variant: "outline" as const },
];

const formSchema = insertPostSchema.extend({
  type: z.enum(["vraag", "aanbieding", "lead", "event", "update"], {
    required_error: "Type is verplicht",
  }),
});

type FormValues = z.infer<typeof formSchema>;

function NewPostDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "vraag",
      title: "",
      body: "",
      region: "Amsterdam",
      authorUserId: null,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await apiRequest("POST", "/api/posts", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      toast({
        title: "Post aangemaakt!",
        description: "Je post is succesvol geplaatst in de community.",
      });
      
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Fout bij aanmaken",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-post">
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nieuwe Post</DialogTitle>
          <DialogDescription>
            Deel een vraag, aanbieding, lead, event of update met de community
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-post-type">
                        <SelectValue placeholder="Selecteer type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="vraag">Vraag</SelectItem>
                      <SelectItem value="aanbieding">Aanbieding</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Regio</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-region">
                        <SelectValue placeholder="Selecteer regio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Amsterdam">Amsterdam</SelectItem>
                      <SelectItem value="Rotterdam">Rotterdam</SelectItem>
                      <SelectItem value="Utrecht">Utrecht</SelectItem>
                      <SelectItem value="Den Haag">Den Haag</SelectItem>
                      <SelectItem value="Leiden">Leiden</SelectItem>
                      <SelectItem value="Haarlem">Haarlem</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input placeholder="Korte, bondige titel..." {...field} data-testid="input-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bericht</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschrijf je vraag, aanbieding, lead, event of update in detail..."
                      className="min-h-[120px]"
                      {...field}
                      data-testid="input-body"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                Annuleer
              </Button>
              <Button type="submit" data-testid="button-submit">
                Plaats Post
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function PostCard({ post }: { post: Post }) {
  const typeInfo = postTypes.find((t) => t.value === post.type) || postTypes[0];
  
  return (
    <Card className="hover-elevate" data-testid={`post-${post.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={typeInfo.variant} data-testid={`badge-${post.type}`}>
              {typeInfo.label}
            </Badge>
            <Badge variant="outline" data-testid={`badge-region-${post.id}`}>
              {post.region}
            </Badge>
          </div>
          <CardTitle className="text-lg" data-testid={`title-${post.id}`}>
            {post.title}
          </CardTitle>
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap" data-testid={`time-${post.id}`}>
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: nl })}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground whitespace-pre-wrap" data-testid={`body-${post.id}`}>
          {post.body}
        </p>
      </CardContent>
    </Card>
  );
}

export default function CommunityPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts", typeFilter !== "all" ? typeFilter : undefined],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }
      const response = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="title-community">Community & Kansenbord</h1>
            <p className="text-muted-foreground">
              Deel vragen, aanbiedingen, leads en events met lokale ondernemers
            </p>
          </div>
          <NewPostDialog />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]" data-testid="select-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle types</SelectItem>
              <SelectItem value="vraag">Vragen</SelectItem>
              <SelectItem value="aanbieding">Aanbiedingen</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="event">Events</SelectItem>
              <SelectItem value="update">Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground" data-testid="text-loading">Laden...</p>
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-4" data-testid="feed">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground" data-testid="text-empty">
                Nog geen posts. Wees de eerste om iets te delen!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
