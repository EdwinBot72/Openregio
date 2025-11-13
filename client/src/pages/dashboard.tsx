import { CooperativeStats } from "@/components/CooperativeStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ThumbsUp, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Proposal, Activity, UserProfile } from "@shared/schema";
import { formatDistance } from "date-fns";
import { nl } from "date-fns/locale";

const PAIN_POINT_LABELS: Record<string, string> = {
  visibility: "Zichtbaarheid",
  rules: "Platformregels",
  time: "Tijd besparen",
  platform_fees: "Geen commissies",
  no_community: "Community",
  digital_stress: "Focus & Overzicht",
  rights_confusion: "Duidelijke rechten",
  low_autonomy: "Zeggenschap"
};

const PAIN_POINT_ACTIONS: Record<string, { title: string; path: string; description: string }> = {
  visibility: {
    title: "Vergroot je bereik",
    path: "/regiobot",
    description: "Gebruik RegioBot voor SEO-tips en contentideeën"
  },
  no_community: {
    title: "Ontdek ondernemers",
    path: "/network",
    description: "Vind lokale partners en bouw je netwerk"
  },
  time: {
    title: "Bespaar tijd met AI",
    path: "/regiobot",
    description: "Laat RegioBot je helpen met content en marketing"
  },
  platform_fees: {
    title: "0% commissie, 100% coöperatief",
    path: "/cooperative",
    description: "Ontdek hoe we samen eigenaar zijn"
  },
  digital_stress: {
    title: "Eén platform, alles overzicht",
    path: "/dashboard",
    description: "Al je tools op één plek, geen versnippering meer"
  },
  rules: {
    title: "Transparante regels",
    path: "/cooperative",
    description: "Stem mee over platformregels en beleid"
  },
  rights_confusion: {
    title: "Duidelijke rechten & eigendom",
    path: "/cooperative",
    description: "Jouw data, jouw rechten, jouw platform"
  },
  low_autonomy: {
    title: "Jouw stem telt",
    path: "/cooperative",
    description: "Stem mee over beslissingen en toekomst"
  }
};

interface CardHighlight {
  isPriority: boolean;
  painPoints: string[];
  label: string;
}

function getCardHighlights(painPoints: string[]): {
  impact: CardHighlight;
  activity: CardHighlight;
  voting: CardHighlight;
  stats: CardHighlight;
} {
  return {
    impact: {
      isPriority: painPoints.includes("visibility"),
      painPoints: painPoints.filter(p => p === "visibility"),
      label: "Vergroot je zichtbaarheid"
    },
    activity: {
      isPriority: painPoints.includes("no_community"),
      painPoints: painPoints.filter(p => p === "no_community"),
      label: "Bouw je netwerk"
    },
    voting: {
      isPriority: painPoints.includes("rules") || painPoints.includes("low_autonomy") || painPoints.includes("rights_confusion"),
      painPoints: painPoints.filter(p => p === "rules" || p === "low_autonomy" || p === "rights_confusion"),
      label: "Jouw stem telt"
    },
    stats: {
      isPriority: painPoints.includes("platform_fees") || painPoints.includes("digital_stress"),
      painPoints: painPoints.filter(p => p === "platform_fees" || p === "digital_stress"),
      label: "Coöperatief voordeel"
    }
  };
}

export default function DashboardPage() {
  // NOTE: Hardcoded user ID for MVP - will be replaced with authentication context when implemented
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["/api/user-profile", "user-jan"],
  });

  const { data: proposals } = useQuery<Proposal[]>({
    queryKey: ["/api/proposals"],
  });

  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const activeProposals = proposals?.filter((p) => p.status === "active").slice(0, 2) || [];

  const recentActivity = (activities || []).map((activity) => ({
    type: activity.type,
    title: activity.title,
    from: activity.from,
    time: formatDistance(new Date(activity.createdAt), new Date(), { addSuffix: true, locale: nl }),
    icon: activity.type === "lead" ? <ThumbsUp className="h-4 w-4" /> :
          activity.type === "message" ? <MessageSquare className="h-4 w-4" /> :
          <Calendar className="h-4 w-4" />,
  }));

  const painPoints = userProfile?.painPoints || [];
  const highlights = getCardHighlights(painPoints);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-accent text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welkom terug, {userProfile?.name || "Jan"}! Hier is een overzicht van je activiteit.
        </p>
      </div>

      <div className="space-y-8">
        <div className={highlights.stats.isPriority ? "rounded-lg border-2 border-primary/50 p-1" : ""}>
          {highlights.stats.isPriority && (
            <div className="mb-2 flex items-center gap-2 px-2">
              <Badge variant="default" className="text-xs" data-testid="badge-priority-stats">
                <Sparkles className="h-3 w-3 mr-1" />
                {highlights.stats.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Ontdek de coöperatieve voordelen hieronder
              </span>
            </div>
          )}
          <CooperativeStats />
        </div>

        {painPoints.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Voor jou geselecteerd
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Op basis van jouw frustraties bieden we deze oplossingen:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {painPoints.map((point) => {
                  const action = PAIN_POINT_ACTIONS[point];
                  if (!action) return null;
                  return (
                    <a
                      key={point}
                      href={action.path}
                      className="block p-3 rounded-lg border border-primary/20 bg-background hover-elevate active-elevate-2"
                      data-testid={`link-action-${point}`}
                    >
                      <h3 className="font-semibold text-sm mb-1 text-foreground">{action.title}</h3>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className={highlights.activity.isPriority ? "border-primary/50" : ""}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Recente Activiteit</CardTitle>
                  {highlights.activity.isPriority && (
                    <Badge variant="default" className="text-xs" data-testid="badge-priority-activity">
                      <Sparkles className="h-3 w-3 mr-1" />
                      {highlights.activity.label}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" data-testid="button-view-all-activity">
                  Bekijk alles
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg hover-elevate"
                    data-testid={`activity-${idx}`}
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.from}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Bekijk
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className={highlights.voting.isPriority ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Lopende Stemmingen
                  </CardTitle>
                  {highlights.voting.isPriority && (
                    <Badge variant="default" className="text-xs" data-testid="badge-priority-voting">
                      <Sparkles className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeProposals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Geen actieve stemmingen
                  </p>
                ) : (
                  activeProposals.map((vote) => {
                    const totalVotes = Number(vote.votesFor) + Number(vote.votesAgainst) + Number(vote.votesAbstain);
                    const daysUntilDeadline = formatDistance(new Date(vote.deadline), new Date(), { addSuffix: false, locale: nl });

                    return (
                      <div key={vote.id} className="space-y-2" data-testid={`vote-${vote.id}`}>
                        <p className="font-medium text-sm">{vote.title}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{totalVotes} stemmen</span>
                          <Badge variant="outline">{daysUntilDeadline}</Badge>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          Stem nu
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className={highlights.impact.isPriority ? "border-primary/50" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Jouw Impact
                  </CardTitle>
                  {highlights.impact.isPriority && (
                    <Badge variant="default" className="text-xs" data-testid="badge-priority-impact">
                      <Sparkles className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Profielweergaven</span>
                  <span className="font-semibold">234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Contactverzoeken</span>
                  <span className="font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Gedeelde leads</span>
                  <span className="font-semibold">8</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
