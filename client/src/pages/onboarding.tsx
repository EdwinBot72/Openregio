import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { PAIN_POINTS, insertUserProfileSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

const PAIN_POINT_LABELS: Record<typeof PAIN_POINTS[number], { title: string; description: string }> = {
  visibility: {
    title: "Geen zichtbaarheid",
    description: "Mijn bedrijf verdwijnt tussen grote platforms"
  },
  rules: {
    title: "Onduidelijke regels",
    description: "Ik begrijp de platformregels niet goed"
  },
  time: {
    title: "Geen tijd",
    description: "Online marketing kost te veel tijd"
  },
  platform_fees: {
    title: "Hoge platformkosten",
    description: "Commissies vreten mijn winst op"
  },
  no_community: {
    title: "Geen gemeenschap",
    description: "Ik mis contact met andere ondernemers"
  },
  digital_stress: {
    title: "Digitale stress",
    description: "Te veel platforms, te weinig overzicht"
  },
  rights_confusion: {
    title: "Onduidelijke rechten",
    description: "Ik weet niet waar ik aan toe ben"
  },
  low_autonomy: {
    title: "Weinig zeggenschap",
    description: "Geen invloed op platformbeslissingen"
  }
};

const onboardingFormSchema = insertUserProfileSchema.extend({
  name: z.string().min(2, "Naam moet minimaal 2 karakters zijn"),
  email: z.string().email("Voer een geldig e-mailadres in"),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [selectedPainPoints, setSelectedPainPoints] = useState<(typeof PAIN_POINTS[number])[]>([]);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      painPoints: [],
      onboardingCompleted: true,
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      return apiRequest("POST", "/api/user-profile", data);
    },
    onSuccess: () => {
      setLocation("/dashboard");
    },
  });

  const togglePainPoint = (painPoint: typeof PAIN_POINTS[number]) => {
    setSelectedPainPoints((prev) => {
      const newPainPoints = prev.includes(painPoint)
        ? prev.filter((p) => p !== painPoint)
        : [...prev, painPoint];
      
      form.setValue("painPoints", newPainPoints);
      return newPainPoints;
    });
  };

  const onSubmit = (data: OnboardingFormValues) => {
    const dataWithPainPoints: OnboardingFormValues = {
      ...data,
      painPoints: selectedPainPoints,
    };
    completeOnboardingMutation.mutate(dataWithPainPoints);
  };

  const isSelected = (painPoint: typeof PAIN_POINTS[number]) => selectedPainPoints.includes(painPoint);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-heading text-4xl font-bold text-foreground md:text-5xl">
            Welkom bij OpenRegio
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Een coöperatief platform voor lokale ondernemers. Geen Big Tech, geen hoge commissies, 
            wel échte zichtbaarheid en ondersteuning. Laten we beginnen met jouw verhaal.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="p-6 md:p-8">
              <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Jouw gegevens
              </h2>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naam</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jouw naam"
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="jouw@email.nl"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6 md:p-8">
              <h2 className="mb-2 text-2xl font-semibold text-foreground">
                Waar loop je tegenaan?
              </h2>
              <p className="mb-6 text-muted-foreground">
                Selecteer de uitdagingen die jij herkent. Dit helpt ons je beter te ondersteunen.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {PAIN_POINTS.map((painPoint) => {
                  const selected = isSelected(painPoint);
                  const { title, description } = PAIN_POINT_LABELS[painPoint];

                  return (
                    <button
                      key={painPoint}
                      type="button"
                      onClick={() => togglePainPoint(painPoint)}
                      className={`group relative rounded-lg border-2 p-4 text-left transition-all hover-elevate active-elevate-2 ${
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      }`}
                      data-testid={`button-painpoint-${painPoint}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30"
                          }`}
                        >
                          {selected && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="mb-1 font-semibold text-foreground">
                            {title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={completeOnboardingMutation.isPending}
                className="min-w-48"
                data-testid="button-complete-onboarding"
              >
                {completeOnboardingMutation.isPending ? "Bezig..." : "Start met OpenRegio"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
