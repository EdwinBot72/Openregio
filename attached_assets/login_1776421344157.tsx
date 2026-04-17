import { useState } from "react";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function LoginPage() {
  usePageTitle("Inloggen");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation]         = useLocation();
  const { toast }               = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Vul alle velden in", description: "Email en wachtwoord zijn verplicht" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const data = await response.json();
      if (data.mustCompleteOnboarding && data.onboardingToken) {
        toast({ title: "Welkom!", description: "Vul eerst je profiel in." });
        setLocation(`/first-login?token=${data.onboardingToken}`);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Ingelogd!", description: "Je wordt doorgestuurd…" });
      setTimeout(() => setLocation("/aan-de-slag"), 500);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Inloggen mislukt", description: error.message || "Controleer je gegevens en probeer opnieuw" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="openregio-page openregio-auth-page" data-testid="page-login">
      <div className="openregio-auth-center">

        <div className="openregio-auth-logo" data-testid="link-home-logo">
          <Link href="/">
            <span className="openregio-topnav-logo">
              <span className="openregio-topnav-logo-dark">Open</span>
              <span className="openregio-topnav-logo-blue">Regio</span>
            </span>
          </Link>
        </div>

        <div className="openregio-card openregio-auth-card" data-testid="card-login">
          <div className="openregio-auth-header">
            <h1 className="openregio-auth-title">Welkom terug</h1>
            <p className="openregio-auth-sub">Log in met je e-mailadres en wachtwoord om door te gaan.</p>
          </div>

          <form onSubmit={handleSubmit} className="openregio-onboarding-form">
            <div className="openregio-form-group">
              <label htmlFor="email">E-mailadres</label>
              <input
                id="email"
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={isLoading}
                required
                data-testid="input-email"
              />
            </div>

            <div className="openregio-form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label htmlFor="password" style={{ margin: 0 }}>Wachtwoord</label>
                <Link href="/forgot-password">
                  <span style={{ fontSize: 11, color: "#1f5fae", cursor: "pointer", fontWeight: 600 }} data-testid="link-forgot-password">
                    Vergeten?
                  </span>
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
                required
                data-testid="input-password"
              />
            </div>

            <button
              type="submit"
              className="openregio-button openregio-button-primary"
              disabled={isLoading}
              data-testid="button-login"
              style={{ width: "100%", marginTop: 4 }}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Inloggen…" : "Inloggen"}
            </button>
          </form>

          <p className="openregio-auth-footer">
            Nog geen account?{" "}
            <Link href="/lidmaatschap">
              <span style={{ color: "#1f5fae", fontWeight: 700, cursor: "pointer" }} data-testid="link-register">
                Word lid
              </span>
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .openregio-auth-page {
          background: #f4f6fb;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .openregio-auth-center {
          width: 100%;
          max-width: 440px;
        }
        .openregio-auth-logo {
          text-align: center;
          margin-bottom: 24px;
        }
        .openregio-auth-logo .openregio-topnav-logo {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -.4px;
          text-decoration: none;
        }
        .openregio-auth-card {
          margin-bottom: 0;
        }
        .openregio-auth-header {
          margin-bottom: 22px;
        }
        .openregio-auth-title {
          font-size: 20px;
          font-weight: 800;
          color: #0b2240;
          margin-bottom: 6px;
          letter-spacing: -.3px;
        }
        .openregio-auth-sub {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          margin: 0;
        }
        .openregio-auth-footer {
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
          margin-top: 18px;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
