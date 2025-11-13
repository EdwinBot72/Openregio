import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, MapPin, Handshake } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-value-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export function CooperativeStats() {
  const { data: stats } = useQuery<{
    totalMembers: number;
    totalCollaborations: number;
    totalRegions: number;
    monthlyGrowth: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const statsData = [
    {
      icon: <Users className="h-4 w-4" />,
      title: "Leden",
      value: stats?.totalMembers.toLocaleString("nl-NL") || "...",
      description: "Actieve ondernemers in de regio",
    },
    {
      icon: <Handshake className="h-4 w-4" />,
      title: "Samenwerkingen",
      value: stats?.totalCollaborations.toLocaleString("nl-NL") || "...",
      description: "Leads gedeeld deze maand",
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      title: "Regio's",
      value: stats?.totalRegions.toString() || "...",
      description: "Actieve lokale netwerken",
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      title: "Groei",
      value: stats ? `+${stats.monthlyGrowth}%` : "...",
      description: "Nieuwe leden deze maand",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
