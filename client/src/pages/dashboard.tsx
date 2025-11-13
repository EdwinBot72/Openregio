import { CooperativeStats } from "@/components/CooperativeStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, ThumbsUp, MessageSquare, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const recentActivity = [
    {
      type: "lead",
      title: "Nieuwe samenwerking aanvraag",
      from: "Tech Solutions NL",
      time: "2 uur geleden",
      icon: <ThumbsUp className="h-4 w-4" />,
    },
    {
      type: "message",
      title: "Bericht ontvangen",
      from: "Sophie de Vries",
      time: "5 uur geleden",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      type: "event",
      title: "Netwerkborrel volgende week",
      from: "OpenRegio Amsterdam",
      time: "1 dag geleden",
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  const upcomingVotes = [
    {
      title: "Nieuwe feature: Groepsaankopen",
      deadline: "Over 3 dagen",
      votes: "234 / 500",
    },
    {
      title: "Budget voor regionale marketing",
      deadline: "Over 5 dagen",
      votes: "456 / 500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-accent text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welkom terug, Jan! Hier is een overzicht van je activiteit.
        </p>
      </div>

      <div className="space-y-8">
        <CooperativeStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recente Activiteit</CardTitle>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Lopende Stemmingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingVotes.map((vote, idx) => (
                  <div key={idx} className="space-y-2" data-testid={`vote-${idx}`}>
                    <p className="font-medium text-sm">{vote.title}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{vote.votes} stemmen</span>
                      <Badge variant="outline">{vote.deadline}</Badge>
                    </div>
                    <Button size="sm" variant="outline" className="w-full">
                      Stem nu
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Jouw Impact
                </CardTitle>
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
