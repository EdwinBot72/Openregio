import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Zap,
  ChevronDown,
  ChevronUp,
  Clock,
  X,
  Search,
  ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type DailyCourse = {
  id: string;
  title: string;
  slug: string;
  category: string;
  sector: string;
  plan: string;
  status: string;
  postedAt: string;
  expiresAt: string;
  minutes: number;
  goal: string;
  action: string;
  result: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  sortOrder: number;
  createdAt: string;
};

// ─── Form schema ──────────────────────────────────────────────────────────────

const courseFormSchema = z.object({
  title: z.string().min(3, "Titel is verplicht"),
  slug: z.string().min(3, "Slug is verplicht").regex(/^[a-z0-9-]+$/, "Alleen kleine letters, cijfers en koppeltekens"),
  category: z.string().min(1, "Categorie is verplicht"),
  sector: z.string().min(1, "Sector is verplicht"),
  plan: z.string().min(1, "Plan is verplicht"),
  status: z.string().min(1, "Status is verplicht"),
  postedAt: z.string().min(1, "Publicatiedatum is verplicht"),
  expiresAt: z.string().min(1, "Vervaldatum is verplicht"),
  minutes: z.coerce.number().min(1, "Duur is verplicht"),
  goal: z.string().min(5, "Doel is verplicht"),
  action: z.string().min(5, "Actie is verplicht"),
  result: z.string().min(5, "Resultaat is verplicht"),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  sortOrder: z.coerce.number().default(0),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

// ─── Category / sector / plan options ────────────────────────────────────────

const CATEGORIES = [
  { value: "zichtbaarheid", label: "Zichtbaarheid" },
  { value: "financieel", label: "Financieel" },
  { value: "marketing", label: "Marketing" },
  { value: "operatie", label: "Operatie" },
  { value: "wetgeving", label: "Wetgeving" },
  { value: "netwerk", label: "Netwerk" },
];

const SECTORS = [
  { value: "algemeen", label: "Algemeen (iedereen)" },
  { value: "detailhandel", label: "Detailhandel" },
  { value: "horeca", label: "Horeca" },
  { value: "techniek", label: "Techniek" },
  { value: "agrarisch", label: "Agrarisch" },
];

const PLANS = [
  { value: "basic", label: "Basis" },
  { value: "pro", label: "Pro" },
  { value: "all", label: "Iedereen (Basis + Pro)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalInput(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function nowLocalInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function formatDate(isoString: string) {
  return new Date(isoString).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function isActive(course: DailyCourse) {
  const now = Date.now();
  return (
    course.status === "published" &&
    new Date(course.postedAt).getTime() <= now &&
    new Date(course.expiresAt).getTime() > now
  );
}

// ─── Pexels Image Picker ─────────────────────────────────────────────────────

type PexelsPhoto = {
  id: number;
  url: string;
  thumb: string;
  small: string;
  photographer: string;
  alt: string;
};

function PexelsPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [input, setInput] = useState("");
  const [activeQ, setActiveQ] = useState("");
  const [page, setPage] = useState(1);
  const [fotos, setFotos] = useState<PexelsPhoto[]>([]);
  const [totaal, setTotaal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [noKey, setNoKey] = useState(false);
  const [open, setOpen] = useState(false);

  const search = async (q: string, p: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setNoKey(false);
    try {
      const res = await fetch(`/api/admin/image-search?q=${encodeURIComponent(q)}&page=${p}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.noKey) { setNoKey(true); return; }
      if (!res.ok) return;
      setFotos(data.fotos ?? []);
      setTotaal(data.totaal ?? 0);
      setPage(p);
      setActiveQ(q);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    search(input, 1);
    setOpen(true);
  };

  const select = (foto: PexelsPhoto) => {
    onChange(foto.url);
    setOpen(false);
  };

  const clear = () => {
    onChange("");
  };

  const totalPages = Math.ceil(Math.min(totaal, 500) / 12);

  return (
    <div className="space-y-2" data-testid="section-image-picker">
      <Label>Afbeelding (optioneel)</Label>

      {/* Huidige selectie preview */}
      {value && (
        <div className="relative rounded-lg overflow-hidden" style={{ height: 120 }}>
          <img
            src={value}
            alt="Geselecteerde afbeelding"
            className="w-full h-full object-cover"
            data-testid="img-selected-preview"
          />
          <button
            type="button"
            onClick={clear}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
            data-testid="button-clear-image"
            aria-label="Afbeelding verwijderen"
          >
            <X className="h-3 w-3" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white/80 px-2 py-1 text-right">
            Foto via Pexels
          </div>
        </div>
      )}

      {/* Zoekbalk */}
      {noKey ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-[#f28a1a]/10 dark:bg-[#f28a1a]/30 border border-[#f28a1a]/20 dark:border-[#f28a1a] text-sm text-[#f28a1a] dark:text-[#f28a1a]/30">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Stel de <strong>PEXELS_API_KEY</strong> in als secret om afbeeldingen te zoeken.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Zoek bijv. 'detailhandel' of 'marketing'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            data-testid="input-image-search"
          />
          <Button type="submit" size="default" disabled={loading || !input.trim()} data-testid="button-search-images">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>
      )}

      {/* Resultaten grid */}
      {open && fotos.length > 0 && (
        <div className="space-y-2 rounded-lg border border-border p-3 bg-background">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {fotos.map((foto) => {
              const isSelected = value === foto.url;
              return (
                <button
                  key={foto.id}
                  type="button"
                  onClick={() => select(foto)}
                  className={`relative rounded-md overflow-hidden group focus:outline-none ${isSelected ? "ring-2 ring-primary" : ""}`}
                  style={{ height: 72 }}
                  data-testid={`button-foto-${foto.id}`}
                  title={foto.photographer}
                >
                  <img
                    src={foto.small}
                    alt={foto.alt}
                    className="w-full h-full object-cover transition-opacity group-hover:opacity-80"
                    loading="lazy"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Paginatie */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={page <= 1 || loading}
                onClick={() => search(activeQ, page - 1)}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">Pagina {page} van {totalPages}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                disabled={page >= totalPages || loading}
                onClick={() => search(activeQ, page + 1)}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-right">
            Foto's via <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="underline">Pexels</a> — gratis te gebruiken
          </p>
        </div>
      )}

      {open && !loading && fotos.length === 0 && activeQ && (
        <p className="text-sm text-muted-foreground">Geen resultaten voor "{activeQ}".</p>
      )}
    </div>
  );
}

// ─── Course row ───────────────────────────────────────────────────────────────

function CourseRow({
  course,
  onEdit,
}: {
  course: DailyCourse;
  onEdit: (c: DailyCourse) => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const active = isActive(course);

  const deleteMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/admin/cursussen/${course.id}`),
    onSuccess: () => {
      toast({ title: "Cursus verwijderd" });
      qc.invalidateQueries({ queryKey: ["/api/admin/cursussen"] });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message }),
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden" data-testid={`row-cursus-${course.id}`}>
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p className="text-sm font-semibold text-foreground truncate" data-testid={`text-cursus-title-${course.id}`}>
              {course.title}
            </p>
            <Badge variant={active ? "default" : course.status === "published" ? "secondary" : "outline"} className="text-[10px] shrink-0">
              {active ? "Actief" : course.status === "published" ? "Verlopen" : "Concept"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDate(course.postedAt)} → {formatDate(course.expiresAt)} · {course.minutes} min · {course.category} · {course.sector} · {course.plan}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => onEdit(course)}
            data-testid={`button-edit-${course.id}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setOpen((v) => !v)}
            data-testid={`button-expand-${course.id}`}
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          {!deleteConfirm ? (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setDeleteConfirm(true)}
              data-testid={`button-delete-${course.id}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              <span className="text-xs text-destructive font-medium">Zeker?</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs px-2"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                data-testid={`button-confirm-delete-${course.id}`}
              >
                {deleteMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verwijder"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs px-2"
                onClick={() => setDeleteConfirm(false)}
                data-testid={`button-cancel-delete-${course.id}`}
              >
                Annuleer
              </Button>
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-muted/20 px-4 py-3 text-xs space-y-1.5">
          <p><span className="font-semibold text-muted-foreground">Doel:</span> {course.goal}</p>
          <p><span className="font-semibold text-muted-foreground">Actie:</span> {course.action}</p>
          <p><span className="font-semibold text-muted-foreground">Resultaat:</span> {course.result}</p>
          <p className="font-mono text-muted-foreground">/{course.slug}</p>
        </div>
      )}
    </div>
  );
}

// ─── Course form ──────────────────────────────────────────────────────────────

function CourseForm({
  existing,
  onCancel,
  onSaved,
}: {
  existing?: DailyCourse | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();

  const defaultPostedAt = existing ? toLocalInput(existing.postedAt) : nowLocalInput();
  const defaultExpiresAt = existing
    ? toLocalInput(existing.expiresAt)
    : toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: existing?.title ?? "",
      slug: existing?.slug ?? "",
      category: existing?.category ?? "zichtbaarheid",
      sector: existing?.sector ?? "algemeen",
      plan: existing?.plan ?? "basic",
      status: existing?.status ?? "draft",
      postedAt: defaultPostedAt,
      expiresAt: defaultExpiresAt,
      minutes: existing?.minutes ?? 15,
      goal: existing?.goal ?? "",
      action: existing?.action ?? "",
      result: existing?.result ?? "",
      imageUrl: existing?.imageUrl ?? "",
      ctaLabel: existing?.ctaLabel ?? "Markeer als gedaan",
      sortOrder: existing?.sortOrder ?? 0,
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      const payload = {
        ...values,
        postedAt: new Date(values.postedAt).toISOString(),
        expiresAt: new Date(values.expiresAt).toISOString(),
        imageUrl: values.imageUrl || null,
      };
      if (existing) {
        return apiRequest("PUT", `/api/admin/cursussen/${existing.id}`, payload);
      } else {
        return apiRequest("POST", "/api/admin/cursussen", payload);
      }
    },
    onSuccess: () => {
      toast({ title: existing ? "Cursus bijgewerkt" : "Cursus aangemaakt" });
      qc.invalidateQueries({ queryKey: ["/api/admin/cursussen"] });
      onSaved();
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Opslaan mislukt" }),
  });

  const handleTitleBlur = () => {
    if (!existing && !form.getValues("slug")) {
      const title = form.getValues("title");
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
      form.setValue("slug", slug);
    }
  };

  return (
    <Card data-testid="card-cursus-form">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {existing ? "Cursus bewerken" : "Nieuwe cursus aanmaken"}
          </CardTitle>
          <Button size="icon" variant="ghost" onClick={onCancel} data-testid="button-close-form">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
          className="space-y-4"
        >
          {/* Titel + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                placeholder="Google bedrijfsprofiel aanscherpen"
                {...form.register("title")}
                onBlur={handleTitleBlur}
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="google-bedrijfsprofiel-aanscherpen"
                {...form.register("slug")}
                data-testid="input-slug"
              />
              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>
          </div>

          {/* Categorie + Sector + Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Categorie *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v)}
              >
                <SelectTrigger data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sector *</Label>
              <Select
                value={form.watch("sector")}
                onValueChange={(v) => form.setValue("sector", v)}
              >
                <SelectTrigger data-testid="select-sector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Plan *</Label>
              <Select
                value={form.watch("plan")}
                onValueChange={(v) => form.setValue("plan", v)}
              >
                <SelectTrigger data-testid="select-plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status + Duur + Volgorde */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) => form.setValue("status", v)}
              >
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Concept</SelectItem>
                  <SelectItem value="published">Gepubliceerd</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minutes">Duur (minuten) *</Label>
              <Input
                id="minutes"
                type="number"
                min={1}
                {...form.register("minutes")}
                data-testid="input-minutes"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sortOrder">Volgorde</Label>
              <Input
                id="sortOrder"
                type="number"
                {...form.register("sortOrder")}
                data-testid="input-sort-order"
              />
            </div>
          </div>

          {/* Datums */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postedAt">Publicatiedatum *</Label>
              <Input
                id="postedAt"
                type="datetime-local"
                {...form.register("postedAt")}
                data-testid="input-posted-at"
              />
              {form.formState.errors.postedAt && (
                <p className="text-xs text-destructive">{form.formState.errors.postedAt.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiresAt">Vervaldatum *</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                {...form.register("expiresAt")}
                data-testid="input-expires-at"
              />
              {form.formState.errors.expiresAt && (
                <p className="text-xs text-destructive">{form.formState.errors.expiresAt.message}</p>
              )}
            </div>
          </div>

          {/* Doel */}
          <div className="space-y-1.5">
            <Label htmlFor="goal">Doel *</Label>
            <Textarea
              id="goal"
              placeholder="Meer lokale zichtbaarheid zonder marketingcircus."
              rows={2}
              {...form.register("goal")}
              data-testid="textarea-goal"
            />
            {form.formState.errors.goal && (
              <p className="text-xs text-destructive">{form.formState.errors.goal.message}</p>
            )}
          </div>

          {/* Actie */}
          <div className="space-y-1.5">
            <Label htmlFor="action">Actie *</Label>
            <Textarea
              id="action"
              placeholder="Pas je bedrijfsomschrijving aan, voeg 3 diensten toe en controleer openingstijden."
              rows={2}
              {...form.register("action")}
              data-testid="textarea-action"
            />
            {form.formState.errors.action && (
              <p className="text-xs text-destructive">{form.formState.errors.action.message}</p>
            )}
          </div>

          {/* Resultaat */}
          <div className="space-y-1.5">
            <Label htmlFor="result">Resultaat *</Label>
            <Textarea
              id="result"
              placeholder="Je profiel oogt direct scherper en consistenter."
              rows={2}
              {...form.register("result")}
              data-testid="textarea-result"
            />
            {form.formState.errors.result && (
              <p className="text-xs text-destructive">{form.formState.errors.result.message}</p>
            )}
          </div>

          {/* Afbeelding */}
          <PexelsPicker
            value={form.watch("imageUrl") ?? ""}
            onChange={(url) => form.setValue("imageUrl", url)}
          />

          {/* CTA label */}
          <div className="space-y-1.5">
            <Label htmlFor="ctaLabel">CTA-tekst</Label>
            <Input
              id="ctaLabel"
              placeholder="Markeer als gedaan"
              {...form.register("ctaLabel")}
              data-testid="input-cta-label"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saveMutation.isPending}
            data-testid="button-save-cursus"
          >
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existing ? "Wijzigingen opslaan" : "Cursus aanmaken"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCursussenPage() {
  const [editing, setEditing] = useState<DailyCourse | null | "new">(null);

  const { data, isLoading } = useQuery<{ cursussen: DailyCourse[]; totaal: number }>({
    queryKey: ["/api/admin/cursussen"],
  });

  const cursussen = data?.cursussen ?? [];
  const actief = cursussen.filter(isActive).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold" data-testid="text-page-title">Cursussen beheren</h1>
            <p className="text-sm text-muted-foreground">Acties van de week aanmaken en beheren</p>
          </div>
        </div>
        {editing !== "new" && editing === null && (
          <Button onClick={() => setEditing("new")} data-testid="button-new-cursus">
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe cursus
          </Button>
        )}
      </div>

      {/* ── Stats ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground" data-testid="text-count-actief">{actief}</span>
          <span className="text-xs text-muted-foreground">actieve cursussen</span>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{cursussen.length}</span>
          <span className="text-xs text-muted-foreground">totaal</span>
        </div>
      </div>

      {/* ── Formulier ── */}
      {editing !== null && (
        <CourseForm
          existing={editing === "new" ? null : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}

      {/* ── Lijst ── */}
      <Card data-testid="card-cursussen-list">
        <CardHeader>
          <CardTitle className="text-base">Alle cursussen</CardTitle>
          <CardDescription>Meest recent bovenaan. Klik bewerken om te wijzigen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Laden…</span>
            </div>
          ) : cursussen.length === 0 ? (
            <div className="py-12 text-center" data-testid="text-empty">
              <Zap className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Nog geen cursussen</p>
              <p className="text-xs text-muted-foreground mb-4">Maak een eerste actie aan met de knop hierboven.</p>
              <Button onClick={() => setEditing("new")} data-testid="button-new-cursus-empty">
                <Plus className="h-4 w-4 mr-2" />
                Eerste cursus aanmaken
              </Button>
            </div>
          ) : (
            cursussen.map((c) => (
              <CourseRow key={c.id} course={c} onEdit={(c) => setEditing(c)} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
