import { CheckCircle, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const registerSchema = z.object({
  firstName: z.string().optional(),
  lastName:  z.string().optional(),
  email:     z.string().email("Vul een geldig e-mailadres in"),
  password:  z.string().min(6, "Wachtwoord moet minimaal 6 tekens zijn"),
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const PLAN_LABELS: Record<string, string> = {
  basic: "Basis-lid",
  pro: "Pro-bijdrager",
};

function PostPaymentRegisterForm({ plan }: { plan: "basic" | "pro" }) {
  const [, setLocation] = useLocation();
  const { toast }       = useToast();
  const { refetch }     = useAuth();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...rest } = data;
    const response = await fetch("/api/auth/register-after-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rest, plan }),
      credentials: "include",
    });
    const result = await response.json();
    if (!response.ok) {
      toast({ variant: "destructive", title: "Registratie mislukt", description: result.error || "Probeer het opnieuw" });
      return;
    }
    await refetch();
    toast({ title: "Account aangemaakt!", description: "Je wordt doorgestuurd naar je dashboard…" });
    setTimeout(() => setLocation("/dashboard"), 500);
  };

  return (
    <div className="openregio-page openregio-auth-page" data-testid="card-post-payment-register">
      <div className="openregio-auth-center" style={{ maxWidth: 480 }}>

        <div className="openregio-auth-logo">
          <Link href="/">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        {/* Succes-badge */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <CheckCircle size={28} style={{ color: "#059669" }} data-testid="icon-success" />
          </div>
          <span style={{ display: "inline-block", background: "rgba(31,95,174,.1)", color: "#1f5fae", border: "1px solid rgba(31,95,174,.2)", borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700 }}>
            Betaling geslaagd — {PLAN_LABELS[plan]} actief
          </span>
        </div>

        <div className="openregio-card openregio-auth-card">
          <div className="openregio-auth-header">
            <h1 className="openregio-auth-title">Account aanmaken</h1>
            <p className="openregio-auth-sub">
              Jouw betaling is verwerkt. Maak nu je account aan om direct aan de slag te gaan.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="openregio-onboarding-form">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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

            <button
              type="submit"
              className="openregio-button openregio-button-primary"
              disabled={isSubmitting}
              data-testid="button-create-account"
              style={{ width: "100%" }}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Account aanmaken…" : "Account aanmaken en inloggen"}
            </button>
          </form>

          <p className="openregio-auth-footer">
            Al een account?{" "}
            <Link href="/login">
              <span style={{ color: "#1f5fae", fontWeight: 700, cursor: "pointer" }} data-testid="link-login">Log hier in</span>
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .openregio-auth-page { background: #f4f6fb; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
        .openregio-auth-center { width: 100%; max-width: 440px; }
        .openregio-auth-logo { text-align: center; margin-bottom: 20px; }
        .openregio-auth-logo .openregio-topnav-logo { font-size: 24px; font-weight: 800; letter-spacing: -.4px; text-decoration: none; }
        .openregio-auth-card { margin-bottom: 0; }
        .openregio-auth-header { margin-bottom: 22px; }
        .openregio-auth-title { font-size: 20px; font-weight: 800; color: #0b2240; margin-bottom: 6px; letter-spacing: -.3px; }
        .openregio-auth-sub { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }
        .openregio-auth-footer { font-size: 13px; color: #94a3b8; text-align: center; margin-top: 18px; margin-bottom: 0; }
      `}</style>
    </div>
  );
}

function EmailCheckPage({ email }: { email: string }) {
  return (
    <div className="openregio-page openregio-auth-page" data-testid="card-payment-success">
      <div className="openregio-auth-center">
        <div className="openregio-auth-logo">
          <Link href="/">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        <div className="openregio-card openregio-auth-card" style={{ textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle size={28} style={{ color: "#059669" }} data-testid="icon-success" />
          </div>
          <h1 className="openregio-auth-title">Betaling geslaagd!</h1>
          <p className="openregio-auth-sub" style={{ marginBottom: 20 }}>
            Welkom bij OpenRegio! Je ontvangt een e-mail met je persoonlijke onboarding-link.
          </p>

          {email && (
            <div style={{ background: "#f4f6fb", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left" }}>
              <Mail size={16} style={{ color: "#1f5fae", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", margin: "0 0 2px" }}>Check je inbox</p>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Verstuurd naar <strong style={{ color: "#0b2240" }} data-testid="text-email">{email}</strong>
                </p>
              </div>
            </div>
          )}

          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#0b2240", marginBottom: 10 }}>Volgende stappen:</p>
            {[
              "Check je e-mail voor je persoonlijke onboarding-link",
              "Klik op de link om je account te activeren",
              "Maak je bedrijfsprofiel compleet",
              "Start met RegioBot en de basischeck!",
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, color: "#475569", marginBottom: 8 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#E6F1FB", color: "#1f5fae", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
                {s}
              </div>
            ))}
          </div>

          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left" }}>
            <AlertCircle size={14} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11, color: "#92400e", margin: 0, lineHeight: 1.6 }}>
              Geen e-mail ontvangen? Check je spam of neem contact op via info@openregio.nl
            </p>
          </div>

          <Link href="/" data-testid="button-back-home">
            <button className="openregio-button openregio-button-primary" style={{ width: "100%", marginBottom: 10 }}>
              Terug naar homepage
            </button>
          </Link>
          <Link href="/login" data-testid="link-login">
            <button className="openregio-button openregio-button-outline" style={{ width: "100%" }}>
              Al toegang? Log direct in
            </button>
          </Link>
        </div>
      </div>

      <style>{`
        .openregio-auth-page { background: #f4f6fb; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
        .openregio-auth-center { width: 100%; max-width: 440px; }
        .openregio-auth-logo { text-align: center; margin-bottom: 20px; }
        .openregio-auth-logo .openregio-topnav-logo { font-size: 24px; font-weight: 800; letter-spacing: -.4px; text-decoration: none; }
        .openregio-auth-card { margin-bottom: 0; }
        .openregio-auth-title { font-size: 20px; font-weight: 800; color: #0b2240; margin-bottom: 6px; letter-spacing: -.3px; }
        .openregio-auth-sub { font-size: 13px; color: #64748b; line-height: 1.6; margin: 0; }
      `}</style>
    </div>
  );
}

export default function BetalingGeslaagd() {
  const params = new URLSearchParams(window.location.search);
  const plan   = params.get("plan");
  const email  = params.get("email") || "";
  if (plan === "basic" || plan === "pro") return <PostPaymentRegisterForm plan={plan} />;
  return <EmailCheckPage email={email} />;
}
