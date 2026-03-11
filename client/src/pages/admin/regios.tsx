import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, MapPin, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Link } from "wouter";

type Region = {
  id: number;
  name: string;
  slug: string;
  woo_count: number;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function AdminRegiosPage() {
  const { toast } = useToast();

  const { data: regions, isLoading } = useQuery<Region[]>({
    queryKey: ["/api/admin/regions"],
  });

  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  const createMut = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/regions", { name: newName.trim(), slug: newSlug.trim() }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/regions"] });
      setNewName("");
      setNewSlug("");
      toast({ title: "Regio aangemaakt" });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon regio niet aanmaken" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, name, slug }: { id: number; name: string; slug: string }) =>
      apiRequest("PATCH", `/api/admin/regions/${id}`, { name, slug }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/regions"] });
      setEditId(null);
      toast({ title: "Regio bijgewerkt" });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon regio niet bijwerken" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/regions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/regions"] });
      toast({ title: "Regio verwijderd" });
    },
    onError: (e: any) => toast({ variant: "destructive", title: "Fout", description: e.message || "Kon regio niet verwijderen" }),
  });

  const startEdit = (r: Region) => {
    setEditId(r.id);
    setEditName(r.name);
    setEditSlug(r.slug);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin">
          <Button size="icon" variant="ghost" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold" data-testid="heading-regios">Regio-beheer</h1>
          </div>
          <p className="text-sm text-muted-foreground">Regio's beheren voor Woo-verzoeken en het platform.</p>
        </div>
      </div>

      {/* Create form */}
      <Card data-testid="card-create-region">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-semibold">Nieuwe regio toevoegen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-name" className="text-xs">Naam</Label>
              <Input
                id="new-name"
                placeholder="bijv. Drechtsteden"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!editId) setNewSlug(slugify(e.target.value));
                }}
                data-testid="input-region-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-slug" className="text-xs">Slug</Label>
              <Input
                id="new-slug"
                placeholder="bijv. drechtsteden"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                data-testid="input-region-slug"
              />
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => createMut.mutate()}
            disabled={!newName.trim() || !newSlug.trim() || createMut.isPending}
            data-testid="button-create-region"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Regio toevoegen
          </Button>
        </CardContent>
      </Card>

      {/* Regions list */}
      <Card data-testid="card-regions-list">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-semibold">Alle regio's</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)
          ) : !regions?.length ? (
            <p className="text-sm text-muted-foreground">Nog geen regio's aangemaakt.</p>
          ) : (
            <div className="space-y-2">
              {regions.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-md bg-muted/30"
                  data-testid={`row-region-${r.id}`}
                >
                  {editId === r.id ? (
                    <>
                      <Input
                        className="h-8 text-sm flex-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        data-testid={`input-edit-name-${r.id}`}
                      />
                      <Input
                        className="h-8 text-sm w-36"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                        data-testid={`input-edit-slug-${r.id}`}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => updateMut.mutate({ id: r.id, name: editName, slug: editSlug })}
                        disabled={updateMut.isPending}
                        data-testid={`button-save-${r.id}`}
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditId(null)}
                        data-testid={`button-cancel-${r.id}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.slug}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {r.woo_count} verzoeken
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(r)}
                        data-testid={`button-edit-${r.id}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMut.mutate(r.id)}
                        disabled={deleteMut.isPending}
                        data-testid={`button-delete-${r.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
