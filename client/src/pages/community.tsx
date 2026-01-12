import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Post, User, Bedrijfsprofiel } from "@shared/schema";
import { POST_TYPES, REGIONS, insertPostSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { QueryState } from "@/components/query-state";
import { Plus, MessageSquare, LogIn, MapPin, Search, ChevronLeft, ChevronRight, HelpCircle, Megaphone, Users, Calendar, RefreshCw } from "lucide-react";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";
import { Link } from "wouter";

const postTypes = [
  { value: "all", label: "Alles", icon: RefreshCw, variant: "outline" as const },
  { value: "vraag", label: "Vragen", icon: HelpCircle, variant: "default" as const },
  { value: "lead", label: "Leads", icon: Users, variant: "default" as const },
  { value: "event", label: "Events", icon: Calendar, variant: "secondary" as const },
  { value: "aanbieding", label: "Aanbiedingen", icon: Megaphone, variant: "secondary" as const },
  { value: "update", label: "Updates", icon: RefreshCw, variant: "outline" as const },
];

const POSTS_PER_PAGE = 20;

type FormValues = z.infer<typeof insertPostSchema>;

function RegionCombobox({ 
  value, 
  onChange,
  testId 
}: { 
  value: string; 
  onChange: (value: string) => void;
  testId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRegions = useMemo(() => {
    if (!search) return REGIONS.slice(0, 50);
    const lower = search.toLowerCase();
    return REGIONS.filter(r => r.toLowerCase().includes(lower)).slice(0, 50);
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="justify-between min-w-[200px]"
          data-testid={testId}
        >
          <MapPin className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{value || "Alle regio's"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Zoek regio..." 
            value={search}
            onValueChange={setSearch}
            data-testid="input-region-search"
          />
          <CommandList>
            <CommandEmpty>Geen regio gevonden.</CommandEmpty>
            <CommandGroup>
              <CommandItem 
                value="all"
                onSelect={() => {
                  onChange("");
                  setOpen(false);
                }}
                data-testid="option-region-all"
              >
                Alle regio's
              </CommandItem>
              {filteredRegions.map((region) => (
                <CommandItem
                  key={region}
                  value={region}
                  onSelect={() => {
                    onChange(region);
                    setOpen(false);
                  }}
                  data-testid={`option-region-${region}`}
                >
                  {region}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function NewPostDialog({ isAuthenticated, userRegion }: { isAuthenticated: boolean; userRegion?: string }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const defaultRegion = (REGIONS.includes(userRegion as any) ? userRegion : "Amsterdam") as typeof REGIONS[number];

  const form = useForm({
    resolver: zodResolver(insertPostSchema.omit({ authorUserId: true })),
    defaultValues: {
      type: "vraag" as const,
      title: "",
      body: "",
      region: defaultRegion,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("POST", "/api/posts", data);
      
      queryClient.invalidateQueries({ queryKey: ["/api/posts"], exact: false });
      
      toast({
        title: "Post aangemaakt!",
        description: "Je post is succesvol geplaatst in de community.",
      });
      
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const isAuthError = error?.message?.includes("401") || error?.message?.includes("ingelogd");
      toast({
        title: isAuthError ? "Niet ingelogd" : "Fout bij aanmaken",
        description: isAuthError 
          ? "Je moet ingelogd zijn om een post te plaatsen." 
          : "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Link href="/login">
        <Button variant="outline" data-testid="button-login-to-post">
          <LogIn className="mr-2 h-4 w-4" />
          Log in om te posten
        </Button>
      </Link>
    );
  }

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
                      {POST_TYPES.map((type) => {
                        const typeInfo = postTypes.find((t) => t.value === type);
                        return (
                          <SelectItem key={type} value={type}>
                            {typeInfo?.label || type}
                          </SelectItem>
                        );
                      })}
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
                    <SelectContent className="max-h-[200px]">
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
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
  const typeInfo = postTypes.find((t) => t.value === post.type) || postTypes[1];
  
  return (
    <Card className="hover-elevate" data-testid={`post-${post.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant={typeInfo.variant} data-testid={`badge-${post.type}`}>
              {typeInfo.label}
            </Badge>
            <Badge variant="outline" data-testid={`badge-region-${post.id}`}>
              <MapPin className="mr-1 h-3 w-3" />
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
  const [regionFilter, setRegionFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: user } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/user", { credentials: "include" });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user || data;
    },
    retry: false,
  });

  const { data: profile } = useQuery<Bedrijfsprofiel | null>({
    queryKey: ["/api/business-profile/me"],
    queryFn: async () => {
      const response = await fetch("/api/business-profile/me", { credentials: "include" });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user,
    retry: false,
  });

  const userRegion = user?.region || profile?.regio || "";

  const { data: posts, isLoading, isError, error, refetch } = useQuery<Post[]>({
    queryKey: ["/api/posts", typeFilter, regionFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }
      if (regionFilter) {
        params.append("region", regionFilter);
      }
      const response = await fetch(`/api/posts?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
  });

  const paginatedPosts = useMemo(() => {
    if (!posts) return [];
    const start = (page - 1) * POSTS_PER_PAGE;
    return posts.slice(start, start + POSTS_PER_PAGE);
  }, [posts, page]);

  const totalPages = Math.ceil((posts?.length || 0) / POSTS_PER_PAGE);

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleRegionFilter = (region: string) => {
    setRegionFilter(region);
    setPage(1);
  };

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
          <NewPostDialog isAuthenticated={!!user} userRegion={userRegion} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2" data-testid="type-filters">
            {postTypes.map((type) => {
              const Icon = type.icon;
              const isActive = typeFilter === type.value;
              return (
                <Button
                  key={type.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTypeFilter(type.value)}
                  className={isActive ? "" : "toggle-elevate"}
                  data-testid={`filter-${type.value}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {type.label}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <RegionCombobox 
              value={regionFilter} 
              onChange={handleRegionFilter}
              testId="filter-region"
            />
            {userRegion && regionFilter !== userRegion && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRegionFilter(userRegion)}
                data-testid="filter-my-region"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Mijn regio ({userRegion})
              </Button>
            )}
          </div>
        </div>

        <QueryState
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!posts || posts.length === 0}
          emptyMessage="Nog geen posts in deze categorie. Wees de eerste om iets te delen!"
          emptyIcon={<MessageSquare className="w-8 h-8 text-muted-foreground" />}
          onRetry={() => refetch()}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span data-testid="posts-count">{posts?.length || 0} posts gevonden</span>
              {totalPages > 1 && (
                <span data-testid="page-info">Pagina {page} van {totalPages}</span>
              )}
            </div>

            <div className="grid gap-4" data-testid="feed">
              {paginatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4" data-testid="pagination">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Vorige
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-10"
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  data-testid="button-next-page"
                >
                  Volgende
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </QueryState>
      </div>
    </div>
  );
}
