import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { Crown, Upload, FileText, Image, Trash2, Check, AlertCircle, FolderOpen, Info, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const WOO_CATEGORIES = [
  { slug: "mandaat_delegatie", label: "Mandaat & delegatie" },
  { slug: "beleid_verordening", label: "Beleid & verordeningen" },
  { slug: "vergunningen", label: "Vergunningen & beleidsregels" },
  { slug: "heffingen_leges", label: "Heffingen, leges, belastingen" },
  { slug: "handhaving_kaders", label: "Handhavingskaders (beleid)" },
  { slug: "aanbesteding", label: "Aanbesteding/inkoop" },
  { slug: "subsidies", label: "Subsidies" },
  { slug: "uitvoering_partijen", label: "Uitvoeringsorganisaties/derden" },
  { slug: "openbaarheid_archief", label: "Archief/openbaarheid/werkinstructies" },
];

interface RagDocument {
  id: string;
  user_id: string;
  region: string | null;
  woo_category: string | null;
  title: string | null;
  source_type: string;
  created_at: string;
  metadata_json: Record<string, unknown>;
  chunk_count: number;
}

export default function WooBibliotheekPage() {
  const { user, isLoading: authLoading } = useAuth();
  const isPro = user?.plan === "pro";
  const { toast } = useToast();

  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [wooCategory, setWooCategory] = useState<string>("");
  const [region, setRegion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: documents = [], isLoading: docsLoading } = useQuery<RagDocument[]>({
    queryKey: ["/api/rag/documents"],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      setUploadProgress(10);

      const response = await fetch("/api/rag/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      setUploadProgress(90);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload mislukt");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadProgress(100);
      toast({
        title: "Document geüpload",
        description: `${data.chunks} tekstblokken verwerkt en geïndexeerd.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/rag/documents"] });
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload mislukt",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/rag/documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Document verwijderd" });
      queryClient.invalidateQueries({ queryKey: ["/api/rag/documents"] });
    },
    onError: () => {
      toast({ title: "Verwijderen mislukt", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTitle("");
    setWooCategory("");
    setRegion("");
    setSelectedFile(null);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
        if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
      "text/plain",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Ongeldig bestandstype",
        description: "Upload een PDF, afbeelding (JPG/PNG), of tekstbestand.",
        variant: "destructive",
      });
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Bestand te groot",
        description: "Maximum bestandsgrootte is 10MB.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (title) formData.append("title", title);
    if (wooCategory) formData.append("wooCategory", wooCategory);
    if (region) formData.append("region", region);

    uploadMutation.mutate(formData);
  };

  const getCategoryLabel = (slug: string | null) => {
    if (!slug) return null;
    return WOO_CATEGORIES.find((c) => c.slug === slug)?.label || slug;
  };

  const getFileIcon = (metadata: Record<string, unknown>) => {
    if (metadata?.isImage) return <Image className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card data-testid="card-login-prompt">
          <CardContent className="p-6 space-y-6 text-center">
            <p className="text-muted-foreground">Log in om Mijn documenten te gebruiken.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold" data-testid="heading-woo-bibliotheek">
          <FolderOpen className="inline-block mr-2 h-7 w-7" />
          Mijn documenten
        </h1>
        <p className="text-muted-foreground">
          Upload documenten (PDF's, foto's van brieven) naar je persoonlijke bibliotheek. 
          RegioBot doorzoekt deze documenten bij het beantwoorden van je vragen.
        </p>
        {!isPro && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3" data-testid="text-upload-limit-info">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Gratis toegang: 1 document per dag. Extra uploads beschikbaar voor leden met uitgebreide toegang.</span>
          </div>
        )}
      </header>

      {/* Uitleg */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#1f5fae] mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Hoe werkt Mijn documenten?</p>
              <p className="text-sm text-muted-foreground">
                Dit is jouw persoonlijke bibliotheek van WOO-documenten. Upload hier gemeentebrieven,
                besluiten, mandaatregisters en andere officiële stukken. RegioBot gebruikt deze
                documenten om jouw vragen te beantwoorden mét exacte bronverwijzing.
              </p>
              <p className="text-sm text-muted-foreground">
                Upload een document → kies de juiste WOO-categorie → het document wordt automatisch
                opgesplitst en doorzoekbaar gemaakt → ga naar RegioBot en stel je vraag.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  { label: "PDF", desc: "tekst direct" },
                  { label: "JPG / PNG", desc: "via OCR" },
                  { label: "TXT", desc: "platte tekst" },
                ].map(({ label, desc }) => (
                  <Badge key={label} variant="secondary" className="text-xs font-normal gap-1">
                    {label}
                    <span className="text-muted-foreground">— {desc}</span>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-8">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-muted-foreground">
              Gratis leden kunnen 1 document per dag uploaden. Pro-leden uploaden onbeperkt.
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-[1fr,1.5fr] gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Document uploaden</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"}
                ${selectedFile ? "border-green-500 bg-green-50 dark:bg-green-950/20" : ""}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-input")?.click()}
              data-testid="dropzone-upload"
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.txt"
                onChange={handleFileSelect}
                data-testid="input-file"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <Check className="h-10 w-10 mx-auto text-green-600" />
                  <p className="font-medium text-green-700 dark:text-green-400">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                  <p className="font-medium">Sleep hier een bestand naartoe</p>
                  <p className="text-sm text-muted-foreground">of klik om te selecteren</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG, TXT (max 10MB)</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                placeholder="Bijv. Mandaatbesluit gemeente 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />
            </div>

            {/* WOO Category */}
            <div className="space-y-2">
              <Label>WOO-categorie</Label>
              <Select value={wooCategory} onValueChange={setWooCategory}>
                <SelectTrigger data-testid="select-woo-category">
                  <SelectValue placeholder="Selecteer categorie" />
                </SelectTrigger>
                <SelectContent>
                  {WOO_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Region */}
            <div className="space-y-2">
              <Label htmlFor="region">Regio (optioneel)</Label>
              <Input
                id="region"
                placeholder="Bijv. Achterhoek"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                data-testid="input-region"
              />
            </div>

            {/* Progress */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  Document wordt verwerkt...
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              className="w-full"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
              data-testid="button-upload"
            >
              {isUploading ? "Uploaden..." : "Document uploaden"}
            </Button>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Mijn documenten
              <Badge variant="secondary" className="ml-auto">
                {documents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <p className="text-muted-foreground text-center py-8">Laden...</p>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nog geen documenten geüpload</p>
                <p className="text-sm">Upload je eerste document om te beginnen</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    data-testid={`document-${doc.id}`}
                  >
                    <div className="p-2 rounded-md bg-muted">
                      {getFileIcon(doc.metadata_json)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{doc.title || "(geen titel)"}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {doc.woo_category && (
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(doc.woo_category)}
                          </Badge>
                        )}
                        {doc.region && (
                          <Badge variant="secondary" className="text-xs">
                            {doc.region}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {doc.chunk_count} chunks
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(doc.created_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`button-delete-${doc.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Hoe werkt het?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Upload PDF's of foto's van WOO-documenten, brieven of besluiten</li>
                <li>Tekst wordt automatisch geëxtraheerd (ook uit gescande documenten via OCR)</li>
                <li>RegioBot doorzoekt je bibliotheek bij elke vraag die je stelt</li>
                <li>Categoriseer documenten voor betere vindbaarheid</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
