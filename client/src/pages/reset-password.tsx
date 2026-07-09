import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token");

  useEffect(() => {
    if (!token) setError("Ongeldige of ontbrekende herstellink");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({ variant: "destructive", title: "Vul alle velden in", description: "Beide wachtwoordvelden zijn verplicht" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Wachtwoorden komen niet overeen", description: "Zorg dat beide wachtwoorden hetzelfde zijn" });
      return;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Wachtwoord te kort", description: "Wachtwoord moet minimaal 6 tekens zijn" });
      return;
    }
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", { token, password });
      setIsSuccess(true);
      toast({ title: "Wachtwoord gewijzigd", description: "Je kunt nu inloggen met je nieuwe wachtwoord." });
      setTimeout(() => setLocation("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Er is een fout opgetreden");
      toast({ variant: "destructive", title: "Fout", description: err.message || "Er is een fout opgetreden" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="openregio-page openregio-auth-page" data-testid="page-reset-password">
      <div className="openregio-auth-center">
        <div className="openregio-auth-logo">
          <Link href="/" data-testid="link-home-logo">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        <div className="openregio-card openregio-auth-card" data-testid="card-reset-password">
          <div className="openregio-auth-header">
            <h1 className="openregio-auth-title">
              {isSuccess ? "Wachtwoord gewijzigd" : error && !token ? "Ongeldige link" : "Nieuw wachtwoord instellen"}
            </h1>
            <p className="openregio-auth-sub">
              {isSuccess
                ? "Je wordt doorgestuurd naar de inlogpagina…"
                : error && !token
                ? "Deze herstellink is ongeldig of verlopen."
                : "Kies een nieuw wachtwoord voor je account."}
            </p>
          </div>

          {isSuccess ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <CheckCircle size={24} style={{ color: "#059669" }} />
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: 0, lineHeight: 1.6 }}>
                Je wachtwoord is succesvol gewijzigd. Je wordt nu doorgestuurd naar de inlogpagina.
              </p>
            </div>
          ) : error && !token ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <XCircle size={24} style={{ color: "#dc2626" }} />
              </div>
              <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 }}>{error}</p>
              <Link href="/forgot-password">
                <button className="openregio-button openregio-button-primary" data-testid="button-try-again" style={{ width: "100%" }}>
                  Vraag een nieuwe herstellink aan
                </button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="openregio-onboarding-form">
              {error && (
                <div style={{ background: "#fef2f2", color: "#dc2626", borderRadius: 8, padding: "10px 12px", fontSize: 12, marginBottom: 14 }}>
                  {error}
                </div>
              )}
              <div className="openregio-form-group">
                <label htmlFor="password">Nieuw wachtwoord</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                  data-testid="input-password"
                />
              </div>
              <div className="openregio-form-group">
                <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                  data-testid="input-confirm-password"
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
                {isLoading ? "Wijzigen…" : "Wachtwoord wijzigen"}
              </button>
            </form>
          )}

          <p className="openregio-auth-footer">
            <Link href="/login">
              <span style={{ color: "#0b2240", fontWeight: 700, cursor: "pointer" }} data-testid="link-back-to-login">
                ← Terug naar inloggen
              </span>
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
