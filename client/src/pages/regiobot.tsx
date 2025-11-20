import { RegioBotChat } from "@/components/RegioBotChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Tag, TrendingUp, Crown, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

export default function RegioBotPage() {
  const { user, isLoading } = useAuth();
  const isPro = user?.plan === 'pro';

  // Show upgrade screen for Basic users
  if (!isLoading && !isPro) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card data-testid="card-upgrade-prompt">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Crown className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-accent">
              RegioBot is alleen beschikbaar voor Pro-leden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              Upgrade naar OpenRegio Pro om toegang te krijgen tot onze AI-assistent en veel meer functies.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">AI-Assistent RegioBot</h3>
                      <p className="text-sm text-muted-foreground">
                        Laat AI je helpen met content, marketing en lokale SEO
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Onbeperkte content</h3>
                      <p className="text-sm text-muted-foreground">
                        Schrijf zoveel posts, aanbiedingen en teksten als je wilt
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Slimme templates</h3>
                      <p className="text-sm text-muted-foreground">
                        Gebruik professionele templates voor je business
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold mb-2">Prioriteit support</h3>
                      <p className="text-sm text-muted-foreground">
                        Krijg snellere hulp en persoonlijk advies
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Link href="/lidmaatschap?plan=pro" asChild>
                <Button size="lg" data-testid="button-upgrade-to-pro">
                  <Crown className="mr-2 h-5 w-5" />
                  Upgrade naar Pro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
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
