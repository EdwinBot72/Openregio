import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RegionSelect } from "@/components/region-select";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, FileText, Gavel, Info } from "lucide-react";

const indienSchema = z.object({
  afzender: z.string().min(2, "Vul de naam van de afzender in").max(255),
  onderwerp: z.string().min(5, "Geef een korte omschrijving van de brief").max(500),
  regio: z.string().min(1, "Selecteer een gemeente of regio"),
  briefTekst: z.string().optional(),
});

type IndienFormValues = z.infer<typeof indienSchema>;

export default function WetgevingIndienenPage() {
  usePageTitle("Wet & Regelgeving indienen");
  const { toast } = useToast();
  const [ingediend, setIngediend] = useState(false);

  const form = useForm<IndienFormValues>({
    resolver: zodResolver(indienSchema),
    defaultValues: {
      afzender: "",
      onderwerp: "",
      regio: "",
      briefTekst: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: IndienFormValues) => {
      const res = await apiRequest("POST", "/api/wetgeving/indienen", data);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Onbekende fout");
      }
      return res.json();
    },
    onSuccess: () => {
      setIngediend(true);
    },
    onError: (err: Error) => {
      toast({
        title: "Indienen mislukt",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: IndienFormValues) {
    mutation.mutate(data);
  }

  if (ingediend) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 space-y-6 text-center" data-testid="section-bevestiging">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-4">
            <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold" data-testid="heading-bevestiging">Bedankt voor je inzending!</h1>
        <p className="text-muted-foreground leading-relaxed">
          Ons team heeft je brief ontvangen en bekijkt deze zo snel mogelijk. Zodra we het verwerkt hebben, verschijnt
          de informatie op het platform zodat alle leden ervan kunnen profiteren.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setIngediend(false);
              form.reset();
            }}
            data-testid="button-nieuwe-inzending"
          >
            Nog een brief indienen
          </Button>
          <Button
            onClick={() => window.location.href = "/wetgeving/publicaties"}
            data-testid="button-naar-publicaties"
          >
            Bekijk gepubliceerde regelgeving
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold" data-testid="heading-wetgeving-indienen">
            Wet & Regelgeving indienen
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Heb je een brief gekregen van de overheid over een wet of maatregel? Dien hem hier in. Ons team vertaalt
          hem naar bruikbare informatie voor alle ondernemers in de coöperatie.
        </p>
      </div>

      <Card data-testid="card-info">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3 items-start">
            <Info className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Je inzending wordt door het OpenRegio-team bekeken. We publiceren alleen wat relevant en nuttig is voor
              andere leden — persoonlijke gegevens worden nooit openbaar gemaakt.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-formulier">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Briefinformatie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="afzender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Afzender / overheidsinstantie</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Gemeente Amsterdam, Ministerie van EZK, Waterschap..."
                        data-testid="input-afzender"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onderwerp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onderwerp van de brief</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Bijv. Nieuwe terrasregels, Omgevingsvergunning vereist, Btw-wijziging..."
                        data-testid="input-onderwerp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gemeente / regio</FormLabel>
                    <FormControl>
                      <RegionSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecteer gemeente"
                        data-testid="select-regio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="briefTekst"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tekst van de brief{" "}
                      <span className="text-muted-foreground font-normal">(optioneel)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Plak hier de relevante tekst uit de brief, of een samenvatting..."
                        className="min-h-32 resize-y"
                        data-testid="textarea-brieftekst"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
                data-testid="button-indienen"
              >
                {mutation.isPending ? "Indienen..." : "Brief indienen"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
