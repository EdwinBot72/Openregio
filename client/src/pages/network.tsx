import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { useLocation, useSearch } from "wouter";
import {
  HelpCircle,
  Megaphone,
  Share2,
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
  Loader2,
  Building2,
  Globe,
  Users,
} from "lucide-react";
import { PROVINCES_REGIONS, PROVINCES, POST_TYPES } from "@shared/schema";
import type { Post, Bedrijfsprofiel } from "@shared/schema";

type PostType = "vraag" | "aanbod" | "lead" | "event" | "alles";

const postFormSchema = z.object({
  type: z.enum(["vraag", "aanbieding", "lead", "event", "update"]),
  title: z.string().min(3, "Titel moet minimaal 3 tekens zijn"),
  body: z.string().min(10, "Beschrijving moet minimaal 10 tekens zijn"),
  region: z.string().min(1, "Selecteer een regio"),
});

type PostFormValues = z.infer<typeof postFormSchema>;

function NewPostDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      type: "vraag",
      title: "",
      body: "",
      region: "Amsterdam",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      return await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post geplaatst!",
        description: "Je bericht is zichtbaar in het netwerk.",
      });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon post niet plaatsen. Ben je ingelogd?",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PostFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-new-post">
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe post plaatsen</DialogTitle>
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
                      <SelectItem value="aanbieding">Aanbod</SelectItem>
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input placeholder="Korte titel" data-testid="input-post-title" {...field} />
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
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Wat wil je delen?" data-testid="input-post-body" {...field} />
                  </FormControl>
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
                      <SelectTrigger data-testid="select-post-region">
                        <SelectValue placeholder="Selecteer regio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-80">
                      {PROVINCES.map((province) => (
                        <SelectGroup key={province}>
                          <SelectLabel className="font-semibold text-primary">{province}</SelectLabel>
                          {PROVINCES_REGIONS[province].map((region) => (
                            <SelectItem key={region} value={region} className="pl-6">
                              {region}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={createMutation.isPending}
              data-testid="button-submit-post"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Plaatsen...
                </>
              ) : (
                "Plaatsen"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function MemberCard({ member }: { member: Bedrijfsprofiel }) {
  return (
    <Card data-testid={`card-member-${member.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold" data-testid={`text-member-name-${member.id}`}>
                {member.naam}
              </h3>
              <Badge variant="outline" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {member.regio}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{member.eigenaarnaam}</p>
            {member.beschrijving && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {member.beschrijving}
              </p>
            )}
            {member.websiteUrl && (
              <a 
                href={member.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                data-testid={`link-website-${member.id}`}
              >
                <Globe className="w-3 h-3" />
                Website bezoeken
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post, currentUserId, isAdmin }: { post: Post; currentUserId?: string; isAdmin?: boolean }) {
  const { toast } = useToast();
  
  const canDelete = isAdmin || post.authorUserId === currentUserId;
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post verwijderd",
        description: "Je post is verwijderd uit het netwerk.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon post niet verwijderen.",
        variant: "destructive",
      });
    },
  });

  function labelForType(t: string) {
    switch (t) {
      case "vraag": return "Vraag";
      case "aanbieding": case "aanbod": return "Aanbod";
      case "lead": return "Lead";
      case "event": return "Event";
      case "update": return "Update";
      default: return t;
    }
  }

  function iconForType(t: string) {
    switch (t) {
      case "vraag": return <HelpCircle className="w-3 h-3" />;
      case "aanbieding": case "aanbod": return <Megaphone className="w-3 h-3" />;
      case "lead": return <Share2 className="w-3 h-3" />;
      case "event": return <CalendarDays className="w-3 h-3" />;
      default: return null;
    }
  }

  const createdAt = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: nl }) : "";

  return (
    <Card data-testid={`card-post-${post.id}`}>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {iconForType(post.type)}
              {labelForType(post.type)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {post.region}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{createdAt}</span>
            {canDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${post.id}`}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 text-destructive" />
                )}
              </Button>
            )}
          </div>
        </div>

        <h2 className="font-semibold text-sm md:text-base" data-testid={`text-post-title-${post.id}`}>
          {post.title}
        </h2>
        <p className="text-sm text-muted-foreground">{post.body}</p>
      </CardContent>
    </Card>
  );
}

type ViewTab = "posts" | "leden";

export default function NetworkPage() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialRegio = searchParams.get("regio");
  
  const [activeTab, setActiveTab] = useState<ViewTab>(initialRegio ? "leden" : "posts");
  const [typeFilter, setTypeFilter] = useState<PostType>("alles");
  const [regionFilter, setRegionFilter] = useState<string>(initialRegio || "alle");
  const { user } = useAuth();

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: allMembers, isLoading: membersLoading } = useQuery<Bedrijfsprofiel[]>({
    queryKey: ["/api/business-profiles/public"],
  });

  const regions = ["alle", ...Object.values(PROVINCES_REGIONS).flat()];

  const filteredMembers = allMembers?.filter((member) => {
    if (regionFilter !== "alle" && member.regio !== regionFilter) return false;
    return true;
  }) || [];

  const filteredPosts = posts?.filter((post) => {
    if (typeFilter !== "alles") {
      const normalizedType = post.type === "aanbieding" ? "aanbod" : post.type;
      if (normalizedType !== typeFilter) return false;
    }
    if (regionFilter !== "alle" && post.region !== regionFilter) return false;
    return true;
  }) || [];

  const isLoading = activeTab === "posts" ? postsLoading : membersLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="text-network-title">
          Netwerk & Kansenbord
        </h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {activeTab === "leden" 
            ? "Bekijk alle ondernemers in jouw regio en maak direct contact."
            : "Deel concrete vragen, aanbiedingen, leads en events met ondernemers in jouw regio."}
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          data-testid="tab-posts"
          className={[
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "posts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <HelpCircle className="w-4 h-4 inline mr-2" />
          Kansenbord
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("leden")}
          data-testid="tab-leden"
          className={[
            "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
            activeTab === "leden"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Leden ({filteredMembers.length})
        </button>
      </div>

      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          {activeTab === "posts" && (
            <>
              <span className="font-semibold">Filter:</span>
              <div className="inline-flex rounded-full border bg-background p-1">
                {[
                  { key: "alles", label: "Alles" },
                  { key: "vraag", label: "Vraag" },
                  { key: "aanbod", label: "Aanbod" },
                  { key: "lead", label: "Lead" },
                  { key: "event", label: "Event" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTypeFilter(opt.key as PostType)}
                    data-testid={`button-filter-${opt.key}`}
                    className={[
                      "px-3 py-1 rounded-full text-xs md:text-sm transition-colors",
                      typeFilter === opt.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              data-testid="select-region"
              className="border rounded-md px-2 py-1 text-xs md:text-sm bg-background"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r === "alle" ? "Alle regio's" : r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeTab === "posts" && <NewPostDialog />}
      </section>

      <section className="space-y-3">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {activeTab === "posts" && (
          <>
            {!postsLoading && filteredPosts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-posts">
                Nog geen berichten met deze filters. Plaats de eerste vraag of aanbod.
              </p>
            )}

            {filteredPosts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                currentUserId={user?.id}
                isAdmin={user?.isAdmin}
              />
            ))}
          </>
        )}

        {activeTab === "leden" && (
          <>
            {!membersLoading && filteredMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8" data-testid="text-no-members">
                {regionFilter !== "alle" 
                  ? `Nog geen leden gevonden in ${regionFilter}.`
                  : "Nog geen leden gevonden."}
              </p>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              {filteredMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
