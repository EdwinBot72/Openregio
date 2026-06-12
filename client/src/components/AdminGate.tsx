import { Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

interface AdminGateProps {
  children: React.ReactNode;
}

export function AdminGate({ children }: AdminGateProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isAdmin =
    user?.role === "admin" || user?.role === "master" || !!user?.isAdmin;

  if (!isAdmin) {
    return (
      <div
        className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4"
        data-testid="page-admin-gate"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto">
          <Lock className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Geen toegang</h1>
        <p className="text-muted-foreground">
          Deze pagina is alleen toegankelijk voor platformbeheerders.
        </p>
        <Button asChild>
          <Link href="/vandaag">Terug naar dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
