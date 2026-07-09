import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Users, Euro, Link as LinkIcon, Share2, Clock, CheckCircle, Ban, TrendingUp } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AffiliateStats {
  referralCode: string | null;
  activeReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
  commissionRates: {
    basic: number;
    pro: number;
    basicPercent?: number;
    proPercent?: number;
    months?: number;
  };
}

interface Commission {
  id: string;
  referredEmail: string;
  planDisplayName: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

export default function AffiliatePage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const { data: stats, isLoading } = useQuery<AffiliateStats>({
    queryKey: ["/api/affiliate"],
  });

  const { data: commissionsData, isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ["/api/affiliate/commissions"],
    enabled: !!stats?.referralCode,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Openstaand</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1 bg-[#0b2240]"><TrendingUp className="h-3 w-3" />Goedgekeurd</Badge>;
      case "paid":
        return <Badge variant="default" className="gap-1 bg-[#f28a1a]"><CheckCircle className="h-3 w-3" />Uitbetaald</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Geannuleerd</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eaf6ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Euro style={{ width: 24, height: 24, color: "#1a6b3a" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-affiliate">Affiliate programma</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Verdien commissie door anderen te verwijzen naar OpenRegio. €{stats?.commissionRates?.basic?.toFixed(2) ?? "4,95"} per Basis-lid of €{stats?.commissionRates?.pro?.toFixed(2) ?? "9,00"} per Pro-lid.
            </p>
          </div>
        </div>
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
                    <Check className="h-4 w-4 text-[#f28a1a]" />
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

          <div className="grid md:grid-cols-3 gap-4">
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
                  <div className="p-3 rounded-full bg-[#f28a1a]/10">
                    <Clock className="h-6 w-6 text-[#f28a1a]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-pending-commission">
                      €{stats.pendingCommission.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Openstaande commissie</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#f28a1a]/10">
                    <Euro className="h-6 w-6 text-[#f28a1a]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-paid-commission">
                      €{stats.paidCommission.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Uitbetaald</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {commissionsData && commissionsData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Commissie Historie</CardTitle>
                <CardDescription>
                  Overzicht van al je verdiende commissies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum</TableHead>
                      <TableHead>Aangebracht lid</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Bedrag</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissionsData.map((commission) => (
                      <TableRow key={commission.id} data-testid={`row-commission-${commission.id}`}>
                        <TableCell className="text-muted-foreground">
                          {new Date(commission.createdAt).toLocaleDateString('nl-NL')}
                        </TableCell>
                        <TableCell className="font-medium">{commission.referredEmail}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{commission.planDisplayName}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          €{commission.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {commissionsLoading && (
            <Card>
              <CardContent className="py-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          )}

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
                      Je ontvangt {stats.commissionRates?.basicPercent || 25}% over de eerste {stats.commissionRates?.months || 3} maanden — tot €{stats.commissionRates?.basic?.toFixed(2) || "14,25"} per Basis-lid en €{stats.commissionRates?.pro?.toFixed(2) || "51,45"} per Pro-bijdrager. Uitbetaling maandelijks.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#f28a1a]/20 bg-[#f28a1a]/10 dark:bg-[#f28a1a]/20 dark:border-[#f28a1a]">
            <CardContent className="pt-6">
              <p className="text-sm text-[#f28a1a] dark:text-[#f28a1a]/20">
                <strong>Let op:</strong> Commissie wordt alleen uitbetaald zolang de doorverwezen klant een actief abonnement heeft. 
                Bij opzegging stopt de commissie automatisch. Uitbetaling gebeurt maandelijks via bankoverschrijving na goedkeuring.
              </p>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </div>
  );
}
