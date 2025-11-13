import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CooperativeStats } from "@/components/CooperativeStats";
import { Vote, Users, Euro, FileText, CheckCircle2, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Proposal } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { formatDistance } from "date-fns";
import { nl } from "date-fns/locale";

export default function CooperativePage() {
  const { toast } = useToast();
  const { data: proposals, isLoading } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, voteType }: { id: string; voteType: "for" | "against" | "abstain" }) => {
      return apiRequest("POST", `/api/proposals/${id}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Stem geregistreerd",
        description: "Je stem is succesvol opgeslagen.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is iets misgegaan bij het registreren van je stem.",
        variant: "destructive",
      });
    },
  });

  const activeProposals = proposals?.filter((p) => p.status === "active") || [];

  const contributions = [
    { category: "Platformonderhoud", amount: "45%", color: "bg-chart-1" },
    { category: "Marketing", amount: "25%", color: "bg-chart-2" },
    { category: "Ontwikkeling", amount: "20%", color: "bg-chart-3" },
    { category: "Support", amount: "10%", color: "bg-chart-4" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-accent text-3xl font-bold mb-2">Coöperatie</h1>
        <p className="text-muted-foreground">
          Transparant, democratisch en van ons allemaal.
        </p>
      </div>

      <div className="space-y-8">
        <CooperativeStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  Actieve Voorstellen
                </CardTitle>
                <Button variant="outline" size="sm" data-testid="button-new-proposal">
                  Nieuw voorstel
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Laden...</p>
                  </div>
                ) : activeProposals.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Geen actieve voorstellen op dit moment.</p>
                  </div>
                ) : (
                  activeProposals.map((proposal) => {
                    const totalVotes = Number(proposal.votesFor) + Number(proposal.votesAgainst) + Number(proposal.votesAbstain);
                    const forPercentage = totalVotes > 0 ? (Number(proposal.votesFor) / totalVotes) * 100 : 0;
                    const daysUntilDeadline = formatDistance(new Date(proposal.deadline), new Date(), { addSuffix: false, locale: nl });

                    return (
                      <div
                        key={proposal.id}
                        className="p-4 rounded-lg border space-y-4"
                        data-testid={`proposal-${proposal.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{proposal.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{proposal.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Voorgesteld door {proposal.proposerName}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            <Clock className="h-3 w-3 mr-1" />
                            {daysUntilDeadline}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Stemmen</span>
                            <span className="font-medium">{totalVotes} totaal</span>
                          </div>
                          <Progress value={forPercentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className="text-green-600">Voor: {proposal.votesFor}</span>
                            <span className="text-red-600">Tegen: {proposal.votesAgainst}</span>
                            <span>Blanco: {proposal.votesAbstain}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => voteMutation.mutate({ id: proposal.id, voteType: "for" })}
                            disabled={voteMutation.isPending}
                          >
                            Stem voor
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => voteMutation.mutate({ id: proposal.id, voteType: "against" })}
                            disabled={voteMutation.isPending}
                          >
                            Stem tegen
                          </Button>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Bijdragen Transparantie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Zo wordt jouw bijdrage gebruikt voor de coöperatie:
                </p>
                {contributions.map((contribution, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{contribution.category}</span>
                      <span className="font-semibold">{contribution.amount}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${contribution.color}`}
                        style={{ width: contribution.amount }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Governance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>1 lid = 1 stem</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Open financiën</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Democratische besluitvorming</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Winstdeling onder leden</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documenten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Statuten coöperatie
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Jaarverslag 2024
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Financieel overzicht
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
