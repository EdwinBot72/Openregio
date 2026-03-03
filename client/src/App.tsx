import type { CSSProperties } from "react";
import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import NetworkPage from "@/pages/network";
import CommunityPage from "@/pages/community";
import RegioBotPage from "@/pages/regiobot";
import CooperativePage from "@/pages/cooperative";
import ChatPage from "@/pages/chat";
import OnboardingPage from "@/pages/onboarding";
import LidmaatschapPage from "@/pages/lidmaatschap";
import BedrijfsprofielPage from "@/pages/bedrijfsprofiel";
import BetalingGeslaagdPage from "@/pages/betaling-geslaagd";
import FirstLoginPage from "@/pages/first-login";
import PrivacyPage from "@/pages/privacy";
import VoorwaardenPage from "@/pages/voorwaarden";
import StartPage from "@/pages/start";
import BasischeckPage from "@/pages/basischeck";
import PrivacyDashboardPage from "@/pages/privacy-dashboard";
import ProVisibilitySettingsPage from "@/pages/pro-visibility-settings";
import WooBotPage from "@/pages/woo-bot";
import WooWizardPage from "@/pages/woo-wizard";
import WooBibliotheekPage from "@/pages/woo-bibliotheek";
import RegioCrewPage from "@/pages/regiocrew";
import BlogDetailPage from "@/pages/blog-detail";
import BlogsPage from "@/pages/blogs";
import AdminBlogsPage from "@/pages/admin/blogs";
import AdminCommissionsPage from "@/pages/admin/commissions";
import AdminUsersPage from "@/pages/admin/users";
import AffiliatePage from "@/pages/affiliate";
import ForgotPasswordPage from "@/pages/forgot-password";
import ResetPasswordPage from "@/pages/reset-password";
import DisclaimerPage from "@/pages/disclaimer";
import CookiebeleidPage from "@/pages/cookiebeleid";
import RegioAnalysePage from "@/pages/regio-analyse";
import BeleidsmonitorPage from "@/pages/beleidsmonitor";
import AanbestedingenPage from "@/pages/aanbestedingen";
import GemeenteUpdatesPage from "@/pages/gemeente-updates";
import FinancieringPage from "@/pages/financiering";
import RegiodealsPage from "@/pages/regio-deals";
import RegiodealsAdminPage from "@/pages/admin/regio-deals-admin";
import { ComingSoon } from "@/components/ComingSoon";

// Routes that should NOT have the sidebar/header layout
const PUBLIC_ROUTES = ["/", "/login", "/register", "/start", "/lidmaatschap", "/betaling-geslaagd", "/first-login", "/privacy", "/voorwaarden", "/basischeck", "/blog/:slug", "/blogs", "/forgot-password", "/reset-password", "/disclaimer", "/cookiebeleid", "/regio-analyse"];

function PublicRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/start" component={StartPage} />
      <Route path="/lidmaatschap" component={LidmaatschapPage} />
      <Route path="/betaling-geslaagd" component={BetalingGeslaagdPage} />
      <Route path="/first-login" component={FirstLoginPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/voorwaarden" component={VoorwaardenPage} />
      <Route path="/basischeck" component={BasischeckPage} />
      <Route path="/blog/:slug" component={BlogDetailPage} />
      <Route path="/blogs" component={BlogsPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/cookiebeleid" component={CookiebeleidPage} />
      <Route path="/regio-analyse" component={RegioAnalysePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/bedrijfsprofiel" component={BedrijfsprofielPage} />
      <Route path="/network" component={NetworkPage} />
      <Route path="/community" component={CommunityPage} />
      <Route path="/chat" component={ChatPage} />
      <Route path="/regiobot" component={RegioBotPage} />
      <Route path="/cooperative" component={CooperativePage} />
      <Route path="/privacy-dashboard" component={PrivacyDashboardPage} />
      <Route path="/pro/visibility-settings" component={ProVisibilitySettingsPage} />
      <Route path="/woo-bot" component={WooBotPage} />
      <Route path="/woo-wizard" component={WooWizardPage} />
      <Route path="/woo-bibliotheek" component={WooBibliotheekPage} />
      <Route path="/regiocrew" component={RegioCrewPage} />
      <Route path="/affiliate" component={AffiliatePage} />
      <Route path="/beleidsmonitor" component={BeleidsmonitorPage} />
      <Route path="/admin/blogs" component={AdminBlogsPage} />
      <Route path="/admin/commissions" component={AdminCommissionsPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/regio-deals" component={RegiodealsAdminPage} />

      {/* Kansen */}
      <Route path="/kansen/subsidies">{() => <ComingSoon title="Subsidies" description="Overzicht van subsidies beschikbaar voor ondernemers in jouw regio." />}</Route>
      <Route path="/kansen/aanbestedingen" component={AanbestedingenPage} />
      <Route path="/kansen/gemeente-updates" component={GemeenteUpdatesPage} />
      <Route path="/kansen/regio-deals" component={RegiodealsPage} />
      <Route path="/kansen/financiering" component={FinancieringPage} />

      {/* Samenwerken */}
      <Route path="/samenwerken/project-starten">{() => <ComingSoon title="Project starten" description="Start een nieuw samenwerkingsproject met ondernemers uit jouw regio." />}</Route>
      <Route path="/samenwerken/initiatieven">{() => <ComingSoon title="Lopende initiatieven" description="Bekijk lopende regionale initiatieven en sluit je aan." />}</Route>
      <Route path="/samenwerken/pitchbord">{() => <ComingSoon title="Pitchbord" description="Presenteer jouw idee aan de regio en zoek partners of financiering." />}</Route>

      {/* Projecten */}
      <Route path="/projecten">{() => <ComingSoon title="Mijn projecten" description="Beheer jouw lopende regionale projecten op één plek." />}</Route>
      <Route path="/projecten/regionaal">{() => <ComingSoon title="Regionale projecten" description="Alle actieve projecten in jouw regio." />}</Route>
      <Route path="/projecten/documenten">{() => <ComingSoon title="Documenten" description="Gedeelde projectdocumenten en dossiers." />}</Route>
      <Route path="/projecten/taken">{() => <ComingSoon title="Taken & rollen" description="Taakverdeling en verantwoordelijkheden binnen jouw projecten." />}</Route>
      <Route path="/projecten/resultaten">{() => <ComingSoon title="Resultaten" description="Meetbare uitkomsten en voortgang van afgeronde projecten." />}</Route>

      {/* Data & Inzicht */}
      <Route path="/data/marktanalyse">{() => <ComingSoon title="Marktanalyse" description="Inzicht in regionale markttrends en kansen voor jouw sector." />}</Route>
      <Route path="/data/impact-rapportages">{() => <ComingSoon title="Impact-rapportages" description="Rapportages over de maatschappelijke impact van OpenRegio-leden." />}</Route>

      {/* Coöperatie */}
      <Route path="/cooperatie/stemmen">{() => <ComingSoon title="Stemmen" description="Breng jouw stem uit over coöperatieve besluiten en voorstellen." />}</Route>
      <Route path="/cooperatie/besluiten">{() => <ComingSoon title="Besluiten" description="Archief van genomen besluiten binnen de coöperatie." />}</Route>
      <Route path="/cooperatie/resultaten">{() => <ComingSoon title="Financiële resultaten" description="Transparant overzicht van de financiële resultaten van de coöperatie." />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isHomePage] = useRoute("/");
  const [isLoginPage] = useRoute("/login");
  const [isRegisterPage] = useRoute("/register");
  const [isStartPage] = useRoute("/start");
  const [isLidmaatschapPage] = useRoute("/lidmaatschap");
  const [isPaymentSuccessPage] = useRoute("/betaling-geslaagd");
  const [isFirstLoginPage] = useRoute("/first-login");
  const [isPrivacyPage] = useRoute("/privacy");
  const [isVoorwaardenPage] = useRoute("/voorwaarden");
  const [isBasischeckPage] = useRoute("/basischeck");
  const [isBlogDetailPage] = useRoute("/blog/:slug");
  const [isBlogsPage] = useRoute("/blogs");
  const [isForgotPasswordPage] = useRoute("/forgot-password");
  const [isResetPasswordPage] = useRoute("/reset-password");
  const [isDisclaimerPage] = useRoute("/disclaimer");
  const [isCookiebeleidPage] = useRoute("/cookiebeleid");
  const [isRegioAnalysePage] = useRoute("/regio-analyse");
  
  const isPublicRoute = isHomePage || isLoginPage || isRegisterPage || isStartPage || isLidmaatschapPage || isPaymentSuccessPage || isFirstLoginPage || isPrivacyPage || isVoorwaardenPage || isBasischeckPage || isBlogDetailPage || isBlogsPage || isForgotPasswordPage || isResetPasswordPage || isDisclaimerPage || isCookiebeleidPage || isRegioAnalysePage;

  if (isPublicRoute) {
    return <PublicRouter />;
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden bg-regio-base dark:bg-background">
          <header className="flex items-center justify-between p-4 border-b shrink-0 bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto p-8">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
