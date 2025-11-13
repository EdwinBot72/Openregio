import { useState } from "react";
import { NetworkGrid } from "@/components/NetworkGrid";
import { MapView } from "@/components/MapView";
import type { BusinessProfile } from "@/components/BusinessProfileCard";
import { useQuery } from "@tanstack/react-query";
import type { Entrepreneur } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Map, Grid3x3, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEntrepreneurSchema, strictEntrepreneurSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = insertEntrepreneurSchema.omit({ lat: true, lng: true }).extend({
  lat: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return Number(val);
    },
    z.number({ required_error: "Latitude is verplicht" })
      .min(-90, "Latitude moet tussen -90 en 90 zijn")
      .max(90, "Latitude moet tussen -90 en 90 zijn")
      .refine(Number.isFinite, "Voer een geldig nummer in")
  ),
  lng: z.preprocess(
    (val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return Number(val);
    },
    z.number({ required_error: "Longitude is verplicht" })
      .min(-180, "Longitude moet tussen -180 en 180 zijn")
      .max(180, "Longitude moet tussen -180 en 180 zijn")
      .refine(Number.isFinite, "Voer een geldig nummer in")
  ),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  image: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  openingHours: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  isVerified: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

function AddEntrepreneurDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      owner: "",
      category: "retail",
      description: "",
      location: "",
      city: "",
      email: "",
      phone: "",
      website: "",
      image: "",
      lat: undefined,
      lng: undefined,
      address: "",
      openingHours: "",
      logoUrl: "",
      isVerified: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const submitData: Parameters<typeof strictEntrepreneurSchema.parse>[0] = {
        name: data.name,
        owner: data.owner,
        email: data.email,
        category: data.category,
        description: data.description,
        location: data.location,
        city: data.city || data.location,
        lat: data.lat,
        lng: data.lng,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        openingHours: data.openingHours || null,
        logoUrl: data.logoUrl || null,
        image: data.image || null,
        isVerified: data.isVerified,
        ownerUserId: data.ownerUserId || null,
      };
      
      await apiRequest("POST", "/api/entrepreneurs", submitData);
      
      queryClient.invalidateQueries({ queryKey: ["/api/entrepreneurs"] });
      
      toast({
        title: "Bedrijfsprofiel aangemaakt!",
        description: "Je profiel is succesvol toegevoegd aan het netwerk.",
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
        <Button data-testid="button-add-entrepreneur">
          <Plus className="h-4 w-4 mr-2" />
          Bedrijf Toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bedrijfsprofiel Toevoegen</DialogTitle>
          <DialogDescription>
            Vul de gegevens van je bedrijf in om zichtbaar te worden in het netwerk.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrijfsnaam</FormLabel>
                    <FormControl>
                      <Input placeholder="Mijn Bedrijf BV" {...field} data-testid="input-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eigenaar</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan Jansen" {...field} data-testid="input-owner" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Selecteer categorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="food">Horeca</SelectItem>
                      <SelectItem value="services">Diensten</SelectItem>
                      <SelectItem value="tech">Technologie</SelectItem>
                      <SelectItem value="health">Gezondheid</SelectItem>
                      <SelectItem value="education">Onderwijs</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschrijving</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Vertel over je bedrijf..." 
                      className="min-h-[80px]"
                      {...field} 
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stad</FormLabel>
                    <FormControl>
                      <Input placeholder="Amsterdam" {...field} data-testid="input-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input placeholder="Damrak 1" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.000001" placeholder="52.3676" {...field} data-testid="input-lat" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.000001" placeholder="4.9041" {...field} data-testid="input-lng" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="openingHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Openingstijden</FormLabel>
                  <FormControl>
                    <Input placeholder="Ma-Vr 9:00-17:00" {...field} data-testid="input-opening-hours" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="info@bedrijf.nl" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefoon</FormLabel>
                    <FormControl>
                      <Input placeholder="+31 20 1234567" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.bedrijf.nl" {...field} data-testid="input-website" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} data-testid="input-logo-url" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrijfsfoto URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/foto.jpg" {...field} data-testid="input-image" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                Annuleren
              </Button>
              <Button type="submit" data-testid="button-submit">
                Profiel Aanmaken
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function NetworkPage() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("map");
  
  const { data: entrepreneurs, isLoading } = useQuery<Entrepreneur[]>({
    queryKey: ["/api/entrepreneurs"],
  });

  const profiles: BusinessProfile[] = (entrepreneurs || []).map((e) => ({
    id: e.id,
    name: e.name,
    owner: e.owner,
    category: e.category,
    description: e.description,
    location: e.location,
    email: e.email,
    phone: e.phone ?? undefined,
    image: e.image ?? undefined,
  }));

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-accent text-3xl font-bold mb-2">Ontdek je Netwerk</h1>
          <p className="text-muted-foreground">
            Vind en verbind met lokale ondernemers in jouw regio.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-accent text-3xl font-bold mb-2">Ontdek je Netwerk</h1>
          <p className="text-muted-foreground">
            Vind en verbind met lokale ondernemers in jouw regio.
          </p>
        </div>
        
        <div className="flex gap-2">
          <AddEntrepreneurDialog />
          
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            data-testid="button-view-map"
          >
            <Map className="h-4 w-4 mr-2" />
            Kaart
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {viewMode === "map" ? (
        <MapView entrepreneurs={entrepreneurs || []} />
      ) : (
        <NetworkGrid
          profiles={profiles}
          onViewProfile={(id) => console.log("View profile:", id)}
          onContact={(id) => console.log("Contact:", id)}
        />
      )}
    </div>
  );
}
