import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema } from "@shared/schema";
import { z } from "zod";

const registerFormSchema = registerUserSchema.extend({
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  usePageTitle("Registreren");
  const searchParams  = useSearch();
  const urlParams     = new URLSearchParams(searchParams);
  const planParam     = urlParams.get("plan");
  const selectedPlan  = planParam === "pro" ? "pro" : "basic";
  const [, setLocation] = useLocation();
  const { toast }       = useToast();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "", password: "", confirmPassword: "",
      firstName: "", lastName: "", plan: selectedPlan,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    try {
      await apiRequest("POST", "/api/auth/register", registerData);
      toast({ title: "Account aangemaakt!", description: "Je wordt doorgestuurd naar het dashboard…" });
      setTimeout(() => setLocation("/dashboard"), 500);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Probeer het later opnieuw";
      toast({ variant: "destructive", title: "Registratie mislukt", description: message });
    }
  };

  const planFeats = {
    basic: ["Bedrijfsprofiel in lokaal netwerk", "Ontdek en ontmoet ondernemers", "Volledig stemrecht in de coöperatie", "Basischeck & weerbaarheidsbadges"],
    pro:   ["RegioBot: WOO & regelgeving AI", "Persoonlijke WOO-bibliotheek", "Printbare overzichten", "Prioriteit ondersteuning"],
  };

  return (
    <div className="openregio-page openregio-auth-page" data-testid="page-register">
      <div className="openregio-auth-center" style={{ maxWidth: 520 }}>

        <div className="openregio-auth-logo">
          <Link href="/">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        {/* Plan badge */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span style={{ display: "inline-block", background: selectedPlan === "pro" ? "rgba(242,138,26,.12)" : "rgba(31,95,174,.1)", color: selectedPlan === "pro" ? "#f28a1a" : "#1f5fae", border: `1px solid ${selectedPlan === "pro" ? "rgba(242,138,26,.3)" : "rgba(31,95,174,.2)"}`, borderRadius: 20, padding: "5px 16px", fontSize: 12, fontWeight: 700 }}>
            {selectedPlan === "pro" ? "Pro · €59/mnd" : "Basis · €14,95/mnd"}
          </span>
        </div>

        <div className="openregio-card openregio-auth-card">
          <div className="openregio-auth-header">
            <h1 className="openregio-auth-title">Account aanmaken</h1>
            <p className="openregio-auth-sub">Maak je account aan en start direct met OpenRegio.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="openregio-onboarding-form">
            <div className="openregio-register-name-grid">
              <div className="openregio-form-group" style={{ marginBottom: 0 }}>
                <label>Voornaam</label>
                <input {...register("firstName")} type="text" placeholder="Jan" data-testid="input-first-name" />
              </div>
              <div className="openregio-form-group" style={{ marginBottom: 0 }}>
                <label>Achternaam</label>
                <input {...register("lastName")} type="text" placeholder="Jansen" data-testid="input-last-name" />
              </div>
            </div>

            <div className="openregio-form-group">
              <label>E-mailadres *</label>
              <input {...register("email")} type="email" placeholder="jouw@email.nl" data-testid="input-email" />
              {errors.email && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div className="openregio-form-group">
              <label>Wachtwoord *</label>
              <input {...register("password")} type="password" placeholder="Minimaal 6 tekens" data-testid="input-password" />
              {errors.password && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <div className="openregio-form-group">
              <label>Bevestig wachtwoord *</label>
              <input {...register("confirmPassword")} type="password" placeholder="Herhaal je wachtwoord" data-testid="input-confirm-password" />
              {errors.confirmPassword && <p style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>{errors.confirmPassword.message}</p>}
            </div>

            {/* Wat je krijgt */}
            <div style={{ background: "#f4f6fb", borderRadius: 12, padding: "14px 16px", marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: ".4px" }}>Wat je krijgt</p>
              {planFeats[selectedPlan].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", marginBottom: 5 }}>
                  <span style={{ color: "#1f5fae", fontWeight: 700 }}>✓</span>{f}
                </div>
              ))}
            </div>

            <input {...register("plan")} type="hidden" value={selectedPlan} />

            <button
              type="submit"
              className="openregio-button openregio-button-primary"
              disabled={isSubmitting}
              data-testid="button-register"
              style={{ width: "100%" }}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Account aanmaken…" : "Account aanmaken"}
            </button>
          </form>

          <p className="openregio-auth-footer">
            Al lid?{" "}
            <Link href="/login">
              <span style={{ color: "#1f5fae", fontWeight: 700, cursor: "pointer" }} data-testid="link-login">Inloggen</span>
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
