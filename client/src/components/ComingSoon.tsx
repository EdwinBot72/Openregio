import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center" data-testid="section-coming-soon">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Clock className="w-7 h-7 text-muted-foreground" />
        </div>
      </div>
      <h1 className="font-bold text-2xl mb-2" data-testid="text-coming-soon-title">{title}</h1>
      <p className="text-muted-foreground mb-5" data-testid="text-coming-soon-description">{description}</p>
      <Badge variant="secondary" data-testid="badge-coming-soon">Binnenkort beschikbaar</Badge>
    </div>
  );
}
