import { RegioBotChat } from "@/components/RegioBotChat";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, FileText, Tag, TrendingUp } from "lucide-react";

export default function RegioBotPage() {
  const capabilities = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: "Posts & Teksten",
      description: "Schrijf overtuigende social media content",
    },
    {
      icon: <Tag className="h-5 w-5" />,
      title: "Aanbiedingen",
      description: "Creëer aantrekkelijke promoties",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Lokale SEO",
      description: "Verbeter je vindbaarheid in de regio",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-accent text-3xl font-bold">RegioBot</h1>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-3 w-3" />
            AI Assistent
          </div>
        </div>
        <p className="text-muted-foreground">
          Jouw slimme business assistent voor content, marketing en lokale SEO.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RegioBotChat />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Wat kan RegioBot?</h3>
              <div className="space-y-4">
                {capabilities.map((capability, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      {capability.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{capability.title}</p>
                      <p className="text-xs text-muted-foreground">{capability.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Tips voor beste resultaten</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Wees specifiek over je doelgroep</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Vermeld je unieke verkooppunten</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Geef context over je lokatie</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
