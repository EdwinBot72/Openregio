import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { useSearch, Link } from "wouter";
import { Loader2, Users, ArrowLeft } from "lucide-react";
import { PROVINCES_REGIONS, PROVINCES } from "@shared/schema";
import type { Post, Bedrijfsprofiel } from "@shared/schema";

const CATEGORIE_LABELS: Record<string, string> = {
  retail: "Retail & Winkels",
  food: "Horeca & Catering",
  services: "Zakelijke Diensten",
  tech: "Technologie & ICT",
  health: "Gezondheid & Welzijn",
  education: "Onderwijs & Training",
  creative: "Creatief & Media",
  construction: "Bouw & Renovatie",
  agriculture: "Landbouw & Tuinbouw",
  transport: "Transport & Logistiek",
};

type PostType = "vraag" | "aanbod" | "lead" | "event" | "alles";
type ViewTab = "leden" | "posts";

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
    defaultValues: { type: "vraag", title: "", body: "", region: "Amsterdam" },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PostFormValues) => apiRequest("POST", "/api/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post geplaatst!", description: "Je bericht is zichtbaar in het netwerk." });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon post niet plaatsen. Ben je ingelogd?", variant: "destructive" });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="openregio-button openregio-button-primary" data-testid="button-new-post">
          + Nieuwe post
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuwe post plaatsen</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-post-type"><SelectValue /></SelectTrigger>
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
                  <FormControl><Input data-testid="input-post-title" {...field} /></FormControl>
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
                  <FormControl><Textarea data-testid="input-post-body" {...field} /></FormControl>
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
                      <SelectTrigger data-testid="select-post-region"><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-80">
                      {PROVINCES.map((province) => (
                        <SelectGroup key={province}>
                          <SelectLabel className="font-semibold">{province}</SelectLabel>
                          {PROVINCES_REGIONS[province].map((region) => (
                            <SelectItem key={region} value={region} className="pl-6">{region}</SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="openregio-button openregio-button-primary openregio-button-large"
              data-testid="button-submit-post"
            >
              {createMutation.isPending ? "Plaatsen..." : "Plaatsen"}
            </button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function getInitials(naam: string): string {
  const parts = naam.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type MemberWithPro = Bedrijfsprofiel & { isPro?: boolean };

function MemberCard({ member }: { member: MemberWithPro }) {
  const categorieLabel = CATEGORIE_LABELS[member.categorieId] ?? member.categorieId;
  const websiteUrl = member.websiteUrl
    ? member.websiteUrl.startsWith("http")
      ? member.websiteUrl
      : `https://${member.websiteUrl}`
    : null;

  return (
    <div className="openregio-member-card" data-testid={`card-member-${member.id}`}>
      <div className="openregio-member-avatar" aria-hidden="true">
        {getInitials(member.naam)}
      </div>
      <div className="openregio-member-header">
        <h3 data-testid={`text-member-name-${member.id}`}>{member.naam}</h3>
        {member.isPro && (
          <span
            className="openregio-plan-badge openregio-plan-pro"
            style={{ marginLeft: 8, fontSize: 10 }}
            data-testid={`badge-pro-${member.id}`}
          >
            Pro
          </span>
        )}
      </div>
      {categorieLabel && (
        <span className="openregio-member-category" data-testid={`text-categorie-${member.id}`}>
          {categorieLabel}
        </span>
      )}
      {member.regio && member.regio !== "-" && (
        <span
          className="openregio-member-category"
          style={{ marginLeft: 6, background: "#f8faff", color: "#475569" }}
          data-testid={`text-regio-${member.id}`}
        >
          {member.regio}
        </span>
      )}
      {member.beschrijving && (
        <p className="openregio-member-bio" data-testid={`text-member-desc-${member.id}`}>
          {member.beschrijving}
        </p>
      )}
      <div className="openregio-member-actions">
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="openregio-button openregio-button-outline openregio-button-small"
            data-testid={`link-website-${member.id}`}
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}

function PostItem({
  post,
  currentUserId,
  isAdmin,
}: {
  post: Post;
  currentUserId?: string;
  isAdmin?: boolean;
}) {
  const { toast } = useToast();
  const canDelete = isAdmin || post.authorUserId === currentUserId;

  const deleteMutation = useMutation({
    mutationFn: async () => apiRequest("DELETE", `/api/posts/${post.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Post verwijderd" });
    },
    onError: () => toast({ title: "Fout", description: "Kon post niet verwijderen.", variant: "destructive" }),
  });

  const labelType = (t: string) =>
    ({
      vraag: "Vraag",
      aanbieding: "Aanbod",
      aanbod: "Aanbod",
      lead: "Lead",
      event: "Event",
      update: "Update",
    } as Record<string, string>)[t] ?? t;

  const created = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: nl })
    : "";

  return (
    <div className="openregio-card" data-testid={`card-post-${post.id}`}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span className="openregio-member-category">{labelType(post.type)}</span>
          <span
            className="openregio-member-category"
            style={{ background: "#f8faff", color: "#475569" }}
          >
            {post.region}
          </span>
          {created && (
            <span style={{ fontSize: 11, color: "#94a3b8" }} data-testid={`time-${post.id}`}>
              {created}
            </span>
          )}
        </div>
        {canDelete && (
          <button
            className="openregio-button openregio-button-danger openregio-button-small"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            data-testid={`button-delete-${post.id}`}
          >
            {deleteMutation.isPending ? "..." : "Verwijderen"}
          </button>
        )}
      </div>
      <h3 data-testid={`text-post-title-${post.id}`}>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  );
}

export default function NetworkPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialRegio = params.get("regio");

  const [activeTab, setActiveTab] = useState<ViewTab>(initialRegio ? "leden" : "posts");
  const [typeFilter, setTypeFilter] = useState<PostType>("alles");
  const [regionFilter, setRegionFilter] = useState<string>(initialRegio || "alle");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({ queryKey: ["/api/posts"] });
  const { data: allMembers, isLoading: membersLoading } = useQuery<MemberWithPro[]>({
    queryKey: ["/api/business-profiles/public"],
  });

  const regions = ["alle", ...Object.values(PROVINCES_REGIONS).flat()];

  const filteredMembers =
    allMembers?.filter((m) => {
      if (regionFilter !== "alle" && m.regio !== regionFilter) return false;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        if (
          !m.naam.toLowerCase().includes(t) &&
          !(m.beschrijving ?? "").toLowerCase().includes(t)
        )
          return false;
      }
      return true;
    }) ?? [];

  const filteredPosts =
    posts?.filter((p) => {
      if (typeFilter !== "alles") {
        const norm = p.type === "aanbieding" ? "aanbod" : p.type;
        if (norm !== typeFilter) return false;
      }
      if (regionFilter !== "alle" && p.region !== regionFilter) return false;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        if (!p.title.toLowerCase().includes(t) && !p.body.toLowerCase().includes(t))
          return false;
      }
      return true;
    }) ?? [];

  const isLoading = activeTab === "posts" ? postsLoading : membersLoading;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }} data-testid="page-network">
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      <Link href="/vandaag">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 18, cursor: "pointer" }}>
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Terug naar dashboard
        </div>
      </Link>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#fff8ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users style={{ width: 24, height: 24, color: "#f28a1a" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="text-page-title">Netwerk</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              {activeTab === "leden"
                ? "Verbind met andere lokale ondernemers in jouw regio."
                : "Deel concrete vragen, aanbiedingen, leads en events met ondernemers in jouw regio."}
            </p>
          </div>
        </div>
      </div>

      {/* Tab-toggle */}
      <div className="openregio-form-actions" style={{ marginBottom: 18 }}>
        <button
          type="button"
          onClick={() => setActiveTab("leden")}
          className={`openregio-button openregio-button-small ${
            activeTab === "leden" ? "openregio-button-primary" : "openregio-button-outline"
          }`}
          data-testid="tab-leden"
        >
          Leden ({filteredMembers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`openregio-button openregio-button-small ${
            activeTab === "posts" ? "openregio-button-primary" : "openregio-button-outline"
          }`}
          data-testid="tab-posts"
        >
          Kansenbord ({filteredPosts.length})
        </button>
      </div>

      {/* Filters */}
      <div className="openregio-network-filters">
        <input
          type="text"
          className="openregio-search-input"
          placeholder={
            activeTab === "leden" ? "Zoek op naam of bedrijf..." : "Zoek in posts..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          data-testid="input-search"
        />
        <select
          className="openregio-filter-select"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          data-testid="select-region"
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r === "alle" ? "Alle regio's" : r}
            </option>
          ))}
        </select>
        {activeTab === "posts" && (
          <select
            className="openregio-filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PostType)}
            data-testid="select-type"
          >
            <option value="alles">Alle types</option>
            <option value="vraag">Vraag</option>
            <option value="aanbod">Aanbod</option>
            <option value="lead">Lead</option>
            <option value="event">Event</option>
          </select>
        )}
        {activeTab === "posts" && <NewPostDialog />}
      </div>

      {isLoading && (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1f5fae" }} />
        </div>
      )}

      {!isLoading && activeTab === "leden" && (
        <>
          {filteredMembers.length === 0 ? (
            <p className="openregio-subtitle" data-testid="text-no-members">
              {regionFilter !== "alle"
                ? `Nog geen leden gevonden in ${regionFilter}.`
                : "Nog geen leden gevonden."}
            </p>
          ) : (
            <div className="openregio-network-grid">
              {filteredMembers.map((m) => (
                <MemberCard key={m.id} member={m} />
              ))}
            </div>
          )}
        </>
      )}

      {!isLoading && activeTab === "posts" && (
        <>
          {filteredPosts.length === 0 ? (
            <p className="openregio-subtitle" data-testid="text-no-posts">
              Nog geen berichten met deze filters. Plaats de eerste vraag of aanbod.
            </p>
          ) : (
            <div>
              {filteredPosts.map((p) => (
                <PostItem
                  key={p.id}
                  post={p}
                  currentUserId={user?.id}
                  isAdmin={user?.isAdmin}
                />
              ))}
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}
