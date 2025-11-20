import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { Subscription } from "@shared/schema";

interface PaywallBannerProps {
  userId: string;
  message?: string;
  ctaText?: string;
}

export function PaywallBanner({
  userId,
  message = "Word lid van OpenRegio om toegang te krijgen tot alle functies",
  ctaText = "Bekijk lidmaatschappen",
}: PaywallBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: subscription, isLoading, isError } = useQuery<Subscription>({
    queryKey: ["/api/billing/subscription", { search: { userId } }],
    enabled: !!userId,
  });

  // Don't show banner if loading, error, user has active subscription, or if dismissed
  if (isLoading || isError || isDismissed) {
    return null;
  }

  const hasActiveSubscription = subscription && ["trialing", "active"].includes(subscription.status);
  if (hasActiveSubscription) {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 mb-6" data-testid="paywall-banner">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-primary/20 p-2 rounded-lg shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm mb-1" data-testid="text-paywall-message">
                {message}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs" data-testid="badge-cooperative">
                  Coöperatief platform
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Vanaf €9,99/maand
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2" data-testid="button-view-membership" asChild>
              <Link href="/lidmaatschap">
                <CreditCard className="h-4 w-4" />
                {ctaText}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="shrink-0"
              data-testid="button-dismiss-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
