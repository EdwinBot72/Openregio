import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCw, Inbox, LogIn, Settings } from "lucide-react";
import { Link } from "wouter";

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  loadingRows?: number;
  onRetry?: () => void;
  children: React.ReactNode;
}

type ErrorType = "auth" | "env" | "notfound" | "server" | "network" | "unknown";

function getErrorType(error: Error | null | undefined): ErrorType {
  if (!error) return "unknown";
  const msg = error.message.toLowerCase();
  
  if (msg.includes("niet ingelogd") || msg.includes("unauthorized") || msg.includes("401")) {
    return "auth";
  }
  if (msg.includes("env") || msg.includes("api key") || msg.includes("secret") || msg.includes("configuratie")) {
    return "env";
  }
  if (msg.includes("not found") || msg.includes("404") || msg.includes("niet gevonden")) {
    return "notfound";
  }
  if (msg.includes("network") || msg.includes("fetch") || msg.includes("connection")) {
    return "network";
  }
  if (msg.includes("500") || msg.includes("server")) {
    return "server";
  }
  return "unknown";
}

function ErrorState({ error, onRetry }: { error: Error | null | undefined; onRetry?: () => void }) {
  const errorType = getErrorType(error);

  const errorConfig: Record<ErrorType, { title: string; message: string; action: React.ReactNode }> = {
    auth: {
      title: "Niet ingelogd",
      message: "Je moet ingelogd zijn om deze pagina te bekijken.",
      action: (
        <Link href="/login">
          <Button variant="default" data-testid="button-login-redirect">
            <LogIn className="w-4 h-4 mr-2" />
            Inloggen
          </Button>
        </Link>
      ),
    },
    env: {
      title: "Configuratie ontbreekt",
      message: "Er mist een configuratie-instelling. Neem contact op met de beheerder.",
      action: (
        <Button variant="outline" disabled data-testid="button-env-error">
          <Settings className="w-4 h-4 mr-2" />
          Configuratie vereist
        </Button>
      ),
    },
    notfound: {
      title: "Niet gevonden",
      message: "De gevraagde gegevens konden niet worden gevonden.",
      action: onRetry ? (
        <Button onClick={onRetry} variant="outline" data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          Opnieuw proberen
        </Button>
      ) : null,
    },
    network: {
      title: "Verbindingsprobleem",
      message: "Kan geen verbinding maken met de server. Controleer je internetverbinding.",
      action: onRetry ? (
        <Button onClick={onRetry} variant="outline" data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          Opnieuw proberen
        </Button>
      ) : null,
    },
    server: {
      title: "Serverfout",
      message: "Er is een fout opgetreden op de server. Probeer het later opnieuw.",
      action: onRetry ? (
        <Button onClick={onRetry} variant="outline" data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          Opnieuw proberen
        </Button>
      ) : null,
    },
    unknown: {
      title: "Er ging iets mis",
      message: error?.message || "Er is een onverwachte fout opgetreden.",
      action: onRetry ? (
        <Button onClick={onRetry} variant="outline" data-testid="button-retry">
          <RefreshCw className="w-4 h-4 mr-2" />
          Opnieuw proberen
        </Button>
      ) : null,
    },
  };

  const config = errorConfig[errorType];

  return (
    <div className="flex items-center justify-center min-h-[300px] p-4" data-testid="state-error">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <CardTitle>{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">{config.message}</p>
          {config.action}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 p-4" data-testid="state-loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message, icon }: { message: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-4 text-center" data-testid="state-empty">
      <div className="mb-4 w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        {icon || <Inbox className="w-8 h-8 text-muted-foreground" />}
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function QueryState({
  isLoading,
  isError,
  error,
  isEmpty = false,
  emptyMessage = "Nog geen gegevens beschikbaar",
  emptyIcon,
  loadingRows = 3,
  onRetry,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return <LoadingState rows={loadingRows} />;
  }

  if (isError) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return <EmptyState message={emptyMessage} icon={emptyIcon} />;
  }

  return <>{children}</>;
}

export { LoadingState, EmptyState, ErrorState };
