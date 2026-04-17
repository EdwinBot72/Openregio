import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: "destructive", title: "Email verplicht", description: "Vul je emailadres in" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/forgot-password", { email });
      setIsSubmitted(true);
      toast({ title: "Email verzonden", description: "Als dit emailadres bij ons bekend is, ontvang je een herstelmail." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Fout", description: error.message || "Er is een fout opgetreden" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="openregio-page openregio-auth-page" data-testid="page-forgot-password">
      <div className="openregio-auth-center">
        <div className="openregio-auth-logo">
          <Link href="/" data-testid="link-home-logo">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        <div className="openregio-card openregio-auth-card" data-testid="card-forgot-password">
          <div className="openregio-auth-header">
            <h1 className="openregio-auth-title">Wachtwoord vergeten</h1>
            <p className="openregio-auth-sub">
              {isSubmitted
                ? "Controleer je inbox voor verdere instructies."
                : "Vul je emailadres in om een herstellink te ontvangen."}
            </p>
          </div>

          {isSubmitted ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <Mail size={24} style={{ color: "#1f5fae" }} />
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: 0 }}>
                Als dit emailadres bij ons bekend is, ontvang je binnen enkele minuten een email met een link om je wachtwoord te herstellen.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="openregio-onboarding-form">
              <div className="openregio-form-group">
                <label htmlFor="email">E-mailadres</label>
                <input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  data-testid="input-email"
                />
              </div>
              <button
                type="submit"
                className="openregio-button openregio-button-primary"
                disabled={isLoading}
                data-testid="button-submit"
                style={{ width: "100%", marginTop: 4 }}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Versturen…" : "Verstuur herstellink"}
              </button>
            </form>
          )}

          <p className="openregio-auth-footer">
            <Link href="/login">
              <span style={{ color: "#1f5fae", fontWeight: 700, cursor: "pointer" }} data-testid="link-back-to-login">
                ← Terug naar inloggen
              </span>
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
