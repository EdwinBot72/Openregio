import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Users, Euro, Link as LinkIcon, Share2 } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AffiliateStats {
  referralCode: string | null;
  activeReferrals: number;
  totalCommission: number;
  commissionPerReferral: number;
}

export default function AffiliatePage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = useQuery<AffiliateStats>({
    queryKey: ["/api/affiliate"],
  });

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/affiliate/generate-code");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/affiliate"] });
      toast({
        title: "Referral code aangemaakt",
        description: "Je kunt nu je link delen met anderen.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon referral code niet aanmaken. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });

  const getAffiliateLink = (code: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/start?ref=${code}`;
  };

  const copyToClipboard = async () => {
    if (!stats?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(getAffiliateLink(stats.referralCode));
      setCopied(true);
      toast({
        title: "Gekopieerd!",
        description: "Je affiliate link is gekopieerd naar het klembord.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Fout",
        description: "Kon link niet kopiëren. Selecteer de link handmatig.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-regio-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold" data-testid="heading-affiliate">Affiliate Programma</h1>
        <p className="text-muted-foreground">
          Verdien €2,95 per maand voor elke actieve klant die je doorverwijst.
        </p>
      </div>

      {!stats?.referralCode ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-regio-purple" />
              Start met verdienen
            </CardTitle>
            <CardDescription>
              Genereer je persoonlijke affiliate link om te beginnen met het doorverwijzen van ondernemers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => generateCodeMutation.mutate()}
              disabled={generateCodeMutation.isPending}
              data-testid="button-generate-code"
            >
              {generateCodeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Genereren...
                </>
              ) : (
                <>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Genereer mijn affiliate link
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-regio-purple" />
                Jouw Affiliate Link
              </CardTitle>
              <CardDescription>
                Deel deze link met andere ondernemers. Als zij zich aanmelden, ontvang jij commissie.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted p-3 rounded-md font-mono text-sm break-all" data-testid="text-affiliate-link">
                  {getAffiliateLink(stats.referralCode)}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  data-testid="button-copy-link"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Je referral code: <span className="font-mono font-semibold" data-testid="text-referral-code">{stats.referralCode}</span>
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-regio-blue/10">
                    <Users className="h-6 w-6 text-regio-blue" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-active-referrals">{stats.activeReferrals}</p>
                    <p className="text-sm text-muted-foreground">Actieve referrals</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-regio-alert/10">
                    <Euro className="h-6 w-6 text-regio-alert" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-total-commission">
                      €{stats.totalCommission.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Verwachte commissie per maand</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hoe werkt het?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-regio-purple/10 flex items-center justify-center text-regio-purple font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Deel je link</p>
                    <p className="text-sm text-muted-foreground">
                      Stuur je persoonlijke affiliate link naar ondernemers in je netwerk.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-regio-purple/10 flex items-center justify-center text-regio-purple font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Zij melden zich aan</p>
                    <p className="text-sm text-muted-foreground">
                      Als iemand via jouw link een abonnement afsluit, wordt dit aan jou gekoppeld.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-regio-purple/10 flex items-center justify-center text-regio-purple font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Ontvang commissie</p>
                    <p className="text-sm text-muted-foreground">
                      Je ontvangt €2,95 per maand voor elke actieve klant. Uitbetaling gebeurt maandelijks.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Let op:</strong> Commissie wordt alleen uitbetaald zolang de doorverwezen klant een actief abonnement heeft. 
                Bij opzegging stopt de commissie automatisch. Uitbetaling gebeurt maandelijks via bankoverschrijving.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
