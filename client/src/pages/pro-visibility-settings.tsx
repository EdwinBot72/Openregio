import { MapPin } from "lucide-react";
import LokaleVindbaarheid from "@/components/lokale-vindbaarheid/LokaleVindbaarheid";

export default function ProVisibilitySettings() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Pagina header */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-md bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Lokale zichtbaarheid</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Gebruik deze tools om als lokale ondernemer beter gevonden te worden. Ontdek welke zoektermen klanten gebruiken,
          genereer website-teksten die lokaal scoren, en bekijk in welke gemeente de vraag naar jouw dienst het grootst is.
        </p>
      </div>

      {/* Hoofd-tool */}
      <LokaleVindbaarheid />
    </div>
  );
}
