import { usePageTitle } from "@/hooks/usePageTitle";
import { Clock } from "lucide-react";

interface Props {
  titel?: string;
}

export default function BinnenkortPage({ titel = "Binnenkort beschikbaar" }: Props) {
  usePageTitle(titel);
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Clock className="h-6 w-6 text-primary" />
      </div>
      <h1 className="text-xl font-bold">{titel}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Deze pagina wordt binnenkort gelanceerd. Kom snel terug.
      </p>
    </div>
  );
}
