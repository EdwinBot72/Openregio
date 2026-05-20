import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, MapPin, Lightbulb } from "lucide-react";
import ZoektermenFinder from "./ZoektermenFinder";
import WebsiteChecklist from "./WebsiteChecklist";
import GoogleEnAI from "./GoogleEnAI";
import VoorbeeldenGalerij from "./VoorbeeldenGalerij";

export default function LokaleVindbaarheid() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Lokale vindbaarheid</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Ontdek welke zoektermen, websiteteksten en SEO-elementen jij nodig
          hebt om gevonden te worden in jouw regio.
        </p>
      </div>

      <Tabs defaultValue="zoektermen">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="zoektermen" className="flex items-center gap-2 text-xs sm:text-sm" data-testid="tab-zoektermen">
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Zoektermen</span>
            <span className="sm:hidden">Zoek</span>
          </TabsTrigger>
          <TabsTrigger value="website" className="flex items-center gap-2 text-xs sm:text-sm" data-testid="tab-website">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Website</span>
            <span className="sm:hidden">Web</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2 text-xs sm:text-sm" data-testid="tab-google">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Google & AI</span>
            <span className="sm:hidden">Google</span>
          </TabsTrigger>
          <TabsTrigger value="voorbeelden" className="flex items-center gap-2 text-xs sm:text-sm" data-testid="tab-voorbeelden">
            <Lightbulb className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Voorbeelden</span>
            <span className="sm:hidden">Meer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zoektermen">
          <ZoektermenFinder />
        </TabsContent>
        <TabsContent value="website">
          <WebsiteChecklist />
        </TabsContent>
        <TabsContent value="google">
          <GoogleEnAI />
        </TabsContent>
        <TabsContent value="voorbeelden">
          <VoorbeeldenGalerij />
        </TabsContent>
      </Tabs>
    </div>
  );
}
